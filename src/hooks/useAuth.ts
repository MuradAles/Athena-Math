/**
 * useAuth hook
 * Manages authentication state and provides auth methods
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  getGoogleRedirectResult,
  signOutUser,
} from '../services/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result first (if user came back from OAuth redirect)
    getGoogleRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser(redirectUser);
        }
      })
      .catch((error) => {
        // Ignore redirect errors, they're handled in the auth flow
        console.error('Error getting redirect result:', error);
      });

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<void> => {
    await signInWithEmail(email, password);
  };

  const handleSignUp = async (email: string, password: string): Promise<void> => {
    await signUpWithEmail(email, password);
  };

  const handleSignInWithGoogle = async (): Promise<void> => {
    await signInWithGoogle();
  };

  const handleSignOut = async (): Promise<void> => {
    await signOutUser();
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  };
};

