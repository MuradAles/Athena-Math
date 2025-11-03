/**
 * ChatContainer component
 * Main chat interface combining MessageList and InputArea
 */

import { useState } from 'react';
import type { Message as MessageType } from '../../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import './ChatContainer.css';

export const ChatContainer = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  const handleSendMessage = (content: string) => {
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // TODO: Add OpenAI integration in Task 1.13-1.16
    // For now, add a placeholder response
    setTimeout(() => {
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'This is a placeholder response. OpenAI integration will be added in the next tasks.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
};

