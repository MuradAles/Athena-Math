/**
 * ChatContainer component
 * Main chat interface combining MessageList and InputArea
 * Now integrated with Firestore for persistence
 */

import { useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import type { Message as MessageType } from '../../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { StreamingMessage } from './StreamingMessage';
import { useStreaming } from '../../hooks/useStreaming';
import { useChats } from '../../hooks/useChats';
import { useAuthContext } from '../../contexts/AuthContext';
import { saveProblemContext } from '../../utils/storage';
import { useConfetti } from '../../hooks/useConfetti';
import type { ToolCall } from '../../hooks/useStreaming';
import './ChatContainer.css';

interface ChatContainerProps {
  chatId: string | null;
  onTrackCorrectAnswer?: (chatId: string, problem: string, hintsUsed: number, questionsAsked: number) => Promise<void>;
  onTrackWrongAnswer?: (chatId: string, problem: string) => Promise<void>;
  onCorrectAnswerDetected?: (messageId: string) => void;
  onToggleWhiteboard?: () => void;
  isWhiteboardOpen?: boolean;
}

export interface ChatContainerRef {
  sendMessage: (content: string, imageUrl?: string) => void;
}

export const ChatContainer = forwardRef<ChatContainerRef, ChatContainerProps>(({ 
  chatId,
  onTrackCorrectAnswer,
  onTrackWrongAnswer,
  onCorrectAnswerDetected,
  onToggleWhiteboard,
  isWhiteboardOpen,
}, ref) => {
  const { user } = useAuthContext();
  const { currentChat, addMessage, selectChat } = useChats(user?.uid || null);

  // Sync chatId prop with useChats
  useEffect(() => {
    if (chatId) {
      selectChat(chatId);
    } else {
      selectChat(null);
    }
  }, [chatId, selectChat]);
  
  const {
    streamingMessage,
    isStreaming,
    startStream,
    reset: resetStream,
  } = useStreaming();

  // Confetti celebration hook
  const { celebrate } = useConfetti();

  // Note: Gamification is handled at App level and passed down via callbacks

  // Get messages from current chat
  const messages = currentChat?.messages || [];
  const currentProblem = currentChat?.problem;

  // Track problem session state
  const problemSessionRef = useRef<{
    startTime: Date;
    questionsAsked: number;
    hintsUsed: number;
    problem: string | null;
  }>({
    startTime: new Date(),
    questionsAsked: 0,
    hintsUsed: 0,
    problem: null,
  });

  // Track which messages indicate correct answers
  const correctAnswerMessageIdsRef = useRef<Set<string>>(new Set());
  
  // Track tool call results for validation
  const toolCallResultsRef = useRef<Array<{
    toolName: string;
    args: Record<string, unknown>;
    result: Record<string, unknown>;
    timestamp: Date;
  }>>([]);

  // Reset problem session when problem changes
  useEffect(() => {
    if (currentProblem && currentProblem !== problemSessionRef.current.problem) {
      problemSessionRef.current = {
        startTime: new Date(),
        questionsAsked: 0,
        hintsUsed: 0,
        problem: currentProblem,
      };
      correctAnswerMessageIdsRef.current.clear();
    }
  }, [currentProblem]);

  const handleSendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!chatId || !user || !currentChat) {
        console.error('Cannot send message: missing chatId, user, or currentChat', { chatId, user: !!user, currentChat: !!currentChat });
        return;
      }


      // Create user message (store imageUrl separately)
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content || '',
        imageUrl: imageUrl, // Store image URL separately
        timestamp: new Date(),
      };

      // Increment questions asked for this problem session
      if (currentProblem) {
        problemSessionRef.current.questionsAsked++;
      }

      // Check if user is asking for a hint
      const isHintRequest = 
        content.toLowerCase().includes('hint') ||
        content.toLowerCase().includes('help') ||
        content.toLowerCase().includes('i don\'t know') ||
        content.toLowerCase().includes('how do i');

      if (isHintRequest && currentProblem) {
        problemSessionRef.current.hintsUsed++;
      }

      // Save user message to Firestore
      try {
        await addMessage(userMessage);
      } catch (error) {
        console.error('Error saving user message:', error);
        alert('Failed to save message. Check console for details.');
        return;
      }

      // Prepare messages array for OpenAI
      // If there's an image, format it as OpenAI's vision format
      const newUserMessage = imageUrl
        ? {
            role: 'user' as const,
            content: [
              { type: 'text' as const, text: content || 'What is this problem?' },
              { type: 'image_url' as const, image_url: { url: imageUrl } },
            ],
          }
        : {
            role: 'user' as const,
            content: content || '',
          };

      // Convert stored messages to API format
      // If message has imageUrl, reconstruct vision format
      const messagesForAPI = [
        ...messages.map((msg) => {
          // If message has an image, convert to OpenAI vision format
          if (msg.imageUrl) {
            return {
              role: msg.role as 'user' | 'assistant',
              content: [
                { type: 'text' as const, text: msg.content || 'What is this problem?' },
                { type: 'image_url' as const, image_url: { url: msg.imageUrl } },
              ],
            };
          }
          // Otherwise, use content as string
          return {
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          };
        }),
        newUserMessage,
      ];


      // Generate problem context - only use context from current chat, not from other chats
      // For new chats, don't use old context - each chat should be independent
      // Context should only help within the same chat conversation, not across different chats
      const problemContext = undefined; // Disabled cross-chat context - each chat is independent

      // Start streaming AI response
      resetStream(); // Clear any previous stream state
      
      startStream({
      messages: messagesForAPI,
      problem: currentProblem,
      problemContext,
        onToolCall: (toolCall: ToolCall) => {
          console.log('🔧 [ChatContainer] onToolCall fired!', {
            toolName: toolCall.name,
            hasArgs: !!toolCall.args,
            hasResult: !!toolCall.result,
          });
          
          // Track tool calls for validation
          toolCallResultsRef.current.push({
            toolName: toolCall.name,
            args: toolCall.args,
            result: toolCall.result,
            timestamp: new Date(),
          });
          
          console.log('📋 [ChatContainer] Tool calls tracked:', toolCallResultsRef.current.length);
          
          // If validate_answer was called, check if answer is correct
          if (toolCall.name === 'validate_answer') {
            console.log('🎯 [ChatContainer] validate_answer tool detected!', {
              result: toolCall.result,
              isCorrect: toolCall.result?.is_correct,
            });
            
            if (toolCall.result?.is_correct === true) {
              console.log('✅ Correct answer detected via validate_answer tool!', {
                problem: toolCall.args?.problem?.substring(0, 50),
                studentAnswer: toolCall.args?.student_answer,
                result: toolCall.result,
              });
              
              // Mark for tracking - will be processed in onComplete
              // We store the tool call result so we can use it in onComplete
            }
          }
        },
        onComplete: async (completeMessage: string) => {
        console.log('🏁 [ChatContainer] onComplete fired!', {
          messageLength: completeMessage.length,
          toolCallsTracked: toolCallResultsRef.current.length,
        });
        
        // Convert streaming message to regular message on completion
        const assistantMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: completeMessage,
          timestamp: new Date(),
        };
        
        // Save assistant message to Firestore
        await addMessage(assistantMessage);
        
        // Check if validate_answer tool was called and returned is_correct: true
        // This is the reliable way to detect correctness - from tool results, not text parsing
        const recentValidation = toolCallResultsRef.current
          .filter(tc => tc.toolName === 'validate_answer')
          .pop();
        
        console.log('🔍 [ChatContainer] Recent validation:', {
          hasValidation: !!recentValidation,
          toolName: recentValidation?.toolName,
          result: recentValidation?.result,
        });
        
        const isCorrectFromTool = recentValidation?.result && 
          typeof recentValidation.result === 'object' && 
          'is_correct' in recentValidation.result &&
          recentValidation.result.is_correct === true;
        
        // Get problem text from tool call args or fallback
        const problemFromArgs = recentValidation?.args && 
          typeof recentValidation.args === 'object' && 
          'problem' in recentValidation.args
          ? String(recentValidation.args.problem)
          : null;
        
        const problemText = problemFromArgs || 
          currentProblem || 
          (messages.length > 0 
            ? messages.filter(m => m.role === 'user').pop()?.content || ''
            : '');
        
        // Track correct answer based on tool result, not text parsing
        if (isCorrectFromTool && problemText && chatId) {
          console.log('✅ Correct answer confirmed by validate_answer tool!', {
            problem: problemText.substring(0, 50),
            studentAnswer: recentValidation?.args && typeof recentValidation.args === 'object' && 'student_answer' in recentValidation.args
              ? String(recentValidation.args.student_answer)
              : 'unknown',
            chatId,
            messageId: assistantMessage.id,
          });
          
          // Check if this is the FINAL answer (problem completely solved)
          // Look for indicators in the AI's message that the problem is finished
          const messageText = completeMessage.toLowerCase();
          const isFinalAnswer = 
            messageText.includes('solved') ||
            messageText.includes('complete') ||
            messageText.includes('finished') ||
            messageText.includes('final answer') ||
            messageText.includes('well done') ||
            messageText.includes('excellent work') ||
            messageText.includes('perfect') ||
            messageText.includes('exactly right') ||
            messageText.includes('nailed it') ||
            messageText.includes('that\'s it') ||
            // Also check if AI says we're done with this problem
            (messageText.includes('done') && (messageText.includes('problem') || messageText.includes('all'))) ||
            // Check if message suggests moving to a new problem
            messageText.includes('ready for another') ||
            messageText.includes('new problem') ||
            messageText.includes('next problem');
          
          console.log('🎯 Final answer check:', {
            isFinalAnswer,
            messagePreview: completeMessage.substring(0, 100),
          });
          
          // ONLY show sparkles and confetti if this is the FINAL answer
          if (isFinalAnswer) {
            // Mark this message as indicating a correct answer
            correctAnswerMessageIdsRef.current.add(assistantMessage.id);
            onCorrectAnswerDetected?.(assistantMessage.id);
            
            // 🎉 Celebrate with confetti!
            console.log('🎉 Triggering confetti celebration for FINAL answer:', assistantMessage.id);
            celebrate();
          } else {
            console.log('✅ Correct step, but not final answer - no celebration yet');
          }
          
          // Track progress with gamification (only for final answer)
          if (isFinalAnswer && onTrackCorrectAnswer) {
            try {
              console.log('📊 Tracking progress...', {
                chatId,
                problem: problemText.substring(0, 50),
                hintsUsed: problemSessionRef.current.hintsUsed,
                questionsAsked: problemSessionRef.current.questionsAsked,
              });
              await onTrackCorrectAnswer(
                chatId,
                problemText,
                problemSessionRef.current.hintsUsed,
                problemSessionRef.current.questionsAsked
              );
              console.log('✅ Progress tracked successfully!');
            } catch (error) {
              console.error('❌ Error tracking progress:', error);
            }
          } else if (!isFinalAnswer) {
            console.log('⏭️ Correct step - continuing to next step');
          } else {
            console.warn('⚠️ onTrackCorrectAnswer callback not provided');
          }
        } else if (isCorrectFromTool && !problemText) {
          console.warn('⚠️ Correct answer detected but no problem text available', {
            currentProblem,
            messageCount: messages.length,
            toolCallArgs: recentValidation?.args,
          });
        }
        
        // Clear old tool call results (keep only last 10)
        if (toolCallResultsRef.current.length > 10) {
          toolCallResultsRef.current = toolCallResultsRef.current.slice(-10);
        }
        
        // Check if answer is wrong (AI indicates error)
        const isWrongAnswer = 
          completeMessage.toLowerCase().includes('not quite') ||
          completeMessage.toLowerCase().includes('that\'s not right') ||
          completeMessage.toLowerCase().includes('incorrect') ||
          completeMessage.toLowerCase().includes('try again');
        
        if (isWrongAnswer && currentProblem && chatId && onTrackWrongAnswer) {
          try {
            await onTrackWrongAnswer(chatId, currentProblem);
          } catch (error) {
            console.error('Error tracking wrong answer:', error);
          }
        }
        
        // If student asks for "another problem", also save context from conversation
        const isRequestingAnotherProblem = 
          content.toLowerCase().includes('another problem') ||
          content.toLowerCase().includes('another example') ||
          content.toLowerCase().includes('give me another') ||
          content.toLowerCase().includes('new problem');
        
        // Save context when problem is solved (via tool validation) or when requesting another problem
        if ((isCorrectFromTool || isRequestingAnotherProblem) && currentProblem) {
          // Save problem context - AI will analyze concepts from conversation context
          saveProblemContext({
            lastSolvedProblem: currentProblem,
            complexity: 'medium', // Default, can be refined later
          });
          
          // Reset problem session
          problemSessionRef.current = {
            startTime: new Date(),
            questionsAsked: 0,
            hintsUsed: 0,
            problem: null,
          };
        }
        
        resetStream();
      },
      });
    },
    [chatId, user, messages, currentProblem, currentChat, addMessage, startStream, resetStream, onTrackCorrectAnswer, onTrackWrongAnswer, onCorrectAnswerDetected]
  );

  // Expose sendMessage function via ref
  useImperativeHandle(ref, () => ({
    sendMessage: handleSendMessage,
  }));

  if (!chatId) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <p>Select a chat from the sidebar or create a new chat to get started!</p>
        </div>
      </div>
    );
  }

  // Normal chat mode
  return (
    <div className="chat-container">
      <MessageList 
        messages={messages}
        chatId={chatId}
        correctAnswerMessageIds={correctAnswerMessageIdsRef.current}
        streamingMessage={
          isStreaming ? (
            <StreamingMessage 
              content={streamingMessage}
              isStreaming={isStreaming}
              isComplete={false}
            />
          ) : null
        }
      />
      <InputArea 
        onSendMessage={handleSendMessage} 
        disabled={isStreaming}
        onToggleWhiteboard={onToggleWhiteboard}
        isWhiteboardOpen={isWhiteboardOpen}
      />
    </div>
  );
});

ChatContainer.displayName = 'ChatContainer';

