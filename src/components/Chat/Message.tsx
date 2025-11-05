/**
 * Message component
 * Displays individual chat messages with role-based styling
 * Supports LaTeX math rendering via KaTeX
 * Shows sparkle animation on correct answers
 */

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Message as MessageType } from '../../types';
import { InlineMath, BlockMath } from 'react-katex';
import { parseMathContent } from '../../utils/mathRenderer';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { SparkleAnimation } from '../Gamification/SparkleAnimation';
import 'katex/dist/katex.min.css';
import './Message.css';

interface MessageProps {
  message: MessageType;
  isNew?: boolean; // Whether this is a newly received message
  onAutoPlayComplete?: () => void; // Callback when auto-play completes
  isCorrectAnswer?: boolean; // Whether this message indicates a correct answer
}

export const Message = ({ message, isNew = false, onAutoPlayComplete, isCorrectAnswer = false }: MessageProps) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const { isGenerating, isPlaying, generateAndPlay, stop } = useTextToSpeech();
  const hasAutoPlayedRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);

  // Trigger sparkles when correct answer is detected
  useEffect(() => {
    if (isCorrectAnswer && isAssistant) {
      setShowSparkles(true);
      // Reset after animation completes
      const timer = setTimeout(() => setShowSparkles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isCorrectAnswer, isAssistant]);

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
  
  // Auto-play when isNew becomes true - FIXED: stable dependencies only
  useEffect(() => {
    // Reset flag if message ID changed (new message)
    if (lastMessageIdRef.current !== message.id) {
      lastMessageIdRef.current = message.id;
      hasAutoPlayedRef.current = false;
    }
    
    // Only trigger if isNew is true, is assistant, has content, and hasn't played yet
    if (!isNew || !isAssistant || !cleanContent || hasAutoPlayedRef.current) {
      return;
    }
    
    // Mark as played immediately to prevent duplicate calls
    hasAutoPlayedRef.current = true;
    
    // Call audio generation immediately (no timeout to avoid cancellation)
    generateAndPlay(cleanContent)
      .then(() => {
        if (onAutoPlayComplete) {
          onAutoPlayComplete();
        }
      })
      .catch((error) => {
        console.error('Error auto-playing audio:', error);
        hasAutoPlayedRef.current = false; // Reset on error so user can retry manually
        if (onAutoPlayComplete) {
          onAutoPlayComplete();
        }
      });
  // CRITICAL: Only depend on isNew and message.id to prevent re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, message.id]);
  

  // Parse math content if there's text to display
  const mathSegments = cleanContent ? parseMathContent(cleanContent) : [];

  // Render content with math support
  const renderContent = () => {
    if (!cleanContent) return null;

    // Flatten segments into renderable elements
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

    return <div className="message__text">{elements}</div>;
  };

  const handlePlayClick = () => {
    if (isPlaying) {
      stop();
    } else if (cleanContent) {
      generateAndPlay(cleanContent);
    }
  };

  return (
    <div className={`message message--${message.role} ${isCorrectAnswer ? 'message--correct' : ''}`}>
      <div className="message__content">
        {isCorrectAnswer && isAssistant && (
          <SparkleAnimation trigger={showSparkles} />
        )}
        {imageUrl && (
          <div className="message__image">
            <img src={imageUrl} alt="User uploaded" className="message__image-img" />
          </div>
        )}
        {renderContent()}
      </div>
      <div className="message__footer">
        {isAssistant && cleanContent && (
          <button
            className={`message__play-btn ${isPlaying ? 'message__play-btn--playing' : ''}`}
            onClick={handlePlayClick}
            disabled={isGenerating}
            aria-label={isPlaying ? 'Stop playing' : 'Play audio'}
            title={isPlaying ? 'Stop playing' : 'Play audio'}
          >
            {isGenerating ? '⏳' : isPlaying ? '⏸️' : '🔊'}
          </button>
        )}
        <span className="message__timestamp">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

