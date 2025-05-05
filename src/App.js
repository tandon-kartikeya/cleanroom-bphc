import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';

// Import services
import { createBooking, getAllBookings, updateBookingStatus as updateBookingStatusInDb } from './services/BookingService';

// Import pages
import Home from './pages/Home';
import Student from './pages/Student';
import Admin from './pages/Admin';
import Faculty from './pages/Faculty';
import Profile from './pages/Profile';
import Login from './components/Login';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Import Auth Provider
import { AuthProvider } from './context/AuthContext';

// Create BookingContext
export const BookingContext = createContext();

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0066b3', // BITS Pilani blue
      light: '#4a8cd3',
      dark: '#004283',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e63946', // Accent red
      light: '#ff6b6b',
      dark: '#b02a37',
      contrastText: '#ffffff',
    },
    info: {
      main: '#00a9e0', // Light blue
    },
    success: {
      main: '#2e7d32', // Green
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#f57c00', // Orange
      light: '#ffb74d',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f', // Red
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
      card: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 10px 20px rgba(0, 0, 0, 0.15)',
    '0px 12px 24px rgba(0, 0, 0, 0.15)',
    ...Array(18).fill('none'), // Placeholder for remaining shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 22px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: 'transparent', // Will be overridden by palette
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0066b3 0%, #0085e0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #004283 0%, #0066b3 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b02a37 0%, #e63946 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        outlinedPrimary: {
          borderColor: '#0066b3',
          '&:hover': {
            backgroundColor: 'rgba(0, 102, 179, 0.04)',
          },
        },
        outlinedSecondary: {
          borderColor: '#e63946',
          '&:hover': {
            backgroundColor: 'rgba(230, 57, 70, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
        },
        elevation4: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
          minWidth: 120,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 102, 179, 0.04)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

function App() {
  // Initialize with empty bookings array
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to fetch all bookings from Firestore - can be called manually to refresh
  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const fetchedBookings = await getAllBookings();
      setBookings(fetchedBookings);
      setError(null);
      console.log('Bookings refreshed:', fetchedBookings.length, 'bookings loaded');
      return fetchedBookings;
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bookings from Firestore on component mount
  useEffect(() => {
    fetchAllBookings();
    // We've removed the auto-refresh interval to prevent Firebase permissions errors
  }, []);
  
  const addBooking = async (bookingData) => {
    try {
      // Create booking in Firestore
      const newBooking = await createBooking(bookingData);
      
      // Update local state
      setBookings(prevBookings => [...prevBookings, newBooking]);
      
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };
  
  const updateBookingStatus = async (docId, newStatus, reason = '', updatedBy = 'system', approverRole = null) => {
    try {
      console.log('Updating booking status:', { docId, newStatus, reason, updatedBy, approverRole });
      
      // Update directly in Firestore with the provided docId
      const updatedBooking = await updateBookingStatusInDb(
        docId, 
        newStatus, 
        reason,
        updatedBy,
        approverRole
      );
      
      console.log('Updated booking from Firestore:', updatedBooking);
      
      // Update local state using the docId for matching
      setBookings(prevBookings => {
        // Try to find the booking in the current state to update it
        const bookingExists = prevBookings.some(booking => booking.docId === docId);
        
        if (bookingExists) {
          // If booking exists, update it
          return prevBookings.map(booking => 
            booking.docId === docId ? updatedBooking : booking
          );
        } else {
          // If booking doesn't exist in our local state, add it
          console.log('Booking was not in local state, adding it');
          return [...prevBookings, updatedBooking];
        }
      });
      
      return updatedBooking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  };
  
  const bookingContextValue = {
    bookings,
    loading,
    error,
    addBooking,
    updateBookingStatus,
    refreshBookings: fetchAllBookings
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BookingContext.Provider value={bookingContextValue}>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/student/login" element={<Login userType="student" />} />
              <Route path="/faculty/login" element={<Login userType="faculty" />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/student" element={
                <ProtectedRoute>
                  <Student />
                </ProtectedRoute>
              } />
              <Route path="/faculty" element={
                <ProtectedRoute>
                  <Faculty />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/profile/student/:id" element={
                <ProtectedRoute>
                  <Profile userType="student" />
                </ProtectedRoute>
              } />
              <Route path="/profile/faculty/:id" element={
                <ProtectedRoute>
                  <Profile userType="faculty" />
                </ProtectedRoute>
              } />
              <Route path="/profile/admin/:id" element={
                <ProtectedRoute>
                  <Profile userType="admin" />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </BookingContext.Provider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
