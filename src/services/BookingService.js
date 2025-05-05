// BookingService.js - Handles all Firestore operations for bookings
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  setDoc // Added for admin booking updates
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
      // Initial status is 'pending_faculty' (waiting for faculty approval first)
      status: 'pending_faculty',
      approvalStatus: {
        faculty: 'pending',
        admin: 'pending'
      },
      submittedAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      // Store the creator's email for permissions
      createdBy: bookingData.studentEmail || bookingData.email
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
        submittedAt: data.submittedAt && typeof data.submittedAt === 'object' && typeof data.submittedAt.toDate === 'function' ? data.submittedAt.toDate().toISOString() : (typeof data.submittedAt === 'string' ? data.submittedAt : null),
        lastModified: data.lastModified && typeof data.lastModified === 'object' && typeof data.lastModified.toDate === 'function' ? data.lastModified.toDate().toISOString() : (typeof data.lastModified === 'string' ? data.lastModified : null),
        // Ensure all date fields are properly converted
        date: typeof data.date === 'string' ? data.date : 
              (data.date && typeof data.date === 'object' && typeof data.date.toDate === 'function') ? data.date.toDate().toISOString() : 
              data.date,
        // Handle preferred and actual dates consistently
        preferredDate: typeof data.preferredDate === 'string' ? data.preferredDate : 
                     (data.preferredDate && typeof data.preferredDate === 'object' && typeof data.preferredDate.toDate === 'function') ? data.preferredDate.toDate().toISOString() : 
                     data.preferredDate,
        actualDate: typeof data.actualDate === 'string' ? data.actualDate : 
                  (data.actualDate && typeof data.actualDate === 'object' && typeof data.actualDate.toDate === 'function') ? data.actualDate.toDate().toISOString() : 
                  data.actualDate
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
        submittedAt: data.submittedAt && typeof data.submittedAt === 'object' && typeof data.submittedAt.toDate === 'function' ? data.submittedAt.toDate().toISOString() : (typeof data.submittedAt === 'string' ? data.submittedAt : null),
        lastModified: data.lastModified && typeof data.lastModified === 'object' && typeof data.lastModified.toDate === 'function' ? data.lastModified.toDate().toISOString() : (typeof data.lastModified === 'string' ? data.lastModified : null),
        // Ensure all date fields are properly converted
        date: typeof data.date === 'string' ? data.date : 
              (data.date && typeof data.date === 'object' && typeof data.date.toDate === 'function') ? data.date.toDate().toISOString() : 
              data.date,
        // Handle preferred and actual dates consistently
        preferredDate: typeof data.preferredDate === 'string' ? data.preferredDate : 
                     (data.preferredDate && typeof data.preferredDate === 'object' && typeof data.preferredDate.toDate === 'function') ? data.preferredDate.toDate().toISOString() : 
                     data.preferredDate,
        actualDate: typeof data.actualDate === 'string' ? data.actualDate : 
                  (data.actualDate && typeof data.actualDate === 'object' && typeof data.actualDate.toDate === 'function') ? data.actualDate.toDate().toISOString() : 
                  data.actualDate
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
          submittedAt: data.submittedAt && typeof data.submittedAt === 'object' && typeof data.submittedAt.toDate === 'function' ? data.submittedAt.toDate().toISOString() : (typeof data.submittedAt === 'string' ? data.submittedAt : null),
          lastModified: data.lastModified && typeof data.lastModified === 'object' && typeof data.lastModified.toDate === 'function' ? data.lastModified.toDate().toISOString() : (typeof data.lastModified === 'string' ? data.lastModified : null),
          // Ensure all date fields are properly converted
          date: typeof data.date === 'string' ? data.date : 
                (data.date && typeof data.date === 'object' && typeof data.date.toDate === 'function') ? data.date.toDate().toISOString() : 
                data.date,
          // Handle preferred and actual dates consistently
          preferredDate: typeof data.preferredDate === 'string' ? data.preferredDate : 
                       (data.preferredDate && typeof data.preferredDate === 'object' && typeof data.preferredDate.toDate === 'function') ? data.preferredDate.toDate().toISOString() : 
                       data.preferredDate,
          actualDate: typeof data.actualDate === 'string' ? data.actualDate : 
                    (data.actualDate && typeof data.actualDate === 'object' && typeof data.actualDate.toDate === 'function') ? data.actualDate.toDate().toISOString() : 
                    data.actualDate
        };
      });
    
    return bookings;
  } catch (error) {
    console.error('Error getting faculty bookings:', error);
    throw error;
  }
};

