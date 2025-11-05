/**
 * Streak Badge Component
 * Displays current streak count with fire emoji
 */

import './StreakBadge.css';

interface StreakBadgeProps {
  streak: number;
  show?: boolean;
}

export const StreakBadge = ({ streak, show = true }: StreakBadgeProps) => {
  if (!show || streak < 3) return null;

  return (
    <div className="streak-badge">
      <span className="streak-icon">🔥</span>
      <span className="streak-count">{streak}</span>
      <span className="streak-label">in a row!</span>
    </div>
  );
};

