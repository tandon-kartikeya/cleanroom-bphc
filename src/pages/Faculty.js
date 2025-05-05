import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  useTheme,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  NotificationsActive as NotificationsIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  CheckCircleOutline as ApproveIcon,
  CancelOutlined as RejectIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../App';
import { AuthContext } from '../context/AuthContext';
import { getFacultyBookings } from '../services/BookingService';

// Faculty email to ID mapping
const facultyMapping = [
  { id: 'faculty1', email: 'f20211878@hyderabad.bits-pilani.ac.in', name: 'Faculty 1' },
  { id: 'faculty2', email: 'f20213183@hyderabad.bits-pilani.ac.in', name: 'Faculty 2' },
  { id: 'faculty3', email: 'f20210485@hyderabad.bits-pilani.ac.in', name: 'Faculty 3' },
  { id: 'faculty4', email: '', name: 'Faculty 4' },
  { id: 'faculty5', email: '', name: 'Faculty 5' }
];

// Data for form
const equipmentOptions = [
  { value: '1', label: 'Electron Microscope' },
  { value: '2', label: 'Spin Coater' },
  { value: '3', label: 'Plasma Etcher' },
  { value: '4', label: 'Thermal Evaporator' },
  { value: '5', label: 'Optical Microscope' }
];

const timeSlotOptions = [
  { value: '8:00', label: '8:00 AM - 10:00 AM' },
  { value: '10:00', label: '10:00 AM - 12:00 PM' },
  { value: '12:00', label: '12:00 PM - 2:00 PM' },
  { value: '14:00', label: '2:00 PM - 4:00 PM' },
  { value: '16:00', label: '4:00 PM - 6:00 PM' }
];

