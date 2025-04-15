import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Stack
} from '@mui/material';
import { 
  AccessTime as ClockIcon, 
  Science as ScienceIcon, 
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  SupervisorAccount as FacultyIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(0,102,179,0.04) 0%, rgba(0,169,224,0.07) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ maxWidth: 'lg', position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Cleanroom Laboratory Booking System
            </Typography>
            
            <Typography 
              variant="h6" 
              color="textSecondary" 
              paragraph
              sx={{
                mb: 3,
                maxWidth: 'md',
                lineHeight: 1.6
              }}
            >
              Welcome to the online booking system for the BITS Pilani Hyderabad Campus Cleanroom Facility.
              Reserve lab time, manage equipment usage, and streamline your research workflow.
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/student/login')}
                endIcon={<PersonIcon />}
              >
                Student Login
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
                onClick={() => navigate('/faculty/login')}
                endIcon={<FacultyIcon />}
              >
                Faculty Login
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
                onClick={() => navigate('/admin/login')}
                endIcon={<AdminIcon />}
              >
                Administrator Login
              </Button>
            </Stack>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip icon={<ClockIcon />} label="Streamlined Booking" color="primary" variant="outlined" />
              <Chip icon={<ScienceIcon />} label="Advanced Equipment" color="primary" variant="outlined" />
              <Chip icon={<SchoolIcon />} label="Research Support" color="primary" variant="outlined" />
            </Box>
          </Box>
          
          {/* Decorative element */}
          <Box 
            sx={{
              position: 'absolute',
              right: { xs: '-150px', md: '-100px' },
              top: { xs: '-80px', md: '-120px' },
              width: { xs: '300px', md: '400px' },
              height: { xs: '300px', md: '400px' },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,102,179,0.03) 0%, rgba(0,102,179,0.08) 100%)',
              zIndex: 0
            }}
          />
        </Paper>
        
        {/* About the Facility */}
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{
            mb: 3,
            fontWeight: 600,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 60,
              height: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2
            }
          }}
        >
          About the Facility
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  color="primary"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  BITS Pilani Hyderabad Campus Cleanroom
                </Typography>
                
                <Typography variant="body1" paragraph>
                  The BITS Pilani Hyderabad Campus Cleanroom is a state-of-the-art facility established for conducting research and experiments in a controlled environment. The lab spans 1500 square feet and is classified as class 1000 (ISO 6) cleanroom with a class 100 (ISO 5) area for specific operations.
                </Typography>
                
                <Typography variant="body1" paragraph>
                  The cleanroom features specialized zones including a dedicated yellow light area for Lithography processes. The facility is equipped with advanced instruments such as spin coaters, mask aligners, and characterization tools to support various research endeavors in microelectronics, MEMS, and nanotechnology.
                </Typography>
                
                <Typography variant="body1">
                  Our facility supports faculty and student research projects while serving as a training ground for future engineers and scientists in fields requiring precision manufacturing and testing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardContent>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  color="primary"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Equipment & Resources
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={600}>
                      Lithography
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • Spin Coaters
                      <br/>
                      • Mask Aligners
                      <br/>
                      • UV Exposure Systems
                    </Typography>
                    
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={600}>
                      Material Processing
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • Thermal Evaporators
                      <br/>
                      • Plasma Etchers
                      <br/>
                      • Annealing Furnaces
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={600}>
                      Characterization
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • Optical Microscopes
                      <br/>
                      • Profilometers
                      <br/>
                      • Electrical Testing Equipment
                    </Typography>
                    
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={600}>
                      Safety Features
                    </Typography>
                    <Typography variant="body2">
                      • Airflow Control Systems
                      <br/>
                      • Environmental Monitoring
                      <br/>
                      • Personal Protective Equipment
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ px: 3, pb: 3 }}>
                <Button 
                  onClick={() => navigate('/student/login')} 
                  color="primary" 
                  variant="contained"
                  endIcon={<ChevronRightIcon />}
                >
                  Student Booking
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        {/* Footer Section */}
        <Box 
          component={Paper} 
          elevation={1}
          sx={{ 
            p: 3, 
            mt: 4, 
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(0,102,179,0.02)'
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {new Date().getFullYear()} BITS Pilani Hyderabad Campus. All rights reserved.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            For technical support, please contact the lab administrator.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
