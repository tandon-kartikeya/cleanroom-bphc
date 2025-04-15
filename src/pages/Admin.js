import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  useTheme,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AssignmentTurnedIn as BookingsIcon,
  Person as UsersIcon,
  Science as EquipmentIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  CheckCircleOutline as ApproveIcon,
  CancelOutlined as RejectIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { BookingContext } from '../App';
import { useNavigate } from 'react-router-dom';

// Equipment options - would come from API in real app
const equipmentOptions = [
  { value: '1', label: 'Electron Microscope' },
  { value: '2', label: 'Spin Coater' },
  { value: '3', label: 'Plasma Etcher' },
  { value: '4', label: 'Thermal Evaporator' },
  { value: '5', label: 'Optical Microscope' }
];

// Time slot options
const timeSlotOptions = [
  { value: '8:00', label: '8:00 AM - 10:00 AM' },
  { value: '10:00', label: '10:00 AM - 12:00 PM' },
  { value: '12:00', label: '12:00 PM - 2:00 PM' },
  { value: '14:00', label: '2:00 PM - 4:00 PM' },
  { value: '16:00', label: '4:00 PM - 6:00 PM' }
];

// Status options for filtering
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

// Faculty mapping data 
const facultyMapping = [
  { id: 'faculty1', email: 'f20211878@hyderabad.bits-pilani.ac.in', name: 'Faculty 1' },
  { id: 'faculty2', email: 'f20213183@hyderabad.bits-pilani.ac.in', name: 'Faculty 2' },
  { id: 'faculty3', email: 'f20210485@hyderabad.bits-pilani.ac.in', name: 'Faculty 3' },
  { id: 'faculty4', email: '', name: 'Faculty 4' },
  { id: 'faculty5', email: '', name: 'Faculty 5' }
];

// Faculty options for dropdown
const facultyOptions = [
  { value: 'faculty1', label: 'Faculty 1' },
  { value: 'faculty2', label: 'Faculty 2' },
  { value: 'faculty3', label: 'Faculty 3' },
  { value: 'faculty4', label: 'Faculty 4' },
  { value: 'faculty5', label: 'Faculty 5' }
];

