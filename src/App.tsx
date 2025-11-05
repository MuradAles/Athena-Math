/**
 * App component
 * Main application entry point with authentication and chat management
 */

import { useState, useRef } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { Login, Signup } from './components/Auth';
import { Header } from './components/Common/Header';
import { ChatList, ChatContainer, type ChatContainerRef } from './components/Chat';
import { WhiteboardPanel } from './components/Whiteboard';
import { ProgressPage } from './pages/ProgressPage';
import { useChats } from './hooks/useChats';
import { useGamification } from './hooks/useGamification';
import { AchievementNotification } from './components/Gamification/AchievementNotification';
import './App.css';

type ViewMode = 'chat' | 'progress';

const AppContent = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { createNewChat, selectChat } = useChats(user?.uid || null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [whiteboardWidth, setWhiteboardWidth] = useState(400);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const chatContainerRef = useRef<ChatContainerRef | null>(null);
  
  // Gamification hook for header display
  const { 
    streak, 
    recentCorrect, 
    recentTotal,
    trackCorrectAnswer,
    trackWrongAnswer,
    newlyEarnedAchievement,
    dismissAchievement,
  } = useGamification(user?.uid || null);

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
    <div className={`app ${viewMode === 'progress' ? 'progress-mode' : ''}`}>
      <AchievementNotification 
        achievement={newlyEarnedAchievement}
        onDismiss={dismissAchievement}
      />
      <Header 
        isWhiteboardOpen={isWhiteboardOpen}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        streak={streak}
        recentCorrect={recentCorrect}
        recentTotal={recentTotal}
      />
      {viewMode === 'progress' ? (
        <ProgressPage />
      ) : (
        <div className="app-content">
          <ChatList activeChatId={currentChatId} onSelectChat={handleSelectChat} />
          <div className="app-chat-area">
            <ChatContainer 
              ref={chatContainerRef}
              chatId={currentChatId}
              onTrackCorrectAnswer={trackCorrectAnswer}
              onTrackWrongAnswer={trackWrongAnswer}
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
                  onSendCanvas={(imageUrl, message) => {
                    // Send canvas image to chat
                    if (chatContainerRef.current?.sendMessage) {
                      chatContainerRef.current.sendMessage(message || 'Here is my whiteboard:', imageUrl);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
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
