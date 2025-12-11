import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import '../../styles/Register/Login.css';

// --- Framer Motion Variants ---
const centerLogoVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 1.0, type: "spring", stiffness: 80 } },
  exit: { opacity: 0, scale: 1.2, transition: { duration: 0.5 } }
};

const centerTextVariants = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.7, delay: 0.5 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.5 } }
};

const formCardVariants = {
  initial: { y: 50, opacity: 0, scale: 0.95 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }
  }
};

const itemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 }
};

const cornerLogoVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.8 } }
};

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
  const [showWelcome, setShowWelcome] = useState(true);

  // Show welcome screen for 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="login-container-main staged-layout">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            className="login-full-screen-welcome"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="login-center-logo-group"
              variants={centerLogoVariants}
            >
              <img src="/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="login-logo-image-center" />
              <h1 className="login-logo-title-center">Welcome Back</h1>
            </motion.div>
            
            <motion.p
              className="login-welcome-text-center"
              variants={centerTextVariants}
            >
              RECYCLE · RENEW<br/>Continue your journey of renewal and sustainability.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            className="login-center-content-wrapper form-stage"
          >
            {/* Top-left corner logo */}
            <motion.div 
              className="login-corner-logo-card"
              variants={cornerLogoVariants}
              initial="initial"
              animate="animate"
            >
              <img src="/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="login-logo-image-small" />
              <div className="login-logo-text-small">
                <span className="login-logo-title-small">PHOENIX</span>
              </div>
            </motion.div>

            {/* Welcome header */}
            <motion.div
              className="login-welcome-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            >
              <h2 className="login-welcome-title">Sign In to Your Account</h2>
              <p className="login-welcome-text">Welcome back! Please enter your details</p>
            </motion.div>

            {/* Form card */}
            <motion.div
              className="login-form-wrapper"
              variants={formCardVariants}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="login-form-inner-content"
                initial="initial"
                animate="animate"
                transition={{ staggerChildren: 0.08, delayChildren: 1.0 }}
              >
                
                <form onSubmit={handleSubmit} className="login-form">
                  {/* Email */}
                  <motion.div className="login-input-row" variants={itemVariants}>
                    <div className="login-input-group">
                      <label className="login-input-label">Email Address</label>
                      <motion.input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`login-input-field ${errors.email ? 'login-input-error' : ''}`}
                        disabled={loading}
                        whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 91, 0.4)' }}
                      />
                      {errors.email && <motion.span className="login-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.email}</motion.span>}
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div className="login-input-row" variants={itemVariants}>
                    <div className="login-input-group">
                      <label className="login-input-label">Password</label>
                      <div className="login-password-wrapper">
                        <motion.input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className={`login-input-field ${errors.password ? 'login-input-error' : ''}`}
                          disabled={loading}
                          whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 91, 0.4)' }}
                        />
                        <button
                          type="button"
                          className="login-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.password && <motion.span className="login-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.password}</motion.span>}
                    </div>
                  </motion.div>

                  {/* Remember Me & Forgot Password */}
                  <motion.div className="login-options-row" variants={itemVariants}>
                    <label className="login-checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="login-checkbox-input"
                        disabled={loading}
                      />
                      <span className="login-checkbox-text">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => navigate('/forgot-password')} 
                      className="login-forgot-link"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="login-submit-button login-full-width-btn"
                    disabled={loading}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: '#577f40ff' }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </motion.button>
                </form>

                {/* Divider */}
                <motion.div className="login-divider" variants={itemVariants}>
                  <span className="login-divider-text">OR CONTINUE WITH</span>
                </motion.div>

                {/* Social Buttons */}
                <motion.div className="login-social-buttons" variants={itemVariants}>
                  <motion.button
                    onClick={handleGoogleLogin}
                    className="login-social-button login-google-button"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaGoogle className="login-social-icon" /> Google
                  </motion.button>
                  <motion.button
                    onClick={handleFacebookLogin}
                    className="login-social-button login-facebook-button"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaFacebookF className="login-social-icon" /> Facebook
                  </motion.button>
                </motion.div>

                {/* Switch Link */}
                <motion.p className="login-switch-text" variants={itemVariants}>
                  Don't have an account?{' '}
                  <button onClick={() => navigate('/auth/signup')} className="login-link-button" disabled={loading}>
                    Sign up
                  </button>
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;