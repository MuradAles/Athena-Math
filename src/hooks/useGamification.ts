/**
 * Gamification Hook
 * Manages all gamification logic: progress tracking, streaks, achievements
 */

import { useState, useCallback, useRef } from 'react';
import { useStreak } from '../hooks/useStreak';
import { useAchievements } from '../hooks/useAchievements';
import { useProgress } from '../hooks/useProgress';
import type { Achievement } from '../types/achievements';

interface UseGamificationReturn {
  // Progress tracking
  trackCorrectAnswer: (
    chatId: string,
    problem: string,
    hintsUsed: number,
    questionsAsked: number
  ) => Promise<void>;
  trackWrongAnswer: (chatId: string, problem: string) => Promise<void>;
  
  // Streak
  streak: number;
  
  // Achievements
  newlyEarnedAchievement: Achievement | null;
  dismissAchievement: () => void;
  
  // Session stats
  recentCorrect: number;
  recentTotal: number;
}

export const useGamification = (userId: string | null): UseGamificationReturn => {
  const { streak, incrementStreak, resetStreak } = useStreak(userId);
  const { checkForNewAchievements } = useAchievements(userId);
  const { trackProgress } = useProgress(userId);
  
  // Session tracking
  const sessionStatsRef = useRef<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [newlyEarnedAchievement, setNewlyEarnedAchievement] = useState<Achievement | null>(null);
  
  // Track correct answer
  const trackCorrectAnswer = useCallback(
    async (
      chatId: string,
      problem: string,
      hintsUsed: number,
      questionsAsked: number
    ) => {
      if (!userId) return;

      // Update session stats
      sessionStatsRef.current.correct++;
      sessionStatsRef.current.total++;

      // Increment streak
      const newStreak = await incrementStreak();

      // Track progress event (topic will be extracted automatically)
      await trackProgress(
        chatId,
        problem,
        true, // wasCorrect
        hintsUsed,
        1, // attemptsBeforeCorrect - simplified for now
        questionsAsked,
        problem
      );

      // Get topic for achievement checking (will be extracted by progress service)
      // For now, we'll check achievements after progress is tracked
      // The progress service extracts topic, so we'll use a generic check
      const newAchievements = await checkForNewAchievements({
        wasCorrect: true,
        hintsUsed,
        topic: 'unknown', // Will be updated when we can get it from progress
        streak: newStreak,
      });

      // Show first achievement notification
      if (newAchievements.length > 0) {
        setNewlyEarnedAchievement(newAchievements[0]);
      }
    },
    [userId, incrementStreak, trackProgress, checkForNewAchievements]
  );

  // Track wrong answer
  const trackWrongAnswer = useCallback(async (chatId: string, problem: string) => {
    if (!userId) return;

    // Update session stats
    sessionStatsRef.current.total++;

    // Reset streak
    await resetStreak();

    // Track progress event (will extract topic automatically)
    await trackProgress(
      chatId,
      problem,
      false, // wasCorrect
      0, // hintsUsed - simplified
      0, // attemptsBeforeCorrect
      0, // questionsPerProblem
      problem
    );
  }, [userId, resetStreak, trackProgress]);

  const dismissAchievement = useCallback(() => {
    setNewlyEarnedAchievement(null);
  }, []);

  return {
    trackCorrectAnswer,
    trackWrongAnswer,
    streak,
    newlyEarnedAchievement,
    dismissAchievement,
    recentCorrect: sessionStatsRef.current.correct,
    recentTotal: sessionStatsRef.current.total,
  };
};

