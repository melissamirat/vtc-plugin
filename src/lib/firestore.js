// src/lib/firestore.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ═══════════════════════════════════════════════════════════════════
// 👤 USERS
// ═══════════════════════════════════════════════════════════════════

export async function createUser(userId, userData) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      plan: 'basic',
      subscriptionStatus: 'inactive',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function getUser(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(userId, updates) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 WIDGETS
// ═══════════════════════════════════════════════════════════════════

export async function createWidget(userId, config) {
  try {
    const docRef = await addDoc(collection(db, 'widgets'), {
      userId,
      config,
      allowedDomains: [],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, widgetId: docRef.id };
  } catch (error) {
    console.error('Error creating widget:', error);
    return { success: false, error: error.message };
  }
}

export async function getWidget(widgetId) {
  try {
    const docRef = doc(db, 'widgets', widgetId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Widget not found' };
    }
  } catch (error) {
    console.error('Error getting widget:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserWidgets(userId) {
  try {
    const q = query(
      collection(db, 'widgets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const widgets = [];
    
    querySnapshot.forEach((doc) => {
      widgets.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: widgets };
  } catch (error) {
    console.error('Error getting user widgets:', error);
    return { success: false, error: error.message };
  }
}

export async function updateWidget(widgetId, updates) {
  try {
    await updateDoc(doc(db, 'widgets', widgetId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating widget:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📅 BOOKINGS
// ═══════════════════════════════════════════════════════════════════

export async function createBooking(bookingData) {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserBookings(userId, limitCount = 50) {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: bookings };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return { success: false, error: error.message };
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: error.message };
  }
}
