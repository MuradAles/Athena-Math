/**
 * App component
 * Main application entry point with authentication and chat management
 */

import { useState } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { Login, Signup } from './components/Auth';
import { Header } from './components/Common/Header';
import { ChatList, ChatContainer } from './components/Chat';
import { useChats } from './hooks/useChats';
import './App.css';

const AppContent = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { createNewChat, selectChat } = useChats(user?.uid || null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    if (showSignup) {
      return <Signup onSwitchToLogin={() => setShowSignup(false)} />;
    }
    return <Login onSwitchToSignup={() => setShowSignup(true)} />;
  }

  // Handle chat selection
  const handleSelectChat = (chatId: string | null) => {
    setCurrentChatId(chatId);
    if (chatId) {
      selectChat(chatId);
    }
  };

  // Main app layout
  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <ChatList activeChatId={currentChatId} onSelectChat={handleSelectChat} />
        <div className="app-chat-area">
          <ChatContainer chatId={currentChatId} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
