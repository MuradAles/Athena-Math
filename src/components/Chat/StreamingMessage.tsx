/**
 * StreamingMessage component
 * Displays streaming AI response with cursor animation
 * Supports LaTeX math rendering via KaTeX during streaming
 */

import type React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { parseMathContent } from '../../utils/mathRenderer';
import 'katex/dist/katex.min.css';
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

  // Parse math content for real-time formatting during streaming
  const mathSegments = content ? parseMathContent(content) : [];

  // Render content with math support (same logic as Message component)
  const renderContent = () => {
    if (!content) return null;

    const elements: React.ReactNode[] = [];
    
    mathSegments.forEach((segment, index) => {
      if (segment.type === 'text') {
        // Render text with preserved line breaks
        const lines = segment.content.split('\n');
        lines.forEach((line, lineIndex) => {
          elements.push(
            <span key={`text-${index}-${lineIndex}`}>
              {line}
            </span>
          );
          if (lineIndex < lines.length - 1) {
            elements.push(<br key={`br-${index}-${lineIndex}`} />);
          }
        });
      } else if (segment.type === 'inline') {
        try {
          elements.push(<InlineMath key={`inline-${index}`} math={segment.content} />);
        } catch (error) {
          // Fallback to text if KaTeX fails
          console.error('KaTeX inline rendering error:', error);
          elements.push(<span key={`inline-error-${index}`}>${segment.content}$</span>);
        }
      } else if (segment.type === 'block') {
        try {
          elements.push(<BlockMath key={`block-${index}`} math={segment.content} />);
        } catch (error) {
          // Fallback to text if KaTeX fails
          console.error('KaTeX block rendering error:', error);
          elements.push(<div key={`block-error-${index}`}>$${segment.content}$$</div>);
        }
      }
    });

    return <div className="streaming-text">{elements}</div>;
  };

  return (
    <div className="streaming-message assistant-message">
      <div className="streaming-content">
        {showThinking && (
          <span className="thinking-indicator">Tutor is thinking...</span>
        )}
        {content && (
          <>
            {renderContent()}
            {!isComplete && <span className="streaming-cursor">|</span>}
          </>
        )}
      </div>
    </div>
  );
};

