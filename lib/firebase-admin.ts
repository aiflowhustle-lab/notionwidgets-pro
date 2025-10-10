import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
let adminAuth: any;
let adminDb: any;

// Only initialize Firebase Admin if we have the required environment variables
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (!getApps().length) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      app = getApps()[0];
    }
    
    adminAuth = getAuth();
    adminDb = getFirestore();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Fallback to mock objects
    adminAuth = {
      verifyIdToken: () => Promise.reject(new Error('Firebase Admin initialization failed')),
    };
    adminDb = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.reject(new Error('Firebase Admin initialization failed')),
          set: () => Promise.reject(new Error('Firebase Admin initialization failed')),
          update: () => Promise.reject(new Error('Firebase Admin initialization failed')),
          delete: () => Promise.reject(new Error('Firebase Admin initialization failed')),
        }),
      }),
    };
  }
} else {
  console.error('Firebase Admin environment variables missing:', {
    projectId: !!process.env.FIREBASE_PROJECT_ID,
    clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  });
  // Mock objects for build time when env vars are not available
  adminAuth = {
    verifyIdToken: () => Promise.reject(new Error('Firebase Admin not initialized - missing env vars')),
  };
  adminDb = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error('Firebase Admin not initialized - missing env vars')),
        set: () => Promise.reject(new Error('Firebase Admin not initialized - missing env vars')),
        update: () => Promise.reject(new Error('Firebase Admin not initialized - missing env vars')),
        delete: () => Promise.reject(new Error('Firebase Admin not initialized - missing env vars')),
      }),
    }),
  };
}

export { adminAuth, adminDb };
