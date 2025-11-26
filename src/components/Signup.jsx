import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import '../styles/Register/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, resendOTP, signInWithGoogle, signInWithFacebook } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    location: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 3) newErrors.fullName = 'Name must be at least 3 characters';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(formData.password))
      newErrors.password = 'Password must be 8+ chars with upper, lower, number & special char';

    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error('Please fix the errors in the form');

    setLoading(true);
    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.location
      );

      if (result.success) {
        sessionStorage.setItem('otpEmail', formData.email);
        sessionStorage.setItem(
          'tempUserData',
          JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            location: formData.location,
          })
        );

        toast.success('Account created! Please verify your email.');
        navigate('/otp-verification');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        sessionStorage.setItem('otpEmail', result.user.email);
        sessionStorage.setItem(
          'tempUserData',
          JSON.stringify({ email: result.user.email, fullName: result.user.displayName || '', provider: 'Google' })
        );

        if (!result.emailVerified && result.needsVerification) {
          await resendOTP(result.user.email);
          toast.success('Google signup – check your email for OTP.');
          navigate('/otp-verification');
        } else {
          toast.success('Google signup successful!');
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Google signup error:', err);
      toast.error(err.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithFacebook();

      if (result.success) {
        sessionStorage.setItem('otpEmail', result.user.email);
        sessionStorage.setItem(
          'tempUserData',
          JSON.stringify({ email: result.user.email, fullName: result.user.displayName || '', provider: 'Facebook' })
        );

        if (!result.emailVerified && result.needsVerification) {
          await resendOTP(result.user.email);
          toast.success('Facebook signup – check your email for OTP.');
          navigate('/otp-verification');
        } else {
          toast.success('Facebook signup successful!');
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Facebook signup error:', err);
      toast.error(err.message || 'Facebook signup failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- JSX (unchanged except for button handlers) ---------- */
  return (
    <div className="signup-container">
      {/* LEFT SIDE – LOGO & TEXT */}
      <div className="signup-left">
        <div className="logo-card">
          <img src="../../public/logo big (1).png" alt="Phoenix Logo" className="logo-image" />
          <h2 className="logo-title">THE<br/>PHOENIX<br/>PROJECT</h2>
          <p className="logo-subtitle">RECYCLE · RENEW</p>
        </div>
        <h2 className="welcome-title">Welcome to Phoenix</h2>
        <p className="welcome-text">
          Join our community of conscious consumers renewing<br/>the world, one item at a time.
        </p>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="signup-right">
        <div className="form-wrapper">
          <h1 className="form-title">Create Account</h1>
          <p className="form-subtitle">Start your renewal journey today</p>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name */}
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
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
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Location */}
            <div className="input-group">
              <label className="input-label">Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
                className={`input-field ${errors.location ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">OR SIGN UP WITH</span>
          </div>

          <div className="social-buttons">
            <button onClick={handleGoogleSignup} className="social-button google-button" disabled={loading}>
              Google
            </button>
            <button onClick={handleFacebookSignup} className="social-button facebook-button" disabled={loading}>
              Facebook
            </button>
          </div>

          <p className="switch-text">
            Already have an account?{' '}
            <button onClick={() => navigate('/auth/login')} className="link-button" disabled={loading}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
