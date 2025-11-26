// routes/auth.route.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyFirebaseToken = require('../middlewares/auth.middleware');

// Helper to ensure handlers are functions
const wrap = (fn) => {
	if (typeof fn !== 'function') {
		return (req, res) =>
			res.status(500).json({ success: false, message: 'Handler not a function' });
	}
	return fn;
};

// Public Routes
router.post('/signup', wrap(authController.signup));
router.post('/login', wrap(authController.login));
router.post('/social-login', wrap(authController.socialLogin));
router.post('/verify-otp', wrap(authController.verifyOTP));
router.post('/resend-otp', wrap(authController.resendOTP));
router.post('/forgot-password', wrap(authController.forgotPassword));
router.post('/reset-password', wrap(authController.resetPassword));
router.post('/refresh-token', wrap(authController.refreshToken));

// Protected Routes
router.get('/me', verifyFirebaseToken, wrap(authController.getMe));
router.post('/logout', verifyFirebaseToken, wrap(authController.logout));

module.exports = router;