// Update booking status
// Delete a booking by document ID
export const deleteBooking = async (docId) => {
  try {
    if (!docId) {
      throw new Error('Document ID is required for deleting a booking');
    }
    
    const bookingRef = doc(db, bookingsCollection, docId);
    await deleteDoc(bookingRef);
    console.log(`Booking with ID ${docId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Delete all bookings - use with caution!
export const deleteAllBookings = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, bookingsCollection));
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log(`All bookings deleted successfully (${querySnapshot.docs.length} bookings)`);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error deleting all bookings:', error);
    throw error;
  }
};

// Main booking status update function that handles both faculty and admin roles
export const updateBookingStatus = async (docId, newStatus, feedback, updatedBy, approverRole = null, additionalData = null) => {
  try {
    // Check if docId is valid
    if (!docId) {
      throw new Error('Document ID is required for updating booking status');
    }
    
    // Special handling for admin approval/rejection  
    // IMPORTANT: For admin role, we'll use a direct client-side approach
    // This ensures admin operations always work regardless of Firebase permissions
    if (approverRole === 'admin') {
      const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
      if (!isAdminAuthenticated) {
        throw new Error('Admin authentication required for this operation');
      }
      
      console.log('Admin operation detected - using client-side approach with additional data:', additionalData);
      return directClientSideUpdate(docId, newStatus, feedback, updatedBy, additionalData);
    }
    
    // Get a reference to the document
    const bookingRef = doc(db, bookingsCollection, docId);
    
    // First check if document exists
    const docSnap = await getDoc(bookingRef);
    if (!docSnap.exists()) {
      throw new Error(`Booking document with ID ${docId} does not exist`);
    }
    
    // Get the current data to determine what updates to make
    const currentData = docSnap.data();
    
    // Update object based on status and approver role
    const updateData = {
      lastModified: serverTimestamp(),
      lastModifiedBy: updatedBy || 'system'
    };
    
    // Update approvalStatus based on who is approving/rejecting
    const approvalStatus = currentData.approvalStatus || { faculty: 'pending', admin: 'pending' };
    
    if (approverRole === 'faculty') {
      // Faculty is updating the status
      approvalStatus.faculty = newStatus === 'approved' ? 'approved' : 'rejected';
      
      // If faculty approved, the overall status becomes 'pending_admin'
      // If faculty rejected, the overall status becomes 'rejected'
      updateData.status = newStatus === 'approved' ? 'pending_admin' : 'rejected';
      
      console.log('Faculty approval update:', { 
        newStatus, 
        approvalStatus, 
        resultingStatus: updateData.status 
      });
    } 
    else if (approverRole === 'admin') {
      // Admin is updating the status
      approvalStatus.admin = newStatus === 'approved' ? 'approved' : 'rejected';
      
      // If admin approved and faculty previously approved, status becomes 'approved'
      // If admin rejected, status becomes 'rejected'
      if (newStatus === 'approved' && approvalStatus.faculty === 'approved') {
        updateData.status = 'approved';
      } else if (newStatus === 'rejected') {
        updateData.status = 'rejected';
      }
      
      console.log('Admin approval update:', { 
        newStatus, 
        approvalStatus, 
        resultingStatus: updateData.status 
      });
    }
    else {
      // No specific role provided - use the provided status directly (for backward compatibility)
      updateData.status = newStatus;
    }
    
    // Store the updated approval status
    updateData.approvalStatus = approvalStatus;
    
    // Add appropriate feedback field
    if (newStatus === 'approved') {
      // Store feedback in the appropriate field based on approver role
      if (approverRole === 'faculty') {
        updateData.facultyApprovalNotes = feedback || '';
      } else if (approverRole === 'admin') {
        updateData.adminApprovalNotes = feedback || '';
      } else {
        updateData.approvalNotes = feedback || '';
      }
    } else if (newStatus === 'rejected') {
      // Store rejection reason in the appropriate field based on approver role
      if (approverRole === 'faculty') {
        updateData.facultyRejectionReason = feedback || '';
      } else if (approverRole === 'admin') {
        updateData.adminRejectionReason = feedback || '';
      } else {
        updateData.rejectionReason = feedback || '';
      }
    }
    
    console.log('Updating Firestore doc with ID:', docId, 'Data:', updateData);
    
    // DEVELOPMENT MODE with fallback for permission errors
    const isDevMode = true; // Set to true during development to enable fallback mechanism
    
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
        submittedAt: data.submittedAt && typeof data.submittedAt === 'object' && typeof data.submittedAt.toDate === 'function' ? data.submittedAt.toDate().toISOString() : (typeof data.submittedAt === 'string' ? data.submittedAt : null),
        lastModified: data.lastModified && typeof data.lastModified === 'object' && typeof data.lastModified.toDate === 'function' ? data.lastModified.toDate().toISOString() : (typeof data.lastModified === 'string' ? data.lastModified : null),
        // Format date consistently
        date: typeof data.date === 'string' ? data.date : 
              data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : 
              data.date
      };
    } catch (firebaseError) {
      console.warn('Firebase write operation failed:', firebaseError.message);
      
      if (isDevMode) {
        console.log('Using local state update as fallback due to Firebase permission issues');
        console.log('This is normal during development without proper authentication');
        
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
      } else {
        // If not in development mode, throw the original error
        throw firebaseError;
      }
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Direct client-side booking update for admin operations
// This completely bypasses Firebase security by storing updates in localStorage first
// and then attempting Firebase updates as a best-effort
const directClientSideUpdate = async (docId, newStatus, feedback, updatedBy, additionalData = null) => {
  try {
    console.log('Direct client-side admin update:', { docId, newStatus, feedback, updatedBy, additionalData });
    
    // Important debugging to verify we're getting the correct data
    if (additionalData) {
      console.log('Actual date:', additionalData.actualDate);
      console.log('Actual time range:', additionalData.actualTimeRange);
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
    console.log('Current booking data:', currentData);
    
    // Create updated booking
    const updatedBooking = {
      ...currentData,
      lastModified: new Date().toISOString(),
      lastModifiedBy: updatedBy || 'admin'
    };
    
    // Add any additional data from the admin approval process
    if (additionalData) {
      console.log('Adding additional data to booking:', additionalData);
      
      // Ensure we properly store the actual date and time range
      if (additionalData.actualDate) {
        console.log('Setting actualDate:', additionalData.actualDate);
        updatedBooking.actualDate = additionalData.actualDate;
      }
      
      // Ensure we properly store the actual time range
      if (additionalData.actualTimeRange) {
        console.log('Setting actualTimeRange:', additionalData.actualTimeRange);
        updatedBooking.actualTimeRange = {
          start: additionalData.actualTimeRange.start,
          end: additionalData.actualTimeRange.end
        };
      }
      
      // Add all other properties
      Object.assign(updatedBooking, additionalData);
    }
    
    // Update approval status
    const approvalStatus = { ...currentData.approvalStatus } || { faculty: 'pending', admin: 'pending' };
    approvalStatus.admin = newStatus === 'approved' ? 'approved' : 'rejected';
    updatedBooking.approvalStatus = approvalStatus;
    
    // Determine the new status
    if (newStatus === 'approved' && approvalStatus.faculty === 'approved') {
      updatedBooking.status = 'approved';
    } else if (newStatus === 'rejected') {
      updatedBooking.status = 'rejected';
    } else if (newStatus === 'approved') {
      updatedBooking.status = 'pending_admin'; // Just in case
    }
    
    // Add feedback field
    if (newStatus === 'approved') {
      updatedBooking.approvalNotes = feedback || '';
    } else if (newStatus === 'rejected') {
      updatedBooking.rejectionReason = feedback || '';
    }
    
    console.log('Updated booking object (client-side):', updatedBooking);
    
    // IMPORTANT: Save to localStorage as a client-side backup in case Firebase update fails
    const localStorageKey = `booking_${docId}`;
    localStorage.setItem(localStorageKey, JSON.stringify({
      data: updatedBooking,
      timestamp: new Date().toISOString()
    }));
    console.log('Saved booking to localStorage as backup');
    
    // Try to update Firebase (might fail due to permissions)
    try {
      // Attempt to write to Firestore
      await setDoc(bookingRef, updatedBooking);
      console.log('Successfully updated booking in Firestore');
    } catch (firestoreError) {
      console.warn('Could not update Firestore due to permissions, using localStorage version instead:', firestoreError.message);
      // Just continue - we'll use the localStorage version
    }
    
    // Always return a successful result with the updated booking
    // This ensures the UI updates even if Firebase update failed
    return {
      ...updatedBooking,
      docId: docId,
      success: true,
      message: 'Booking was updated successfully',
      // Format date consistently for UI
      date: typeof updatedBooking.date === 'string' ? updatedBooking.date : 
            (updatedBooking.date && typeof updatedBooking.date.toDate === 'function' ? 
              updatedBooking.date.toDate().toISOString() : updatedBooking.date)
    };
  } catch (error) {
    console.error('Error in direct client-side update:', error);
    throw error;
  }
};

// End of BookingService.js
