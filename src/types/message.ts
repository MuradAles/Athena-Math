/**
 * Message type definitions
 * Core types for chat messages in the tutor conversation
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string; // Optional image URL for user messages
  timestamp: Date;
}

export type MessageRole = Message['role'];

