/**
 * Progress Tracking Types
 * Data structures for tracking student progress across topics
 */

export interface ProgressEvent {
  id: string;
  userId: string;
  sessionId: string;
  topic: string;
  subTopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wasCorrect: boolean;
  hintsUsed: number;
  attemptsBeforeCorrect: number;
  questionsPerProblem: number;
  timestamp: Date;
  problemText?: string;
}

export interface SubTopicProgress {
  subTopic: string;
  totalProblems: number;
  correctAnswers: number;
  successRate: number;
  avgHintsPerProblem: number;
  avgQuestionsPerProblem: number;
}

export interface TopicProgress {
  topic: string;
  totalProblems: number;
  correctAnswers: number;
  successRate: number;
  avgHintsPerProblem: number;
  avgQuestionsPerProblem: number;
  difficultyBreakdown: {
    easy: { attempted: number; correct: number };
    medium: { attempted: number; correct: number };
    hard: { attempted: number; correct: number };
  };
  subTopics: SubTopicProgress[];
  trend: 'improving' | 'declining' | 'stable';
  lastActivity: Date;
}

export interface TopicMetadata {
  topic: string;
  subTopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

