// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import toast from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
// import '../styles/Register/Signup.css';

// // --- Framer Motion Variants ---

// // 1. Logo for the Welcome Screen (Center piece)
// const centerLogoVariants = {
//   initial: { scale: 0.8, opacity: 0 },
//   animate: { scale: 1, opacity: 1, transition: { duration: 1.0, type: "spring", stiffness: 80 } },
//   exit: { opacity: 0, scale: 1.2, transition: { duration: 0.5 } }
// };

// // 2. Welcome Text
// const centerTextVariants = {
//   initial: { y: 50, opacity: 0 },
//   animate: { y: 0, opacity: 1, transition: { duration: 0.7, delay: 0.5 } },
//   exit: { opacity: 0, y: -50, transition: { duration: 0.5 } }
// };

// // 3. Form Card (Entrance after Welcome exit)
// const formCardVariants = {
//   initial: { y: 50, opacity: 0, scale: 0.95 },
//   animate: {
//     y: 0,
//     opacity: 1,
//     scale: 1,
//     transition: { type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }
//   }
// };

// // 4. Staggered Form Items
// const itemVariants = {
//   initial: { y: 20, opacity: 0 },
//   animate: { y: 0, opacity: 1 }
// };

// // 5. Corner Logo (appears once form is visible)
// const cornerLogoVariants = {
//     initial: { opacity: 0, x: -20 },
//     animate: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.8 } }
// };


// const Signup = () => {
//   const navigate = useNavigate();
//   const { signup, signInWithGoogle, signInWithFacebook } = useAuth();

//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     location: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);

//   // --- useEffect to handle the transition ---
//   useEffect(() => {
//     // Show welcome screen for 3.5 seconds, then transition to form
//     const timer = setTimeout(() => {
//       setShowWelcome(false);
//     }, 3500);
//     return () => clearTimeout(timer);
//   }, []);
  
//   // --- Functions (Validation, Handlers) ---
//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
//     else if (formData.fullName.trim().length < 3) newErrors.fullName = 'Name must be at least 3 characters';
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!formData.email) newErrors.email = 'Email is required';
//     else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (!passwordRegex.test(formData.password))
//       newErrors.password = 'Password must be 8+ chars with upper, lower, number & special char';
//     if (!formData.location.trim()) newErrors.location = 'Location is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return toast.error('Please fix the errors in the form');
//     setLoading(true);
//     try {
//       const result = await signup(formData.email, formData.password, formData.fullName, formData.location);
//       if (result.success) {
//         sessionStorage.setItem('otpEmail', formData.email);
//         sessionStorage.setItem('tempUserData', JSON.stringify({ email: formData.email, fullName: formData.fullName, location: formData.location }));
//         toast.success('Account created! Please verify your email.');
//         navigate('/otp-verification');
//       }
//     } catch (err) {
//       console.error('Signup error:', err);
//       toast.error(err.message || 'Signup failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignup = async () => {
//     setLoading(true);
//     try {
//       const result = await signInWithGoogle();
//       if (result.success) {
//         sessionStorage.setItem('otpEmail', result.user.email);
//         sessionStorage.setItem('tempUserData', JSON.stringify({ email: result.user.email, fullName: result.user.displayName || '', provider: 'Google' }));
//         toast.success('Google signup successful!');
//         navigate('/profile');
//       }
//     } catch (err) {
//       console.error('Google signup error:', err);
//       toast.error(err.message || 'Google signup failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFacebookSignup = async () => {
//     setLoading(true);
//     try {
//       const result = await signInWithFacebook();
//       if (result.success) {
//         sessionStorage.setItem('otpEmail', result.user.email);
//         sessionStorage.setItem('tempUserData', JSON.stringify({ email: result.user.email, fullName: result.user.displayName || '', provider: 'Facebook' }));
//         toast.success('Facebook signup successful!');
//         navigate('/profile');
//       }
//     } catch (err) {
//       console.error('Facebook signup error:', err);
//       toast.error(err.message || 'Facebook signup failed');
//     } finally {
//       setLoading(false);
//     }
//   };


