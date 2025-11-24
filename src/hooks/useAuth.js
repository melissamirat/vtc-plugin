// src/hooks/useAuth.js
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser, getUser, createWidget } from '@/lib/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const result = await getUser(firebaseUser.uid);
        if (result.success) {
          setUserData(result.data);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName, companyName) => {
    try {
      // 1. Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Mettre à jour le profil
      await updateProfile(userCredential.user, { displayName });
      
      // 3. Créer le document user dans Firestore
      await createUser(userCredential.user.uid, {
        email,
        displayName,
        companyName,
      });
      
      // 4. Créer automatiquement le widget avec config par défaut
      const widgetResult = await createWidget(userCredential.user.uid, {
        // État du setup
        setupCompleted: false,
        
        // Branding (personnalisation visuelle du widget)
        branding: {
          companyName: companyName || 'Mon VTC',
          logo: '',
          primaryColor: '#2563eb',
          secondaryColor: '#ffffff',
          accentColor: '#3b82f6',
        },
        
        // Textes du formulaire
        texts: {
          formTitle: 'Réservation VTC',
          formSubtitle: 'Calculez votre prix et réservez en quelques clics',
          submitButton: 'Réserver & Confirmer le Prix',
        },
        
        // Config métier (sera remplie par le wizard)
        vehicleCategories: [],
        serviceZones: [],
        packages: [],
        timeSurcharges: [],
        
        // Paiements par défaut
        paymentModes: {
          driver: {
            enabled: true,
            label: 'Paiement à bord',
          },
          methods: ['cash', 'card'],
          online: {
            enabled: false,
            label: 'Paiement en ligne',
            requiresDeposit: false,
            depositPercent: 30,
          },
        },
        
        // Mode vacances
        vacationMode: {
          enabled: false,
          message: 'Nous sommes actuellement en congés.',
          startDate: null,
          endDate: null,
        },
        
        // Email
        email: {
          adminEmail: email,
          fromName: companyName || 'Mon VTC',
          smtpHost: '',
          smtpPort: 465,
          smtpUser: '',
          smtpPassword: '',
        },
      });

      console.log('✅ Compte créé avec widget:', widgetResult);
      
      return { success: true, user: userCredential.user, widgetId: widgetResult.widgetId };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userData,
    loading,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}