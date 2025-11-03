/**
 * Message type definitions
 * Core types for chat messages in the tutor conversation
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export type MessageRole = Message['role'];

