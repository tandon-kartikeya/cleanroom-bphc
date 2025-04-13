import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';

// Import pages
import Home from './pages/Home';
import Student from './pages/Student';
import Admin from './pages/Admin';

// Create BookingContext
export const BookingContext = createContext();

// Mock fixed approved and rejected bookings
const generateFixedBookings = () => {
  const approvedBookings = [
    {
      id: 'REQ-1001',
      name: 'Ravi Kumar',
      studentId: 'BT18ECE045',
      email: 'ravi.kumar@pilani.bits-pilani.ac.in',
      phone: '9876543210',
      faculty: 'electrical',
      date: '2025-03-15',
      timeSlot: '8:00',
      equipment: '1', 
      description: 'Microelectronic circuit fabrication for final year project',
      status: 'approved',
      submittedAt: '2025-03-05T10:30:00Z'
    },
    {
      id: 'REQ-1002',
      name: 'Priya Singh',
      studentId: 'BT19CHE032',
      email: 'priya.singh@pilani.bits-pilani.ac.in',
      phone: '9988776655',
      faculty: 'chemical',
      date: '2025-03-16',
      timeSlot: '10:00',
      equipment: '3',
      description: 'Polymer coating development for corrosion resistance',
      status: 'approved',
      submittedAt: '2025-03-06T11:20:00Z'
    },
    {
      id: 'REQ-1003',
      name: 'Akash Patel',
      studentId: 'BT17EEE028',
      email: 'akash.patel@pilani.bits-pilani.ac.in',
      phone: '9876123450',
      faculty: 'electrical',
      date: '2025-03-17',
      timeSlot: '14:00',
      equipment: '2',
      description: 'MEMS sensor testing for robotics application',
      status: 'approved',
      submittedAt: '2025-03-07T09:15:00Z'
    },
    {
      id: 'REQ-1004',
      name: 'Neha Gupta',
      studentId: 'BT18PHY015',
      email: 'neha.gupta@pilani.bits-pilani.ac.in',
      phone: '8877665544',
      faculty: 'physics',
      date: '2025-03-18',
      timeSlot: '12:00',
      equipment: '5',
      description: 'Quantum dot synthesis for optoelectronic device research',
      status: 'approved',
      submittedAt: '2025-03-08T14:45:00Z'
    },
    {
      id: 'REQ-1005',
      name: 'Vikram Sharma',
      studentId: 'BT19CSE078',
      email: 'vikram.sharma@pilani.bits-pilani.ac.in',
      phone: '7788994455',
      faculty: 'computer_science',
      date: '2025-03-19',
      timeSlot: '15:00',
      equipment: '4',
      description: 'Microcontroller programming for IoT sensor network',
      status: 'approved',
      submittedAt: '2025-03-09T16:30:00Z'
    }
  ];

  const rejectedBookings = [
    {
      id: 'REQ-2001',
      name: 'Ananya Reddy',
      studentId: 'BT17ECE056',
      email: 'ananya.reddy@pilani.bits-pilani.ac.in',
      phone: '9865432109',
      faculty: 'electrical',
      date: '2025-03-20',
      timeSlot: '8:00',
      equipment: '1',
      description: 'PCB design for wireless charging system',
      status: 'rejected',
      submittedAt: '2025-03-01T11:20:00Z',
      rejectionReason: 'Equipment already booked for this time slot'
    },
    {
      id: 'REQ-2002',
      name: 'Rahul Verma',
      studentId: 'BT18MEC042',
      email: 'rahul.verma@pilani.bits-pilani.ac.in',
      phone: '8899776655',
      faculty: 'mechanical',
      date: '2025-03-21',
      timeSlot: '10:00',
      equipment: '2',
      description: 'MEMS actuator development for microfluidic applications',
      status: 'rejected',
      submittedAt: '2025-03-02T13:40:00Z',
      rejectionReason: 'Insufficient detail provided about experiment safety protocols'
    },
    {
      id: 'REQ-2003',
      name: 'Sneha Joshi',
      studentId: 'BT19CHE038',
      email: 'sneha.joshi@pilani.bits-pilani.ac.in',
      phone: '7766554433',
      faculty: 'chemical',
      date: '2025-03-22',
      timeSlot: '12:00',
      equipment: '3',
      description: 'Plasma etching for semiconductor fabrication',
      status: 'rejected',
      submittedAt: '2025-03-03T09:50:00Z',
      rejectionReason: 'Required material not available for specified date'
    },
    {
      id: 'REQ-2004',
      name: 'Arun Mehta',
      studentId: 'BT17PHY025',
      email: 'arun.mehta@pilani.bits-pilani.ac.in',
      phone: '9988776611',
      faculty: 'physics',
      date: '2025-03-23',
      timeSlot: '14:00',
      equipment: '4',
      description: 'Thin film deposition for solar cell research',
      status: 'rejected',
      submittedAt: '2025-03-04T15:10:00Z',
      rejectionReason: 'Maintenance scheduled for requested equipment'
    },
    {
      id: 'REQ-2005',
      name: 'Karthik Raja',
      studentId: 'BT18CSE066',
      email: 'karthik.raja@pilani.bits-pilani.ac.in',
      phone: '8877665522',
      faculty: 'computer_science',
      date: '2025-03-24',
      timeSlot: '15:00',
      equipment: '5',
      description: 'Sensor calibration for embedded systems project',
      status: 'rejected',
      submittedAt: '2025-03-05T10:20:00Z',
      rejectionReason: 'Faculty supervisor approval missing'
    }
  ];

  return [...approvedBookings, ...rejectedBookings];
};

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
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    // Initialize with fixed approved and rejected bookings
    setBookings(generateFixedBookings());
  }, []);
  
  const addBooking = (bookingData) => {
    // Generate a reference ID
    const id = `REQ-${1000 + Math.floor(Math.random() * 1000)}`;
    
    // Create a new booking with pending status
    const newBooking = {
      id,
      ...bookingData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    // Add to bookings state
    setBookings(prevBookings => [...prevBookings, newBooking]);
    
    return newBooking;
  };
  
  const updateBookingStatus = (id, newStatus, reason = '') => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === id 
          ? { 
              ...booking, 
              status: newStatus,
              ...(newStatus === 'rejected' && { rejectionReason: reason }),
              ...(newStatus === 'approved' && { approvalNotes: reason })
            } 
          : booking
      )
    );
  };
  
  const bookingContextValue = {
    bookings,
    addBooking,
    updateBookingStatus
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BookingContext.Provider value={bookingContextValue}>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<Student />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </BookingContext.Provider>
    </ThemeProvider>
  );
}

export default App;
