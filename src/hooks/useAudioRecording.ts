/**
 * Audio recording hook for speech-to-text
 * Records audio from microphone and transcribes using Whisper-1
 */

import { useState, useRef, useCallback } from 'react';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  transcribeAudio: (audioBlob: Blob) => Promise<string | null>;
}

// Cloud Functions URL - adjust based on your setup
const getFunctionsUrl = () => {
  const useEmulator = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
  if (useEmulator) {
    return 'http://127.0.0.1:5001';
  }
  // Use your deployed Cloud Functions URL
  // This should be set in your .env file
  return import.meta.env.VITE_FUNCTIONS_URL || '';
};

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper works best with 16kHz
        } 
      });
      
      streamRef.current = stream;
      
      // Create MediaRecorder with WebM format (widely supported)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to access microphone';
      setError(errorMessage);
      console.error('Error starting recording:', err);
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          // Combine all audio chunks into a single blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          audioChunksRef.current = [];
          setIsRecording(false);
          
          // Stop all tracks to release microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          resolve(audioBlob);
        };
        
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  }, [isRecording]);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      setIsTranscribing(true);
      setError(null);
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
      // Get audio format from blob type
      const audioFormat = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
      
      // Call Cloud Function
      const functionsUrl = getFunctionsUrl();
      const projectId = import.meta.env.VITE_PROJECT_ID;
      const useEmulator = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';
      
      // Build function URL
      const functionUrl = useEmulator 
        ? `${functionsUrl}/${projectId}/us-central1/transcribe`
        : `https://us-central1-${projectId}.cloudfunctions.net/transcribe`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          audioFormat: audioFormat,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.text || null;
      
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to transcribe audio';
      setError(errorMessage);
      console.error('Error transcribing audio:', err);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    transcribeAudio,
  };
};