//   // --- JSX with Framer Motion and Staging ---
//   return (
//     <div className="signup-container staged-layout">
//       <AnimatePresence mode="wait">
//         {showWelcome ? (
//           /* -------------------------------------
//           | STAGE 1: FULL SCREEN WELCOME
//           ------------------------------------- */
//           <motion.div
//             key="welcome"
//             className="full-screen-welcome"
//             initial="initial"
//             animate="animate"
//             exit="exit"
//           >
//             <motion.div
//               className="center-logo-group"
//               variants={centerLogoVariants}
//             >
//               <img src="../../public/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="logo-image-center" />
//               <h1 className="logo-title-center">Welcome to Phoenix</h1>
//             </motion.div>
            
//             <motion.p
//               className="welcome-text-center"
//               variants={centerTextVariants}
//             >
//               RECYCLE · RENEW<br/>Join our community of conscious consumers.
//             </motion.p>
//           </motion.div>

//         ) : (
//           /* -------------------------------------
//           | STAGE 2: FORM CONTENT
//           ------------------------------------- */
//           <motion.div 
//             key="form"
//             className="center-content-wrapper form-stage"
//           >
//             {/* 1. TOP LEFT LOGO (Fixed Corner Position) */}
//             <motion.div 
//               className="corner-logo-card"
//               variants={cornerLogoVariants}
//               initial="initial"
//               animate="animate"
//             >
//               <img src="../../public/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="logo-image-small" />
//               <div className="logo-text-small">
//                 <span className="logo-title-small">PHOENIX</span>
//               </div>
//             </motion.div>

//             {/* Welcome Text above Form (Different animation than initial welcome) */}
//             <motion.div
//               className="welcome-header"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
//             >
//               <h2 className="welcome-title">Create Your Account</h2>
//               <p className="welcome-text">Start your renewal journey today</p>
//             </motion.div>

//             {/* Animated Form Card */}
//             <motion.div
//               className="form-wrapper"
//               variants={formCardVariants}
//               initial="initial"
//               animate="animate"
//             >
//               <motion.div
//                 className="form-inner-content"
//                 initial="initial"
//                 animate="animate"
//                 transition={{ staggerChildren: 0.08, delayChildren: 1.0 }}
//               >
                
//                 <form onSubmit={handleSubmit} className="signup-form">
                  
//                   {/* Row 1: Full Name and Email */}
//                   <motion.div className="input-row" variants={itemVariants}>
                    
//                     {/* Full Name */}
//                     <div className="input-group">
//                       <label className="input-label">Full Name</label>
//                       <motion.input
//                         type="text"
//                         name="fullName"
//                         placeholder="John Doe"
//                         value={formData.fullName}
//                         onChange={handleChange}
//                         className={`input-field ${errors.fullName ? 'input-error' : ''}`}
//                         disabled={loading}
//                         whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 172, 0.4)' }}
//                       />
//                       {errors.fullName && <motion.span className="error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.fullName}</motion.span>}
//                     </div>

//                     {/* Email */}
//                     <div className="input-group">
//                       <label className="input-label">Email Address</label>
//                       <motion.input
//                         type="email"
//                         name="email"
//                         placeholder="your@email.com"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className={`input-field ${errors.email ? 'input-error' : ''}`}
//                         disabled={loading}
//                         whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 172, 0.4)' }}
//                       />
//                       {errors.email && <motion.span className="error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.email}</motion.span>}
//                     </div>
//                   </motion.div>

//                   {/* Row 2: Password and Location */}
//                   <motion.div className="input-row" variants={itemVariants}>
                    
