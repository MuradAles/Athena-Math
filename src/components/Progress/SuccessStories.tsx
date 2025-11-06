/**
 * Success Stories Component
 * Displays achievements - both unlocked and locked!
 */

import { useState } from 'react';
import type { TopicProgress } from '../../types/progress';
import './SuccessStories.css';

interface SuccessStoriesProps {
  topicsProgress: TopicProgress[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  progress: number;
  requirement: number;
  type: 'epic' | 'awesome' | 'great' | 'cool';
}

export const SuccessStories = ({ topicsProgress }: SuccessStoriesProps) => {
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  
  // Get all achievements
  const allAchievements = generateAllAchievements(topicsProgress);
  const unlockedAchievements = allAchievements.filter(a => a.unlocked);
  const lockedAchievements = allAchievements.filter(a => !a.unlocked);

  if (allAchievements.length === 0) {
    return null;
  }

  return (
    <div className="success-stories">
      <div className="success-stories-header">
        <h2 className="success-stories-title">
          <span className="title-icon">🏆</span>
          Your Achievements
        </h2>
        <div className="achievement-counter">
          <span className="unlocked-count">{unlockedAchievements.length}</span>
          <span className="count-separator">/</span>
          <span className="total-count">{allAchievements.length}</span>
          <div className="celebration-burst">✨</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="achievement-tabs">
        <button
          className={`achievement-tab ${activeTab === 'unlocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('unlocked')}
        >
          <span className="tab-icon">🎉</span>
          <span className="tab-text">Unlocked ({unlockedAchievements.length})</span>
        </button>
        <button
          className={`achievement-tab ${activeTab === 'locked' ? 'active' : ''}`}
          onClick={() => setActiveTab('locked')}
        >
          <span className="tab-icon">🔒</span>
          <span className="tab-text">To Unlock ({lockedAchievements.length})</span>
        </button>
      </div>

      <div className="success-stories-grid">
        {(activeTab === 'unlocked' ? unlockedAchievements : lockedAchievements).map((achievement, index) => (
          <div 
            key={achievement.id} 
            className={`success-story-card ${achievement.type} ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="story-badge">
              {achievement.unlocked && <div className="badge-shine"></div>}
              <span className="badge-icon">{achievement.icon}</span>
              {!achievement.unlocked && <div className="lock-overlay">🔒</div>}
            </div>
            <div className="story-content">
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-description">{achievement.description}</p>
              
              {achievement.unlocked ? (
                <div className="story-footer unlocked">
                  <span className="story-date">{achievement.date}</span>
                  <span className="story-celebration">🎊</span>
                </div>
              ) : (
                <div className="achievement-progress">
                  <div className="progress-info">
                    <span className="progress-text">{achievement.progress} / {achievement.requirement}</span>
                    <span className="progress-percentage">
                      {Math.round((achievement.progress / achievement.requirement) * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%` }}
                    />
                  </div>
            </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(activeTab === 'unlocked' ? unlockedAchievements : lockedAchievements).length === 0 && (
        <div className="no-achievements">
          <div className="no-achievements-icon">
            {activeTab === 'unlocked' ? '🎯' : '🔒'}
          </div>
          <p>
            {activeTab === 'unlocked' 
              ? 'Start solving problems to unlock achievements!'
              : 'You\'ve unlocked everything! Amazing!'}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Generate ALL achievements - both locked and unlocked
 */
const generateAllAchievements = (topicsProgress: TopicProgress[]): Achievement[] => {
  const achievements: Achievement[] = [];

  // Calculate stats
  const totalProblems = topicsProgress.reduce((sum, topic) => sum + topic.totalProblems, 0);
  const topicsCount = topicsProgress.length;
  const maxTopicProblems = Math.max(0, ...topicsProgress.map(t => t.totalProblems));

  // === MILESTONE ACHIEVEMENTS ===
  const milestones = [
    { id: 'first', title: 'First Step', desc: 'Solve your very first problem', icon: '🎯', req: 1, type: 'cool' as const },
    { id: 'five', title: 'Problem Solver', desc: 'Solve 5 problems', icon: '⚡', req: 5, type: 'cool' as const },
    { id: 'ten', title: 'Great Start', desc: 'Solve 10 problems', icon: '🌟', req: 10, type: 'great' as const },
    { id: 'twentyfive', title: 'Unstoppable', desc: 'Solve 25 problems', icon: '💪', req: 25, type: 'awesome' as const },
    { id: 'fifty', title: 'On Fire!', desc: 'Solve 50 problems', icon: '🔥', req: 50, type: 'epic' as const },
    { id: 'seventyfive', title: 'Math Wizard', desc: 'Solve 75 problems', icon: '🧙', req: 75, type: 'epic' as const },
    { id: 'hundred', title: 'Legendary!', desc: 'Solve 100 problems', icon: '👑', req: 100, type: 'epic' as const },
    { id: 'onefifty', title: 'Math Master', desc: 'Solve 150 problems', icon: '🚀', req: 150, type: 'epic' as const },
    { id: 'twohundred', title: 'Math Genius', desc: 'Solve 200 problems', icon: '🧠', req: 200, type: 'epic' as const },
    { id: 'twofifty', title: 'Diamond Tier', desc: 'Solve 250 problems', icon: '💎', req: 250, type: 'epic' as const },
    { id: 'fivehundred', title: 'The GOAT', desc: 'Solve 500 problems', icon: '🐐', req: 500, type: 'epic' as const },
  ];

  milestones.forEach(m => {
    achievements.push({
      id: `milestone_${m.id}`,
      title: m.title,
      description: m.desc,
      icon: m.icon,
      unlocked: totalProblems >= m.req,
      date: totalProblems >= m.req ? 'Achievement Unlocked' : undefined,
      progress: totalProblems,
      requirement: m.req,
      type: m.type,
    });
  });

  // === DAILY ACHIEVEMENTS ===
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const problemsToday = topicsProgress
    .filter(topic => {
      const lastActivity = topic.lastActivity;
      return lastActivity && lastActivity >= today;
    })
    .reduce((sum, topic) => sum + topic.totalProblems, 0);

  const dailyAchievements = [
    { id: 'daily1', title: 'Morning Start', desc: 'Solve 1 problem today', icon: '✨', req: 1, type: 'cool' as const },
    { id: 'daily3', title: 'Daily Dedication', desc: 'Solve 3 problems today', icon: '🎯', req: 3, type: 'great' as const },
    { id: 'daily5', title: 'Daily Champion', desc: 'Solve 5 problems today', icon: '🏆', req: 5, type: 'awesome' as const },
    { id: 'daily10', title: 'Power Day', desc: 'Solve 10 problems today', icon: '🚀', req: 10, type: 'epic' as const },
    { id: 'daily20', title: 'Marathon Day', desc: 'Solve 20 problems today', icon: '💥', req: 20, type: 'epic' as const },
  ];

  dailyAchievements.forEach(d => {
    achievements.push({
      id: `daily_${d.id}`,
      title: d.title,
      description: d.desc,
      icon: d.icon,
      unlocked: problemsToday >= d.req,
      date: problemsToday >= d.req ? 'Today' : undefined,
      progress: problemsToday,
      requirement: d.req,
      type: d.type,
    });
  });

  // === TOPIC MASTERY ACHIEVEMENTS ===
  const masteryLevels = [
    { id: 'topic5', title: 'Topic Beginner', desc: 'Solve 5 problems in any topic', icon: '📖', req: 5, type: 'cool' as const },
    { id: 'topic10', title: 'Topic Specialist', desc: 'Solve 10 problems in any topic', icon: '🎓', req: 10, type: 'great' as const },
    { id: 'topic20', title: 'Topic Expert', desc: 'Solve 20 problems in any topic', icon: '🎖️', req: 20, type: 'awesome' as const },
    { id: 'topic30', title: 'Topic Master', desc: 'Solve 30 problems in any topic', icon: '🏆', req: 30, type: 'awesome' as const },
    { id: 'topic50', title: 'Topic Legend', desc: 'Solve 50 problems in any topic', icon: '👑', req: 50, type: 'epic' as const },
  ];

  masteryLevels.forEach(m => {
    achievements.push({
      id: `mastery_${m.id}`,
      title: m.title,
      description: m.desc,
      icon: m.icon,
      unlocked: maxTopicProblems >= m.req,
      date: maxTopicProblems >= m.req ? 'Achievement Unlocked' : undefined,
      progress: maxTopicProblems,
      requirement: m.req,
      type: m.type,
    });
  });

  // === EXPLORER ACHIEVEMENTS - Topic Diversity ===
  const explorerLevels = [
    { id: 'exp1', title: 'Curious Mind', desc: 'Start your first topic', icon: '🗺️', req: 1, type: 'cool' as const },
    { id: 'exp3', title: 'Multi-Talented', desc: 'Explore 3 different topics', icon: '📚', req: 3, type: 'cool' as const },
    { id: 'exp5', title: 'Knowledge Seeker', desc: 'Explore 5 different topics', icon: '🔍', req: 5, type: 'great' as const },
    { id: 'exp7', title: 'Topic Adventurer', desc: 'Explore 7 different topics', icon: '🧭', req: 7, type: 'awesome' as const },
    { id: 'exp10', title: 'Math Explorer', desc: 'Explore 10 different topics', icon: '🌍', req: 10, type: 'epic' as const },
  ];

  explorerLevels.forEach(e => {
    achievements.push({
      id: `explorer_${e.id}`,
      title: e.title,
      description: e.desc,
      icon: e.icon,
      unlocked: topicsCount >= e.req,
      date: topicsCount >= e.req ? 'Achievement Unlocked' : undefined,
      progress: topicsCount,
      requirement: e.req,
      type: e.type,
    });
  });

  // === SPECIAL ACHIEVEMENTS ===
  const maxSubTopics = Math.max(0, ...topicsProgress.map(t => t.subTopics.length));
  achievements.push({
    id: 'special_deep_diver',
    title: 'Deep Diver',
    description: 'Explore 5 sub-topics in one topic',
    icon: '🔬',
    unlocked: maxSubTopics >= 5,
    date: maxSubTopics >= 5 ? 'Achievement Unlocked' : undefined,
    progress: maxSubTopics,
    requirement: 5,
    type: 'awesome',
  });

  const balancedTopics = topicsProgress.filter(t => t.totalProblems >= 5).length;
  achievements.push({
    id: 'special_balanced',
    title: 'Balanced Learner',
    description: 'Solve 5+ problems in 3 topics',
    icon: '⚖️',
    unlocked: balancedTopics >= 3,
    date: balancedTopics >= 3 ? 'Achievement Unlocked' : undefined,
    progress: balancedTopics,
    requirement: 3,
    type: 'awesome',
  });

  const independentCount = topicsProgress.filter(t => 
    t.avgHintsPerProblem < 0.5 && t.totalProblems >= 5
  ).length;
  achievements.push({
    id: 'special_independent',
    title: 'Independent Learner',
    description: 'Solve 5+ problems with minimal hints',
    icon: '💡',
    unlocked: independentCount > 0,
    date: independentCount > 0 ? 'Achievement Unlocked' : undefined,
    progress: Math.min(5, totalProblems),
    requirement: 5,
    type: 'awesome',
  });

  const efficientCount = topicsProgress.filter(t => 
    t.avgQuestionsPerProblem <= 3 && t.totalProblems >= 5
  ).length;
  achievements.push({
    id: 'special_quick',
    title: 'Quick Thinker',
    description: 'Solve problems efficiently',
    icon: '⚡',
    unlocked: efficientCount > 0,
    date: efficientCount > 0 ? 'Achievement Unlocked' : undefined,
    progress: Math.min(5, totalProblems),
    requirement: 5,
    type: 'great',
  });

  achievements.push({
    id: 'special_versatile',
    title: 'Versatile Achiever',
    description: 'Solve 20+ problems in 3+ topics',
    icon: '🎪',
    unlocked: totalProblems >= 20 && topicsCount >= 3,
    date: totalProblems >= 20 && topicsCount >= 3 ? 'Achievement Unlocked' : undefined,
    progress: topicsCount >= 3 ? totalProblems : 0,
    requirement: 20,
    type: 'awesome',
  });

  const currentHour = new Date().getHours();
  const isEarlyBird = problemsToday > 0 && currentHour >= 5 && currentHour < 9;
  achievements.push({
    id: 'special_early_bird',
    title: 'Early Bird',
    description: 'Solve problems in the morning',
    icon: '🌅',
    unlocked: isEarlyBird,
    date: isEarlyBird ? 'Today' : undefined,
    progress: isEarlyBird ? 1 : 0,
    requirement: 1,
    type: 'cool',
  });

  const isNightOwl = problemsToday > 0 && currentHour >= 20 && currentHour < 24;
  achievements.push({
    id: 'special_night_owl',
    title: 'Night Owl',
    description: 'Solve problems at night',
    icon: '🌙',
    unlocked: isNightOwl,
    date: isNightOwl ? 'Today' : undefined,
    progress: isNightOwl ? 1 : 0,
    requirement: 1,
    type: 'cool',
  });

  const dayOfWeek = today.getDay();
  const isWeekendWarrior = problemsToday > 0 && (dayOfWeek === 0 || dayOfWeek === 6);
  achievements.push({
    id: 'special_weekend',
    title: 'Weekend Warrior',
    description: 'Learn on weekends',
    icon: '🎮',
    unlocked: isWeekendWarrior,
    date: isWeekendWarrior ? 'Today' : undefined,
    progress: isWeekendWarrior ? 1 : 0,
    requirement: 1,
    type: 'great',
  });

  // === ADDITIONAL MILESTONE ACHIEVEMENTS ===
  const additionalMilestones = [
    { id: 'fifteen', title: 'Building Momentum', desc: 'Solve 15 problems', icon: '⚡', req: 15, type: 'great' as const },
    { id: 'thirty', title: 'Rising Star', desc: 'Solve 30 problems', icon: '⭐', req: 30, type: 'awesome' as const },
    { id: 'forty', title: 'Getting Strong', desc: 'Solve 40 problems', icon: '💪', req: 40, type: 'awesome' as const },
    { id: 'sixty', title: 'Power Player', desc: 'Solve 60 problems', icon: '🚀', req: 60, type: 'epic' as const },
    { id: 'eighty', title: 'Almost There', desc: 'Solve 80 problems', icon: '🔥', req: 80, type: 'epic' as const },
    { id: 'ninety', title: 'Century Bound', desc: 'Solve 90 problems', icon: '💯', req: 90, type: 'epic' as const },
    { id: 'one25', title: 'Math Champion', desc: 'Solve 125 problems', icon: '🏆', req: 125, type: 'epic' as const },
    { id: 'one75', title: 'Elite Solver', desc: 'Solve 175 problems', icon: '💎', req: 175, type: 'epic' as const },
    { id: 'two25', title: 'Supreme Master', desc: 'Solve 225 problems', icon: '👑', req: 225, type: 'epic' as const },
    { id: 'threehundred', title: 'Triple Century', desc: 'Solve 300 problems', icon: '🎯', req: 300, type: 'epic' as const },
    { id: 'fourhundred', title: 'Quad Century', desc: 'Solve 400 problems', icon: '🌟', req: 400, type: 'epic' as const },
    { id: 'thousand', title: 'Millennium Club', desc: 'Solve 1000 problems', icon: '🏅', req: 1000, type: 'epic' as const },
  ];

  additionalMilestones.forEach(m => {
    achievements.push({
      id: `milestone_${m.id}`,
      title: m.title,
      description: m.desc,
      icon: m.icon,
      unlocked: totalProblems >= m.req,
      date: totalProblems >= m.req ? 'Achievement Unlocked' : undefined,
      progress: totalProblems,
      requirement: m.req,
      type: m.type,
    });
  });

  // === SUB-TOPIC ACHIEVEMENTS ===
  const subTopicAchievements = [
    { id: 'sub2', title: 'Sub-Topic Explorer', desc: 'Explore 2 sub-topics in one topic', icon: '🔍', req: 2, type: 'cool' as const },
    { id: 'sub3', title: 'Sub-Topic Diver', desc: 'Explore 3 sub-topics in one topic', icon: '🐠', req: 3, type: 'great' as const },
    { id: 'sub4', title: 'Sub-Topic Seeker', desc: 'Explore 4 sub-topics in one topic', icon: '🌊', req: 4, type: 'great' as const },
    { id: 'sub6', title: 'Deep Diver', desc: 'Explore 6 sub-topics in one topic', icon: '🔬', req: 6, type: 'awesome' as const },
    { id: 'sub8', title: 'Sub-Topic Master', desc: 'Explore 8 sub-topics in one topic', icon: '🧭', req: 8, type: 'awesome' as const },
    { id: 'sub10', title: 'Sub-Topic Legend', desc: 'Explore 10 sub-topics in one topic', icon: '🗺️', req: 10, type: 'epic' as const },
  ];

  subTopicAchievements.forEach(s => {
    achievements.push({
      id: `subtopic_${s.id}`,
      title: s.title,
      description: s.desc,
      icon: s.icon,
      unlocked: maxSubTopics >= s.req,
      date: maxSubTopics >= s.req ? 'Achievement Unlocked' : undefined,
      progress: maxSubTopics,
      requirement: s.req,
      type: s.type,
    });
  });

  // === TOPIC MASTERY EXTENDED ===
  const extendedMastery = [
    { id: 'topic15', title: 'Topic Proficient', desc: 'Solve 15 problems in any topic', icon: '📚', req: 15, type: 'great' as const },
    { id: 'topic25', title: 'Topic Advanced', desc: 'Solve 25 problems in any topic', icon: '🎓', req: 25, type: 'awesome' as const },
    { id: 'topic40', title: 'Topic Expert', desc: 'Solve 40 problems in any topic', icon: '🎖️', req: 40, type: 'awesome' as const },
    { id: 'topic60', title: 'Topic Champion', desc: 'Solve 60 problems in any topic', icon: '🏆', req: 60, type: 'epic' as const },
    { id: 'topic75', title: 'Topic Grandmaster', desc: 'Solve 75 problems in any topic', icon: '👑', req: 75, type: 'epic' as const },
    { id: 'topic100', title: 'Topic Centurion', desc: 'Solve 100 problems in any topic', icon: '💯', req: 100, type: 'epic' as const },
  ];

  extendedMastery.forEach(m => {
    achievements.push({
      id: `mastery_${m.id}`,
      title: m.title,
      description: m.desc,
      icon: m.icon,
      unlocked: maxTopicProblems >= m.req,
      date: maxTopicProblems >= m.req ? 'Achievement Unlocked' : undefined,
      progress: maxTopicProblems,
      requirement: m.req,
      type: m.type,
    });
  });

  // === EXPLORER EXTENDED ===
  const extendedExplorer = [
    { id: 'exp2', title: 'Two-Topic Talent', desc: 'Explore 2 different topics', icon: '📖', req: 2, type: 'cool' as const },
    { id: 'exp4', title: 'Four-Topic Scholar', desc: 'Explore 4 different topics', icon: '📚', req: 4, type: 'great' as const },
    { id: 'exp6', title: 'Six-Topic Sage', desc: 'Explore 6 different topics', icon: '🔍', req: 6, type: 'awesome' as const },
    { id: 'exp8', title: 'Eight-Topic Explorer', desc: 'Explore 8 different topics', icon: '🧭', req: 8, type: 'awesome' as const },
    { id: 'exp12', title: 'Math Polymath', desc: 'Explore 12 different topics', icon: '🌍', req: 12, type: 'epic' as const },
    { id: 'exp15', title: 'Universal Scholar', desc: 'Explore 15 different topics', icon: '🌎', req: 15, type: 'epic' as const },
  ];

  extendedExplorer.forEach(e => {
    achievements.push({
      id: `explorer_${e.id}`,
      title: e.title,
      description: e.desc,
      icon: e.icon,
      unlocked: topicsCount >= e.req,
      date: topicsCount >= e.req ? 'Achievement Unlocked' : undefined,
      progress: topicsCount,
      requirement: e.req,
      type: e.type,
    });
  });

  // === BALANCED LEARNING ACHIEVEMENTS ===
  const balancedAchievements = [
    { id: 'bal2', title: 'Two-Topic Balance', desc: 'Solve 5+ problems in 2 topics', icon: '⚖️', req: 2, type: 'cool' as const },
    { id: 'bal4', title: 'Four-Topic Balance', desc: 'Solve 5+ problems in 4 topics', icon: '🎯', req: 4, type: 'great' as const },
    { id: 'bal5', title: 'Five-Topic Balance', desc: 'Solve 5+ problems in 5 topics', icon: '🎪', req: 5, type: 'awesome' as const },
    { id: 'bal6', title: 'Six-Topic Balance', desc: 'Solve 5+ problems in 6 topics', icon: '🌟', req: 6, type: 'awesome' as const },
    { id: 'bal8', title: 'Eight-Topic Balance', desc: 'Solve 5+ problems in 8 topics', icon: '🌐', req: 8, type: 'epic' as const },
  ];

  balancedAchievements.forEach(b => {
    achievements.push({
      id: `balanced_${b.id}`,
      title: b.title,
      description: b.desc,
      icon: b.icon,
      unlocked: balancedTopics >= b.req,
      date: balancedTopics >= b.req ? 'Achievement Unlocked' : undefined,
      progress: balancedTopics,
      requirement: b.req,
      type: b.type,
    });
  });

  // === ADVANCED TOPIC MASTERY ===
  const advancedTopics10 = topicsProgress.filter(t => t.totalProblems >= 10).length;
  const advancedTopics20 = topicsProgress.filter(t => t.totalProblems >= 20).length;
  const advancedTopics30 = topicsProgress.filter(t => t.totalProblems >= 30).length;

  if (advancedTopics10 >= 2) {
    achievements.push({
      id: 'multi_10_2',
      title: 'Double Specialist',
      description: 'Master 2 topics with 10+ problems each',
      icon: '🎖️',
      unlocked: advancedTopics10 >= 2,
      date: advancedTopics10 >= 2 ? 'Achievement Unlocked' : undefined,
      progress: advancedTopics10,
      requirement: 2,
      type: 'awesome',
    });
  }

  if (advancedTopics10 >= 3) {
    achievements.push({
      id: 'multi_10_3',
      title: 'Triple Specialist',
      description: 'Master 3 topics with 10+ problems each',
      icon: '🏆',
      unlocked: advancedTopics10 >= 3,
      date: advancedTopics10 >= 3 ? 'Achievement Unlocked' : undefined,
      progress: advancedTopics10,
      requirement: 3,
      type: 'epic',
    });
  }

  if (advancedTopics20 >= 2) {
    achievements.push({
      id: 'multi_20_2',
      title: 'Double Expert',
      description: 'Master 2 topics with 20+ problems each',
      icon: '👑',
      unlocked: advancedTopics20 >= 2,
      date: advancedTopics20 >= 2 ? 'Achievement Unlocked' : undefined,
      progress: advancedTopics20,
      requirement: 2,
      type: 'epic',
    });
  }

  // === CONSISTENCY ACHIEVEMENTS ===
  const recentActivity = topicsProgress.filter(topic => {
    const daysSinceActivity = Math.floor((today.getTime() - topic.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceActivity <= 7;
  });

  if (recentActivity.length >= 2 && totalProblems >= 10) {
    achievements.push({
      id: 'consistency_week',
      title: 'Weekly Learner',
      description: 'Active in 2+ topics this week',
      icon: '📅',
      unlocked: recentActivity.length >= 2,
      date: 'This Week',
      progress: recentActivity.length,
      requirement: 2,
      type: 'great',
    });
  }

  if (recentActivity.length >= 4 && totalProblems >= 20) {
    achievements.push({
      id: 'consistency_active',
      title: 'Active Learner',
      description: 'Active in 4+ topics this week',
      icon: '🔥',
      unlocked: recentActivity.length >= 4,
      date: 'This Week',
      progress: recentActivity.length,
      requirement: 4,
      type: 'awesome',
    });
  }

  // === HINT USAGE ACHIEVEMENTS ===
  const hintFreeTopics = topicsProgress.filter(t => 
    t.avgHintsPerProblem === 0 && t.totalProblems >= 3
  ).length;
  
  if (hintFreeTopics >= 1) {
    achievements.push({
      id: 'hint_free',
      title: 'Hint-Free Hero',
      description: 'Solve 3+ problems without any hints',
      icon: '💪',
      unlocked: hintFreeTopics >= 1,
      date: hintFreeTopics >= 1 ? 'Achievement Unlocked' : undefined,
      progress: hintFreeTopics,
      requirement: 1,
      type: 'awesome',
    });
  }

  const strategicTopics = topicsProgress.filter(t => 
    t.avgHintsPerProblem >= 1 && t.avgHintsPerProblem <= 1.5 && t.totalProblems >= 5
  ).length;

  if (strategicTopics >= 1) {
    achievements.push({
      id: 'hint_strategic',
      title: 'Strategic Learner',
      description: 'Use hints wisely (1-1.5 avg)',
      icon: '🧠',
      unlocked: strategicTopics >= 1,
      date: strategicTopics >= 1 ? 'Achievement Unlocked' : undefined,
      progress: strategicTopics,
      requirement: 1,
      type: 'great',
    });
  }

  // === EFFICIENCY ACHIEVEMENTS ===
  const veryEfficientTopics = topicsProgress.filter(t => 
    t.avgQuestionsPerProblem <= 2 && t.totalProblems >= 5
  ).length;

  if (veryEfficientTopics >= 1) {
    achievements.push({
      id: 'efficiency_expert',
      title: 'Efficiency Expert',
      description: 'Solve problems with 2 or fewer questions',
      icon: '⚡',
      unlocked: veryEfficientTopics >= 1,
      date: veryEfficientTopics >= 1 ? 'Achievement Unlocked' : undefined,
      progress: veryEfficientTopics,
      requirement: 1,
      type: 'awesome',
    });
  }

  // === COMBO ACHIEVEMENTS ===
  if (totalProblems >= 30 && topicsCount >= 5) {
    achievements.push({
      id: 'combo_30_5',
      title: 'Versatile Achiever',
      description: 'Solve 30+ problems across 5+ topics',
      icon: '🎪',
      unlocked: totalProblems >= 30 && topicsCount >= 5,
      date: 'Achievement Unlocked',
      progress: Math.min(totalProblems, topicsCount * 6),
      requirement: 30,
      type: 'awesome',
    });
  }

  if (totalProblems >= 50 && topicsCount >= 3) {
    achievements.push({
      id: 'combo_50_3',
      title: 'Deep & Wide',
      description: 'Solve 50+ problems across 3+ topics',
      icon: '🌊',
      unlocked: totalProblems >= 50 && topicsCount >= 3,
      date: 'Achievement Unlocked',
      progress: Math.min(totalProblems, topicsCount * 17),
      requirement: 50,
      type: 'epic',
    });
  }

  if (totalProblems >= 100 && topicsCount >= 7) {
    achievements.push({
      id: 'combo_100_7',
      title: 'Universal Master',
      description: 'Solve 100+ problems across 7+ topics',
      icon: '🌍',
      unlocked: totalProblems >= 100 && topicsCount >= 7,
      date: 'Achievement Unlocked',
      progress: Math.min(totalProblems, topicsCount * 15),
      requirement: 100,
      type: 'epic',
    });
  }

  // === DAILY EXTENDED ACHIEVEMENTS ===
  const dailyExtended = [
    { id: 'daily7', title: 'Steady Progress', desc: 'Solve 7 problems today', icon: '📈', req: 7, type: 'great' as const },
    { id: 'daily15', title: 'Power Session', desc: 'Solve 15 problems today', icon: '💥', req: 15, type: 'epic' as const },
    { id: 'daily25', title: 'Marathon Session', desc: 'Solve 25 problems today', icon: '🏃', req: 25, type: 'epic' as const },
    { id: 'daily30', title: 'Ultra Marathon', desc: 'Solve 30 problems today', icon: '🌟', req: 30, type: 'epic' as const },
  ];

  dailyExtended.forEach(d => {
    achievements.push({
      id: `daily_${d.id}`,
      title: d.title,
      description: d.desc,
      icon: d.icon,
      unlocked: problemsToday >= d.req,
      date: problemsToday >= d.req ? 'Today' : undefined,
      progress: problemsToday,
      requirement: d.req,
      type: d.type,
    });
  });

  return achievements.sort((a, b) => {
    // Sort by: unlocked first, then by type (epic > awesome > great > cool), then by requirement
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    const typeOrder = { epic: 0, awesome: 1, great: 2, cool: 3 };
    if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type];
    return a.requirement - b.requirement;
  });
};

