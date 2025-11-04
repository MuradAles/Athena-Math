/**
 * useImageUpload hook
 * Handles image file selection, validation, and upload to Firebase Storage
 */

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, type UploadTask } from 'firebase/storage';
import { storage } from '../config/firebase';

interface UseImageUploadReturn {
  uploadImage: (file: File, userId: string) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File, userId: string): Promise<string> => {
    // Reset state
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `users/${userId}/images/${fileName}`);

      // Upload file with progress tracking and metadata
      // Include contentType so Storage rules can validate it
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      // Set up progress listener
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => {
          console.error('Upload error:', uploadError);
          setError(uploadError.message || 'Failed to upload image');
          setIsUploading(false);
          throw uploadError;
        },
        async () => {
          // Upload completed, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(100);
            setIsUploading(false);
            return downloadURL;
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            setError('Failed to get image URL');
            setIsUploading(false);
            throw urlError;
          }
        }
      );

      // Wait for upload to complete
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          reject,
          resolve
        );
      });

      // Get download URL after upload completes
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      setIsUploading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
    uploadImage,
    uploadProgress,
    isUploading,
    error,
    reset,
  };
};


