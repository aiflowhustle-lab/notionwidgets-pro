'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User, AuthContextType } from '@/types';
import { createUser, getUser } from './firestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        // For now, just use Firebase Auth user data directly
        // We'll add Firestore integration later
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date(),
        };
        
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default auth context when no AuthProvider is present
    // This allows components to work in public widget pages
    console.log('useAuth called without AuthProvider - returning default context');
    return {
      user: null,
      loading: false,
      signInWithGoogle: async () => {
        console.log('signInWithGoogle called without AuthProvider');
        throw new Error('Authentication not available in public widget view');
      },
      signOut: async () => {
        console.log('signOut called without AuthProvider');
        throw new Error('Authentication not available in public widget view');
      },
    };
  }
  return context;
}

// Conditional AuthProvider that only applies auth to non-public pages
export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  // Check if we're on a public widget page
  if (typeof window !== 'undefined') {
    const isPublicWidget = window.location.pathname.startsWith('/w/');
    
    // Only skip auth for actual public widget pages
    if (isPublicWidget) {
      console.log('Skipping auth for public widget page:', window.location.pathname);
      return <>{children}</>;
    }
  }

  // For all other pages (dashboard, auth, main), use the full AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}
