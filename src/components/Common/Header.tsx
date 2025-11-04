/**
 * Header component
 * Shows user info and logout button
 */

import { useAuthContext } from '../../contexts/AuthContext';
import './Header.css';

export const Header = () => {
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
          <span className="header-email">{user.email}</span>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

