import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
  Badge,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Science as ScienceIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { BookingContext } from '../App';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { bookings, updateBookingStatus } = useContext(BookingContext);
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFacultyLabel = (value) => {
    const map = {
      'electrical': 'Electrical Engineering',
      'mechanical': 'Mechanical Engineering',
      'chemical': 'Chemical Engineering',
      'computer_science': 'Computer Science',
      'physics': 'Physics',
      'chemistry': 'Chemistry'
    };
    return map[value] || value;
  };
  
  const getTimeSlotLabel = (value) => {
    const map = {
      '8:00': '8:00 AM - 10:00 AM',
      '10:00': '10:00 AM - 12:00 PM',
      '12:00': '12:00 PM - 2:00 PM',
      '2:00': '2:00 PM - 4:00 PM',
      '4:00': '4:00 PM - 6:00 PM'
    };
    return map[value] || value;
  };

  const getEquipmentLabel = (value) => {
    const map = {
      'equipment_1': 'Equipment #1',
      'equipment_2': 'Equipment #2',
      'equipment_3': 'Equipment #3',
      'equipment_4': 'Equipment #4',
      'equipment_5': 'Equipment #5',
      'none': 'None (General Access)'
    };
    return map[value] || value;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning',
          label: 'Pending'
        };
      case 'approved':
        return {
          color: 'success',
          label: 'Approved'
        };
      case 'rejected':
        return {
          color: 'error',
          label: 'Rejected'
        };
      default:
        return {
          color: 'default',
          label: status
        };
    }
  };

  const filteredRequests = () => {
    // First, filter by status based on selected tab
    let filtered;
    switch (tabValue) {
      case 0: // All
        filtered = bookings;
        break;
      case 1: // Pending
        filtered = bookings.filter(req => req.status === 'pending');
        break;
      case 2: // Approved
        filtered = bookings.filter(req => req.status === 'approved');
        break;
      case 3: // Rejected
        filtered = bookings.filter(req => req.status === 'rejected');
        break;
      default:
        filtered = bookings;
    }
    
    // Then sort by booking date (more recent booking dates first)
    return filtered.sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Sort ascending by date (earlier dates first)
      return dateA - dateB;
    });
  };

  const handleDetailsOpen = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };

  const handleApprove = () => {
    updateBookingStatus(selectedRequest.id, 'approved');
    handleDetailsClose();
  };

  const handleReject = () => {
    updateBookingStatus(selectedRequest.id, 'rejected');
    handleDetailsClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Format date without date-fns: convert YYYY-MM-DD to MMM DD, YYYY
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Manage cleanroom booking requests
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/')}
              startIcon={<ArrowBackIcon />}
              sx={{ px: 3 }}
              size="large"
            >
              Back to Home
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Card elevation={3} sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ fontWeight: 600, color: theme.palette.primary.main }}
            >
              Booking Requests
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Badge badgeContent={bookings.filter(b => b.status === 'pending').length} color="warning" 
                sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: '1.4rem', minWidth: '1.4rem' } }}>
                <Chip 
                  label="Pending" 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                />
              </Badge>
              <Badge badgeContent={bookings.filter(b => b.status === 'approved').length} color="success"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: '1.4rem', minWidth: '1.4rem' } }}>
                <Chip 
                  label="Approved" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              </Badge>
            </Stack>
          </Box>
        </CardContent>
      
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="booking status tabs"
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : "disabled"}
            centered={!isMobile}
            sx={{ 
              '& .MuiTab-root': { 
                py: 1.5,
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          >
            <Tab label="All" id="tab-0" />
            <Tab label={
              <Badge badgeContent={bookings.filter(b => b.status === 'pending').length} color="warning">
                Pending
              </Badge>
            } id="tab-1" />
            <Tab label={
              <Badge badgeContent={bookings.filter(b => b.status === 'approved').length} color="success">
                Approved
              </Badge>
            } id="tab-2" />
            <Tab label={
              <Badge badgeContent={bookings.filter(b => b.status === 'rejected').length} color="error">
                Rejected
              </Badge>
            } id="tab-3" />
          </Tabs>
        </Box>
        
        {filteredRequests().length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body1">
              No bookings found for this status.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="bookings table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(0, 102, 179, 0.04)' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(0, 102, 179, 0.04)' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(0, 102, 179, 0.04)' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(0, 102, 179, 0.04)' }}>Time Slot</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(0, 102, 179, 0.04)' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(0, 102, 179, 0.04)' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests().map((request) => (
                  <TableRow 
                    key={request.id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 102, 179, 0.02) !important',
                        boxShadow: 'inset 0 0 0 1px rgba(0, 102, 179, 0.1)',
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{request.id}</TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{formatDate(request.date)}</TableCell>
                    <TableCell>{getTimeSlotLabel(request.timeSlot)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusColor(request.status).label} 
                        color={getStatusColor(request.status).color} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleDetailsOpen(request)}
                        color="primary"
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(0, 102, 179, 0.08)'
                          }
                        }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
      
      {/* Booking Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 3 }
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle sx={{ 
              pb: 1, 
              pt: 3,
              px: 3,
              fontWeight: 600 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  Booking Details
                </Typography>
                <Chip 
                  label={getStatusColor(selectedRequest.status).label} 
                  color={getStatusColor(selectedRequest.status).color} 
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Reference ID: {selectedRequest.id}
              </Typography>
            </DialogTitle>
            
            <Divider />
            
            <DialogContent sx={{ p: 0 }}>
              <Grid container spacing={0}>
                <Grid item xs={12} md={6} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.name}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Student ID</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.studentId}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.email}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.phone}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Faculty</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {getFacultyLabel(selectedRequest.faculty)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6} sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(0, 102, 179, 0.02)',
                  borderLeft: { xs: 'none', md: '1px solid rgba(0, 0, 0, 0.08)' },
                  borderTop: { xs: '1px solid rgba(0, 0, 0, 0.08)', md: 'none' }
                }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Booking Information
                  </Typography>
                  
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(selectedRequest.date)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Time Slot</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getTimeSlotLabel(selectedRequest.timeSlot)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Equipment</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getEquipmentLabel(selectedRequest.equipment)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {selectedRequest.description && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">Description</Typography>
                        <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2 }}>
                          <Typography variant="body2">
                            {selectedRequest.description || 'No description provided.'}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            
            <Divider />
            
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleDetailsClose} startIcon={<ArrowBackIcon />}>
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              
              {selectedRequest.status === 'pending' && (
                <>
                  <Button 
                    onClick={handleReject} 
                    variant="outlined" 
                    color="error"
                    startIcon={<CloseIcon />}
                    sx={{ mr: 1 }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove} 
                    variant="contained" 
                    color="success"
                    startIcon={<CheckIcon />}
                  >
                    Approve
                  </Button>
                </>
              )}
              
              {selectedRequest.status === 'approved' && (
                <Button 
                  onClick={handleReject} 
                  variant="outlined" 
                  color="error"
                  startIcon={<CloseIcon />}
                >
                  Change to Rejected
                </Button>
              )}
              
              {selectedRequest.status === 'rejected' && (
                <Button 
                  onClick={handleApprove} 
                  variant="contained" 
                  color="success"
                  startIcon={<CheckIcon />}
                >
                  Change to Approved
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Admin;
