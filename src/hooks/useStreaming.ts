/**
 * useStreaming hook
 * Handles Server-Sent Events (SSE) streaming from Cloud Function
 */

import { useState, useCallback, useRef } from 'react';

interface StartStreamOptions {
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;
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
      // Using production URL by default (not emulator)
      const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'athena-math';
      const REGION = 'us-central1';
      const USE_EMULATOR = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
      
      let functionUrl: string;
      if (USE_EMULATOR) {
        // For emulator: http://127.0.0.1:5001/{PROJECT_ID}/{REGION}/{FUNCTION_NAME}
        functionUrl = `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}/chat`;
      } else {
        // For production: https://{REGION}-{PROJECT_ID}.cloudfunctions.net/{FUNCTION_NAME}
        functionUrl = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/chat`;
      }
      
      // Use fetch for POST request with streaming
      console.log('Starting stream to:', functionUrl);
      console.log('Sending messages:', messages.length, 'messages');
      
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

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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
      let chunkCount = 0;

      console.log('Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('Stream reading done. Total chunks:', chunkCount);
          break;
        }

        chunkCount++;
        
        // Decode chunk
        const decoded = decoder.decode(value, { stream: true });
        buffer += decoded;
        
        // Process complete SSE lines (format: "data: {...}\n\n")
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue; // Skip empty lines
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove "data: " prefix
              const data = JSON.parse(jsonStr);

              // Handle different event types
              if (data.error) {
                console.error('Stream error:', data.error);
                setError(data.error);
                setIsStreaming(false);
                break;
              }

              if (data.done) {
                // Stream completed
                console.log('Stream done signal received');
                setIsStreaming(false);
                if (onComplete) {
                  console.log('Calling onComplete with message length:', accumulatedMessage.length);
                  onComplete(accumulatedMessage);
                }
                return;
              }

              if (data.content) {
                // Append content chunk
                accumulatedMessage += data.content;
                setStreamingMessage(accumulatedMessage);
                if (chunkCount <= 5 || chunkCount % 10 === 0) {
                  console.log(`Chunk ${chunkCount}:`, data.content.substring(0, 50) + '...');
                }
              }
            } catch (parseError) {
              // Log parsing errors for debugging
              console.warn('Failed to parse SSE line:', line.substring(0, 100), parseError);
            }
          } else if (line.trim()) {
            // Log non-data lines for debugging
            console.log('Non-data line:', line.substring(0, 100));
          }
        }
      }

      // Stream completed normally
      console.log('Stream reading finished. Final message length:', accumulatedMessage.length);
      setIsStreaming(false);
      if (onComplete && accumulatedMessage) {
        console.log('Calling onComplete (normal completion)');
        onComplete(accumulatedMessage);
      } else if (!accumulatedMessage) {
        console.warn('Stream completed but no message accumulated!');
        setError('Stream completed but received no content');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream was cancelled, don't show error
        setIsStreaming(false);
        return;
      }

      // Log error to console with details
      console.error('Streaming error:', err);
      if (err instanceof Error) {
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsStreaming(false);
      
      // Show error to user in console for debugging
      alert(`AI response error: ${err instanceof Error ? err.message : 'Unknown error'}. Check console for details.`);
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

