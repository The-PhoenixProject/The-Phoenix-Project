import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import '../styles/Register/ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="forgot-password-container">
      {/* LEFT */}
      <div className="forgot-password-left">
        <div className="logo-container">
          <img src="../../public/logo big (1).png" alt="Phoenix Project Logo" className="logo" />
          <h1 className="logo-title">THE PHOENIX PROJECT</h1>
          <p className="logo-subtitle">RECYCLE. RENEW.</p>
        </div>
        <div className="welcome-text">
          <h2>Password Recovery</h2>
          <p>Don't worry, we'll help you get back to your sustainable journey.</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="forgot-password-right">
        <div className="forgot-password-form-container">
          <h1 className="form-title">Forgot Password?</h1>
          <p className="form-subtitle">Enter your email to receive a reset code</p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={error ? 'error' : ''}
                disabled={loading}
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <p className="back-link">
            <a href="/login">← Back to Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;