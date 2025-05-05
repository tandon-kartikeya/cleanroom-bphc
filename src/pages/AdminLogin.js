import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

// Admin credentials - in a real app, these would be in a secure backend or environment variables
// These values are just for development and should be changed in production
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'cleanroom123'
};

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
        if (isAdminAuthenticated) {
          // Don't redirect if we're already on the admin login page to avoid loops
          if (location.pathname === '/admin/login') {
            navigate('/admin', { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname]);

  // Don't render the form while checking auth to prevent flickering
  if (checkingAuth) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple validation
    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Direct comparison with credentials (simple but effective)
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        try {
          // Store admin auth state in localStorage
          localStorage.setItem('adminAuthenticated', 'true');
          
          // Store admin user info
          const adminInfo = {
            username: 'Administrator', // Generic name for security
            role: 'admin',
            name: 'Administrator',
            loginTime: new Date().toISOString()
          };
          
          localStorage.setItem('adminUserInfo', JSON.stringify(adminInfo));
          
          // Navigate to admin page with replace to avoid browser history issues
          navigate('/admin', { replace: true });
        } catch (error) {
          console.error("Error during login:", error);
          setError('An error occurred during login');
        }
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 800); // Simulate network delay for UX
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Administrator Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access the cleanroom booking administration portal
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            For administrator access only. Students and faculty should use Google login.
          </Typography>
          <Button 
            variant="text" 
            color="primary" 
            size="small" 
            onClick={() => navigate('/')}
            sx={{ mt: 1 }}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
