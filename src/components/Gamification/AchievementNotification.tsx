/**
 * Achievement Notification Component
 * Popup notification when achievement is earned
 */

import { useEffect, useState } from 'react';
import type { Achievement } from '../../types/achievements';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementNotification = ({ achievement, onDismiss }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement || !isVisible) return null;

  return (
    <div className="achievement-notification">
      <div className="achievement-notification-content">
        <div className="achievement-icon">{achievement.icon || '🏆'}</div>
        <div className="achievement-text">
          <div className="achievement-title">Achievement Unlocked!</div>
          <div className="achievement-name">{achievement.name}</div>
          <div className="achievement-description">{achievement.description}</div>
        </div>
        <button 
          className="achievement-close"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

