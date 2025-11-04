/**
 * Text-to-speech hook for AI responses
 * Converts text to speech using OpenAI TTS-1
 */

import { useState, useRef, useCallback } from 'react';

interface UseTextToSpeechReturn {
  isGenerating: boolean;
  isPlaying: boolean;
  error: string | null;
  generateAndPlay: (text: string, voice?: string) => Promise<void>;
  stop: () => void;
}

// Cloud Functions URL - adjust based on your setup
const getFunctionsUrl = () => {
  const useEmulator = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
  if (useEmulator) {
    return 'http://127.0.0.1:5001';
  }
  // Use your deployed Cloud Functions URL
  return import.meta.env.VITE_FUNCTIONS_URL || '';
};

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAndPlay = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Call Cloud Function
      const functionsUrl = getFunctionsUrl();
      const projectId = import.meta.env.VITE_PROJECT_ID;
      const useEmulator = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
      
      // Build function URL
      const functionUrl = useEmulator
        ? `${functionsUrl}/${projectId}/us-central1/speech`
        : `https://us-central1-${projectId}.cloudfunctions.net/speech`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert base64 audio to blob
      const audioData = atob(data.audio);
      const audioBytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioBytes[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      await audio.play();
      
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to generate speech';
      setError(errorMessage);
      console.error('Error generating speech:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      audioRef.current = null;
    }
  }, []);

  return {
    isGenerating,
    isPlaying,
    error,
    generateAndPlay,
    stop,
  };
};

