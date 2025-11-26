// src/pages/AuthPage.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';    
import Signup from '../components/Signup';   
import '../styles/Register/AuthPage.css';

const AuthPage = () => {
  return (
    <div className="auth-page">
      <Routes>
        {/* داخل /auth */}
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="/" element={<Navigate to="signup" replace />} />
      </Routes>
    </div>
  );
};

export default AuthPage;
