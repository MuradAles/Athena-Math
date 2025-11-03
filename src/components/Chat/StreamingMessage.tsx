/**
 * StreamingMessage component
 * Displays streaming AI response with cursor animation
 */

import './StreamingMessage.css';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  isComplete?: boolean;
}

export const StreamingMessage = ({
  content,
  isStreaming,
  isComplete = false,
}: StreamingMessageProps) => {
  // Show "Tutor is thinking..." when stream hasn't started
  const showThinking = isStreaming && !content;

  return (
    <div className="streaming-message assistant-message">
      <div className="streaming-content">
        {showThinking && (
          <span className="thinking-indicator">Tutor is thinking...</span>
        )}
        {content && (
          <span className="streaming-text">
            {content}
            {!isComplete && <span className="streaming-cursor">|</span>}
          </span>
        )}
      </div>
    </div>
  );
};

