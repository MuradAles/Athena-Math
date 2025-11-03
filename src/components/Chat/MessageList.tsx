/**
 * MessageList component
 * Container for displaying all messages with auto-scroll
 */

import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../../types';
import { Message } from './Message';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
  streamingMessage?: React.ReactNode | null;
}

export const MessageList = ({ messages, streamingMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="message-list message-list--empty">
        <p className="message-list__empty-text">
          Start a conversation by entering a math problem!
        </p>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="message-list__container">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {streamingMessage}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

