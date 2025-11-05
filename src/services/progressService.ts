/**
 * Progress Service
 * Handles progress tracking and topic extraction for student learning analytics
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ProgressEvent, TopicProgress, TopicMetadata } from '../types/progress';

/**
 * Extract topic metadata from problem text using AI
 */
export const extractTopicMetadata = async (problem: string): Promise<TopicMetadata> => {
  try {
    console.log('🔍 Extracting topic metadata from problem:', problem.substring(0, 100));
    const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'athena-math';
    const USE_EMULATOR = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
    
    let functionUrl: string;
    if (USE_EMULATOR) {
      functionUrl = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1/extractTopic`;
    } else {
      functionUrl = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/extractTopic`;
    }

    console.log('📡 Calling extractTopic function:', functionUrl);
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ extractTopic API error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Topic extracted:', data);
    return {
      topic: data.topic,
      subTopic: data.subTopic || undefined,
      difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
    };
  } catch (error) {
    console.error('❌ Error extracting topic:', error);
    // Fallback to default values
    const fallback = {
      topic: 'unknown',
      difficulty: 'medium',
    };
    console.log('⚠️ Using fallback topic:', fallback);
    return fallback;
  }
};

/**
 * Track a progress event for a student
 */
export const trackProgressEvent = async (
  userId: string,
  event: Omit<ProgressEvent, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    console.log('📝 trackProgressEvent called', {
      userId,
      topic: event.topic,
      wasCorrect: event.wasCorrect,
      problem: event.problemText?.substring(0, 50),
    });

    const eventData = {
      ...event,
      timestamp: serverTimestamp(),
    };

    // Ensure topic document exists (for querying all topics)
    const topicDocRef = doc(db, 'users', userId, 'progress', event.topic);
    console.log('📄 [trackProgressEvent] Ensuring topic document exists:', `users/${userId}/progress/${event.topic}`);
    
    try {
      await runTransaction(db, async (transaction) => {
        const topicDoc = await transaction.get(topicDocRef);
        if (!topicDoc.exists()) {
          console.log('📝 [trackProgressEvent] Creating new topic document for:', event.topic);
          // Create topic document with metadata
          transaction.set(topicDocRef, {
            topic: event.topic,
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
          });
        } else {
          console.log('📝 [trackProgressEvent] Updating existing topic document for:', event.topic);
          // Update last activity
          transaction.update(topicDocRef, {
            lastActivity: serverTimestamp(),
          });
        }
      });
      console.log('✅ [trackProgressEvent] Topic document transaction completed');
    } catch (error) {
      console.error('❌ [trackProgressEvent] Error in topic document transaction:', error);
      // Don't throw - continue with saving progress event even if topic doc creation fails
    }

    // Save progress event
    const progressRef = collection(db, 'users', userId, 'progress', event.topic, 'attempts');
    console.log('💾 Saving progress event to:', `users/${userId}/progress/${event.topic}/attempts`);
    await addDoc(progressRef, eventData);
    console.log('✅ Progress event saved successfully');

    // Update aggregated progress (incremental update)
    console.log('📊 Updating aggregated progress...');
    await updateAggregatedProgress(userId, event.topic, event);
    console.log('✅ Aggregated progress updated successfully');
  } catch (error) {
    console.error('❌ Error tracking progress event:', error);
    throw error;
  }
};

/**
 * Update aggregated progress for a topic (incremental)
 */
