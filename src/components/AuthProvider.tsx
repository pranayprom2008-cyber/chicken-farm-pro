'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebaseClient';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { useFarmStore } from '@/store/useFarmStore';
import { isEmailAuthorized, getAuthorizedEmail } from '@/lib/authSecurity';

export type AuthState = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'ERROR';

export interface FarmAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  idToken?: string;
}

interface AuthContextType {
  authState: AuthState;
  user: FarmAuthUser | null;
  firebaseUser: FirebaseUser | null;
  unauthorizedEmail: string | null;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('LOADING');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<FarmAuthUser | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unauthorizedLockRef = useRef<string | null>(null);
  const { setUserFromSupabase, syncAll } = useFarmStore();

  const handleValidUser = useCallback(async (fbUser: FirebaseUser) => {
    const email = fbUser.email || '';

    // Check against authorized single account (mjohn.suji@gmail.com)
    if (!isEmailAuthorized(email)) {
      console.warn('[FIREBASE_AUTH] Access denied for unauthorized account:', email);
      unauthorizedLockRef.current = email;
      setUnauthorizedEmail(email);
      setUser(null);
      setFirebaseUser(null);
      setAuthState('UNAUTHORIZED');
      setUserFromSupabase(null);

      // Sign out from Firebase in background
      try {
        await signOut(auth);
      } catch {}
      return;
    }

    // Authorized Google Account confirmed
    console.log('[FIREBASE_AUTH] Authorized session established for:', email);
    unauthorizedLockRef.current = null;
    setUnauthorizedEmail(null);
    setError(null);

    let idToken = '';
    try {
      idToken = await fbUser.getIdToken();
    } catch {}

    const authUser: FarmAuthUser = {
      uid: fbUser.uid,
      email: email,
      displayName: fbUser.displayName || 'Farm Lead',
      photoURL: fbUser.photoURL || '',
      role: 'Owner',
      idToken,
    };

    setFirebaseUser(fbUser);
    setUser(authUser);
    setAuthState('AUTHENTICATED');

    // Update Zustand store and trigger cloud database sync
    setUserFromSupabase({
      id: fbUser.uid,
      email: email,
      user_metadata: {
        name: fbUser.displayName || 'Farm Lead',
        avatar_url: fbUser.photoURL || '',
      },
    });

    syncAll().catch(() => {});
  }, [setUserFromSupabase, syncAll]);

  const handleNoUser = useCallback(() => {
    if (unauthorizedLockRef.current) {
      setAuthState('UNAUTHORIZED');
      return;
    }
    setFirebaseUser(null);
    setUser(null);
    setUnauthorizedEmail(null);
    setAuthState('UNAUTHENTICATED');
    setUserFromSupabase(null);
  }, [setUserFromSupabase]);

  useEffect(() => {
    // Listen to real-time Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFbUser) => {
        console.log('[FIREBASE_AUTH] onAuthStateChanged:', currentFbUser ? currentFbUser.email : 'null');
        if (currentFbUser) {
          await handleValidUser(currentFbUser);
        } else {
          handleNoUser();
        }
      },
      (authError) => {
        console.error('[FIREBASE_AUTH] Error:', authError);
        setError(authError.message);
        setAuthState('ERROR');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [handleValidUser, handleNoUser]);

  const loginWithGoogle = async () => {
    setError(null);
    unauthorizedLockRef.current = null;
    setUnauthorizedEmail(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await handleValidUser(result.user);
      }
    } catch (err: any) {
      // User cancelled popup or closed it
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.log('[FIREBASE_AUTH] Sign-in popup closed by user.');
        return;
      }
      console.error('[FIREBASE_AUTH] Popup sign-in error:', err);
      setError(err?.message || 'Failed to sign in with Google.');
      throw err;
    }
  };

  const logout = async () => {
    unauthorizedLockRef.current = null;
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[FIREBASE_AUTH] Logout error:', err);
    }
    handleNoUser();
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        firebaseUser,
        unauthorizedEmail,
        error,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
