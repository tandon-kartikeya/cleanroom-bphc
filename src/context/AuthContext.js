// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, signInWithGoogle as firebaseSignInWithGoogle } from '../utils/firebase';

// Create the Authentication Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'student', 'faculty', or null

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      // Use the helper function from firebase.js
      const result = await firebaseSignInWithGoogle();
      
      // Get user email
      const email = result.user.email;
      
      // For local development, allow any email
      // Uncomment this code for production
      /*
      if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
        await signOut(auth);
        setAuthError('You must use your BITS Pilani Hyderabad email to sign in');
        return null;
      }
      */
      
      // For testing, we'll accept any email but log a message
      console.log('LOCAL DEV: Bypassing email domain restriction for testing');
      if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
        console.warn('Note: In production, only @hyderabad.bits-pilani.ac.in emails would be allowed');
      }
      
      // Determine if student or faculty based on email pattern
      // For local development, provide a way to test both roles
      // In production, this would be based on email pattern
      
      let isStudent;
      
      // For BITS emails, use the standard pattern
      if (email.endsWith('@hyderabad.bits-pilani.ac.in')) {
        // Student emails start with 'f' followed by numbers
        isStudent = email.match(/^f\d+@hyderabad\.bits-pilani\.ac\.in$/);
      } else {
        // For non-BITS emails during local testing:
        // If email contains 'student', treat as student, otherwise as faculty
        isStudent = email.toLowerCase().includes('student');
        console.log(`LOCAL DEV: Assigning role as ${isStudent ? 'student' : 'faculty'} based on email: ${email}`);
      }
      
      if (isStudent) {
        setUserRole('student');
      } else {
        setUserRole('faculty');
      }
      
      return result.user;
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(error.message);
      return null;
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const email = user.email;
        // Re-determine role on auth state change
        const isStudent = email.match(/^f\d+@hyderabad\.bits-pilani\.ac\.in$/);
        setUserRole(isStudent ? 'student' : 'faculty');
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signInWithGoogle,
    logOut,
    authError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};