const updateAggregatedProgress = async (
  userId: string,
  topic: string,
  event: Omit<ProgressEvent, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    const aggregatedRef = doc(db, 'users', userId, 'progress', topic, 'aggregated', 'summary');

    await runTransaction(db, async (transaction) => {
      const aggregatedDoc = await transaction.get(aggregatedRef);

      if (!aggregatedDoc.exists()) {
        // Create new aggregated data
        const newAggregated: TopicProgress = {
          topic,
          totalProblems: 1,
          correctAnswers: event.wasCorrect ? 1 : 0,
          successRate: event.wasCorrect ? 1 : 0,
          avgHintsPerProblem: event.hintsUsed,
          avgQuestionsPerProblem: event.questionsPerProblem,
          difficultyBreakdown: {
            easy: { attempted: 0, correct: 0 },
            medium: { attempted: 0, correct: 0 },
            hard: { attempted: 0, correct: 0 },
          },
          subTopics: event.subTopic ? [{
            subTopic: event.subTopic,
            totalProblems: 1,
            correctAnswers: event.wasCorrect ? 1 : 0,
            successRate: event.wasCorrect ? 1 : 0,
            avgHintsPerProblem: event.hintsUsed,
            avgQuestionsPerProblem: event.questionsPerProblem,
          }] : [],
          trend: 'stable',
          lastActivity: new Date(),
        };

        // Update difficulty breakdown
        newAggregated.difficultyBreakdown[event.difficulty] = {
          attempted: 1,
          correct: event.wasCorrect ? 1 : 0,
        };

        transaction.set(aggregatedRef, {
          ...newAggregated,
          lastActivity: serverTimestamp(),
        });
      } else {
        // Update existing aggregated data
        const current = aggregatedDoc.data() as TopicProgress & { lastActivity: Timestamp };
        
        const totalProblems = current.totalProblems + 1;
        const correctAnswers = current.correctAnswers + (event.wasCorrect ? 1 : 0);
        const successRate = correctAnswers / totalProblems;

        // Update averages (weighted average)
        const avgHints = (current.avgHintsPerProblem * current.totalProblems + event.hintsUsed) / totalProblems;
        const avgQuestions = (current.avgQuestionsPerProblem * current.totalProblems + event.questionsPerProblem) / totalProblems;

        // Update difficulty breakdown
        const difficultyBreakdown = { ...current.difficultyBreakdown };
        difficultyBreakdown[event.difficulty] = {
          attempted: difficultyBreakdown[event.difficulty].attempted + 1,
          correct: difficultyBreakdown[event.difficulty].correct + (event.wasCorrect ? 1 : 0),
        };

        // Update sub-topics
        let subTopics = [...current.subTopics];
        if (event.subTopic) {
          const subTopicIndex = subTopics.findIndex(st => st.subTopic === event.subTopic);
          if (subTopicIndex >= 0) {
            const subTopic = subTopics[subTopicIndex];
            const subTotal = subTopic.totalProblems + 1;
            const subCorrect = subTopic.correctAnswers + (event.wasCorrect ? 1 : 0);
            subTopics[subTopicIndex] = {
              ...subTopic,
              totalProblems: subTotal,
              correctAnswers: subCorrect,
              successRate: subCorrect / subTotal,
              avgHintsPerProblem: (subTopic.avgHintsPerProblem * subTopic.totalProblems + event.hintsUsed) / subTotal,
              avgQuestionsPerProblem: (subTopic.avgQuestionsPerProblem * subTopic.totalProblems + event.questionsPerProblem) / subTotal,
            };
          } else {
            subTopics.push({
              subTopic: event.subTopic,
              totalProblems: 1,
              correctAnswers: event.wasCorrect ? 1 : 0,
              successRate: event.wasCorrect ? 1 : 0,
              avgHintsPerProblem: event.hintsUsed,
              avgQuestionsPerProblem: event.questionsPerProblem,
            });
          }
        }

        // Determine trend (simplified: compare recent success rate)
        const trend = successRate > current.successRate ? 'improving' : 
                     successRate < current.successRate ? 'declining' : 'stable';

        transaction.update(aggregatedRef, {
          totalProblems,
          correctAnswers,
          successRate,
          avgHintsPerProblem: avgHints,
          avgQuestionsPerProblem: avgQuestions,
          difficultyBreakdown,
          subTopics,
          trend,
          lastActivity: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    console.error('Error updating aggregated progress:', error);
    // Don't throw - we don't want to fail the whole operation if aggregation fails
  }
};

/**
 * Get aggregated progress for a specific topic
 */
export const getTopicProgress = async (
  userId: string,
  topic: string
): Promise<TopicProgress | null> => {
  try {
    const aggregatedRef = doc(db, 'users', userId, 'progress', topic, 'aggregated', 'summary');
    const docSnap = await getDoc(aggregatedRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      lastActivity: data.lastActivity?.toDate() || new Date(),
    } as TopicProgress;
  } catch (error) {
    console.error('Error getting topic progress:', error);
    throw error;
  }
};

/**
 * Get all topics with progress data
 */
export const getAllTopicsProgress = async (userId: string): Promise<TopicProgress[]> => {
  try {
    console.log('🔍 [getAllTopicsProgress] Fetching all topics for user:', userId);
    const progressRef = collection(db, 'users', userId, 'progress');
    const querySnapshot = await getDocs(progressRef);

    console.log('📋 [getAllTopicsProgress] Found', querySnapshot.docs.length, 'topic documents');

    const topics: TopicProgress[] = [];

    for (const topicDoc of querySnapshot.docs) {
      const topic = topicDoc.id;
      console.log('🔍 [getAllTopicsProgress] Checking topic:', topic);
      const aggregatedRef = doc(db, 'users', userId, 'progress', topic, 'aggregated', 'summary');
      const aggregatedDoc = await getDoc(aggregatedRef);

      if (aggregatedDoc.exists()) {
        const data = aggregatedDoc.data();
        console.log('✅ [getAllTopicsProgress] Found aggregated data for', topic, ':', data);
        topics.push({
          ...data,
          lastActivity: data.lastActivity?.toDate() || new Date(),
        } as TopicProgress);
      } else {
        console.warn('⚠️ [getAllTopicsProgress] No aggregated data found for topic:', topic);
      }
    }

    console.log('📊 [getAllTopicsProgress] Returning', topics.length, 'topics');
    return topics.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  } catch (error) {
    console.error('❌ Error getting all topics progress:', error);
    throw error;
  }
};

/**
 * Convert Firestore timestamp to Date
 */
const timestampToDate = (timestamp: Timestamp | Date | null | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  return new Date();
};

