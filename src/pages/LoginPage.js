import React, { useContext, useEffect } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { currentUser, userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (userRole === 'student') {
        navigate('/student');
      } else if (userRole === 'faculty') {
        navigate('/faculty');
      } else if (userRole === 'admin') {
        navigate('/admin');
      }
    }
  }, [currentUser, userRole, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(0,102,179,0.02) 0%, rgba(0,169,224,0.05) 100%)',
        }}
      >
        <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: theme => theme.palette.primary.main,
              mb: 3
            }}
          >
            Login to Cleanroom Booking System
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            align="center"
            paragraph
            sx={{ mb: 4 }}
          >
            Please sign in with your BITS Pilani Hyderabad Campus email address to access the cleanroom booking system.
          </Typography>
          
          <Login />
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Access is restricted to @hyderabad.bits-pilani.ac.in email addresses.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
