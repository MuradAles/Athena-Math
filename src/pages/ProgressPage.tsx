/**
 * Progress Page Component
 * Route wrapper for progress dashboard
 */

import { ProgressDashboard } from '../components/Progress/ProgressDashboard';
import './ProgressPage.css';

export const ProgressPage = () => {
  return (
    <div className="progress-page">
      <ProgressDashboard />
    </div>
  );
};

