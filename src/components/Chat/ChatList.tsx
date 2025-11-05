/**
 * ChatList component
 * Displays list of user's chats with "New Chat" button
 * Supports collapse/expand with animation
 */

import { useState, useRef, useEffect } from 'react';
import { useChats } from '../../hooks/useChats';
import { useAuthContext } from '../../contexts/AuthContext';
import { clearProblemContext } from '../../utils/storage';
import './ChatList.css';

interface ChatListProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
}

export const ChatList = ({ activeChatId, onSelectChat }: ChatListProps) => {
  const { user } = useAuthContext();
  const { chats, loading, createNewChat, deleteChatById } = useChats(user?.uid || null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNewChat = async () => {
    try {
      // Clear problem context when creating a new chat
      // Each new chat should be independent and not use context from other chats
      clearProblemContext();
      
      const chatId = await createNewChat();
      onSelectChat(chatId);
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create new chat. Please try again.');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    // Close menu
    setOpenMenuId(null);

    // Mark as deleting for animation
    setDeletingChatId(chatId);
    
    // Clear active chat if it's the one being deleted
    if (activeChatId === chatId) {
      onSelectChat(null);
    }

    try {
      // Wait for animation to start
      await new Promise(resolve => setTimeout(resolve, 100));
      await deleteChatById(chatId);
    } catch (error) {
      console.error('Error deleting chat:', error);
      setDeletingChatId(null); // Reset on error
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
                    className={`chat-list-item-wrapper ${activeChatId === chat.id ? 'active' : ''} ${deletingChatId === chat.id ? 'chat-list-item-wrapper--deleting' : ''}`}
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
                    <div className="chat-list-item-menu" ref={openMenuId === chat.id ? menuRef : null}>
                      <button
                        onClick={(e) => handleMenuClick(e, chat.id)}
                        className="chat-list-item-menu-btn"
                        aria-label="Chat options"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                      {openMenuId === chat.id && (
                        <div className="chat-list-item-menu-dropdown">
                          <button
                            onClick={() => handleDeleteChat(chat.id)}
                            className="chat-list-item-menu-delete"
                            aria-label="Delete chat"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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

