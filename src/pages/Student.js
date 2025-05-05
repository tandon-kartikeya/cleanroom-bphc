import React, { useState, useContext, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Tabs,
  Tab,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import { BookingContext } from '../App';
import { AuthContext } from '../context/AuthContext';
import { getStudentBookings } from '../services/BookingService';
import { useNavigate } from 'react-router-dom';

// Data for form
const equipmentOptions = [
  { value: '1', label: 'Electron Microscope' },
  { value: '2', label: 'Spin Coater' },
  { value: '3', label: 'Plasma Etcher' },
  { value: '4', label: 'Thermal Evaporator' },
  { value: '5', label: 'Optical Microscope' }
];

const timeSlotOptions = [
  { value: '8:00', label: '8:00 AM - 11:00 AM' },
  { value: '11:00', label: '11:00 AM - 2:00 PM' },
  { value: '14:00', label: '2:00 PM - 5:00 PM' },
  { value: '17:00', label: '5:00 PM - 8:00 PM' }
];

const facultyOptions = [
  { value: 'faculty1', label: 'Faculty 1', email: 'f20211878@hyderabad.bits-pilani.ac.in' },
  { value: 'faculty2', label: 'Faculty 2', email: 'f20213138@hyderabad.bits-pilani.ac.in' },
  { value: 'faculty3', label: 'Faculty 3', email: 'f20210485@hyderabad.bits-pilani.ac.in' },
  { value: 'faculty4', label: 'Faculty 4', email: '' },
  { value: 'faculty5', label: 'Faculty 5', email: '' }
];

const Student = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  const { addBooking, bookings, loading, error } = useContext(BookingContext);
  const [studentBookings, setStudentBookings] = useState([]);
  const [loadingStudentBookings, setLoadingStudentBookings] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // State for booking form
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    equipment: '',
    faculty: '',
    preferredDate: null,
    preferredTimeSlot: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Populate student info from Google Auth
  useEffect(() => {
    if (currentUser) {
      // Nothing needed here, as we're using currentUser directly in the component
    }
  }, [currentUser]);

  // Fetch student-specific bookings
  useEffect(() => {
    const fetchStudentBookings = async () => {
      if (!currentUser || !currentUser.email) return;
      
      try {
        setLoadingStudentBookings(true);
        const fetchedBookings = await getStudentBookings(currentUser.email);
        console.log("Fetched student bookings:", fetchedBookings);
        setStudentBookings(fetchedBookings);
      } catch (err) {
        console.error('Error fetching student bookings:', err);
        setFormErrors('Failed to load your bookings. Please try again later.');
      } finally {
        setLoadingStudentBookings(false);
      }
    };
    
    fetchStudentBookings();
  }, [currentUser]);

  // Create a function to refresh bookings
  const refreshBookings = async () => {
    if (!currentUser || !currentUser.email) return;
    
    try {
      setLoadingStudentBookings(true);
      const fetchedBookings = await getStudentBookings(currentUser.email);
      console.log("Refreshed student bookings:", fetchedBookings);
      setStudentBookings(fetchedBookings);
    } catch (err) {
      console.error('Error refreshing student bookings:', err);
    } finally {
      setLoadingStudentBookings(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for the field
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };
  
  // Validate form step
  const validateStep = () => {
    const errors = {};
    
    switch (activeStep) {
      case 0:
        if (!formData.equipment) errors.equipment = 'Please select an equipment';
        if (!formData.faculty) errors.faculty = 'Please select a faculty';
        break;
      case 1:
        if (!formData.preferredDate && !selectedDate) errors.preferredDate = 'Please select a preferred date';
        if (!formData.preferredTimeSlot) errors.preferredTimeSlot = 'Please select a preferred time slot';
        break;
      case 2:
        // No validation for description
        break;
      case 3:
        // Validate all fields for final review
        if (!formData.equipment) errors.equipment = 'Please select an equipment';
        if (!formData.faculty) errors.faculty = 'Please select a faculty';
        if (!formData.preferredDate && !selectedDate) errors.preferredDate = 'Please select a preferred date';
        if (!formData.preferredTimeSlot) errors.preferredTimeSlot = 'Please select a preferred time slot';
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateStep() && currentUser) {
      try {
        setFormLoading(true);
        
        // Extract BITS student ID from email
        let bitsStudentId = '';
        if (currentUser.email) {
          // Extract student ID from email (e.g., f20190001@hyderabad.bits-pilani.ac.in)
          const emailPrefix = currentUser.email.split('@')[0];
          if (emailPrefix && emailPrefix.length > 0) {
            bitsStudentId = emailPrefix.toUpperCase();
          }
        }
        
        // Add student information to the booking
        const bookingWithStudentInfo = {
          name: currentUser.displayName || 'Unknown User',
          studentId: bitsStudentId || currentUser.uid, // Use BITS ID if available, fallback to UID
          studentEmail: currentUser.email, // Important: explicitly set studentEmail for filtering
          facultyEmail: facultyOptions.find(faculty => faculty.value === formData.faculty)?.email,
          ...formData,
          preferredDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
          // These will be set by admin during approval
          actualDate: null,
          actualTimeSlot: null,
          status: 'pending_faculty' // Initial status
        };
        
        console.log("Creating booking with data:", bookingWithStudentInfo);
        
        // Create the booking
        await addBooking(bookingWithStudentInfo);
        
        // Reset form
        setFormData({
          equipment: '',
          preferredDate: '',
          preferredTimeSlot: '',
          faculty: '',
          description: ''
        });
        setSelectedDate(null);
        setActiveStep(0);
        
        // Show success
        setSuccessMessage('Booking submitted successfully!');
        
        // Refresh the bookings list to show the new booking
        await refreshBookings();
        
        // Change tab to show the pending bookings
        setTabValue(0); // Switch to the pending tab to show the new booking
        
      } catch (error) {
        console.error('Error submitting booking:', error);
        setFormErrors('Failed to submit booking. Please try again.');
      } finally {
        setFormLoading(false);
      }
    }
  };
  
  // Handle close success message
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };
  
  // Format date correctly
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

  // Get status chip color based on status
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending_admin': return 'info'; // Faculty approved, waiting for admin
      case 'pending_faculty': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  // Get human-readable status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending_faculty': return 'Pending Faculty Approval';
      case 'pending_admin': return 'Faculty Approved, Pending Admin';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending'; // For backward compatibility
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'pending':
      case 'pending_faculty':
        return <Chip 
          icon={<ScheduleIcon />} 
          label={getStatusLabel(status)} 
          color="warning" 
          size="small" 
        />;
      case 'pending_admin':
        return <Chip 
          icon={<ScheduleIcon />} 
          label={getStatusLabel(status)} 
          color="info" 
          size="small" 
        />;
      case 'approved':
        return <Chip 
          icon={<CheckCircleIcon />} 
          label={getStatusLabel(status)} 
          color="success" 
          size="small" 
        />;
      case 'rejected':
        return <Chip 
          icon={<CancelIcon />} 
          label={getStatusLabel(status)} 
          color="error" 
          size="small" 
        />;
      default:
        return <Chip label={getStatusLabel(status)} size="small" />;
    }
  };
  
  // Render bookings table
  const renderBookingsTable = (bookings) => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time Slot</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>
                    {equipmentOptions.find(eq => eq.value === booking.equipment)?.label || booking.equipment}
                  </TableCell>
                  <TableCell>{formatDate(booking.date)}</TableCell>
                  <TableCell>
                    {timeSlotOptions.find(ts => ts.value === booking.timeSlot)?.label || booking.timeSlot}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(booking.status)}
                    {booking.approvalStatus && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {booking.status === 'pending_faculty' && 'Waiting for faculty approval'}
                          {booking.status === 'pending_admin' && 'Faculty approved, waiting for admin approval'}
                          {booking.status === 'approved' && 'Approved by both faculty and admin'}
                          {booking.status === 'rejected' && booking.approvalStatus.faculty === 'rejected' && 'Rejected by faculty'}
                          {booking.status === 'rejected' && booking.approvalStatus.admin === 'rejected' && 'Rejected by admin'}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Equipment and Faculty
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }} error={Boolean(formErrors.equipment)}>
              <InputLabel id="equipment-label">Equipment</InputLabel>
              <Select
                labelId="equipment-label"
                value={formData.equipment}
                onChange={(e) => handleFormChange('equipment', e.target.value)}
                label="Equipment"
              >
                {equipmentOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.equipment && (
                <Typography color="error" variant="caption">
                  {formErrors.equipment}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }} error={Boolean(formErrors.faculty)}>
              <InputLabel id="faculty-label">Faculty</InputLabel>
              <Select
                labelId="faculty-label"
                value={formData.faculty}
                onChange={(e) => handleFormChange('faculty', e.target.value)}
                label="Faculty"
              >
                {facultyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.faculty && (
                <Typography color="error" variant="caption">
                  {formErrors.faculty}
                </Typography>
              )}
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Preferred Date and Time
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please select your preferred date and time slot. The admin may assign a different time based on availability.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Preferred Date"
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      handleFormChange('preferredDate', date);
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={Boolean(formErrors.preferredDate)}
                        helperText={formErrors.preferredDate}
                      />
                    )}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(formErrors.preferredTimeSlot)}>
                  <InputLabel id="time-slot-label">Preferred Time Slot</InputLabel>
                  <Select
                    labelId="time-slot-label"
                    value={formData.preferredTimeSlot}
                    onChange={(e) => handleFormChange('preferredTimeSlot', e.target.value)}
                    label="Preferred Time Slot"
                  >
                    {timeSlotOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.preferredTimeSlot && (
                    <Typography color="error" variant="caption">
                      {formErrors.preferredTimeSlot}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Provide Description
            </Typography>
            <TextField
              label="Description of work"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              fullWidth
              placeholder="Describe the work you plan to do with this equipment..."
              error={Boolean(formErrors.description)}
              helperText={formErrors.description}
            />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Booking
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Equipment
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {equipmentOptions.find(eq => eq.value === formData.equipment)?.label}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Faculty
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {facultyOptions.find(eq => eq.value === formData.faculty)?.label}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.date ? formatDate(formData.date) : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time Slot
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {timeSlotOptions.find(ts => ts.value === formData.timeSlot)?.label}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.description}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };
  
  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            You must be logged in as a student to view this page
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/student/login')}
            sx={{ mt: 2 }}
          >
            Student Login
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with profile button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.main
          }}
        >
          Student Dashboard
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ProfileIcon />}
          onClick={() => navigate('/profile/student/student1')}
        >
          Profile
        </Button>
      </Box>

      {/* Success message */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSuccessMessage}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Tabs */}
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden' 
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(0, 102, 179, 0.03)'
          }}
        >
          <Tab 
            label="My Bookings" 
            icon={<CalendarIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="New Booking" 
            icon={<AddIcon />} 
            iconPosition="start"
          />
        </Tabs>
        
        {/* Tab content */}
        <Box sx={{ p: 3 }}>
          {/* My Bookings Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Pending Requests
              </Typography>
              {renderBookingsTable(studentBookings.filter(booking => booking.status === 'pending'))}
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" gutterBottom>
                Approved Bookings
              </Typography>
              {renderBookingsTable(studentBookings.filter(booking => booking.status === 'approved'))}
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" gutterBottom>
                Rejected Requests
              </Typography>
              {renderBookingsTable(studentBookings.filter(booking => booking.status === 'rejected'))}
            </Box>
          )}
          
          {/* New Booking Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Book Cleanroom Equipment
              </Typography>
              
              {/* Stepper */}
              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 4,
                  py: 2
                }}
              >
                <Step>
                  <StepLabel>Equipment</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Date & Time</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Description</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Confirm</StepLabel>
                </Step>
              </Stepper>
              
              {/* Step content */}
              <Paper 
                elevation={0} 
                variant="outlined"
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  borderColor: 'divider'
                }}
              >
                {renderStepContent(activeStep)}
                
                {/* Navigation buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 3
                }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  
                  {activeStep === 3 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={formLoading}
                    >
                      {formLoading ? 'Submitting...' : 'Submit Booking'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Student's Booking History */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Your Booking History
        </Typography>
        
        {loadingStudentBookings ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : studentBookings.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body1" color="text.secondary">
              You don't have any bookings yet
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time Slot</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>
                      {booking.equipment && booking.equipment.label ? 
                        booking.equipment.label : 
                        getEquipmentName(booking.equipment?.value || booking.equipment)}
                    </TableCell>
                    <TableCell>
                      {booking.actualDate ? 
                        formatDate(booking.actualDate) + ' (Assigned)' : 
                        formatDate(booking.preferredDate) + ' (Preferred)'}
                    </TableCell>
                    <TableCell>
                      {booking.actualTimeSlot ? 
                        (booking.actualTimeSlot.label ? booking.actualTimeSlot.label : getTimeSlotLabel(booking.actualTimeSlot)) + ' (Assigned)' : 
                        (booking.preferredTimeSlot && booking.preferredTimeSlot.label ? 
                          booking.preferredTimeSlot.label : 
                          getTimeSlotLabel(booking.preferredTimeSlot?.value || booking.preferredTimeSlot)) + ' (Preferred)'}
                    </TableCell>
                    <TableCell>
                      {booking.faculty && facultyOptions.find(f => f.value === booking.faculty)?.label || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                        color={getStatusChipColor(booking.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {booking.status === 'approved' && booking.approvalNotes ? booking.approvalNotes : 
                       booking.status === 'rejected' && booking.rejectionReason ? booking.rejectionReason : 
                       'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default Student;
