// src/components/Login.js
import React, { useContext, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = ({ userType }) => {
  const { signInWithGoogle, authError } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await signInWithGoogle(userType);
      setLoading(false);
      
      if (user) {
        // Navigate based on user type
        navigate(`/${userType}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8, 
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {userType === 'student' ? 'Student Login' : 'Faculty Login'}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please use your BITS Pilani Hyderabad Campus email
        </Typography>
        
        {(authError || error) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {authError || error}
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ 
            py: 1.5, 
            px: 4,
            borderRadius: 2
          }}
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Only @hyderabad.bits-pilani.ac.in emails are allowed
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

export default Login;