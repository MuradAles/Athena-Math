/**
 * ChatContainer component
 * Main chat interface combining MessageList and InputArea
 * Now integrated with Firestore for persistence
 */

import { useEffect, useCallback } from 'react';
import type { Message as MessageType } from '../../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { StreamingMessage } from './StreamingMessage';
import { useStreaming } from '../../hooks/useStreaming';
import { useChats } from '../../hooks/useChats';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateContextString, saveProblemContext } from '../../utils/storage';
import './ChatContainer.css';

interface ChatContainerProps {
  chatId: string | null;
}

export const ChatContainer = ({ chatId }: ChatContainerProps) => {
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

  // Get messages from current chat
  const messages = currentChat?.messages || [];
  const currentProblem = currentChat?.problem;

  const handleSendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!chatId || !user || !currentChat) {
        console.error('Cannot send message: missing chatId, user, or currentChat', { chatId, user: !!user, currentChat: !!currentChat });
        return;
      }

      console.log('Sending message:', content, imageUrl ? 'with image' : '');

      // Create user message (store imageUrl separately)
      const userMessage: MessageType = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content || '',
        imageUrl: imageUrl, // Store image URL separately
        timestamp: new Date(),
      };

      // Save user message to Firestore
      try {
        await addMessage(userMessage);
        console.log('User message saved to Firestore');
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

      const messagesForAPI = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        newUserMessage,
      ];

      console.log('Messages for API:', messagesForAPI.length, 'messages');

      // Generate problem context from LocalStorage
      const problemContext = generateContextString();

      // Start streaming AI response
      resetStream(); // Clear any previous stream state
      
      console.log('Starting stream...');
      startStream({
      messages: messagesForAPI,
      problem: currentProblem,
      problemContext,
        onComplete: async (completeMessage: string) => {
        // Convert streaming message to regular message on completion
        const assistantMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: completeMessage,
          timestamp: new Date(),
        };
        
          // Save assistant message to Firestore
          await addMessage(assistantMessage);
        
        // If student solved problem successfully (AI confirms with "Perfect!" or similar)
        const isProblemSolved = 
          completeMessage.toLowerCase().includes('perfect!') ||
          completeMessage.toLowerCase().includes('great job!') ||
          completeMessage.toLowerCase().includes('yes! perfect') ||
          completeMessage.toLowerCase().includes('exactly!');
        
        // If student asks for "another problem", also save context from conversation
        const isRequestingAnotherProblem = 
          content.toLowerCase().includes('another problem') ||
          content.toLowerCase().includes('another example') ||
          content.toLowerCase().includes('give me another') ||
          content.toLowerCase().includes('new problem');
        
        // Save context when problem is solved or when requesting another problem
        if ((isProblemSolved || isRequestingAnotherProblem) && currentProblem) {
          // Save problem context - AI will analyze concepts from conversation context
          saveProblemContext({
            lastSolvedProblem: currentProblem,
            complexity: 'medium', // Default, can be refined later
          });
        }
        
        resetStream();
      },
    });
    },
    [chatId, user, messages, currentProblem, addMessage, startStream, resetStream]
  );

  if (!chatId) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <p>Select a chat from the sidebar or create a new chat to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <MessageList 
        messages={messages}
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
      />
    </div>
  );
};

