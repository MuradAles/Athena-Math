/**
 * Achievement Notification Component
 * Popup notification when achievement is earned
 */

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
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
      
      // Trigger confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Fire confetti from multiple angles
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 500); // Wait for fade out animation
      }, 6000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className={`achievement-notification-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="achievement-notification-modal">
        <div className="achievement-sparkle achievement-sparkle-1">✨</div>
        <div className="achievement-sparkle achievement-sparkle-2">✨</div>
        <div className="achievement-sparkle achievement-sparkle-3">✨</div>
        <div className="achievement-sparkle achievement-sparkle-4">✨</div>
        <div className="achievement-icon-large">{achievement.icon || '🏆'}</div>
        <div className="achievement-title-large">🎉 Achievement Unlocked! 🎉</div>
        <div className="achievement-name-large">{achievement.name}</div>
        <div className="achievement-description-large">{achievement.description}</div>
        <button 
          className="achievement-dismiss-btn"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 500);
          }}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

