/**
 * ChatContainer component
 * Main chat interface combining MessageList and InputArea
 */

import { useState, useCallback } from 'react';
import type { Message as MessageType } from '../../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { StreamingMessage } from './StreamingMessage';
import { useStreaming } from '../../hooks/useStreaming';
import { generateContextString, saveProblemContext } from '../../utils/storage';
import './ChatContainer.css';

export const ChatContainer = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentProblem, setCurrentProblem] = useState<string | undefined>();
  
  const {
    streamingMessage,
    isStreaming,
    startStream,
    reset: resetStream,
  } = useStreaming();

  const handleSendMessage = useCallback((content: string) => {
    // Create user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Prepare messages array for OpenAI (format: {role, content})
    const messagesForAPI = [
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content,
      },
    ];

    // Generate problem context from LocalStorage
    const problemContext = generateContextString();

    // Start streaming AI response
    resetStream(); // Clear any previous stream state
    
    startStream({
      messages: messagesForAPI,
      problem: currentProblem,
      problemContext,
      onComplete: (completeMessage: string) => {
        // Convert streaming message to regular message on completion
        const assistantMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: completeMessage,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
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
        
        // If user provides a new problem in their message, set it as current problem
        // This is a simple detection - can be improved
        if (content.includes('=') || content.includes('solve') || content.includes('help')) {
          // Extract problem from message (simple heuristic)
          const problemMatch = content.match(/([^.!?]+[=<>≤≥].+)/) || 
                               content.match(/(solve|help|find|calculate).+/i);
          if (problemMatch) {
            setCurrentProblem(problemMatch[0]);
          }
        }
        
        resetStream();
      },
    });
  }, [messages, currentProblem, startStream, resetStream]);

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
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
};

