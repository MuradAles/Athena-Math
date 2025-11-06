/**
 * Sidebar Component
 * ChatGPT-style left sidebar with navigation, progress stats, and chat list
 */

import { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { ChatList } from '../Chat/ChatList';
import type { Chat } from '../../types/chat';
import './Sidebar.css';

type ViewMode = 'chat' | 'progress';

interface SidebarProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onNewChat: () => Promise<void>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  chats: Chat[];
  onDeleteChat: (chatId: string) => Promise<void>;
}

export const Sidebar = ({
  activeChatId,
  onSelectChat,
  onNewChat,
  viewMode,
  onViewModeChange,
  onCollapseChange,
  chats,
  onDeleteChat,
}: SidebarProps) => {
  const { user, signOut } = useAuthContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapseToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top Section - Logo */}
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📐</div>
          {!isCollapsed && <span className="sidebar-logo-text">Athena-Math</span>}
        </div>
      </div>

      {/* Navigation */}
      {!isCollapsed && (
        <div className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${viewMode === 'chat' ? 'active' : ''}`}
            onClick={() => onViewModeChange('chat')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat
          </button>
          <button
            className={`sidebar-nav-item ${viewMode === 'progress' ? 'active' : ''}`}
            onClick={() => onViewModeChange('progress')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Progress
          </button>
        </div>
      )}

      {/* New Chat Button - Only show when expanded */}
      {!isCollapsed && (
        <div className="sidebar-new-chat-section">
          <button
            className="sidebar-new-chat-btn"
            onClick={onNewChat}
            title="New Chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Chat
          </button>
        </div>
      )}

      {/* Chat List */}
      <div className="sidebar-chat-list">
        <ChatList 
          activeChatId={activeChatId} 
          onSelectChat={onSelectChat}
          isCollapsed={isCollapsed}
          chats={chats}
          onDeleteChat={onDeleteChat}
        />
      </div>

      {/* Bottom Section - User Info */}
      <div className="sidebar-bottom">
        {!isCollapsed && (
          <>
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-email">{user.email}</div>
              </div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleSignOut}
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </>
        )}
        {isCollapsed && (
          <button
            className="sidebar-collapse-btn"
            onClick={() => handleCollapseToggle(false)}
            title="Expand sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
        {!isCollapsed && (
          <button
            className="sidebar-collapse-btn"
            onClick={() => handleCollapseToggle(true)}
            title="Collapse sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

