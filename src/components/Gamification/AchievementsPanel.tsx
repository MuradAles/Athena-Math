/**
 * Achievements Panel Component
 * Displays all earned achievements
 */

import type { Achievement } from '../../types/achievements';
import './AchievementsPanel.css';

interface AchievementsPanelProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsPanel = ({ achievements, onClose }: AchievementsPanelProps) => {
  const earnedAchievements = achievements.filter(a => a.earned);
  const progressAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="achievements-panel-overlay" onClick={onClose}>
      <div className="achievements-panel" onClick={(e) => e.stopPropagation()}>
        <div className="achievements-panel-header">
          <h2 className="achievements-panel-title">Achievements</h2>
          <button className="achievements-panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="achievements-panel-content">
          {earnedAchievements.length > 0 && (
            <div className="achievements-section">
              <h3 className="achievements-section-title">Earned</h3>
              <div className="achievements-grid">
                {earnedAchievements.map((achievement) => (
                  <div key={achievement.id} className="achievement-card earned">
                    <div className="achievement-card-icon">{achievement.icon || '🏆'}</div>
                    <div className="achievement-card-name">{achievement.name}</div>
                    <div className="achievement-card-description">{achievement.description}</div>
                    {achievement.earnedAt && (
                      <div className="achievement-card-date">
                        Earned {formatDate(achievement.earnedAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {progressAchievements.length > 0 && (
            <div className="achievements-section">
              <h3 className="achievements-section-title">In Progress</h3>
              <div className="achievements-grid">
                {progressAchievements.map((achievement) => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-card-icon">{achievement.icon || '🔒'}</div>
                    <div className="achievement-card-name">{achievement.name}</div>
                    <div className="achievement-card-description">{achievement.description}</div>
                    <div className="achievement-card-progress">
                      <div className="achievement-progress-bar">
                        <div 
                          className="achievement-progress-fill"
                          style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                        />
                      </div>
                      <div className="achievement-progress-text">
                        {achievement.progress} / {achievement.target}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {achievements.length === 0 && (
            <div className="achievements-empty">
              <div className="achievements-empty-icon">🏆</div>
              <p>No achievements yet. Start solving problems to earn achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

