import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  useTheme, 
  useMediaQuery, 
  Button, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logOut } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userType, setUserType] = useState(null);
  
  // Determine user type from URL path
  useEffect(() => {
    if (location.pathname.includes('/student')) {
      setUserType('student');
    } else if (location.pathname.includes('/faculty')) {
      setUserType('faculty');
    } else if (location.pathname.includes('/admin')) {
      setUserType('admin');
    } else {
      setUserType(null);
    }
  }, [location.pathname]);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    if (userType === 'student') {
      navigate('/profile/student/student1');
    } else if (userType === 'faculty') {
      navigate('/profile/faculty/faculty1');
    } else if (userType === 'admin') {
      navigate('/profile/admin/admin1');
    }
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate(`/${userType}`);
  };

  const handleLogout = async () => {
    handleMenuClose();
    
    if (userType === 'admin') {
      // For admin, just clear localStorage
      localStorage.removeItem('adminAuthenticated');
    } else {
      // For students and faculty, use Firebase logout
      await logOut();
    }
    
    navigate('/');
  };
  
  // Determine if we should show auth UI based on path
  const showAuthUI = userType !== null;
  
  // For admin, check localStorage instead of Firebase auth
  const isAdminLoggedIn = userType === 'admin' && localStorage.getItem('adminAuthenticated') === 'true';
  
  // Determine if user is authenticated based on type
  const isAuthenticated = userType === 'admin' ? isAdminLoggedIn : currentUser !== null;
  
  return (
    <Box 
      component="header" 
      sx={{
        width: '100%',
        mb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          my: 2 
        }}>
          <Box 
            component="img"
            src="/images/logo.gif"
            alt="University Logo"
            sx={{
              height: isMobile ? '50px' : '70px',
              objectFit: 'contain',
              cursor: 'pointer'
            }}
            onClick={() => {
              // If user is authenticated, navigate to their dashboard
              if (isAuthenticated && userType) {
                navigate(`/${userType}`);
              } else {
                // Otherwise go to home page
                navigate('/');
              }
            }}
          />
          
          {/* Auth Actions */}
          {showAuthUI && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  {!isMobile && (
                    <Button 
                      color="primary" 
                      variant="text"
                      onClick={handleDashboardClick}
                      sx={{ mr: 2 }}
                    >
                      Dashboard
                    </Button>
                  )}
                  
                  <Tooltip title="Account menu">
                    <IconButton 
                      onClick={handleProfileMenuOpen}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <Avatar 
                        alt={userType === 'admin' ? 'Administrator' : currentUser?.displayName || 'User'} 
                        src={userType !== 'admin' ? currentUser?.photoURL : undefined}
                        sx={{ width: 40, height: 40 }}
                      />
                    </IconButton>
                  </Tooltip>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 2,
                      sx: { minWidth: 180 }
                    }}
                  >
                    {userType === 'admin' ? (
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Administrator
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    ) : currentUser?.displayName && (
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {currentUser.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentUser.email}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    )}
                    
                    <MenuItem onClick={handleProfileClick}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleDashboardClick}>
                      Dashboard
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  color="primary" 
                  variant="contained"
                  onClick={() => navigate(`/${userType}/login`)}
                >
                  Login
                </Button>
              )}
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          height: '8px',
          mb: 2 
        }}>
          <Box sx={{ flex: 1, bgcolor: '#fdb913' }} /> {/* Yellow/Orange */}
          <Box sx={{ flex: 1, bgcolor: '#59c1e8' }} /> {/* Blue */}
          <Box sx={{ flex: 1, bgcolor: '#e63946' }} /> {/* Red */}
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
