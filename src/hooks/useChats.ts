/**
 * useChats hook
 * Manages chat state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  createChat,
  getUserChats,
  getChatWithMessages,
  saveMessage,
  subscribeToChatMessages,
  deleteChat,
} from '../services/firestore';
import type { Chat, ChatWithMessages } from '../types/chat';
import type { Message } from '../types/message';

interface UseChatsReturn {
  chats: Chat[];
  currentChat: ChatWithMessages | null;
  loading: boolean;
  createNewChat: (problem?: string) => Promise<string>;
  loadChat: (chatId: string) => Promise<void>;
  selectChat: (chatId: string | null) => void;
  addMessage: (message: Message) => Promise<void>;
  deleteChatById: (chatId: string) => Promise<void>;
  refreshChats: () => Promise<void>;
}

export const useChats = (userId: string | null): UseChatsReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!userId) {
      setChats([]);
      return;
    }

    try {
      setLoading(true);
      const userChats = await getUserChats(userId);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load chats on mount and when userId changes
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Subscribe to current chat messages
  useEffect(() => {
    if (!userId || !currentChatId) {
      setCurrentChat(null);
      return;
    }

    const unsubscribe = subscribeToChatMessages(userId, currentChatId, (messages) => {
      setCurrentChat((prev) => {
        if (!prev) return null;
        return { ...prev, messages };
      });
    });

    return () => unsubscribe();
  }, [userId, currentChatId]);

  // Create a new chat
  const createNewChat = useCallback(
    async (problem?: string): Promise<string> => {
      if (!userId) throw new Error('User not authenticated');

      try {
        const chatId = await createChat(userId, problem);
        // Silently refresh without showing loading
        const userChats = await getUserChats(userId);
        setChats(userChats);
        return chatId;
      } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
      }
    },
    [userId]
  );

  // Load a specific chat
  const loadChat = useCallback(
    async (chatId: string) => {
      if (!userId) return;

      try {
        setLoading(true);
        const chat = await getChatWithMessages(userId, chatId);
        if (chat) {
          setCurrentChat(chat);
          setCurrentChatId(chatId);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Select a chat (for UI)
  const selectChat = useCallback(
    (chatId: string | null) => {
      if (!chatId) {
        setCurrentChat(null);
        setCurrentChatId(null);
        return;
      }
      loadChat(chatId);
    },
    [loadChat]
  );

  // Add a message to current chat
  const addMessage = useCallback(
    async (message: Message) => {
      if (!userId || !currentChatId) {
        throw new Error('No active chat');
      }

      try {
        await saveMessage(userId, currentChatId, message);
        // Real-time update will handle UI update via subscription
      } catch (error) {
        console.error('Error adding message:', error);
        throw error;
      }
    },
    [userId, currentChatId]
  );

  // Delete a chat
  const deleteChatById = useCallback(
    async (chatId: string) => {
      if (!userId) return;

      // Optimistically remove from list
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChat(null);
        setCurrentChatId(null);
      }

      try {
        await deleteChat(userId, chatId);
        // Silently refresh to ensure consistency without showing loading
        const userChats = await getUserChats(userId);
        setChats(userChats);
      } catch (error) {
        console.error('Error deleting chat:', error);
        // Revert on error by reloading
        await loadChats();
        throw error;
      }
    },
    [userId, currentChatId, loadChats]
  );

  return {
    chats,
    currentChat,
    loading,
    createNewChat,
    loadChat,
    selectChat,
    addMessage,
    deleteChatById,
    refreshChats: loadChats,
  };
};

