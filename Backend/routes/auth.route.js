// routes/auth.route.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyFirebaseToken = require('../middlewares/auth.middleware');

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/social-login', authController.socialLogin);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword); // ✅ Added this line
router.post('/refresh-token', authController.refreshToken); // Also add this if not present

// Protected Routes
router.get('/me', verifyFirebaseToken, authController.getMe);
router.post('/logout', verifyFirebaseToken, authController.logout);

module.exports = router;