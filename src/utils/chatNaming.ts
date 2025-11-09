/**
 * Chat naming utility
 * Generates smart chat names based on problem context
 * Extracts mathematical problems from natural language
 */

/**
 * Convert natural language math to simplified notation
 * Examples: "x squared minus four" → "x² - 4", "two x plus five" → "2x + 5"
 */
// Reserved for future use
// const _normalizeMathExpression = (text: string): string => {
//   let normalized = text.toLowerCase();
//   
//   // Common patterns
//   normalized = normalized.replace(/squared|²|\^2/gi, '²');
//   normalized = normalized.replace(/cubed|³|\^3/gi, '³');
//   normalized = normalized.replace(/times|multiplied by|\*/g, '×');
//   normalized = normalized.replace(/divided by|\//g, '÷');
//   normalized = normalized.replace(/plus|\+/g, '+');
//   normalized = normalized.replace(/minus|-/g, '-');
//   normalized = normalized.replace(/equals?|=/g, '=');
//   
//   return normalized;
// };

/**
 * Extract mathematical problem from natural language
 * Examples:
 * - "solve x squared minus four" → "x² - 4"
 * - "what is 2x + 5 = 13" → "2x + 5 = 13"
 * - "find x in 3x - 7 = 14" → "3x - 7 = 14"
 */
const extractMathProblem = (text: string): string | null => {
  // First, try to find an equation (contains =)
  const equationMatch = text.match(/([^.!?]*[=<>≤≥][^.!?]*)/);
  if (equationMatch) {
    const equation = equationMatch[1].trim();
    if (equation.length <= 50) {
      return equation;
    }
  }

  // Look for mathematical expressions after "solve", "find", "calculate", etc.
  // Remove common prefixes like "solve for x in", "find the value of", etc.
  const actionPattern = /(?:solve|find|calculate|what is|what's|how to|factor|simplify|expand|solve for|find the|calculate the)\s+(?:x\s+in\s+|the\s+value\s+of\s+|the\s+)?(.+?)(?:[.!?]|$)/i;
  const actionMatch = text.match(actionPattern);
  if (actionMatch) {
    let problemText = actionMatch[1].trim();
    
    // Remove trailing phrases like "for x", "if x = 5", etc.
    problemText = problemText.replace(/\s+(?:for|if|when)\s+[xya-z]\s*=.*$/i, '').trim();
    
    // If it already looks like math notation, use it
    if (problemText.match(/[xya-z0-9²³+\-×÷=<>≤≥()]+/i)) {
      if (problemText.length <= 50) {
        return problemText;
      }
      return problemText.substring(0, 47) + '...';
    }
    
    // For natural language math, try to extract the key expression
    // Examples: "x squared minus four" → extract "x squared minus four"
    // This will be used as-is since it's descriptive
    if (problemText.length <= 50) {
      return problemText;
    }
    return problemText.substring(0, 47) + '...';
  }

  // Look for standalone math expressions (variables, numbers, operators)
  const mathExpression = text.match(/\b([xya-z]+\s*[²³]?\s*[+\-×÷]\s*[0-9]+|[0-9]+\s*[xya-z]+\s*[²³]?|[xya-z]+\s*[²³]?)/i);
  if (mathExpression) {
    const expr = mathExpression[1].trim();
    if (expr.length <= 50) {
      return expr;
    }
  }

  return null;
};

/**
 * Generate a smart chat name from a problem
 * Extracts key information from the problem to create a meaningful name
 */
export const generateChatName = (problem?: string): string => {
  if (!problem || problem.trim().length === 0) {
    return 'New Chat';
  }

  // Clean the problem text
  const cleanProblem = problem.trim();

  // Try to extract mathematical problem first
  const mathProblem = extractMathProblem(cleanProblem);
  if (mathProblem) {
    return mathProblem;
  }

  // If it's short enough and looks like math, use it directly
  if (cleanProblem.length <= 50 && cleanProblem.match(/[xya-z0-9²³+\-×÷=<>≤≥()]+/i)) {
    return cleanProblem;
  }

  // Look for equations (contains =)
  const equationMatch = cleanProblem.match(/([^.!?]+[=<>≤≥][^.!?]*)/);
  if (equationMatch) {
    const equation = equationMatch[1].trim();
    if (equation.length <= 50) {
      return equation;
    }
  }

  // Look for "solve", "find", "calculate" keywords and extract what follows
  const actionMatch = cleanProblem.match(/(?:solve|find|calculate|what is|what's|how)\s+(.+?)(?:[.!?]|$)/i);
  if (actionMatch) {
    const actionPart = actionMatch[1].trim();
    if (actionPart.length <= 50) {
      return actionPart;
    }
    return actionPart.substring(0, 47) + '...';
  }

  // Look for word problems (first sentence)
  const firstSentence = cleanProblem.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length <= 50) {
    return firstSentence;
  }

  // Fallback: take first 50 characters and add ellipsis
  return cleanProblem.substring(0, 47) + '...';
};

