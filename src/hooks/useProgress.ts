/**
 * Progress Tracking Hook
 * React hook for tracking student progress and fetching progress data
 */

import { useState, useCallback } from 'react';
import {
  trackProgressEvent,
  extractTopicMetadata,
  getAllTopicsProgress,
  getTopicProgress,
} from '../services/progressService';
import type { ProgressEvent, TopicProgress } from '../types/progress';

interface UseProgressReturn {
  trackProgress: (
    sessionId: string,
    problem: string,
    wasCorrect: boolean,
    hintsUsed: number,
    attemptsBeforeCorrect: number,
    questionsPerProblem: number,
    problemText?: string
  ) => Promise<void>;
  getAllTopicsProgress: () => Promise<TopicProgress[]>;
  getTopicProgress: (topic: string) => Promise<TopicProgress | null>;
  isLoading: boolean;
  error: string | null;
}

export const useProgress = (userId: string | null): UseProgressReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackProgress = useCallback(
    async (
      sessionId: string,
      problem: string,
      wasCorrect: boolean,
      hintsUsed: number,
      attemptsBeforeCorrect: number,
      questionsPerProblem: number,
      problemText?: string
    ) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Extract topic metadata from problem
        const topicMetadata = await extractTopicMetadata(problem);

        // Create progress event
        const event: Omit<ProgressEvent, 'id' | 'timestamp'> = {
          userId,
          sessionId,
          topic: topicMetadata.topic,
          subTopic: topicMetadata.subTopic,
          difficulty: topicMetadata.difficulty,
          wasCorrect,
          hintsUsed,
          attemptsBeforeCorrect,
          questionsPerProblem,
          problemText: problemText || problem,
        };

        // Track the event
        await trackProgressEvent(userId, event);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to track progress';
        setError(errorMessage);
        console.error('Error tracking progress:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const getAllTopics = useCallback(async (): Promise<TopicProgress[]> => {
    if (!userId) {
      setError('User not authenticated');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      return await getAllTopicsProgress(userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(errorMessage);
      console.error('Error fetching all topics progress:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getTopic = useCallback(
    async (topic: string): Promise<TopicProgress | null> => {
      if (!userId) {
        setError('User not authenticated');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        return await getTopicProgress(userId, topic);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch topic progress';
        setError(errorMessage);
        console.error('Error fetching topic progress:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    trackProgress,
    getAllTopicsProgress: getAllTopics,
    getTopicProgress: getTopic,
    isLoading,
    error,
  };
};

