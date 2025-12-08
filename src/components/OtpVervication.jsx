import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import '../styles/Register/OtpVervication.css';

const OtpVerification = () => {
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const email = sessionStorage.getItem('otpEmail');

  // ---- redirect if no email ----
  useEffect(() => {
    if (!email) {
      toast.error('Please sign up first');
      navigate('/signup');
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (idx, val) => {
    if (val && !/^\d$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
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

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter all 6 digits');

    setLoading(true);
    try {
      // ✅ Call verifyOTP with just the OTP code (email is retrieved from sessionStorage inside verifyOTP)
      await verifyOTP(code);
      
      // ✅ sessionStorage is already cleared inside verifyOTP, but we can clear tempUserData here
      sessionStorage.removeItem('tempUserData');
      
      toast.success('Email verified successfully! Welcome aboard! 🎉');
      
      // ✅ Redirect to profile (user is now logged in)
      navigate('/profile', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await resendOTP(email);
      toast.success('New OTP sent! Check your email 📧');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      const t = setInterval(() => {
        setResendTimer((p) => {
          if (p <= 1) {
            setCanResend(true);
            clearInterval(t);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      {/* LEFT SIDE – LOGO */}
      <div className="otp-left">
        <div className="logo-card">
          <img src="../../public/logo big (1).png" alt="Phoenix Logo" className="logo-image" />
          <h2 className="logo-title">THE<br/>PHOENIX<br/>PROJECT</h2>
          <p className="logo-subtitle">RECYCLE · RENEW</p>
        </div>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="otp-right">
        <div className="otp-form-container">
          <h1 className="form-title">Verify Your Email</h1>
          <p className="form-subtitle">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>

          <div className="otp-input-container">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="otp-input"
                autoFocus={i === 0}
                disabled={loading}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            className="verify-btn"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="resend-container">
            {!canResend ? (
              <p className="resend-text">
                Resend code in <span className="timer">{resendTimer}s</span>
              </p>
            ) : (
              <button onClick={handleResend} className="resend-btn" disabled={loading}>
                Resend Code
              </button>
            )}
          </div>

          <p className="back-link">
            <a href="/signup">← Back to Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;