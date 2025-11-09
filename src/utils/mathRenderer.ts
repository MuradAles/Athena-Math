/**
 * Math renderer utility
 * Detects and parses LaTeX math expressions in text
 * Supports inline math ($...$ or \(...\)) and block math ($$...$$ or \[...\])
 */

export interface MathSegment {
  type: 'text' | 'inline' | 'block';
  content: string;
}

/**
 * Detects LaTeX math patterns in text
 * Supports:
 * - Inline math: $expression$ or \(expression\)
 * - Block math: $$expression$$ or \[expression\]
 * 
 * @param text - The text to parse
 * @returns Array of segments (text, inline math, or block math)
 */
export function parseMathContent(text: string): MathSegment[] {
  if (!text) return [{ type: 'text', content: text }];

  const segments: MathSegment[] = [];
  
  // Pattern for block math: $$...$$ or \[...\]
  const blockMathPattern = /(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/g;
  // Pattern for inline math: $...$ or \(...\)
  // Note: Inline math is processed in parseInlineMath function, not here

  // First, find all block math (process before inline to avoid conflicts)
  const blockMatches: Array<{ start: number; end: number; content: string }> = [];
  let match;
  
  // Reset regex lastIndex
  blockMathPattern.lastIndex = 0;
  
  while ((match = blockMathPattern.exec(text)) !== null) {
    const start = match.index;
    const end = match.index + match[0].length;
    // Content is in match[2] (between delimiters)
    const content = match[2];
    
    blockMatches.push({ start, end, content });
  }

  // Add text segments and block math
  let lastIndex = 0;
  
  for (const blockMatch of blockMatches) {
    // Add text before block math
    if (blockMatch.start > lastIndex) {
      const textBefore = text.substring(lastIndex, blockMatch.start);
      // Process inline math in text before block
      if (textBefore) {
        const inlineSegments = parseInlineMath(textBefore);
        segments.push(...inlineSegments);
      }
    }
    
    // Add block math
    segments.push({
      type: 'block',
      content: blockMatch.content.trim(),
    });
    
    lastIndex = blockMatch.end;
  }
  
  // Add remaining text after last block math
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      const inlineSegments = parseInlineMath(remainingText);
      segments.push(...inlineSegments);
    }
  }
  
  // If no block math found, process entire text for inline math
  if (blockMatches.length === 0) {
    return parseInlineMath(text);
  }
  
  return segments;
}

/**
 * Parses inline math expressions in text
 * @param text - Text that may contain inline math
 * @returns Array of text and inline math segments
 */
function parseInlineMath(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  // Improved pattern: matches $...$ or \(...\)
  // For \(...\), match everything between \( and \) non-greedily
  // Use [\s\S] instead of . to match newlines too
  const inlineMathPattern = /(?<!\$)\$(?!\$)([^\$]+?)\$(?!\$)|\\\(([\s\S]*?)\\\)/g;
  
  let lastIndex = 0;
  let match;
  
  // Reset regex lastIndex
  inlineMathPattern.lastIndex = 0;
  
  while ((match = inlineMathPattern.exec(text)) !== null) {
    // Add text before math
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    
    // Add inline math
    // match[1] is for $...$ pattern, match[2] is for \(...\) pattern
    const mathContent = match[1] || match[2];
    if (mathContent) {
      segments.push({
        type: 'inline',
        content: mathContent.trim(),
      });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last math
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }
  
  // If no math found, return single text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }
  
  return segments;
}

