/**
 * Firestore service
 * Handles Firestore database operations for chats
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Chat, ChatWithMessages } from '../types/chat';
import type { Message } from '../types/message';

/**
 * Convert Firestore timestamp to Date
 */
const timestampToDate = (timestamp: Timestamp | Date | null | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  return new Date();
};

/**
 * Create a new chat for a user
 */
export const createChat = async (userId: string, problem?: string): Promise<string> => {
  try {
    // Import the smart naming function
    const { generateChatName } = await import('../utils/chatNaming');
    const title = generateChatName(problem);
    
    const chatData = {
      userId,
      title,
      problem: problem || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const chatsRef = collection(db, 'users', userId, 'chats');
    const docRef = await addDoc(chatsRef, chatData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

/**
 * Get all chats for a user
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'users', userId, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    const chats: Chat[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      chats.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title || 'New Chat',
        problem: data.problem,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
        lastMessagePreview: data.lastMessagePreview,
      });
    });

    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

/**
 * Get a single chat with its messages
 */
export const getChatWithMessages = async (userId: string, chatId: string): Promise<ChatWithMessages | null> => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      return null;
    }

    const chatData = chatSnap.data();
    const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
    const messagesSnapshot = await getDocs(query(messagesRef, orderBy('timestamp', 'asc')));

    const messages: Message[] = [];
    messagesSnapshot.forEach((msgDoc) => {
      const msgData = msgDoc.data();
      messages.push({
        id: msgDoc.id,
        role: msgData.role,
        content: msgData.content,
        imageUrl: msgData.imageUrl || undefined, // Read imageUrl if present
        timestamp: timestampToDate(msgData.timestamp),
      });
    });

    return {
      id: chatSnap.id,
      userId: chatData.userId,
      title: chatData.title || 'New Chat',
      problem: chatData.problem,
      createdAt: timestampToDate(chatData.createdAt),
      updatedAt: timestampToDate(chatData.updatedAt),
      lastMessagePreview: chatData.lastMessagePreview,
      messages,
    };
  } catch (error) {
    console.error('Error getting chat with messages:', error);
    throw error;
  }
};

/**
 * Save a message to a chat
 */
export const saveMessage = async (
  userId: string,
  chatId: string,
  message: Message
): Promise<void> => {
  try {
    const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      role: message.role,
      content: message.content,
      imageUrl: message.imageUrl || null, // Save imageUrl if present
      timestamp: Timestamp.fromDate(message.timestamp),
    });

    // Update chat's updatedAt and lastMessagePreview
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const updateData: any = {
      updatedAt: serverTimestamp(),
      lastMessagePreview: message.content.substring(0, 100),
    };

    // If this is a user message, check if we should update the chat title/problem
    if (message.role === 'user') {
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const { generateChatName } = await import('../utils/chatNaming');
        
        // If no problem is set yet, extract it from this message
        if (!chatData.problem || chatData.problem.trim() === '') {
          const newTitle = generateChatName(message.content);
          // Only update if we extracted a meaningful name (not "New Chat")
          if (newTitle !== 'New Chat') {
            updateData.problem = message.content;
            updateData.title = newTitle;
          }
        } else {
          // If problem is already set, but title is generic, try to improve it
          if (chatData.title === 'New Chat' || chatData.title.length < 10) {
            const newTitle = generateChatName(message.content);
            if (newTitle !== 'New Chat' && newTitle.length > 5) {
              updateData.title = newTitle;
            }
          }
        }
      }
    }

    await updateDoc(chatRef, updateData);
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Subscribe to chat messages in real-time
 */
export const subscribeToChatMessages = (
  userId: string,
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        role: data.role,
        content: data.content,
        imageUrl: data.imageUrl || undefined, // Read imageUrl if present
        timestamp: timestampToDate(data.timestamp),
      });
    });
    callback(messages);
  });
};

/**
 * Delete a chat
 */
export const deleteChat = async (userId: string, chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

