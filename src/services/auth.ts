/**
 * Authentication service
 * Handles user authentication with Firebase Auth
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();
// Add custom parameters for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign in with Google OAuth using popup
 * Falls back to redirect if popup is blocked
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Try popup first
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error: any) {
    // If popup is blocked or fails, check if we should use redirect
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.message?.includes('Cross-Origin-Opener-Policy')
    ) {
      // Popup was blocked, use redirect instead
      console.warn('Popup blocked, using redirect instead');
      try {
        await signInWithRedirect(auth, googleProvider);
        // Redirect will happen, so we won't return here
        // The result will be handled by getRedirectResult
        throw new Error('Redirect in progress');
      } catch (redirectError: any) {
        // If redirect also fails, throw original error
        if (redirectError.message === 'Redirect in progress') {
          throw redirectError;
        }
        console.error('Error with redirect fallback:', redirectError);
        throw error; // Throw original popup error
      }
    }
    // For other errors, throw them as-is
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Get redirect result after Google OAuth redirect
 * Call this after page load to check if user came back from OAuth redirect
 */
export const getGoogleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Error getting redirect result:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

