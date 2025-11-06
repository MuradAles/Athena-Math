/**
 * Progress Dashboard Component
 * Main dashboard showing student progress across all topics
 */

import { useEffect, useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { useAuthContext } from '../../contexts/AuthContext';
import { TopicCard } from './TopicCard';
import { SuccessStories } from './SuccessStories';
import type { TopicProgress } from '../../types/progress';
import './ProgressDashboard.css';

// Get achievement level based on problems solved
const getAchievementLevel = (count: number): { level: number; title: string; icon: string; nextMilestone: number } => {
  if (count >= 100) return { level: 5, title: 'Math Legend', icon: '👑', nextMilestone: 0 };
  if (count >= 50) return { level: 4, title: 'Problem Master', icon: '⭐', nextMilestone: 100 };
  if (count >= 25) return { level: 3, title: 'Math Wizard', icon: '🧙', nextMilestone: 50 };
  if (count >= 10) return { level: 2, title: 'Rising Star', icon: '🌟', nextMilestone: 25 };
  if (count >= 1) return { level: 1, title: 'Beginner', icon: '🚀', nextMilestone: 10 };
  return { level: 0, title: 'New Explorer', icon: '🎯', nextMilestone: 1 };
};

// Get topic icon based on topic name
const getTopicIcon = (topic: string): string => {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('algebra')) return '🔢';
  if (topicLower.includes('geometry')) return '📐';
  if (topicLower.includes('calculus')) return '📊';
  if (topicLower.includes('trigonometry')) return '📏';
  if (topicLower.includes('arithmetic')) return '➕';
  if (topicLower.includes('statistics')) return '📈';
  if (topicLower.includes('probability')) return '🎲';
  return '✨';
};

export const ProgressDashboard = () => {
  const { user } = useAuthContext();
  const { getAllTopicsProgress, isLoading, error } = useProgress(user?.uid || null);
  const [topicsProgress, setTopicsProgress] = useState<TopicProgress[]>([]);

  useEffect(() => {
    const loadProgress = async () => {
      if (user?.uid) {
        const progress = await getAllTopicsProgress();
        setTopicsProgress(progress);
      }
    };

    loadProgress();
  }, [user, getAllTopicsProgress]);

  if (isLoading) {
    return (
      <div className="progress-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your awesome progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-dashboard-error">
        <div className="error-icon">😕</div>
        <p>Oops! Something went wrong</p>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (topicsProgress.length === 0) {
    return (
      <div className="progress-dashboard-empty">
        <div className="empty-state-icon">🎯</div>
        <h2>Ready to Start Your Math Adventure?</h2>
        <p>Solve your first problem to begin tracking your progress!</p>
      </div>
    );
  }

  // Calculate overall summary
  const totalProblems = topicsProgress.reduce((sum, topic) => sum + topic.totalProblems, 0);
  const achievement = getAchievementLevel(totalProblems);

  return (
    <div className="progress-dashboard">
      {/* Hero Section */}
      <div className="progress-hero">
        <div className="achievement-badge">
          <div className="badge-icon">{achievement.icon}</div>
          <div className="badge-info">
            <div className="badge-level">Level {achievement.level}</div>
            <div className="badge-title">{achievement.title}</div>
          </div>
        </div>
        
        {achievement.nextMilestone > 0 && (
          <div className="next-milestone">
            <p className="milestone-text">
              {achievement.nextMilestone - totalProblems} more to reach Level {achievement.level + 1}!
            </p>
            <div className="milestone-progress-bar">
              <div 
                className="milestone-progress-fill"
                style={{ 
                  width: `${(totalProblems / achievement.nextMilestone) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card problems-solved">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{totalProblems}</div>
            <div className="stat-label">Problems Solved</div>
          </div>
        </div>
        
        <div className="stat-card topics-explored">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-value">{topicsProgress.length}</div>
            <div className="stat-label">Topics Explored</div>
          </div>
        </div>
        
        <div className="stat-card stars-earned">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-value">{topicsProgress.reduce((sum, t) => sum + Math.min(t.totalProblems, 5), 0)}</div>
            <div className="stat-label">Stars Earned</div>
          </div>
        </div>
      </div>

      <SuccessStories topicsProgress={topicsProgress} />

      {/* Topics Section */}
      <div className="topics-section">
        <h2 className="section-title">
          <span className="title-icon">🚀</span>
          Your Learning Journey
        </h2>
        <div className="topics-grid">
          {topicsProgress.map((topic) => (
            <TopicCard 
              key={topic.topic} 
              topicProgress={topic}
              icon={getTopicIcon(topic.topic)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

