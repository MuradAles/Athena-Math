/**
 * Achievement Types
 * Definitions for all achievement types and their requirements
 */

export type AchievementType = 
  | 'streak' 
  | 'topic_mastery' 
  | 'daily_goal' 
  | 'hint_efficiency' 
  | 'consistency';

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  name: string;
  description: string;
  progress: number;
  target: number;
  earned: boolean;
  earnedAt?: Date;
  icon?: string;
}

export interface AchievementDefinition {
  type: AchievementType;
  name: string;
  description: string;
  target: number;
  icon: string;
}

/**
 * Achievement definitions
 */
export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  // Streak achievements
  streak_3: {
    type: 'streak',
    name: 'Hot Streak',
    description: 'Answer 3 questions correctly in a row',
    target: 3,
    icon: '🔥',
  },
  streak_5: {
    type: 'streak',
    name: 'On Fire',
    description: 'Answer 5 questions correctly in a row',
    target: 5,
    icon: '🔥',
  },
  streak_10: {
    type: 'streak',
    name: 'Unstoppable',
    description: 'Answer 10 questions correctly in a row',
    target: 10,
    icon: '🔥',
  },
  streak_20: {
    type: 'streak',
    name: 'Math Master',
    description: 'Answer 20 questions correctly in a row',
    target: 20,
    icon: '🔥',
  },
  streak_100: {
    type: 'streak',
    name: 'Legend',
    description: 'Answer 100 questions correctly in a row',
    target: 100,
    icon: '🔥',
  },
  streak_1000: {
    type: 'streak',
    name: 'Mythical',
    description: 'Answer 1000 questions correctly in a row',
    target: 1000,
    icon: '🔥',
  },
  
  // Topic mastery
  topic_mastery_10: {
    type: 'topic_mastery',
    name: 'Topic Expert',
    description: 'Solve 10 problems in a topic',
    target: 10,
    icon: '⭐',
  },
  
  // Daily goals
  daily_5: {
    type: 'daily_goal',
    name: 'Daily Learner',
    description: 'Solve 5 problems today',
    target: 5,
    icon: '📚',
  },
  daily_10: {
    type: 'daily_goal',
    name: 'Daily Champion',
    description: 'Solve 10 problems today',
    target: 10,
    icon: '📚',
  },
  
  // Hint efficiency
  hint_efficiency_0: {
    type: 'hint_efficiency',
    name: 'Independent',
    description: 'Solve a problem with 0 hints',
    target: 0,
    icon: '💪',
  },
  hint_efficiency_1: {
    type: 'hint_efficiency',
    name: 'Quick Learner',
    description: 'Solve a problem with 1 hint or less',
    target: 1,
    icon: '💪',
  },
  
  // Consistency
  consistency_3: {
    type: 'consistency',
    name: 'Consistent',
    description: 'Practice 3 days in a row',
    target: 3,
    icon: '📅',
  },
  consistency_7: {
    type: 'consistency',
    name: 'Dedicated',
    description: 'Practice 7 days in a row',
    target: 7,
    icon: '📅',
  },
};

