// controllers/auth.controller.js - COMPLETE FIXED VERSION
const admin = require('../config/firebase.config');
const User = require('../models/user.model');
const OTP = require('../models/OTP.model');
const { generateOTP } = require('../utlis/otpGeneration');
const { sendOTPEmail, sendWelcomeEmail } = require('../utlis/emailService');
const { generateAccessToken, generateRefreshToken } = require('../utlis/tokenHelper');
const logger = require('../utlis/logger');

exports.signup = async (req, res) => {
  try {
    console.log('🔥 Signup request body:', req.body);
    
    const { email, password, fullName, location } = req.body;

    // Validation
    if (!email || !password || !fullName || !location) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      });
    }

    // Create user object with ONLY allowed fields
    const userData = {
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      location: location.trim(),
      authProvider: 'local',
      isEmailVerified: false,
    };

    console.log('📝 Creating user with data:', { ...userData, password: '***hidden***' });

    // Create user in MongoDB
    const user = await User.create(userData);

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.createOTP(email, otp, 'email_verification');
    console.log(`📧 TEST OTP for ${email}: ${otp}`);
    await sendOTPEmail(email, otp, fullName);

    logger.info(`New user signup: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered. Please check your email for OTP.',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        location: user.location,
      },
    });
  } catch (error) {
    logger.error('Signup error:', error);
    console.error('❌ Signup error details:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    const verification = await OTP.verifyOTP(email, otp, 'email_verification');
    
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    user.isEmailVerified = true;
    await user.save();

    await sendWelcomeEmail(email, user.fullName);

    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    logger.info(`Email verified for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          location: user.location,
          profilePicture: user.profilePicture,
          ecoPoints: user.ecoPoints,
          level: user.level,
          streak: user.streak,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    const otp = generateOTP();
    await OTP.createOTP(email, otp, 'email_verification');
    await sendOTPEmail(email, otp, user.fullName);

    logger.info(`OTP resent to: ${email}`);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add this to auth.controller.js - Fixed login with streak update

/**
 * @desc    Login user - WITH STREAK UPDATE
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
        reason: user.suspensionReason
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate and send OTP
      const otp = generateOTP();
      await OTP.createOTP(email, otp, 'email_verification');
      await sendOTPEmail(email, otp, user.fullName);
      
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. A new OTP has been sent.',
        needsVerification: true,
        email: user.email
      });
    }

    // ✅ Update streak and award daily login points
    let streakInfo = null;
    try {
      streakInfo = await user.updateStreak();
      logger.info(`Streak updated for user ${user.email}: ${JSON.stringify(streakInfo)}`);
    } catch (streakError) {
      logger.error('Streak update error:', streakError);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          location: user.location,
          profilePicture: user.profilePicture,
          ecoPoints: user.ecoPoints,
          level: user.level,
          streak: user.streak,
          badges: user.badges,
        },
        accessToken,
        refreshToken,
        streakInfo // Include streak info in response
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Forgot Password - Send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.authProvider} login. Please use ${user.authProvider} to reset your password.`,
      });
    }

    const otp = generateOTP();
    await OTP.createOTP(email, otp, 'password_reset');
    await sendOTPEmail(email, otp, user.fullName);

    logger.info(`Password reset OTP sent to: ${email}`);

    res.status(200).json({ 
      success: true, 
      message: 'Password reset OTP sent to your email' 
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Reset Password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      });
    }

    const verification = await OTP.verifyOTP(email, otp, 'password_reset');
    
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.password = newPassword;
    await user.save();

    user.refreshTokens = [];
    await user.save();

    logger.info(`Password reset successful for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { refreshToken } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      await user.save();
    }

    logger.info(`User logged out: ${user.email}`);

    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          location: user.location,
          bio: user.bio,
          profilePicture: user.profilePicture,
          ecoPoints: user.ecoPoints,
          level: user.level,
          streak: user.streak,
          badges: user.badges,
          postsCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider,
          subscriptionStatus: user.subscriptionStatus,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const { verifyRefreshToken } = require('../utlis/tokenHelper');
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const newAccessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
    });

    logger.info(`Token refreshed for: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    
    if (error.message === 'Refresh token expired') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
