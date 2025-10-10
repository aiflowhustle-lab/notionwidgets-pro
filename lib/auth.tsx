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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Conditional AuthProvider that only applies auth to non-public pages
export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  // Check if we're on a public widget page or in an iframe context
  if (typeof window !== 'undefined') {
    const isPublicWidget = window.location.pathname.startsWith('/w/');
    const isInIframe = window.self !== window.top;
    const isNotionEmbed = window.location.search.includes('notion') || 
                         window.location.href.includes('notion') ||
                         document.referrer.includes('notion');
    
    // Skip auth for public widget pages, iframe contexts, or Notion embeds
    if (isPublicWidget || isInIframe || isNotionEmbed) {
      console.log('Skipping auth for:', { isPublicWidget, isInIframe, isNotionEmbed });
      return <>{children}</>;
    }
  }

  // For all other pages, use the full AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}
