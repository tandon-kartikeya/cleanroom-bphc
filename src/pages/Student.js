import React, { useState, useContext } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Box, 
  Paper, 
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardActions,
  Alert,
  Divider,
  Stack,
  Chip,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import { 
  Today as TodayIcon, 
  AccessTime as TimeIcon, 
  Science as ScienceIcon, 
  School as SchoolIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  BookmarkAdded as BookmarkIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../App';

const Student = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addBooking } = useContext(BookingContext);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Information', 'Booking Details', 'Review & Submit'];

  // Form state
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Reference number for successful booking
  const [bookingRef, setBookingRef] = useState(null);

  const facultyOptions = [
    { value: 'electrical', label: 'Electrical Engineering' },
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'chemical', label: 'Chemical Engineering' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' }
  ];

  const timeSlotOptions = [
    { value: '8:00', label: '8:00 AM - 10:00 AM' },
    { value: '10:00', label: '10:00 AM - 12:00 PM' },
    { value: '12:00', label: '12:00 PM - 2:00 PM' },
    { value: '2:00', label: '2:00 PM - 4:00 PM' },
    { value: '4:00', label: '4:00 PM - 6:00 PM' }
  ];

  const equipmentOptions = [
    { value: 'equipment_1', label: 'Equipment #1' },
    { value: 'equipment_2', label: 'Equipment #2' },
    { value: 'equipment_3', label: 'Equipment #3' },
    { value: 'equipment_4', label: 'Equipment #4' },
    { value: 'equipment_5', label: 'Equipment #5' },
    { value: 'none', label: 'None (General Access)' }
  ];

  const validateStep = (step) => {
    let newErrors = {};
    let isValid = true;

    if (step === 0) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
      if (!studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
        isValid = false;
      }
      if (!email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Email is invalid';
        isValid = false;
      }
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone number should be 10 digits';
        isValid = false;
      }
    } else if (step === 1) {
      if (!faculty) {
        newErrors.faculty = 'Faculty is required';
        isValid = false;
      }
      if (!date) {
        newErrors.date = 'Date is required';
        isValid = false;
      } else {
        // Validate that the date is not in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors.date = 'Date cannot be in the past';
          isValid = false;
        }
      }
      if (!timeSlot) {
        newErrors.timeSlot = 'Time slot is required';
        isValid = false;
      }
      if (!equipment) {
        newErrors.equipment = 'Equipment selection is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    const bookingData = {
      name,
      studentId, 
      email, 
      phone, 
      faculty,
      date,
      timeSlot, 
      equipment, 
      description
    };
    
    const newBooking = addBooking(bookingData);
    setBookingRef(newBooking);
  };

  const resetForm = () => {
    setName('');
    setStudentId('');
    setEmail('');
    setPhone('');
    setFaculty('');
    setDate('');
    setTimeSlot('');
    setEquipment('');
    setDescription('');
    setErrors({});
    setActiveStep(0);
    setBookingRef(null);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get label for dropdown values
  const getFacultyLabel = (value) => {
    const option = facultyOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getTimeSlotLabel = (value) => {
    const option = timeSlotOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getEquipmentLabel = (value) => {
    const option = equipmentOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" color="primary" 
                sx={{ mb: 3, fontWeight: 600, position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 50,
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2
                  }
                }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    variant="outlined"
                    error={!!errors.studentId}
                    helperText={errors.studentId}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant="outlined"
                    error={!!errors.phone}
                    helperText={errors.phone}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                size="large"
              >
                Next
              </Button>
            </CardActions>
          </Card>
        );
      case 1:
        return (
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" color="primary" 
                sx={{ mb: 3, fontWeight: 600, position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 50,
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2
                  }
                }}>
                Booking Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.faculty} sx={{ mb: 2 }}>
                    <InputLabel id="faculty-label">Faculty</InputLabel>
                    <Select
                      labelId="faculty-label"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      label="Faculty"
                    >
                      {facultyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.faculty && <FormHelperText>{errors.faculty}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.date}>
                    <TextField
                      label="Date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <TodayIcon color="primary" sx={{ mr: 1 }} />
                        ),
                      }}
                      error={!!errors.date}
                      helperText={errors.date}
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.timeSlot} sx={{ mb: 2 }}>
                    <InputLabel id="time-slot-label">Time Slot</InputLabel>
                    <Select
                      labelId="time-slot-label"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      label="Time Slot"
                    >
                      {timeSlotOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.timeSlot && <FormHelperText>{errors.timeSlot}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.equipment} sx={{ mb: 2 }}>
                    <InputLabel id="equipment-label">Equipment</InputLabel>
                    <Select
                      labelId="equipment-label"
                      value={equipment}
                      onChange={(e) => setEquipment(e.target.value)}
                      label="Equipment"
                    >
                      {equipmentOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.equipment && <FormHelperText>{errors.equipment}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Please provide any additional details about your research or specific requirements."
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
              <Button onClick={handleBack} size="large" startIcon={<ArrowBackIcon />}>
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                size="large"
              >
                Review
              </Button>
            </CardActions>
          </Card>
        );
      case 2:
        return (
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" color="primary" 
                sx={{ mb: 3, fontWeight: 600, position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 50,
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2
                  }
                }}>
                Review Your Booking
              </Typography>
              
              <Box sx={{ 
                backgroundColor: 'rgba(0, 102, 179, 0.03)', 
                borderRadius: 2, 
                p: 3, 
                mb: 3 
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {name}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Student ID
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {studentId}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {email}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Faculty
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getFacultyLabel(faculty)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(date)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Time Slot
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getTimeSlotLabel(timeSlot)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Equipment
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getEquipmentLabel(equipment)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  {description && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {description}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review your booking details carefully. Once submitted, you will receive a reference ID.
                The booking will be pending until approved by an administrator.
              </Alert>
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
              <Button 
                onClick={handleBack}
                size="large"
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmit}
                size="large"
                startIcon={<BookmarkIcon />}
              >
                Submit Booking
              </Button>
            </CardActions>
          </Card>
        );
      default:
        return null;
    }
  };

  const renderConfirmation = () => {
    return (
      <Fade in={true}>
        <Card 
          elevation={4} 
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${theme.palette.success.light}`,
            bgcolor: 'rgba(46, 125, 50, 0.03)'
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'success.light', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}>
              <CheckIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            
            <Typography variant="h4" component="h2" color="success.main" gutterBottom sx={{ fontWeight: 600 }}>
              Booking Successful!
            </Typography>
            
            <Typography variant="body1" paragraph>
              Your booking request has been submitted successfully. Please save your reference ID for tracking.
            </Typography>
            
            <Box 
              sx={{ 
                my: 4, 
                py: 2, 
                px: 4, 
                border: `2px dashed ${theme.palette.primary.main}`,
                borderRadius: 2,
                display: 'inline-block',
                bgcolor: 'rgba(0, 102, 179, 0.05)'
              }}
            >
              <Typography variant="h5" component="p" color="primary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                {bookingRef.id}
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3, mx: 'auto', maxWidth: 'sm', textAlign: 'left' }}>
              Your booking is currently <strong>pending</strong> approval. You will be notified once it's approved.
            </Alert>
          </CardContent>
          <CardActions sx={{ p: 3, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Return Home
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={resetForm}
            >
              New Booking
            </Button>
          </CardActions>
        </Card>
      </Fade>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.main,
            textAlign: 'center'
          }}
        >
          Cleanroom Booking
        </Typography>
        
        <Typography 
          variant="h6" 
          color="textSecondary" 
          sx={{ 
            mb: 4,
            textAlign: 'center',
            maxWidth: 'sm'
          }}
        >
          Reserve your slot in the BITS Pilani Hyderabad Campus Cleanroom Laboratory
        </Typography>
      </Box>
      
      {!bookingRef ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {renderStepContent(activeStep)}
        </>
      ) : (
        renderConfirmation()
      )}
    </Container>
  );
};

export default Student;
