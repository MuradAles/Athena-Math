/**
 * Daily Progress Tracking Hook
 * Tracks total questions solved today (not consecutive, just total today)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface DailyProgressState {
  questionsSolvedToday: number;
  lastUpdatedDate: string | null; // ISO date string (YYYY-MM-DD)
}

export const useStreak = (userId: string | null) => {
  const [progress, setProgress] = useState<DailyProgressState>({
    questionsSolvedToday: 0,
    lastUpdatedDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load daily progress from Firestore
  useEffect(() => {
    if (!userId) {
      setProgress({ questionsSolvedToday: 0, lastUpdatedDate: null });
      return;
    }

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const progressRef = doc(db, 'users', userId, 'sessions', 'current');
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
          const data = progressDoc.data();
          const lastUpdated = data.lastUpdatedDate || null;
          
          // If last updated was today, use the stored count; otherwise reset to 0
          if (lastUpdated === today) {
            setProgress({
              questionsSolvedToday: data.questionsSolvedToday || 0,
              lastUpdatedDate: today,
            });
          } else {
            // New day, reset to 0
            setProgress({ questionsSolvedToday: 0, lastUpdatedDate: null });
          }
        } else {
          setProgress({ questionsSolvedToday: 0, lastUpdatedDate: null });
        }
      } catch (error) {
        console.error('Error loading daily progress:', error);
        setProgress({ questionsSolvedToday: 0, lastUpdatedDate: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId]);

  // Increment when answer is correct (just count, no reset on wrong)
  const incrementStreak = useCallback(async () => {
    if (!userId) return 0;

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const progressRef = doc(db, 'users', userId, 'sessions', 'current');
      
      // Check if we need to reset (new day)
      const shouldReset = progress.lastUpdatedDate !== today;
      const newCount = shouldReset ? 1 : progress.questionsSolvedToday + 1;
      
      await setDoc(progressRef, {
        questionsSolvedToday: newCount,
        lastUpdatedDate: today,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setProgress({
        questionsSolvedToday: newCount,
        lastUpdatedDate: today,
      });

      return newCount;
    } catch (error) {
      console.error('Error incrementing daily progress:', error);
      return progress.questionsSolvedToday;
    }
  }, [userId, progress]);

  // Reset streak (no longer needed, but keeping for compatibility)
  const resetStreak = useCallback(async () => {
    // Do nothing - we don't reset on wrong answers anymore
    // Only resets at the start of a new day
  }, []);

  return {
    streak: progress.questionsSolvedToday, // Now represents total solved today
    incrementStreak,
    resetStreak,
    isLoading,
  };
};