//                     {/* Password */}
//                     <div className="input-group">
//                       <label className="input-label">Password</label>
//                       <div className="password-wrapper">
//                         <motion.input
//                           type={showPassword ? 'text' : 'password'}
//                           name="password"
//                           placeholder="••••••••"
//                           value={formData.password}
//                           onChange={handleChange}
//                           className={`input-field ${errors.password ? 'input-error' : ''}`}
//                           disabled={loading}
//                           whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 172, 0.4)' }}
//                         />
//                         <button
//                           type="button"
//                           className="password-toggle"
//                           onClick={() => setShowPassword(!showPassword)}
//                           disabled={loading}
//                         >
//                           {showPassword ? <FaEyeSlash /> : <FaEye />}
//                         </button>
//                       </div>
//                       {errors.password && <motion.span className="error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.password}</motion.span>}
//                     </div>

//                     {/* Location */}
//                     <div className="input-group">
//                       <label className="input-label">Location</label>
//                       <motion.input
//                         type="text"
//                         name="location"
//                         placeholder="City, Country"
//                         value={formData.location}
//                         onChange={handleChange}
//                         className={`input-field ${errors.location ? 'input-error' : ''}`}
//                         disabled={loading}
//                         whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 172, 0.4)' }}
//                       />
//                       {errors.location && <motion.span className="error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.location}</motion.span>}
//                     </div>
//                   </motion.div>

//                   {/* Submit Button */}
//                   <motion.button
//                     type="submit"
//                     className="submit-button full-width-btn"
//                     disabled={loading}
//                     variants={itemVariants}
//                     whileHover={{ scale: 1.02, backgroundColor: '#319795' }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     {loading ? 'Creating Account...' : 'Create Account'}
//                   </motion.button>
//                 </form>

//                 {/* Divider and Social Buttons */}
//                 <motion.div className="divider" variants={itemVariants}>
//                   <span className="divider-text">OR SIGN UP WITH</span>
//                 </motion.div>

//                 <motion.div className="social-buttons" variants={itemVariants}>
//                   <motion.button
//                     onClick={handleGoogleSignup}
//                     className="social-button google-button"
//                     disabled={loading}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <FaGoogle className="social-icon" /> Google
//                   </motion.button>
//                   <motion.button
//                     onClick={handleFacebookSignup}
//                     className="social-button facebook-button"
//                     disabled={loading}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <FaFacebookF className="social-icon" /> Facebook
//                   </motion.button>
//                 </motion.div>

//                 {/* Switch Link */}
//                 <motion.p className="switch-text" variants={itemVariants}>
//                   Already have an account?{' '}
//                   <button onClick={() => navigate('/auth/login')} className="link-button" disabled={loading}>
//                     Sign in
//                   </button>
//                 </motion.p>
//               </motion.div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Signup;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import '../styles/Register/Signup.css';

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

