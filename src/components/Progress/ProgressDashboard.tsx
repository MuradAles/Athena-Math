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
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-dashboard-error">
        <p>Error loading progress: {error}</p>
      </div>
    );
  }

  if (topicsProgress.length === 0) {
    return (
      <div className="progress-dashboard-empty">
        <div className="empty-state-icon">📊</div>
        <h2>No Progress Yet</h2>
        <p>Start solving problems to see your progress here!</p>
      </div>
    );
  }

  // Calculate overall summary
  const totalProblems = topicsProgress.reduce((sum, topic) => sum + topic.totalProblems, 0);
  const totalCorrect = topicsProgress.reduce((sum, topic) => sum + topic.correctAnswers, 0);
  const overallSuccessRate = totalProblems > 0 ? totalCorrect / totalProblems : 0;

  return (
    <div className="progress-dashboard">
      <div className="progress-dashboard-header">
        <div className="progress-dashboard-title">
          <h1>Learning Progress</h1>
          <p className="progress-dashboard-subtitle">Track your math journey</p>
        </div>
        <div className="progress-dashboard-summary">
          <div className="summary-card">
            <span className="summary-label">Total Problems</span>
            <span className="summary-value">{totalProblems}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Success Rate</span>
            <span className="summary-value">{Math.round(overallSuccessRate * 100)}%</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Topics</span>
            <span className="summary-value">{topicsProgress.length}</span>
          </div>
        </div>
      </div>

      <SuccessStories topicsProgress={topicsProgress} />

      <div className="progress-dashboard-topics">
        <h2 className="topics-section-title">Topics</h2>
        <div className="topics-grid">
          {topicsProgress.map((topic) => (
            <TopicCard key={topic.topic} topicProgress={topic} />
          ))}
        </div>
      </div>
    </div>
  );
};

