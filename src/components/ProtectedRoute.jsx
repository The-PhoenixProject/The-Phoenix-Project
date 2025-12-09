// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, token } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if token exists in localStorage as well (for page reloads)
    const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    
    if (!currentUser && !token && !storedToken) {
      console.log('No authentication found, redirecting to login');
    }
  }, [currentUser, token]);

  if (!currentUser && !token) {
    // Save the attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', location.pathname);
    
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;