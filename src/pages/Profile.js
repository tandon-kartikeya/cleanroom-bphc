import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Department options
const departmentOptions = [
  { value: 'electrical', label: 'Electrical Engineering' },
  { value: 'mechanical', label: 'Mechanical Engineering' },
  { value: 'chemical', label: 'Chemical Engineering' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' }
];

const Profile = ({ userType }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useContext(AuthContext);
  
  // State for profile data
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    photo: '',
    studentId: '',
    department: '',
    role: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize profile data from the current user
  useEffect(() => {
    if (currentUser) {
      // Extract user email prefix to use as student ID if not already set
      let defaultStudentId = '';
      if (userType === 'student' && currentUser.email) {
        // Try to extract student ID from email (e.g., f20190001@hyderabad.bits-pilani.ac.in)
        const emailPrefix = currentUser.email.split('@')[0];
        if (emailPrefix && emailPrefix.length > 0) {
          defaultStudentId = emailPrefix.toUpperCase();
        }
      }
      
      const initialData = {
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        photo: currentUser.photoURL || '',
        studentId: currentUser.studentId || defaultStudentId,
        department: currentUser.department || 'electrical',
        role: userType
      };
      
      setEditedData(initialData);
      setPhotoPreview(currentUser.photoURL);
    }
  }, [currentUser, userType]);
  
  // Handle photo change
  const handlePhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle text field changes
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Start editing
  const handleStartEditing = () => {
    setIsEditing(true);
  };
  
  // Cancel editing
  const handleCancelEditing = () => {
    setIsEditing(false);
    setPhotoPreview(currentUser.photoURL);
    setPhotoFile(null);
    
    // Reset to current user data
    setEditedData({
      name: currentUser.displayName || '',
      email: currentUser.email || '',
      photo: currentUser.photoURL || '',
      studentId: currentUser.studentId || '',
      department: currentUser.department || 'electrical',
      role: userType
    });
  };
  
  // Save profile
  const handleSaveProfile = async () => {
    try {
      // In a real implementation, you would upload the photo to Firebase Storage
      // and update the user profile in Firebase Auth/Firestore
      
      // For now, we'll just update the local state and call the context method
      const updatedProfile = {
        ...editedData,
        photoURL: photoPreview
      };
      
      await updateUserProfile(updatedProfile);
      setIsEditing(false);
      setSuccess(true);
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    }
  };
  
  // Get department label
  const getDepartmentLabel = (value) => {
    const option = departmentOptions.find(option => option.value === value);
    return option ? option.label : value;
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate(`/${userType}`);
  };
  
  // If no user is logged in, redirect to home
  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            You must be logged in to view this page
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate(`/${userType}/login`)}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Navigation */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>
      
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            {userType === 'student' ? 'Student Profile' : 
             userType === 'faculty' ? 'Faculty Profile' : 'Admin Profile'}
          </Typography>
          
          {/* Action Buttons */}
          <Box>
            {isEditing ? (
              <>
                <Button 
                  startIcon={<SaveIcon />} 
                  variant="contained" 
                  color="primary"
                  onClick={handleSaveProfile}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button 
                  startIcon={<CancelIcon />} 
                  variant="outlined" 
                  color="error"
                  onClick={handleCancelEditing}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                startIcon={<EditIcon />} 
                variant="outlined" 
                color="primary"
                onClick={handleStartEditing}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center' 
            }}>
              <Avatar 
                src={photoPreview} 
                alt={editedData.name}
                sx={{ 
                  width: 120, 
                  height: 120,
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              
              {isEditing && (
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      size="small"
                    >
                      Change Photo
                    </Button>
                  </label>
                </Box>
              )}
              
              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom 
                align="center"
                sx={{ fontWeight: 600 }}
              >
                {editedData.name || 'User'}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                gutterBottom
                align="center"
              >
                {userType === 'student' ? 'Student' : userType === 'faculty' ? 'Faculty Member' : 'Admin'}
              </Typography>
              
              <Card 
                variant="outlined" 
                sx={{ 
                  mt: 3, 
                  width: '100%',
                  backgroundColor: 'rgba(0, 102, 179, 0.02)'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email Address
                  </Typography>
                  <Typography variant="body1">
                    {editedData.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {getDepartmentLabel(editedData.department)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main,
              mb: 3
            }}>
              Profile Information
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editedData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Email Address"
                value={editedData.email || ''}
                disabled={true} // Email will be populated from Google Auth and cannot be edited
                variant="outlined"
                helperText="Email is synced with your Google account and cannot be changed"
              />
              
              {userType === 'student' && (
                <TextField
                  fullWidth
                  label="Student ID"
                  value={editedData.studentId || ''}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                />
              )}
              
              <FormControl fullWidth>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  value={editedData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={!isEditing}
                  label="Department"
                >
                  {departmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                This profile will be used for all your interactions with the BITS Pilani Cleanroom Booking System.
                {userType === 'faculty' ? 
                  " As a faculty member, you'll review booking requests from students in your department." : 
                  " As a student, you'll need to provide accurate information for your booking requests."}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Success notification */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
      
      {/* Error notification */}
      <Snackbar 
        open={Boolean(error)} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
