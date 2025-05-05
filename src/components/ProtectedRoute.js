// src/components/ProtectedRoute.js
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Check if user is admin based on localStorage
    const adminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAdmin(adminAuthenticated);
    setIsLoading(false);
  }, []);
  
  // Show loading indicator while checking authentication
  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Special case for admin route
  if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
    // If accessing admin route and has admin authentication, allow access
    if (isAdmin) {
      return children;
    } else {
      // Redirect to admin login if not authenticated as admin
      return <Navigate to="/admin/login" replace />;
    }
  }
  
  // Standard user authentication check for other routes
  if (!currentUser && !location.pathname.includes('/admin')) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has required role
  if (requiredRole && requiredRole !== userRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;