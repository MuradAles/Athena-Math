/**
 * LocalStorage utilities for tracking problem context
 */

const PROBLEM_CONTEXT_KEY = 'math-tutor-problem-context';

interface ProblemContext {
  lastSolvedProblem?: string;
  concepts?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
  lastUpdated: number;
}

/**
 * Get problem context from LocalStorage
 */
export const getProblemContext = (): ProblemContext | null => {
  try {
    const stored = localStorage.getItem(PROBLEM_CONTEXT_KEY);
    if (!stored) return null;
    
    const context = JSON.parse(stored) as ProblemContext;
    
    // Check if context is older than 24 hours (optional: can be removed)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (context.lastUpdated < oneDayAgo) {
      // Context is too old, clear it
      clearProblemContext();
      return null;
    }
    
    return context;
  } catch (error) {
    console.error('Error reading problem context:', error);
    return null;
  }
};

/**
 * Save problem context to LocalStorage
 */
export const saveProblemContext = (context: Partial<ProblemContext>): void => {
  try {
    const existing = getProblemContext();
    const updated: ProblemContext = {
      ...existing,
      ...context,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(PROBLEM_CONTEXT_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving problem context:', error);
  }
};

/**
 * Clear problem context from LocalStorage
 */
export const clearProblemContext = (): void => {
  try {
    localStorage.removeItem(PROBLEM_CONTEXT_KEY);
  } catch (error) {
    console.error('Error clearing problem context:', error);
  }
};

/**
 * Generate context string for AI prompt
 */
export const generateContextString = (): string | undefined => {
  const context = getProblemContext();
  if (!context?.lastSolvedProblem) return undefined;
  
  const parts: string[] = [];
  
  if (context.lastSolvedProblem) {
    parts.push(`Student recently solved: ${context.lastSolvedProblem}`);
  }
  
  if (context.concepts && context.concepts.length > 0) {
    parts.push(`Mathematical concepts: ${context.concepts.join(', ')}`);
  }
  
  if (context.complexity) {
    parts.push(`Complexity level: ${context.complexity}`);
  }
  
  return parts.length > 0 ? parts.join('. ') : undefined;
};