const Admin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { bookings, updateBookingStatus } = useContext(BookingContext);
  const [activeTab, setActiveTab] = useState(0);
  const [adminData, setAdminData] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Dialog state
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  useEffect(() => {
    // Check if admin is authenticated
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    // Get admin data
    try {
      const adminInfo = localStorage.getItem('adminUserInfo');
      if (adminInfo) {
        setAdminData(JSON.parse(adminInfo));
      }
    } catch (error) {
      console.error("Error parsing admin info:", error);
    }
  }, [navigate]);

  // Debug available bookings
  console.log('Available bookings in admin:', bookings.length, bookings);
  
  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    // Ensure booking exists and has required properties
    if (!booking) {
      console.log('Skipping undefined booking');
      return false;
    }
    
    // Debug individual booking
    console.log('Processing booking:', booking.id, booking.status, booking.equipment);
    
    // Filter by status
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }
    
    // Filter by equipment - account for different equipment data structures
    if (equipmentFilter !== 'all') {
      // Handle different ways equipment might be stored
      const equipmentValue = booking.equipment?.value || 
                            (typeof booking.equipment === 'string' ? booking.equipment : null);
      
      if (equipmentValue !== equipmentFilter) {
        return false;
      }
    }
    
    // Filter by date
    if (dateFilter !== 'all' && booking.date) {
      try {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return bookingDate.toDateString() === tomorrow.toDateString();
          case 'week':
            return bookingDate >= today && bookingDate < nextWeek;
          case 'month':
            return bookingDate >= today && bookingDate < nextMonth;
          default:
            return true;
        }
      } catch (error) {
        console.error('Error parsing date for booking:', booking.id, error);
        return true; // Include it if date parsing fails
      }
    }
    
    return true;
  });
  
  // Debug filtered bookings
  console.log('Filtered bookings in admin:', filteredBookings.length);

  // Handle tab change 
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr || 'N/A';
    }
  };
  
  // Get faculty name based on ID
  const getFacultyName = (id) => {
    const faculty = facultyMapping.find(f => f.id === id);
    return faculty ? faculty.name : id;
  };
  
  // Open details dialog
  const handleViewDetails = (booking) => {
    // Ensure we have all necessary data for the booking
    console.log('Viewing booking details:', booking);
    if (!booking.docId) {
      console.error('Warning: Selected booking is missing docId', booking);
    }
    setSelectedBooking(booking);
    setDetailsDialog(true);
    // Reset feedback text when opening dialog
    setFeedbackText('');
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
        // Admin has veto power - can change status regardless of current state
        await updateBookingStatus(
          selectedBooking.docId, 
          'approved', 
          feedbackText, 
          'admin'
        );
        setApproveDialogOpen(false);
        setDetailsDialog(false);
        setFeedbackText('');
      } catch (error) {
        console.error('Error approving booking:', error);
        // Handle error (could show a toast/alert)
      }
    }
  };

  // Handle reject booking
  const handleRejectBooking = async () => {
    if (selectedBooking) {
      try {
        // Check if we have a valid docId
        if (!selectedBooking.docId) {
          throw new Error('Missing document ID for this booking. Cannot update status.');
        }
        
        console.log('Admin rejecting booking:', { 
          docId: selectedBooking.docId,
          id: selectedBooking.id,
          status: 'rejected',
          feedback: feedbackText
        });
        
        // Admin has veto power - can change status regardless of current state
        const updatedBooking = await updateBookingStatus(
          selectedBooking.docId, 
          'rejected', 
          feedbackText,
          'admin'
        );
        
        console.log('Booking update successful:', updatedBooking);
        
        // Update UI immediately
        alert('Booking has been successfully rejected.');
        
        // Close dialogs
        setRejectDialogOpen(false);
        setDetailsDialog(false);
        setFeedbackText('');
      } catch (error) {
        console.error('Error rejecting booking:', error);
        alert('There was an error rejecting this booking: ' + error.message);
      }
    }
  };
  
  // Calculate dashboard statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;
  
  // Calculate equipment usage statistics
  const equipmentUsage = equipmentOptions.map(eq => {
    const count = bookings.filter(b => b.equipment.value === eq.value).length;
    return {
      ...eq,
      count,
      percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
    };
  });
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Administrator Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage and monitor cleanroom equipment bookings
        </Typography>
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
          <Tab icon={<BookingsIcon />} label="Bookings" iconPosition="start" />
          <Tab icon={<UsersIcon />} label="Users" iconPosition="start" />
          <Tab icon={<EquipmentIcon />} label="Equipment" iconPosition="start" />
          <Tab icon={<CalendarIcon />} label="Calendar" iconPosition="start" />
        </Tabs>
      </Paper>
      
      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Dashboard Overview
          </Typography>
          
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  backgroundColor: 'primary.light',
                  color: 'white'
                }}
              >
                <Typography variant="h3" fontWeight={700}>
                  {totalBookings}
                </Typography>
                <Typography variant="subtitle1">
                  Total Bookings
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  backgroundColor: 'warning.light',
                  color: 'white'
                }}
              >
                <Typography variant="h3" fontWeight={700}>
                  {pendingBookings}
                </Typography>
                <Typography variant="subtitle1">
                  Pending Approval
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  backgroundColor: 'success.light',
                  color: 'white'
                }}
              >
                <Typography variant="h3" fontWeight={700}>
                  {approvedBookings}
                </Typography>
                <Typography variant="subtitle1">
                  Approved Bookings
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  backgroundColor: 'error.light',
                  color: 'white'
                }}
              >
                <Typography variant="h3" fontWeight={700}>
                  {rejectedBookings}
                </Typography>
                <Typography variant="subtitle1">
                  Rejected Bookings
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Equipment Usage */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Equipment Usage Statistics
            </Typography>
            <Grid container spacing={3}>
              {equipmentUsage.map((equipment) => (
                <Grid item xs={12} sm={6} md={4} key={equipment.value}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {equipment.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {equipment.count} bookings ({equipment.percentage}%)
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 5 }}>
                      <Box 
                        sx={{ 
                          width: `${equipment.percentage}%`, 
                          height: '100%',
                          borderRadius: 5,
                          bgcolor: 'primary.main'
                        }} 
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}
      
      {/* Bookings Tab */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h2" gutterBottom>
                All Bookings
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<FilterIcon />}
                sx={{ mr: 1 }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
          
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="equipment-filter-label">Equipment</InputLabel>
                  <Select
                    labelId="equipment-filter-label"
                    id="equipment-filter"
                    value={equipmentFilter}
                    label="Equipment"
                    onChange={(e) => setEquipmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Equipment</MenuItem>
                    {equipmentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="date-filter-label">Date Range</InputLabel>
                  <Select
                    labelId="date-filter-label"
                    id="date-filter"
                    value={dateFilter}
                    label="Date Range"
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Dates</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="tomorrow">Tomorrow</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
                        No bookings found matching the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>
                          {booking.student?.name || booking.name || 'N/A'}
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
                            label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
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
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
      
      {/* Other tabs would be implemented here */}
      {activeTab > 1 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            This section is under development
          </Typography>
        </Box>
      )}
      
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
              label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)} 
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
                  Faculty
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getFacultyName(selectedBooking.faculty) || 'Not specified'}
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
              
              {/* Show current status information if not pending */}
              {selectedBooking.status !== 'pending' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)} 
                        color={getStatusChipColor(selectedBooking.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {selectedBooking.status === 'approved' ? 'Approved by ' : 'Rejected by '}
                        {selectedBooking.lastModifiedBy || 'faculty/admin'}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                      Feedback
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking.rejectionReason || selectedBooking.approvalNotes || 'No feedback provided'}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {/* Admin veto section - allow status change regardless of current state */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={500}>
                  Admin Veto Controls
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  As an administrator, you can override the current booking status:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="success"
                    onClick={() => handleOpenApproveDialog(selectedBooking)}
                    startIcon={<ApproveIcon />}
                    disabled={selectedBooking?.status === 'approved'}
                  >
                    Change to Approved
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleOpenRejectDialog(selectedBooking)}
                    startIcon={<RejectIcon />}
                    disabled={selectedBooking?.status === 'rejected'}
                  >
                    Change to Rejected
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
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
        <DialogTitle>
          {selectedBooking?.status === 'pending' ? 'Approve Booking Request' : 'Override Booking Status to Approved'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            {selectedBooking?.status === 'pending' 
              ? 'Are you sure you want to approve this booking request?'
              : 'You are overriding the current status and changing it to APPROVED. Please provide a reason for this change.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="feedback"
            label="Approval Notes"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required={selectedBooking?.status !== 'pending'}
            helperText={selectedBooking?.status !== 'pending' ? "Required when overriding a previous decision" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApproveBooking} 
            color="success" 
            variant="contained"
            disabled={selectedBooking?.status !== 'pending' && !feedbackText.trim()}
          >
            {selectedBooking?.status === 'pending' ? 'Approve' : 'Override to Approved'}
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
        <DialogTitle>
          {selectedBooking?.status === 'pending' ? 'Reject Booking Request' : 'Override Booking Status to Rejected'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            {selectedBooking?.status === 'pending' 
              ? 'Please provide a reason for rejecting this booking request.'
              : 'You are overriding the current status and changing it to REJECTED. Please provide a reason for this change.'}
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
            {selectedBooking?.status === 'pending' ? 'Reject' : 'Override to Rejected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
