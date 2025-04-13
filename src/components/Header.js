import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
            }}
          />
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
