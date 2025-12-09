import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import '../styles/Register/Login.css'

const Login = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle, signInWithFacebook, clearAllAuthData } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        // Clear any existing auth data before login
        if (clearAllAuthData) {
          clearAllAuthData();
        }
        
        const result = await login(formData.email, formData.password, formData.rememberMe);
        
        if (result.success) {
          toast.success('Login successful! Welcome back! 🎉');
          // ✅ Navigate to profile after successful login
          navigate('/profile', { replace: true });
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Clear any existing auth data before login
      if (clearAllAuthData) {
        clearAllAuthData();
      }
      
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast.success('Google login successful! 🎉');
        // ✅ Navigate to profile after successful Google login
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      // Clear any existing auth data before login
      if (clearAllAuthData) {
        clearAllAuthData();
      }
      
      const result = await signInWithFacebook();
      
      if (result.success) {
        toast.success('Facebook login successful! 🎉');
        // ✅ Navigate to profile after successful Facebook login
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error(error.message || 'Facebook login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo-card">
          <img src="../../public/logo big (1).png" alt="Phoenix Logo" className="logo-image" />
          <h2 className="logo-title">THE<br/>PHOENIX<br/>PROJECT</h2>
          <p className="logo-subtitle">RECYCLE · RENEW</p>
        </div>
        <h2 className="welcome-title">Welcome Back</h2>
        <p className="welcome-text">
          Continue your journey of renewal and sustainability.
        </p>
      </div>

      <div className="login-right">
        <div className="form-wrapper">
          <h1 className="form-title">Sign In</h1>
          <p className="form-subtitle">Access your Phoenix account</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="remember-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox-input"
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')} 
                className="forgot-link"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">OR CONTINUE WITH</span>
          </div>

          <div className="social-buttons">
            <button onClick={handleGoogleLogin} className="social-button google-button" disabled={loading}>
              <svg className="social-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button onClick={handleFacebookLogin} className="social-button facebook-button" disabled={loading}>
              <svg className="social-icon" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p className="switch-text">
            Don't have an account? <button onClick={() => navigate('/auth/signup')} className="link-button" disabled={loading}>Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;