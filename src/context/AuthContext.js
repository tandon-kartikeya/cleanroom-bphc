// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

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
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if email ends with correct domain
      const email = result.user.email;
      if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
        await signOut(auth);
        setAuthError('You must use your BITS Pilani Hyderabad email to sign in');
        return null;
      }
      
      // Determine if student or faculty based on email pattern
      // For example, student emails might start with 'f' followed by numbers
      const isStudent = email.match(/^f\d+@hyderabad\.bits-pilani\.ac\.in$/);
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