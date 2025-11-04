/**
 * InputArea component
 * Text input for user messages with image upload and send functionality
 */

import { useState, useRef, KeyboardEvent, ChangeEvent, DragEvent } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAuthContext } from '../../contexts/AuthContext';
import './InputArea.css';

interface InputAreaProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export const InputArea = ({ onSendMessage, disabled = false }: InputAreaProps) => {
  const { user } = useAuthContext();
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploadProgress, isUploading, error: uploadError, reset: resetUpload } = useImageUpload();

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
  };

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
          <button
            className="input-area__upload-btn"
            onClick={handleImageUploadClick}
            disabled={disabled || isUploading}
            aria-label="Upload image"
            title="Upload image"
          >
            📷
          </button>
          <textarea
            className="input-area__textarea"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or drag an image here... (Enter to send, Shift+Enter for new line)"
            disabled={disabled || isUploading}
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              resize: 'none',
            }}
          />
          <button
            className="btn btn-primary input-area__button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
          >
            Send
          </button>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="input-area__error">{uploadError}</div>
        )}
      </div>
    </div>
  );
};

