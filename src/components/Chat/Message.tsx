/**
 * Message component
 * Displays individual chat messages with role-based styling
 */

import type { Message as MessageType } from '../../types';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`message message--${message.role}`}>
      <div className="message__content">
        <p className="message__text">{message.content}</p>
      </div>
      <span className="message__timestamp">
        {formatTimestamp(message.timestamp)}
      </span>
    </div>
  );
};

