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

  // Extract image URL from content if stored as [Image: ...] format (legacy)
  const extractImageUrl = (content: string): string | null => {
    const match = content.match(/\[Image:\s*([^\]]+)\]/);
    return match ? match[1] : null;
  };

  // Get image URL from message.imageUrl or extract from content
  const imageUrl = message.imageUrl || (isUser ? extractImageUrl(message.content) : null);
  
  // Clean content to remove [Image: ...] text if present
  const cleanContent = imageUrl && message.content.includes('[Image:')
    ? message.content.replace(/\[Image:[^\]]+\]\s*/, '').trim()
    : message.content;

  return (
    <div className={`message message--${message.role}`}>
      <div className="message__content">
        {imageUrl && (
          <div className="message__image">
            <img src={imageUrl} alt="User uploaded" className="message__image-img" />
          </div>
        )}
        {cleanContent && (
          <p className="message__text">{cleanContent}</p>
        )}
      </div>
      <span className="message__timestamp">
        {formatTimestamp(message.timestamp)}
      </span>
    </div>
  );
};

