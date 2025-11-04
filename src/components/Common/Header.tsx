/**
 * Header component
 * Shows user info and logout button
 */

import { useAuthContext } from '../../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  onToggleWhiteboard?: () => void;
  isWhiteboardOpen?: boolean;
}

export const Header = ({ onToggleWhiteboard, isWhiteboardOpen }: HeaderProps) => {
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
        <h1 className="header-title">Math Tutor</h1>
        <div className="header-user">
          {onToggleWhiteboard && (
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

