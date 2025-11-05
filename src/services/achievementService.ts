/**
 * Achievement Service
 * Handles achievement detection and tracking
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Achievement, AchievementType } from '../types/achievements';
import { ACHIEVEMENT_DEFINITIONS } from '../types/achievements';

/**
 * Check and update achievements based on progress event
 */
export const checkAchievements = async (
  userId: string,
  event: {
    wasCorrect: boolean;
    hintsUsed: number;
    topic: string;
    streak: number;
  }
): Promise<Achievement[]> => {
  if (!userId) return [];

  try {
    const newlyEarned: Achievement[] = [];

    // Get current achievements
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const achievementsSnapshot = await getDocs(achievementsRef);
    const existingAchievements = new Map<string, Achievement>();
    
    achievementsSnapshot.forEach((doc) => {
      const achievement = { id: doc.id, ...doc.data() } as Achievement;
      existingAchievements.set(`${achievement.type}_${achievement.target}`, achievement);
    });

    // Check streak achievements
    if (event.wasCorrect && event.streak >= 3) {
      const streakTargets = [3, 5, 10, 20, 100, 1000];
      for (const target of streakTargets) {
        if (event.streak >= target) {
          const key = `streak_${target}`;
          const existing = existingAchievements.get(`streak_${target}`);
          
          if (!existing || !existing.earned) {
            const definition = ACHIEVEMENT_DEFINITIONS[key];
            if (definition) {
              const achievement: Achievement = {
                id: key,
                userId,
                type: 'streak',
                name: definition.name,
                description: definition.description,
                progress: event.streak,
                target: target,
                earned: true,
                earnedAt: new Date(),
                icon: definition.icon,
              };
              
              await setDoc(
                doc(db, 'users', userId, 'achievements', key),
                {
                  ...achievement,
                  earnedAt: serverTimestamp(),
                },
                { merge: true }
              );
              
              newlyEarned.push(achievement);
            }
          }
        }
      }
    }

    // Check hint efficiency achievements
    if (event.wasCorrect) {
      if (event.hintsUsed === 0) {
        const key = 'hint_efficiency_0';
        const existing = existingAchievements.get(`hint_efficiency_0`);
        if (!existing || !existing.earned) {
          const definition = ACHIEVEMENT_DEFINITIONS[key];
          if (definition) {
            const achievement: Achievement = {
              id: key,
              userId,
              type: 'hint_efficiency',
              name: definition.name,
              description: definition.description,
              progress: 0,
              target: 0,
              earned: true,
              earnedAt: new Date(),
              icon: definition.icon,
            };
            
            await setDoc(
              doc(db, 'users', userId, 'achievements', key),
              {
                ...achievement,
                earnedAt: serverTimestamp(),
              },
              { merge: true }
            );
            
            newlyEarned.push(achievement);
          }
        }
      } else if (event.hintsUsed === 1) {
        const key = 'hint_efficiency_1';
        const existing = existingAchievements.get(`hint_efficiency_1`);
        if (!existing || !existing.earned) {
          const definition = ACHIEVEMENT_DEFINITIONS[key];
          if (definition) {
            const achievement: Achievement = {
              id: key,
              userId,
              type: 'hint_efficiency',
              name: definition.name,
              description: definition.description,
              progress: 1,
              target: 1,
              earned: true,
              earnedAt: new Date(),
              icon: definition.icon,
            };
            
            await setDoc(
              doc(db, 'users', userId, 'achievements', key),
              {
                ...achievement,
                earnedAt: serverTimestamp(),
              },
              { merge: true }
            );
            
            newlyEarned.push(achievement);
          }
        }
      }
    }

    // Topic mastery and daily goals will be checked separately
    // as they require aggregation of progress data

    return newlyEarned;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Get all achievements for a user
 */
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const snapshot = await getDocs(achievementsRef);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        earnedAt: data.earnedAt?.toDate() || undefined,
      } as Achievement;
    }).sort((a, b) => {
      // Sort by earned date (earned first), then by target
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      if (a.earned && b.earned && a.earnedAt && b.earnedAt) {
        return b.earnedAt.getTime() - a.earnedAt.getTime();
      }
      return a.target - b.target;
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
};

/**
 * Check topic mastery achievements
 */
export const checkTopicMastery = async (
  userId: string,
  topic: string,
  problemsSolved: number
): Promise<Achievement | null> => {
  if (problemsSolved >= 10) {
    const key = 'topic_mastery_10';
    const achievementRef = doc(db, 'users', userId, 'achievements', key);
    const existing = await getDoc(achievementRef);
    
    if (!existing.exists() || !existing.data().earned) {
      const definition = ACHIEVEMENT_DEFINITIONS[key];
      if (definition) {
        const achievement: Achievement = {
          id: key,
          userId,
          type: 'topic_mastery',
          name: definition.name,
          description: `${definition.description} in ${topic}`,
          progress: problemsSolved,
          target: 10,
          earned: true,
          earnedAt: new Date(),
          icon: definition.icon,
        };
        
        await setDoc(achievementRef, {
          ...achievement,
          earnedAt: serverTimestamp(),
        }, { merge: true });
        
        return achievement;
      }
    }
  }
  
  return null;
};

/**
 * Check daily goal achievements
 */
export const checkDailyGoals = async (
  userId: string,
  problemsToday: number
): Promise<Achievement[]> => {
  const newlyEarned: Achievement[] = [];
  
  const dailyTargets = [5, 10];
  for (const target of dailyTargets) {
    if (problemsToday >= target) {
      const key = `daily_${target}`;
      const achievementRef = doc(db, 'users', userId, 'achievements', key);
      const existing = await getDoc(achievementRef);
      
      // Check if already earned today
      const today = new Date().toISOString().split('T')[0];
      const existingData = existing.data();
      const earnedToday = existingData?.earnedAt?.toDate().toISOString().split('T')[0] === today;
      
      if (!existing.exists() || (!existingData?.earned || !earnedToday)) {
        const definition = ACHIEVEMENT_DEFINITIONS[key];
        if (definition) {
          const achievement: Achievement = {
            id: key,
            userId,
            type: 'daily_goal',
            name: definition.name,
            description: definition.description,
            progress: problemsToday,
            target: target,
            earned: true,
            earnedAt: new Date(),
            icon: definition.icon,
          };
          
          await setDoc(achievementRef, {
            ...achievement,
            earnedAt: serverTimestamp(),
          }, { merge: true });
          
          newlyEarned.push(achievement);
        }
      }
    }
  }
  
  return newlyEarned;
};

