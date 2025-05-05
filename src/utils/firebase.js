// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Explicitly set auth settings to ensure correct domain is used
const auth = getAuth();
auth.tenantId = null; // Reset any tenant ID
auth.config = {
  ...auth.config,
  apiHost: 'identitytoolkit.googleapis.com',
  tokenApiHost: 'securetoken.googleapis.com',
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
};

// Force local persistence to avoid refresh issues
setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// For production, this would restrict to BITS Pilani domain
// But for local development, we're temporarily disabling this restriction
// to allow sign-in during local testing
// Uncomment this for production
/* 
googleProvider.setCustomParameters({
  hd: 'hyderabad.bits-pilani.ac.in',  // Only allow this domain
  prompt: 'select_account'  // Always prompt user to select an account
});
*/

// For local development, only set prompt
googleProvider.setCustomParameters({
  prompt: 'select_account'  // Always prompt user to select an account
});

// Helper function to sign in with Google
// Using popup for local development to avoid redirect issues
async function signInWithGoogle() {
  try {
    // For local testing, you may need to use a test account instead of the domain restriction
    // Comment this out for local testing if needed
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Use popup for authentication during local development
    // This avoids the redirect URI issues
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
}

export { auth, db, googleProvider, signInWithGoogle };