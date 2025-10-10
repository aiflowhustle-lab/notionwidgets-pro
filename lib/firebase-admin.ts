import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
let adminAuth: any;
let adminDb: any;

// Only initialize Firebase Admin if we have the required environment variables
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
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
} else {
  // Mock objects for build time when env vars are not available
  adminAuth = {
    verifyIdToken: () => Promise.reject(new Error('Firebase Admin not initialized')),
  };
  adminDb = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error('Firebase Admin not initialized')),
        set: () => Promise.reject(new Error('Firebase Admin not initialized')),
        update: () => Promise.reject(new Error('Firebase Admin not initialized')),
        delete: () => Promise.reject(new Error('Firebase Admin not initialized')),
      }),
    }),
  };
}

export { adminAuth, adminDb };
