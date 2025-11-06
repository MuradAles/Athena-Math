/**
 * Daily Progress Badge Component
 * Displays total questions solved today
 */

import './StreakBadge.css';

interface StreakBadgeProps {
  streak: number; // Now represents total solved today
  show?: boolean;
}

export const StreakBadge = ({ streak, show = true }: StreakBadgeProps) => {
  if (!show || streak === 0) return null;

  return (
    <div className="streak-badge">
      <span className="streak-icon">📊</span>
      <span className="streak-count">{streak}</span>
      <span className="streak-label">solved today</span>
    </div>
  );
};

