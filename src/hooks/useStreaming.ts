/**
 * useStreaming hook
 * Handles Server-Sent Events (SSE) streaming from Cloud Function
 */

import { useState, useCallback, useRef } from 'react';

interface StartStreamOptions {
  messages: Array<{ role: string; content: string }>;
  problem?: string;
  problemContext?: string;
  onComplete?: (message: string) => void;
}

/**
 * Custom hook for streaming AI responses via SSE
 * 
 * @returns Object with streaming state and control functions
 */
export const useStreaming = () => {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if stream should be aborted
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start streaming from Cloud Function
   * Uses fetch with ReadableStream to parse SSE events
   */
  const startStream = useCallback(async ({
    messages,
    problem,
    problemContext,
    onComplete,
  }: StartStreamOptions): Promise<void> => {
    // Reset state
    setStreamingMessage('');
    setError(null);
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Get Cloud Function URL
      // For emulator: http://127.0.0.1:5001/{PROJECT_ID}/{REGION}/{FUNCTION_NAME}
      // For production: https://{REGION}-{PROJECT_ID}.cloudfunctions.net/{FUNCTION_NAME}
      // In Vite, use import.meta.env instead of process.env
      const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTION_URL || 
        'http://127.0.0.1:5001/athena-math/us-central1/chat'; // Default for emulator (matches emulator output)
      
      // Use fetch for POST request with streaming
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          problem,
          problemContext,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is SSE stream
      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Read stream chunk by chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedMessage = ''; // Track accumulated message for onComplete

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE lines (format: "data: {...}\n\n")
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove "data: " prefix

              // Handle different event types
              if (data.error) {
                setError(data.error);
                setIsStreaming(false);
                break;
              }

              if (data.done) {
                // Stream completed
                setIsStreaming(false);
                if (onComplete) {
                  onComplete(accumulatedMessage);
                }
                return;
              }

              if (data.content) {
                // Append content chunk
                accumulatedMessage += data.content;
                setStreamingMessage(accumulatedMessage);
              }
            } catch (parseError) {
              // Skip invalid JSON lines (e.g., empty lines, comments)
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      // Stream completed normally
      setIsStreaming(false);
      if (onComplete) {
        onComplete(accumulatedMessage);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream was cancelled, don't show error
        setIsStreaming(false);
        return;
      }

      // Log error to console (no user-facing errors per requirements)
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsStreaming(false);
    }
  }, []);

  /**
   * Stop current stream
   */
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  /**
   * Reset streaming state
   */
  const reset = useCallback(() => {
    stopStream();
    setStreamingMessage('');
    setError(null);
    setIsStreaming(false);
  }, [stopStream]);

  return {
    streamingMessage,
    isStreaming,
    error,
    startStream,
    stopStream,
    reset,
  };
};

