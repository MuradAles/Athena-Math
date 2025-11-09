/**
 * Header component
 * Shows user info, navigation, and logout button
 */

import { useAuthContext } from '../../contexts/AuthContext';
import { ProgressIndicator } from '../Gamification/ProgressIndicator';
import { StreakBadge } from '../Gamification/StreakBadge';
import AthenaLogo from '../../assets/Athena.png';
import './Header.css';

type ViewMode = 'chat' | 'progress';

interface HeaderProps {
  onToggleWhiteboard?: () => void;
  isWhiteboardOpen?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  streak?: number;
  recentCorrect?: number;
  recentTotal?: number;
}

export const Header = ({ 
  onToggleWhiteboard, 
  isWhiteboardOpen,
  viewMode = 'chat',
  onViewModeChange,
  streak = 0,
  recentCorrect = 0,
  recentTotal = 0,
}: HeaderProps) => {
  const { user, signOut } = useAuthContext();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <img src={AthenaLogo} alt="Athena Logo" className="header-logo" />
          <h1 className="header-title">Athena</h1>
        </div>
        <nav className="header-nav">
          <button
            className={`header-nav-btn ${viewMode === 'chat' ? 'active' : ''}`}
            onClick={() => onViewModeChange?.('chat')}
            title="Chat"
          >
            Chat
          </button>
          <button
            className={`header-nav-btn ${viewMode === 'progress' ? 'active' : ''}`}
            onClick={() => onViewModeChange?.('progress')}
            title="Progress"
          >
            Progress
          </button>
        </nav>
        {viewMode === 'chat' && (
          <div className="header-gamification">
            <ProgressIndicator 
              recentCorrect={recentCorrect}
              recentTotal={recentTotal}
            />
            <StreakBadge streak={streak} />
          </div>
        )}
        <div className="header-user">
          {onToggleWhiteboard && viewMode === 'chat' && (
            <button
              className={`header-whiteboard-btn ${isWhiteboardOpen ? 'active' : ''}`}
              onClick={onToggleWhiteboard}
              title="Toggle whiteboard"
              aria-label="Toggle whiteboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 3v18"/>
                <path d="M3 9h18"/>
              </svg>
            </button>
          )}
          <span className="header-email">{user.email}</span>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

