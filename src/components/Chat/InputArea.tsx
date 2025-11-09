/**
 * InputArea component
 * Text input for user messages with image upload and send functionality
 */

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent, DragEvent } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { useAuthContext } from '../../contexts/AuthContext';
import './InputArea.css';

interface InputAreaProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
  onToggleWhiteboard?: () => void;
  isWhiteboardOpen?: boolean;
}

export const InputArea = ({ onSendMessage, disabled = false, onToggleWhiteboard, isWhiteboardOpen }: InputAreaProps) => {
  const { user } = useAuthContext();
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { uploadImage, uploadProgress, isUploading, error: uploadError, reset: resetUpload } = useImageUpload();
  const { 
    isRecording, 
    isTranscribing, 
    error: audioError, 
    startRecording, 
    stopRecording, 
    transcribeAudio 
  } = useAudioRecording();

  const handleSend = () => {
    const textToSend = input.trim();
    // Allow sending if there's text OR an image
    if ((textToSend || imageUrl) && !disabled && !isUploading) {
      onSendMessage(textToSend || '', imageUrl || undefined);
      // Clear everything after sending
      setInput('');
      setImagePreview(null);
      setImageUrl(null);
      resetUpload();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // Auto-resize on mount and when input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleFileSelect = async (file: File) => {
    if (!user) {
      alert('Please sign in to upload images');
      return;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image to Firebase Storage
    try {
      const uploadedUrl = await uploadImage(file, user.uid);
      setImageUrl(uploadedUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to upload image';
      alert(errorMessage);
      setImagePreview(null);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleMicrophoneClick = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      const audioBlob = await stopRecording();
      if (audioBlob) {
        const transcribedText = await transcribeAudio(audioBlob);
        if (transcribedText) {
          setInput(transcribedText);
        }
      }
    } else {
      // Start recording
      await startRecording();
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    resetUpload();
  };

  const canSend = (input.trim() || imageUrl) && !isUploading && !disabled;

  return (
    <div className="input-area">
      <div className="input-area__wrapper">
        {/* Image Preview */}
        {imagePreview && (
          <div className="input-area__preview">
            <img src={imagePreview} alt="Preview" className="input-area__preview-image" />
            <button
              className="input-area__preview-remove"
              onClick={handleRemoveImage}
              aria-label="Remove image"
            >
              ×
            </button>
            {isUploading && (
              <div className="input-area__preview-progress">
                <div className="input-area__progress-bar">
                  <div
                    className="input-area__progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="input-area__progress-text">Uploading...</div>
              </div>
            )}
          </div>
        )}

        {/* Main Input Area */}
        <div
          className="input-area__input-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          {onToggleWhiteboard && (
            <button
              className={`input-area__whiteboard-btn ${isWhiteboardOpen ? 'input-area__whiteboard-btn--active' : ''}`}
              onClick={onToggleWhiteboard}
              disabled={disabled || isRecording || isTranscribing}
              aria-label="Toggle whiteboard"
              title="Toggle whiteboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 3v18"/>
                <path d="M3 9h18"/>
              </svg>
            </button>
          )}
          <button
            className="input-area__upload-btn"
            onClick={handleImageUploadClick}
            disabled={disabled || isUploading || isRecording || isTranscribing}
            aria-label="Upload image"
            title="Upload image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <textarea
            ref={textareaRef}
            className="input-area__textarea"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question"
            disabled={disabled || isUploading || isRecording || isTranscribing}
            rows={1}
          />
          <button
            className={`input-area__mic-btn ${isRecording ? 'input-area__mic-btn--recording' : ''}`}
            onClick={handleMicrophoneClick}
            disabled={disabled || isUploading || isTranscribing}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
          <button
            className="btn btn-primary input-area__button"
            onClick={handleSend}
            disabled={!canSend || isRecording || isTranscribing}
            aria-label="Send message"
          >
            {isTranscribing ? 'Transcribing...' : 'Send'}
          </button>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="input-area__error">{uploadError}</div>
        )}
        {/* Audio Error */}
        {audioError && (
          <div className="input-area__error">{audioError}</div>
        )}
      </div>
    </div>
  );
};

