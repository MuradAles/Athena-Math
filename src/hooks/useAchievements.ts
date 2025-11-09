/**
 * Achievement Hook
 * React hook for managing achievements
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getUserAchievements,
  checkAchievements,
} from '../services/achievementService';
import type { Achievement } from '../types/achievements';

interface UseAchievementsReturn {
  achievements: Achievement[];
  checkForNewAchievements: (
    event: {
      wasCorrect: boolean;
      hintsUsed: number;
      topic: string;
      streak: number;
    }
  ) => Promise<Achievement[]>;
  loadAchievements: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAchievements = (userId: string | null): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!userId) {
      setAchievements([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userAchievements = await getUserAchievements(userId);
      setAchievements(userAchievements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Error loading achievements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const checkForNewAchievements = useCallback(
    async (event: {
      wasCorrect: boolean;
      hintsUsed: number;
      topic: string;
      streak: number;
    }) => {
      if (!userId) return [];

      try {
        const newlyEarned = await checkAchievements(userId, event);
        
        // Reload achievements to get updated list
        if (newlyEarned.length > 0) {
          await loadAchievements();
        }
        
        return newlyEarned;
      } catch (err) {
        console.error('Error checking achievements:', err);
        return [];
      }
    },
    [userId, loadAchievements]
  );

  return {
    achievements,
    checkForNewAchievements,
    loadAchievements,
    isLoading,
    error,
  };
};

