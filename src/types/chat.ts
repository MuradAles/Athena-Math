/**
 * Chat type definitions
 * Types for chat conversations and chat management
 */

import type { Message } from './message';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  problem?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessagePreview?: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

