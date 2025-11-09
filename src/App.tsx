/**
 * App component
 * Main application entry point with authentication and chat management
 */

import { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { Login, Signup } from './components/Auth';
import { Sidebar } from './components/Common/Sidebar';
import { ChatContainer, type ChatContainerRef } from './components/Chat';
import { WhiteboardPanel } from './components/Whiteboard';
import { ProgressPage } from './pages/ProgressPage';
import { useGamification } from './hooks/useGamification';
import { useChats } from './hooks/useChats';
import { AchievementNotification } from './components/Gamification/AchievementNotification';
import './App.css';

type ViewMode = 'chat' | 'progress';

const AppContent = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [whiteboardWidth, setWhiteboardWidth] = useState(400);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const chatContainerRef = useRef<ChatContainerRef | null>(null);
  
  // Chat management hook - single instance for entire app
  const { chats, createNewChat, deleteChatById } = useChats(user?.uid || null);
  
  // Track if we've auto-selected the latest chat
  const hasAutoSelectedRef = useRef(false);
  
  // Gamification hook for progress tracking
  const { 
    trackCorrectAnswer: trackCorrectAnswerGamification,
    trackWrongAnswer: trackWrongAnswerGamification,
    newlyEarnedAchievement,
    dismissAchievement,
  } = useGamification(user?.uid || null);

  // Wrapper functions - useGamification already matches ChatContainer signature
  const trackCorrectAnswer = trackCorrectAnswerGamification;
  const trackWrongAnswer = trackWrongAnswerGamification;

  // Auto-select the latest chat when chats are loaded and no chat is selected
  useEffect(() => {
    // Only auto-select if:
    // 1. We have a user
    // 2. We have chats available
    // 3. No chat is currently selected
    // 4. We haven't already auto-selected a chat
    if (user && chats.length > 0 && !currentChatId && !hasAutoSelectedRef.current) {
      // Select the latest chat (first in array, sorted by updatedAt desc)
      const latestChat = chats[0];
      if (latestChat) {
        setCurrentChatId(latestChat.id);
        hasAutoSelectedRef.current = true;
      }
    }
    
    // Reset auto-select flag if chats become empty
    if (chats.length === 0) {
      hasAutoSelectedRef.current = false;
    }
  }, [user, chats, currentChatId]);

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
    // Switch to chat mode when a chat is selected (e.g., from progress page)
    if (chatId) {
      setViewMode('chat');
    }
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    try {
      const newChatId = await createNewChat();
      setCurrentChatId(newChatId);
      setViewMode('chat'); // Ensure we're in chat mode
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  // Main app layout
  return (
    <div className={`app ${viewMode === 'progress' ? 'progress-mode' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AchievementNotification 
        achievement={newlyEarnedAchievement}
        onDismiss={dismissAchievement}
      />
      <Sidebar
        activeChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCollapseChange={setIsSidebarCollapsed}
        chats={chats}
        onDeleteChat={deleteChatById}
      />
      <div className="app-main">
      {viewMode === 'progress' ? (
        <ProgressPage />
      ) : (
          <>
          <div className="app-chat-area">
            <ChatContainer 
              ref={chatContainerRef}
              chatId={currentChatId}
              onTrackCorrectAnswer={trackCorrectAnswer}
              onTrackWrongAnswer={trackWrongAnswer}
                onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                isWhiteboardOpen={isWhiteboardOpen}
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
          </>
        )}
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