const Signup = () => {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, signInWithFacebook } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    location: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);
  
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
      const result = await signup(formData.email, formData.password, formData.fullName, formData.location);
      if (result.success) {
        sessionStorage.setItem('otpEmail', formData.email);
        sessionStorage.setItem('tempUserData', JSON.stringify({ email: formData.email, fullName: formData.fullName, location: formData.location }));
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
        sessionStorage.setItem('tempUserData', JSON.stringify({ email: result.user.email, fullName: result.user.displayName || '', provider: 'Google' }));
        toast.success('Google signup successful!');
        navigate('/profile');
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
        sessionStorage.setItem('tempUserData', JSON.stringify({ email: result.user.email, fullName: result.user.displayName || '', provider: 'Facebook' }));
        toast.success('Facebook signup successful!');
        navigate('/profile');
      }
    } catch (err) {
      console.error('Facebook signup error:', err);
      toast.error(err.message || 'Facebook signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container-main staged-layout">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            className="signup-full-screen-welcome"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="signup-center-logo-group"
              variants={centerLogoVariants}
            >
              <img src="/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="signup-logo-image-center" />
              <h1 className="signup-logo-title-center">Welcome to Phoenix</h1>
            </motion.div>
            
            <motion.p
              className="signup-welcome-text-center"
              variants={centerTextVariants}
            >
              RECYCLE · RENEW<br/>Join our community of conscious consumers.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            className="signup-center-content-wrapper form-stage"
          >
            {/* Top-left corner logo */}
            <motion.div 
              className="signup-corner-logo-card"
              variants={cornerLogoVariants}
              initial="initial"
              animate="animate"
            >
              <img src="/assets/landingImgs/phoenix-removebg-preview.png" alt="Phoenix Logo" className="signup-logo-image-small" />
              <div className="signup-logo-text-small">
                <span className="signup-logo-title-small">PHOENIX</span>
              </div>
            </motion.div>

            {/* Welcome header */}
            <motion.div
              className="signup-welcome-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            >
              <h2 className="signup-welcome-title">Create Your Account</h2>
              <p className="signup-welcome-text">Start your renewal journey today</p>
            </motion.div>

            {/* Form card */}
            <motion.div
              className="signup-form-wrapper"
              variants={formCardVariants}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="signup-form-inner-content"
                initial="initial"
                animate="animate"
                transition={{ staggerChildren: 0.08, delayChildren: 1.0 }}
              >
                
                <form onSubmit={handleSubmit} className="signup-form">
                  {/* Row 1: Full Name and Email */}
                  <motion.div className="signup-input-row" variants={itemVariants}>
                    {/* Full Name */}
                    <div className="signup-input-group">
                      <label className="signup-input-label">Full Name</label>
                      <motion.input
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`signup-input-field ${errors.fullName ? 'signup-input-error' : ''}`}
                        disabled={loading}
                        whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 91, 0.4)' }}
                      />
                      {errors.fullName && <motion.span className="signup-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.fullName}</motion.span>}
                    </div>

                    {/* Email */}
                    <div className="signup-input-group">
                      <label className="signup-input-label">Email Address</label>
                      <motion.input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`signup-input-field ${errors.email ? 'signup-input-error' : ''}`}
                        disabled={loading}
                        whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 91, 0.4)' }}
                      />
                      {errors.email && <motion.span className="signup-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.email}</motion.span>}
                    </div>
                  </motion.div>

                  {/* Row 2: Password and Location */}
                  <motion.div className="signup-input-row" variants={itemVariants}>
                    {/* Password */}
                    <div className="signup-input-group">
                      <label className="signup-input-label">Password</label>
                      <div className="signup-password-wrapper">
                        <motion.input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className={`signup-input-field ${errors.password ? 'signup-input-error' : ''}`}
                          disabled={loading}
                          whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 91, 0.4)' }}
                        />
                        <button
                          type="button"
                          className="signup-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.password && <motion.span className="signup-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.password}</motion.span>}
                    </div>

                    {/* Location */}
                    <div className="signup-input-group">
                      <label className="signup-input-label">Location</label>
                      <motion.input
                        type="text"
                        name="location"
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={handleChange}
                        className={`signup-input-field ${errors.location ? 'signup-input-error' : ''}`}
                        disabled={loading}
                        whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(56, 178, 91, 0.4)' }}
                      />
                      {errors.location && <motion.span className="signup-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.location}</motion.span>}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="signup-submit-button signup-full-width-btn"
                    disabled={loading}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: '#577f40ff' }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>

                {/* Divider */}
                <motion.div className="signup-divider" variants={itemVariants}>
                  <span className="signup-divider-text">OR SIGN UP WITH</span>
                </motion.div>

                {/* Social Buttons */}
                <motion.div className="signup-social-buttons" variants={itemVariants}>
                  <motion.button
                    onClick={handleGoogleSignup}
                    className="signup-social-button signup-google-button"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaGoogle className="signup-social-icon" /> Google
                  </motion.button>
                  <motion.button
                    onClick={handleFacebookSignup}
                    className="signup-social-button signup-facebook-button"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaFacebookF className="signup-social-icon" /> Facebook
                  </motion.button>
                </motion.div>

                {/* Switch Link */}
                <motion.p className="signup-switch-text" variants={itemVariants}>
                  Already have an account?{' '}
                  <button onClick={() => navigate('/auth/login')} className="signup-link-button" disabled={loading}>
                    Sign in
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

export default Signup;