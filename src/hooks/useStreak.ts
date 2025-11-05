/**
 * Streak Tracking Hook
 * Tracks consecutive correct answers and manages streak state
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface StreakState {
  currentStreak: number;
  lastCorrectDate: string | null; // ISO date string (YYYY-MM-DD)
}

export const useStreak = (userId: string | null) => {
  const [streak, setStreak] = useState<StreakState>({
    currentStreak: 0,
    lastCorrectDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load streak from Firestore
  useEffect(() => {
    if (!userId) {
      setStreak({ currentStreak: 0, lastCorrectDate: null });
      return;
    }

    const loadStreak = async () => {
      try {
        setIsLoading(true);
        const streakRef = doc(db, 'users', userId, 'sessions', 'current');
        const streakDoc = await getDoc(streakRef);

        if (streakDoc.exists()) {
          const data = streakDoc.data();
          setStreak({
            currentStreak: data.currentStreak || 0,
            lastCorrectDate: data.lastCorrectDate || null,
          });
        } else {
          setStreak({ currentStreak: 0, lastCorrectDate: null });
        }
      } catch (error) {
        console.error('Error loading streak:', error);
        setStreak({ currentStreak: 0, lastCorrectDate: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadStreak();
  }, [userId]);

  // Increment streak when answer is correct
  const incrementStreak = useCallback(async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const streakRef = doc(db, 'users', userId, 'sessions', 'current');
      
      // Check if streak should continue (same day) or reset (new day)
      const shouldContinue = streak.lastCorrectDate === today;
      
      const newStreak = shouldContinue ? streak.currentStreak + 1 : 1;
      
      await setDoc(streakRef, {
        currentStreak: newStreak,
        lastCorrectDate: today,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setStreak({
        currentStreak: newStreak,
        lastCorrectDate: today,
      });

      return newStreak;
    } catch (error) {
      console.error('Error incrementing streak:', error);
      return streak.currentStreak;
    }
  }, [userId, streak]);

  // Reset streak when answer is wrong
  const resetStreak = useCallback(async () => {
    if (!userId) return;

    try {
      const streakRef = doc(db, 'users', userId, 'sessions', 'current');
      await setDoc(streakRef, {
        currentStreak: 0,
        lastCorrectDate: null,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setStreak({ currentStreak: 0, lastCorrectDate: null });
    } catch (error) {
      console.error('Error resetting streak:', error);
    }
  }, [userId]);

  return {
    streak: streak.currentStreak,
    incrementStreak,
    resetStreak,
    isLoading,
  };
};

