/**
 * ChatList component
 * Displays list of user's chats with "New Chat" button
 * Supports collapse/expand with animation
 */

import { useState } from 'react';
import { useChats } from '../../hooks/useChats';
import { useAuthContext } from '../../contexts/AuthContext';
import './ChatList.css';

interface ChatListProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
}

export const ChatList = ({ activeChatId, onSelectChat }: ChatListProps) => {
  const { user } = useAuthContext();
  const { chats, loading, createNewChat, deleteChatById } = useChats(user?.uid || null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNewChat = async () => {
    try {
      const chatId = await createNewChat();
      onSelectChat(chatId);
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create new chat. Please try again.');
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent selecting the chat when clicking delete

    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await deleteChatById(chatId);
      if (activeChatId === chatId) {
        onSelectChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <div className={`chat-list ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="chat-list-header">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="chat-list-toggle"
            aria-label={isCollapsed ? 'Expand chat list' : 'Collapse chat list'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
          {!isCollapsed && (
            <button onClick={handleNewChat} className="btn btn-primary btn-sm">
              + New
            </button>
          )}
        </div>

        {!isCollapsed && (
          <>
            {loading ? (
              <div className="chat-list-loading">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="chat-list-empty">No chats yet. Create a new chat to get started!</div>
            ) : (
              <div className="chat-list-items">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-list-item-wrapper ${activeChatId === chat.id ? 'active' : ''}`}
                  >
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="chat-list-item"
                    >
                      <div className="chat-list-item-content">
                        <div className="chat-list-item-title">{chat.title}</div>
                        {chat.lastMessagePreview && (
                          <div className="chat-list-item-preview">{chat.lastMessagePreview}</div>
                        )}
                        <div className="chat-list-item-date">{formatDate(chat.updatedAt)}</div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="chat-list-item-delete"
                      aria-label="Delete chat"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

