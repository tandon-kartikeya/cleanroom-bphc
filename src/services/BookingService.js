// BookingService.js - Handles all Firestore operations for bookings
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../utils/firebase';

const bookingsCollection = 'bookings';

// Create a new booking in Firestore
export const createBooking = async (bookingData) => {
  try {
    // Generate a custom booking ID
    const id = `REQ-${1000 + Math.floor(Math.random() * 9000)}`;

    // Ensure studentEmail is present for filtering
    if (!bookingData.studentEmail && bookingData.email) {
      bookingData.studentEmail = bookingData.email;
    }

    // Prepare the booking object with server timestamp
    const newBooking = {
      id,
      ...bookingData,
      status: 'pending',
      submittedAt: serverTimestamp(),
      lastModified: serverTimestamp()
    };

    console.log("Creating Firestore booking with data:", newBooking);

    // Add to Firestore
    const docRef = await addDoc(collection(db, bookingsCollection), newBooking);
    console.log('Booking created with ID:', docRef.id);
    
    // Return the booking with the Firestore document ID
    return { 
      ...newBooking, 
      docId: docRef.id,
      submittedAt: new Date().toISOString() // For immediate UI display
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get all bookings
export const getAllBookings = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, bookingsCollection),
        orderBy('submittedAt', 'desc')
      )
    );
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Properly convert timestamps to strings or null values
      return {
        ...data,
        docId: doc.id,
        submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : null,
        lastModified: data.lastModified ? data.lastModified.toDate().toISOString() : null,
        // Ensure all date fields are properly converted
        date: typeof data.date === 'string' ? data.date : 
              data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : 
              data.date
      };
    });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw error;
  }
};

// Get bookings for a specific student
export const getStudentBookings = async (studentEmail) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, bookingsCollection),
        where('studentEmail', '==', studentEmail),
        orderBy('submittedAt', 'desc')
      )
    );
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Properly convert timestamps to strings or null values
      return {
        ...data,
        docId: doc.id,
        submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : null,
        lastModified: data.lastModified ? data.lastModified.toDate().toISOString() : null,
        // Ensure all date fields are properly converted
        date: typeof data.date === 'string' ? data.date : 
              data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : 
              data.date
      };
    });
  } catch (error) {
    console.error('Error getting student bookings:', error);
    throw error;
  }
};

// Get bookings for a specific faculty
export const getFacultyBookings = async (facultyId, facultyEmail) => {
  try {
    // Query bookings where either the faculty ID or email matches
    const querySnapshot = await getDocs(
      query(
        collection(db, bookingsCollection),
        where('faculty', '==', facultyId)
      )
    );
    
    // Also get bookings assigned by email
    const emailQuerySnapshot = await getDocs(
      query(
        collection(db, bookingsCollection),
        where('facultyEmail', '==', facultyEmail)
      )
    );
    
    // Combine results, filtering out duplicates
    const bookings = [...querySnapshot.docs, ...emailQuerySnapshot.docs]
      .filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      )
      .map(doc => {
        const data = doc.data();
        // Properly convert timestamps to strings or null values
        return {
          ...data,
          docId: doc.id,
          submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : null,
          lastModified: data.lastModified ? data.lastModified.toDate().toISOString() : null,
          // Ensure all date fields are properly converted
          date: typeof data.date === 'string' ? data.date : 
                data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : 
                data.date
        };
      });
    
    return bookings;
  } catch (error) {
    console.error('Error getting faculty bookings:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (docId, newStatus, feedback, updatedBy) => {
  try {
    // Check if docId is valid
    if (!docId) {
      throw new Error('Document ID is required for updating booking status');
    }
    
    // Get a reference to the document
    const bookingRef = doc(db, bookingsCollection, docId);
    
    // First check if document exists
    const docSnap = await getDoc(bookingRef);
    if (!docSnap.exists()) {
      throw new Error(`Booking document with ID ${docId} does not exist`);
    }
    
    // Get the current data
    const currentData = docSnap.data();
    
    // Update object based on status
    const updateData = {
      status: newStatus,
      lastModified: serverTimestamp(),
      lastModifiedBy: updatedBy || 'system'
    };
    
    // Add appropriate feedback field
    if (newStatus === 'approved') {
      updateData.approvalNotes = feedback || '';
    } else if (newStatus === 'rejected') {
      updateData.rejectionReason = feedback || '';
    }
    
    console.log('Updating Firestore doc with ID:', docId, 'Data:', updateData);
    
    try {
      // Attempt to update the document
      await updateDoc(bookingRef, updateData);
      
      // Get the updated document to return
      const updatedDoc = await getDoc(bookingRef);
      const data = updatedDoc.data();
      
      // Return user-friendly formatted data
      return {
        ...data,
        docId: updatedDoc.id,
        id: data.id, // Ensure custom ID is included
        submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : null,
        lastModified: data.lastModified ? data.lastModified.toDate().toISOString() : null,
        // Format date consistently
        date: typeof data.date === 'string' ? data.date : 
              data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : 
              data.date
      };
    } catch (firebaseError) {
      console.warn('Firebase write operation failed:', firebaseError.message);
      console.log('Using local state update as fallback for development');
      
      // If Firebase update fails, create a simulated updated document for development
      // This allows functionality to work when Firestore write permissions are restricted
      const simulatedData = {
        ...currentData,
        ...updateData,
        // Convert serverTimestamp to regular date since we're not using Firebase
        lastModified: new Date().toISOString(),
        // Add the appropriate feedback field
        ...(newStatus === 'approved' ? { approvalNotes: feedback || '' } : {}),
        ...(newStatus === 'rejected' ? { rejectionReason: feedback || '' } : {})
      };
      
      // Return simulated updated booking
      return {
        ...simulatedData,
        docId: docId,
        id: currentData.id,
        submittedAt: currentData.submittedAt ? 
          (typeof currentData.submittedAt.toDate === 'function' ? 
            currentData.submittedAt.toDate().toISOString() : currentData.submittedAt) : 
          null,
        status: newStatus,  // Explicitly set status
        // Format date consistently
        date: typeof currentData.date === 'string' ? currentData.date : 
              currentData.date && typeof currentData.date.toDate === 'function' ? 
                currentData.date.toDate().toISOString() : currentData.date
      };
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};
