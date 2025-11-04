/**
 * App component
 * Main application entry point with authentication and chat management
 */

import { useState } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { Login, Signup } from './components/Auth';
import { Header } from './components/Common/Header';
import { ChatList, ChatContainer } from './components/Chat';
import { WhiteboardPanel } from './components/Whiteboard';
import { useChats } from './hooks/useChats';
import './App.css';

const AppContent = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { createNewChat, selectChat } = useChats(user?.uid || null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [whiteboardWidth, setWhiteboardWidth] = useState(400);

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
      <Header 
        isWhiteboardOpen={isWhiteboardOpen}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
      />
      <div className="app-content">
        <ChatList activeChatId={currentChatId} onSelectChat={handleSelectChat} />
        <div className="app-chat-area">
          <ChatContainer 
            chatId={currentChatId} 
          />
        </div>
        <div 
          className={`whiteboard-sidebar ${isWhiteboardOpen ? 'open' : ''}`}
          style={{ width: isWhiteboardOpen ? `${whiteboardWidth}px` : '0px' }}
        >
          {isWhiteboardOpen && (
            <div className="whiteboard-panel-wrapper">
              <div 
                className="whiteboard-resizer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = whiteboardWidth;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = startX - e.clientX; // Reverse because we're resizing from right
                    const newWidth = Math.max(300, Math.min(800, startWidth + deltaX));
                    setWhiteboardWidth(newWidth);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              <WhiteboardPanel 
                chatId={currentChatId}
                width={whiteboardWidth}
                onClose={() => setIsWhiteboardOpen(false)}
              />
            </div>
          )}
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
