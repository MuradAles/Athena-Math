/**
 * Success Stories Component
 * Displays recent achievements and milestones
 */

import type { TopicProgress } from '../../types/progress';
import './SuccessStories.css';

interface SuccessStoriesProps {
  topicsProgress: TopicProgress[];
}

export const SuccessStories = ({ topicsProgress }: SuccessStoriesProps) => {
  // Calculate success stories from progress data
  const stories = generateSuccessStories(topicsProgress);

  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="success-stories">
      <h2 className="success-stories-title">Success Stories</h2>
      <div className="success-stories-list">
        {stories.map((story, index) => (
          <div key={index} className="success-story-card">
            <div className="success-story-icon">
              {story.icon}
            </div>
            <div className="success-story-content">
              <p className="success-story-text">{story.text}</p>
              <span className="success-story-date">{story.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Generate success stories from progress data
 */
const generateSuccessStories = (topicsProgress: TopicProgress[]): Array<{
  text: string;
  icon: string;
  date: string;
}> => {
  const stories: Array<{ text: string; icon: string; date: string }> = [];

  // Calculate total problems solved today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const problemsToday = topicsProgress
    .filter(topic => {
      const lastActivity = topic.lastActivity;
      return lastActivity && lastActivity >= today;
    })
    .reduce((sum, topic) => sum + topic.totalProblems, 0);

  if (problemsToday > 0) {
    stories.push({
      text: `Solved ${problemsToday} problem${problemsToday > 1 ? 's' : ''} today!`,
      icon: '🎉',
      date: 'Today',
    });
  }

  // Find topics with high success rate
  const masteredTopics = topicsProgress
    .filter(topic => topic.successRate >= 0.8 && topic.totalProblems >= 5)
    .slice(0, 3);

  masteredTopics.forEach((topic) => {
    stories.push({
      text: `Mastered ${topic.topic}! ${Math.round(topic.successRate * 100)}% success rate`,
      icon: '⭐',
      date: formatDate(topic.lastActivity),
    });
  });

  // Find improving topics
  const improvingTopics = topicsProgress
    .filter(topic => topic.trend === 'improving' && topic.totalProblems >= 3)
    .slice(0, 2);

  improvingTopics.forEach((topic) => {
    stories.push({
      text: `Improving in ${topic.topic}! Keep up the great work!`,
      icon: '📈',
      date: formatDate(topic.lastActivity),
    });
  });

  return stories.slice(0, 5); // Limit to 5 stories
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

