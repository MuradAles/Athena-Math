/**
 * Topic Card Component
 * Displays topic progress with visual indicators
 */

import type { TopicProgress } from '../../types/progress';
import './TopicCard.css';

interface TopicCardProps {
  topicProgress: TopicProgress;
  icon: string;
}

// Get stars based on problems solved
const getStars = (count: number): number => {
  if (count >= 20) return 5;
  if (count >= 15) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 1) return 1;
  return 0;
};

export const TopicCard = ({ topicProgress, icon }: TopicCardProps) => {
  const stars = getStars(topicProgress.totalProblems);
  const maxStars = 5;

  return (
    <div className="topic-card">
      <div className="topic-card-header">
        <div className="topic-icon">{icon}</div>
        <div className="topic-info">
          <h3 className="topic-name">{topicProgress.topic}</h3>
          <div className="topic-stats">
            <span className="problems-badge">{topicProgress.totalProblems} solved</span>
          </div>
        </div>
      </div>
      
      {/* Stars */}
      <div className="topic-stars">
        {[...Array(maxStars)].map((_, i) => (
          <span 
            key={i} 
            className={`star ${i < stars ? 'earned' : 'locked'}`}
          >
            {i < stars ? '⭐' : '☆'}
          </span>
        ))}
    </div>
      
      {/* Sub-topics */}
      {topicProgress.subTopics.length > 0 && (
        <div className="topic-subtopics">
          <div className="subtopics-list">
                {topicProgress.subTopics.map((subTopic) => (
              <div key={subTopic.subTopic} className="subtopic-item">
                <div className="subtopic-name">
                  <span className="subtopic-dot">•</span>
                  {subTopic.subTopic}
                </div>
                <div className="subtopic-count">
                  {subTopic.totalProblems}
                </div>
              </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
};

