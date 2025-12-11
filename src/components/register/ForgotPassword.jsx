import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/Register/ForgotPassword.css';

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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(email);

      // ✅ Store email in sessionStorage for ResetPassword page
      sessionStorage.setItem('resetEmail', email);
      
      // ✅ Show success message
      toast.success('Password reset OTP sent! Check your email.');
      
      // ✅ Navigate to reset-password page
      navigate('/reset-password');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container-main staged-layout">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            className="forgot-full-screen-welcome"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="forgot-center-logo-group"
              variants={centerLogoVariants}
            >
              <img src="/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="forgot-logo-image-center" />
              <h1 className="forgot-logo-title-center">Password Recovery</h1>
            </motion.div>
            
            <motion.p
              className="forgot-welcome-text-center"
              variants={centerTextVariants}
            >
              RECYCLE · RENEW<br/>Don't worry, we'll help you get back to your sustainable journey.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            className="forgot-center-content-wrapper form-stage"
          >
            {/* Top-left corner logo */}
            <motion.div 
              className="forgot-corner-logo-card"
              variants={cornerLogoVariants}
              initial="initial"
              animate="animate"
            >
              <img src="/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="forgot-logo-image-small" />
              <div className="forgot-logo-text-small">
                <span className="forgot-logo-title-small">PHOENIX</span>
              </div>
            </motion.div>

            {/* Welcome header */}
            <motion.div
              className="forgot-welcome-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            >
              <h2 className="forgot-welcome-title">Forgot Password?</h2>
              <p className="forgot-welcome-text">Enter your email to receive a reset code</p>
            </motion.div>

            {/* Form card */}
            <motion.div
              className="forgot-form-wrapper"
              variants={formCardVariants}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="forgot-form-inner-content"
                initial="initial"
                animate="animate"
                transition={{ staggerChildren: 0.08, delayChildren: 1.0 }}
              >
                
                <form onSubmit={handleSubmit} className="forgot-form">
                  {/* Email Input */}
                  <motion.div className="forgot-input-row" variants={itemVariants}>
                    <div className="forgot-input-group">
                      <label className="forgot-input-label">Email Address</label>
                      <motion.input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        className={`forgot-input-field ${error ? 'forgot-input-error' : ''}`}
                        disabled={loading}
                        whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 172, 0.4)' }}
                      />
                      {error && <motion.span className="forgot-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.span>}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="forgot-submit-button forgot-full-width-btn"
                    disabled={loading}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: '#517d37ff' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
                  </motion.button>
                </form>

                {/* Back Link */}
                <motion.div className="forgot-back-link" variants={itemVariants}>
                  <button 
                    onClick={() => navigate('/auth/login')} 
                    className="forgot-back-button"
                    disabled={loading}
                  >
                    <FaArrowLeft className="forgot-back-icon" />
                    Back to Sign In
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;