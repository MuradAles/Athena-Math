/**
 * Progress Indicator Component
 * Shows dynamic progress message in header
 */

import { useMemo } from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  recentCorrect: number; // Number of correct answers in last 5 problems
  recentTotal: number; // Total problems in current session
}

export const ProgressIndicator = ({ recentCorrect, recentTotal }: ProgressIndicatorProps) => {
  const message = useMemo(() => {
    if (recentTotal === 0) {
      return "Ready to learn!";
    }
    
    const successRate = recentCorrect / recentTotal;
    
    if (successRate >= 0.8 && recentTotal >= 3) {
      return "You're doing great today!";
    } else if (successRate >= 0.6) {
      return "You improved your math today!";
    } else if (recentTotal >= 3) {
      return "Keep up the good work!";
    } else {
      return "You're learning!";
    }
  }, [recentCorrect, recentTotal]);

  return (
    <div className="progress-indicator">
      <span className="progress-message">{message}</span>
    </div>
  );
};