const Faculty = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { bookings, updateBookingStatus } = useContext(BookingContext);
  const { currentUser } = useContext(AuthContext);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for dialogs
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Faculty ID based on email
  const [facultyId, setFacultyId] = useState(null);
  
  // State for faculty-specific bookings
  const [facultyBookings, setFacultyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  
  // Determine faculty ID based on email
  useEffect(() => {
    if (currentUser && currentUser.email) {
      const faculty = facultyMapping.find(f => f.email === currentUser.email);
      if (faculty) {
        setFacultyId(faculty.id);
      }
    }
  }, [currentUser]);
  
  // Fetch faculty-specific bookings from Firestore
  useEffect(() => {
    const fetchFacultyBookings = async () => {
      if (!currentUser || !currentUser.email || !facultyId) return;
      
      try {
        setLoadingBookings(true);
        const fetchedBookings = await getFacultyBookings(facultyId, currentUser.email);
        setFacultyBookings(fetchedBookings);
        setBookingsError(null);
      } catch (err) {
        console.error('Error fetching faculty bookings:', err);
        setBookingsError('Failed to load bookings. Please try again later.');
      } finally {
        setLoadingBookings(false);
      }
    };
    
    fetchFacultyBookings();
  }, [currentUser, facultyId, bookings]);
  
  // Get faculty name based on ID
  const getFacultyName = (id) => {
    const faculty = facultyMapping.find(f => f.id === id);
    return faculty ? faculty.name : id;
  };
  
  // Filter bookings by faculty 
  const getFilteredBookings = () => {
    // Use the bookings fetched from Firestore
    return facultyBookings.filter(booking => {
      // Filter by status based on current tab
      let statusMatch = true;
      if (tabValue === 0) {
        // Faculty pending tab should show requests that need faculty approval
        statusMatch = booking.status === 'pending_faculty';
      } else if (tabValue === 1) {
        // Approved tab should show all faculty-approved bookings (both fully approved and waiting for admin)
        statusMatch = booking.status === 'approved' || booking.status === 'pending_admin';
      } else if (tabValue === 2) {
        statusMatch = booking.status === 'rejected';
      }
      
      return statusMatch;
    });
  };
  
  const filteredBookings = getFilteredBookings();
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      // Handle if dateStr is a Firestore timestamp object
      if (dateStr && typeof dateStr === 'object' && dateStr.seconds) {
        return format(new Date(dateStr.seconds * 1000), 'MMM dd, yyyy');
      }
      // Handle regular date strings
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'N/A';
    }
  };
  
  // Get equipment name by value
  const getEquipmentName = (value) => {
    const equipment = equipmentOptions.find(eq => eq.value === value);
    return equipment ? equipment.label : 'Unknown Equipment';
  };
  
  // Get time slot label by value
  const getTimeSlotLabel = (value) => {
    const timeSlot = timeSlotOptions.find(ts => ts.value === value);
    return timeSlot ? timeSlot.label : value;
  };
  
  // Get chip color based on status
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending_admin': return 'info'; // Faculty approved, waiting for admin
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };
  
  // Get human-readable status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending_faculty': return 'Pending Faculty Approval';
      case 'pending_admin': return 'Faculty Approved, Pending Admin';
      case 'rejected': return 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open details dialog
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };
  
  // Open approve dialog
  const handleOpenApproveDialog = (booking) => {
    setSelectedBooking(booking);
    setFeedbackText('');
    setApproveDialogOpen(true);
  };
  
  // Open reject dialog
  const handleOpenRejectDialog = (booking) => {
    setSelectedBooking(booking);
    setFeedbackText('');
    setRejectDialogOpen(true);
  };
  
  // Handle approve booking
  const handleApproveBooking = async () => {
    if (selectedBooking) {
      try {
        await updateBookingStatus(
          selectedBooking.docId, 
          'approved', 
          feedbackText,
          currentUser?.displayName || 'faculty',
          'faculty' // Explicitly specify that faculty is approving
        );
        setApproveDialogOpen(false);
        setFeedbackText('');
      } catch (error) {
        console.error('Error approving booking:', error);
        // Show error toast or message
      }
    }
  };
  
  // Handle reject booking
  const handleRejectBooking = async () => {
    if (selectedBooking) {
      try {
        await updateBookingStatus(
          selectedBooking.docId, 
          'rejected', 
          feedbackText,
          currentUser?.displayName || 'faculty',
          'faculty' // Explicitly specify that faculty is rejecting
        );
        setRejectDialogOpen(false);
        setFeedbackText('');
      } catch (error) {
        console.error('Error rejecting booking:', error);
        // Show error toast or message
      }
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Faculty Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Review and manage cleanroom booking requests
        </Typography>
      </Paper>
      
      {/* Display message if faculty not registered */}
      {currentUser && !facultyId && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Your account is not registered as a faculty member
          </Typography>
          <Typography variant="body1">
            Your email ({currentUser.email}) is not associated with any faculty in the system.
          </Typography>
        </Paper>
      )}
      
      {/* Show loading indicator */}
      {loadingBookings && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Show error message if any */}
      {bookingsError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {bookingsError}
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<NotificationsIcon />} 
            label={`Pending (${facultyBookings.filter(b => b.status === 'pending_faculty').length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<CheckCircleIcon />} 
            label={`Approved (${facultyBookings.filter(b => b.status === 'approved' || b.status === 'pending_admin').length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<CancelIcon />} 
            label={`Rejected (${facultyBookings.filter(b => b.status === 'rejected').length})`} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {/* Bookings Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="bookings table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>
                      {booking.student?.name || booking.name || 'N/A'}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {booking.studentId || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {booking.equipment && booking.equipment.label ? 
                        booking.equipment.label : 
                        getEquipmentName(booking.equipment?.value || booking.equipment)}
                    </TableCell>
                    <TableCell>
                      {formatDate(booking.date)}
                    </TableCell>
                    <TableCell>
                      {booking.timeSlot && booking.timeSlot.label ? 
                        booking.timeSlot.label : 
                        getTimeSlotLabel(booking.timeSlot?.value || booking.timeSlot)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(booking.status)} 
                        color={getStatusChipColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Show approve/reject for any booking waiting for faculty approval */}
                        {booking.status === 'pending_faculty' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                color="success" 
                                size="small" 
                                onClick={() => handleOpenApproveDialog(booking)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Reject">
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => handleOpenRejectDialog(booking)}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Booking Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Booking Details
          {selectedBooking && (
            <Chip 
              label={getStatusLabel(selectedBooking.status)} 
              color={getStatusChipColor(selectedBooking.status)}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Booking ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Request Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.submittedAt ? formatDate(selectedBooking.submittedAt) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Student Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.student?.name || selectedBooking.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Student ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.student?.id || selectedBooking.studentId || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Equipment
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.equipment && selectedBooking.equipment.label ? 
                    selectedBooking.equipment.label : 
                    getEquipmentName(selectedBooking.equipment?.value || selectedBooking.equipment)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Faculty
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getFacultyName(selectedBooking.faculty) || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Booking Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedBooking.date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time Slot
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.timeSlot && selectedBooking.timeSlot.label ? 
                    selectedBooking.timeSlot.label : 
                    getTimeSlotLabel(selectedBooking.timeSlot?.value || selectedBooking.timeSlot)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Purpose of Booking
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.purpose || selectedBooking.description || 'Not specified'}
                </Typography>
              </Grid>
              {selectedBooking.status !== 'pending' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Feedback
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking.rejectionReason || selectedBooking.facultyRejectionReason || 
                     selectedBooking.approvalNotes || selectedBooking.facultyApprovalNotes || 'No feedback provided'}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedBooking && selectedBooking.status === 'pending' && (
            <>
              <Button 
                onClick={() => {
                  setDetailsDialog(false);
                  handleOpenApproveDialog(selectedBooking);
                }} 
                color="success"
              >
                Approve
              </Button>
              <Button 
                onClick={() => {
                  setDetailsDialog(false);
                  handleOpenRejectDialog(selectedBooking);
                }} 
                color="error"
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Approve Booking Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Booking Request</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Are you sure you want to approve this booking request?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="feedback"
            label="Approval Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveBooking} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Booking Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Booking Request</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Please provide a reason for rejecting this booking request.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Rejection Reason"
            fullWidth
            required
            multiline
            rows={3}
            variant="outlined"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectBooking} 
            color="error" 
            variant="contained"
            disabled={!feedbackText.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Faculty;
