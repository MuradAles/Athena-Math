/**
 * MessageList component
 * Container for displaying all messages with auto-scroll
 */

import { useEffect, useRef, useState } from 'react';
import type { Message as MessageType } from '../../types';
import { Message } from './Message';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
  streamingMessage?: React.ReactNode | null;
  chatId?: string | null; // Track chat ID to reset when switching chats
}

export const MessageList = ({ messages, streamingMessage, chatId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const previousMessagesLengthRef = useRef(messages.length);
  const previousMessageIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const currentChatIdRef = useRef<string | null>(null);
  const lastMessageCountRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset seen messages when chat changes
  useEffect(() => {
    if (chatId !== currentChatIdRef.current) {
      previousMessageIdsRef.current.clear();
      isInitializedRef.current = false;
      lastMessageCountRef.current = 0;
      currentChatIdRef.current = chatId || null;
    }
  }, [chatId]);
  
  // Initialize message IDs on first load (these are not "new" messages)
  useEffect(() => {
    if (!isInitializedRef.current && messages.length > 0) {
      messages.forEach(msg => previousMessageIdsRef.current.add(msg.id));
      lastMessageCountRef.current = messages.length;
      isInitializedRef.current = true;
    }
  }, [messages]);
  
  // Track when new messages are added (after initialization)
  useEffect(() => {
    if (isInitializedRef.current && messages.length > lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  // Check if user is near the bottom of the scroll container
  const isNearBottom = (element: HTMLElement): boolean => {
    const threshold = 150; // pixels from bottom
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Handle scroll events to detect user scrolling away from bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container) {
        const nearBottom = isNearBottom(container);
        setShouldAutoScroll(nearBottom);
        
        // Clear any pending scroll timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Initial scroll to bottom on mount
  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, []); // Only on mount

  // Auto-scroll only if:
  // 1. New messages were added (not just re-render)
  // 2. User is near the bottom (or streaming is active)
  useEffect(() => {
    const hasNewMessages = messages.length > previousMessagesLengthRef.current;
    previousMessagesLengthRef.current = messages.length;

    if (hasNewMessages || streamingMessage) {
      // Only auto-scroll if user is near bottom or actively streaming
      if (shouldAutoScroll || streamingMessage) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }
  }, [messages.length, streamingMessage, shouldAutoScroll]);

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
    <div className="message-list" ref={containerRef}>
      <div className="message-list__container">
        {messages.map((message) => {
          // Check if this is a new message (not seen before)
          const isNewMessage = !previousMessageIdsRef.current.has(message.id);
          
          // Only mark as new if it's an assistant message AND we've already initialized
          // (to avoid marking loaded messages as new)
          const shouldAutoPlay = isInitializedRef.current && isNewMessage && message.role === 'assistant';
          
          // CRITICAL: Only mark as seen if NOT auto-playing
          // For auto-play messages, we'll mark them as seen via callback AFTER auto-play starts
          if (isNewMessage && !shouldAutoPlay) {
            // Mark as seen immediately if not auto-playing
            previousMessageIdsRef.current.add(message.id);
          }
          
          return (
            <Message 
              key={message.id} 
              message={message} 
              isNew={shouldAutoPlay}
              onAutoPlayComplete={
                shouldAutoPlay
                  ? () => {
                      // Mark as seen after auto-play starts
                      previousMessageIdsRef.current.add(message.id);
                    }
                  : undefined
              }
            />
          );
        })}
        {streamingMessage}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

