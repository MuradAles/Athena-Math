/**
 * Topic Card Component
 * Displays topic progress with visual indicators
 */

import { useState } from 'react';
import type { TopicProgress } from '../../types/progress';
import './TopicCard.css';

interface TopicCardProps {
  topicProgress: TopicProgress;
  onExpand?: (topic: string) => void;
}

export const TopicCard = ({ topicProgress, onExpand }: TopicCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (onExpand) {
      onExpand(topicProgress.topic);
    }
  };

  // Determine color based on success rate
  const getSuccessColor = (rate: number): string => {
    if (rate >= 0.8) return 'success'; // Green
    if (rate >= 0.5) return 'warning'; // Yellow
    return 'error'; // Red
  };

  const successColor = getSuccessColor(topicProgress.successRate);
  const successPercentage = Math.round(topicProgress.successRate * 100);

  return (
    <div className={`topic-card ${successColor}`} onClick={handleClick}>
      <div className="topic-card-header">
        <div className="topic-card-title">
          <h3 className="topic-name">{topicProgress.topic}</h3>
          <span className="topic-problems-count">
            {topicProgress.totalProblems} problems
          </span>
        </div>
        <div className="topic-card-indicator">
          <div className={`topic-success-circle ${successColor}`}>
            <span className="topic-success-percentage">{successPercentage}%</span>
          </div>
          <svg 
            className={`topic-expand-icon ${isExpanded ? 'expanded' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="topic-card-details">
          <TopicDetail topicProgress={topicProgress} />
        </div>
      )}
    </div>
  );
};

/**
 * Topic Detail Component
 * Shows detailed breakdown when topic card is expanded
 */
const TopicDetail = ({ topicProgress }: { topicProgress: TopicProgress }) => {
  return (
    <div className="topic-detail">
      <div className="topic-detail-stats">
        <div className="topic-stat-item">
          <span className="topic-stat-label">Success Rate</span>
          <span className="topic-stat-value">{Math.round(topicProgress.successRate * 100)}%</span>
        </div>
        <div className="topic-stat-item">
          <span className="topic-stat-label">Avg Hints</span>
          <span className="topic-stat-value">{topicProgress.avgHintsPerProblem.toFixed(1)}</span>
        </div>
        <div className="topic-stat-item">
          <span className="topic-stat-label">Avg Questions</span>
          <span className="topic-stat-value">{topicProgress.avgQuestionsPerProblem.toFixed(1)}</span>
        </div>
      </div>

      {topicProgress.subTopics.length > 0 && (
        <div className="topic-subtopics">
          <h4 className="topic-subtopics-title">Sub-topics</h4>
          <div className="topic-subtopics-list">
            {topicProgress.subTopics.map((subTopic) => (
              <div key={subTopic.subTopic} className="topic-subtopic-item">
                <span className="topic-subtopic-name">{subTopic.subTopic}</span>
                <span className="topic-subtopic-progress">
                  {subTopic.totalProblems} problems · {Math.round(subTopic.successRate * 100)}% success
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="topic-difficulty-breakdown">
        <h4 className="topic-difficulty-title">Difficulty Breakdown</h4>
        <div className="topic-difficulty-list">
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
            const breakdown = topicProgress.difficultyBreakdown[difficulty];
            return (
              <div key={difficulty} className="topic-difficulty-item">
                <span className="topic-difficulty-label">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                <span className="topic-difficulty-stats">
                  {breakdown.attempted} attempted · {breakdown.correct} correct
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

