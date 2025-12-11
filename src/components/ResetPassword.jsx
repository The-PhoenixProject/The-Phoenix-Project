
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api'; 
import toast from 'react-hot-toast';
import '../styles/Register/ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [redirecting, setRedirecting] = useState(false);

  const inputRefs = useRef([]);
  const email = sessionStorage.getItem('resetEmail');

  // Check for email on mount
  useEffect(() => {
    if (!email && !redirecting) {
      toast.error('Please request a password reset first');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate, redirecting]);

  const handleOtpChange = (idx, val) => {
    if (val && !/^\d$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasted)) return toast.error('Only numbers allowed');
    const arr = pasted.split('');
    while (arr.length < 6) arr.push('');
    setOtp(arr);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const validate = () => {
    const newErrors = {};

    // Validate OTP
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      newErrors.otp = 'Enter the 6-digit code';
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!newPassword) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number & special char';
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please start over.');
      navigate('/forgot-password', { replace: true });
      return;
    }

    setLoading(true);
    const code = otp.join('');

    try {
      console.log('🔄 Submitting password reset...', { email, codeLength: code.length });
      
      // Call the API
      const response = await authAPI.resetPassword(email, code, newPassword);
      
      console.log('✅ API Response:', response);

      // If we get here, the request was successful
      setRedirecting(true);
      
      // Clear the email from session
      sessionStorage.removeItem('resetEmail');

      // Show success message
      toast.success('Password reset successful! Redirecting to login...', {
        duration: 2000,
      });
      
      // Navigate after a short delay
      setTimeout(() => {
        console.log('🔄 Navigating to login...');
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (err) {
      console.error('❌ Password reset failed:', err);
      
      // Show error message
      toast.error(err.message || 'Failed to reset password. Please check your code and try again.');
      
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render if redirecting
  if (redirecting) {
    return (
      <div className="reset-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#e7e9e36b'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #6A994E',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      {/* Logo in Top Left */}
      <div className="logo-header">
        <div className="logo-container">
          <img src="../../public/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="logo" />
          <h2 className="logo-title">Phoenix</h2>
        </div>
      </div>
      
      {/* Main Form Container */}
      <div className="reset-container">
        <div className="reset-center-wrapper">
          <div className="reset-form-container">
            <h2 className="form-heading">Reset Your Password</h2>
            <p className="form-subtitle">
              Enter the code sent to <strong>{email}</strong>
            </p>

            {/* OTP Input Section - Same as OTP Verification Page */}
            <div className="otp-section">
              <p className="otp-label">Verification Code</p>
              <div className="otp-input-container">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="otp-input"
                    autoFocus={i === 0}
                    disabled={loading}
                  />
                ))}
              </div>
              {errors.otp && <span className="error-message">{errors.otp}</span>}
            </div>

            <form onSubmit={handleSubmit} className="reset-form">
              {/* NEW PASSWORD */}
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <p className="back-link">
              <a href="/forgot-password">← Didn't receive code?</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;