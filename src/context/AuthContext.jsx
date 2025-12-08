/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import {signInWithPopup,signOut,onAuthStateChanged,} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase.config';
import { authAPI } from '../services/api';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // ---------- 1. Sign Up ----------
  const signup = async (email, password, fullName, location) => {
    try {
      const response = await authAPI.signup({
        email,
        password,
        fullName,
        location,
      });
      return { success: true, user: response.user };
    } catch (err) {
      console.error('Signup error:', err);
      throw new Error(err.message || 'Signup failed');
    }
  };

  // ---------- 2. Resend OTP ----------
  const resendOTP = async (email) => {
    try {
      const res = await authAPI.resendOTP(email);
      return { success: true, message: res.message };
    } catch (err) {
      console.error('Resend OTP error:', err);
      throw new Error(err.message || 'Failed to resend OTP');
    }
  };

  // ---------- 3. Verify OTP ---------- ✅ COMPLETELY FIXED
  const verifyOTP = async (otp) => {
    const email = sessionStorage.getItem('otpEmail');
    if (!email) throw new Error('Email not found. Please sign up again.');

    try {
      const response = await authAPI.verifyOTP(email, otp);

      console.log('✅ Verify OTP Response:', response); // Debug log

      // ✅ Check if response has the data structure
      if (!response.success || !response.data) {
        throw new Error('Invalid response from server');
      }

      // ✅ Store tokens from response.data
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        setToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      // ✅ Store user data in localStorage for persistence
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // ✅ Set user state
      setCurrentUser(response.data.user);
      
      // ✅ Clear sessionStorage AFTER successful verification
      sessionStorage.removeItem('otpEmail');
      
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error('OTP verification error:', err);
      throw new Error(err.message || 'Invalid OTP');
    }
  };

  // ---------- 4. Login ---------- ✅ FIXED
  const login = async (email, password, rememberMe) => {
    try {
      const response = await authAPI.login(email, password);

      console.log('✅ Login Response:', response); // Debug log

      if (!response.success || !response.data) {
        throw new Error('Invalid response from server');
      }

      // ✅ Store tokens from response.data
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        setToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // ✅ Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      if (rememberMe) localStorage.setItem('rememberMe', 'true');

      setCurrentUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Login failed');
    }
  };

  // ---------- 5. Google ---------- ✅ FIXED
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await authAPI.socialLogin(idToken);

      console.log('✅ Google Login Response:', response); // Debug log

      if (!response.success || !response.data) {
        throw new Error('Invalid response from server');
      }

      // ✅ Store tokens from response.data
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        setToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      // ✅ Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setCurrentUser(response.data.user);
      return {
        success: true,
        user: response.data.user,
        emailVerified: result.user.emailVerified,
        needsVerification: response.needsVerification,
      };
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw new Error(err.message || 'Google sign-in failed');
    }
  };

  // ---------- 6. Facebook ---------- ✅ FIXED
  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await result.user.getIdToken();
      const response = await authAPI.socialLogin(idToken);

      console.log('✅ Facebook Login Response:', response); // Debug log

      if (!response.success || !response.data) {
        throw new Error('Invalid response from server');
      }

      // ✅ Store tokens from response.data
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        setToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      // ✅ Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setCurrentUser(response.data.user);
      return {
        success: true,
        user: response.data.user,
        emailVerified: result.user.emailVerified,
        needsVerification: response.needsVerification,
      };
    } catch (err) {
      console.error('Facebook sign-in error:', err);
      throw new Error(err.message || 'Facebook sign-in failed');
    }
  };

  // ---------- 7. Reset Password ----------
  const resetPassword = async (email) => {
    try {
      const res = await authAPI.forgotPassword(email);
      return { success: true, message: res.message };
    } catch (err) {
      console.error('Password reset error:', err);
      throw new Error(err.message || 'Failed to send reset email');
    }
  };

 // ---------- 8. Logout ----------
const logout = async () => {
  try {
    await signOut(auth);
    localStorage.clear();       // ← MUST BE HERE
    sessionStorage.clear();     // ← MUST BE HERE
    setToken(null);
    setCurrentUser(null);
    return { success: true };
  } catch (err) {
    console.error('Logout error:', err);
    throw err;
  }
};

  // ---------- Firebase auth state + Load persisted user ---------- ✅ ENHANCED
  useEffect(() => {
    // ✅ Try to load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && token) setCurrentUser(user);
      else if (!storedUser) setCurrentUser(null); // Only set to null if no stored user
      setLoading(false);
    });
    return unsub;
  }, [token]);

  const value = {
    currentUser,
    token,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    resendOTP,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};