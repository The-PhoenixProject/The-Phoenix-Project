// user.route.js - MAKE SURE YOU HAVE THESE ROUTES

const express = require('express');
const verifyToken = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Profile Management
router.get('/me', verifyToken, userController.getProfile);
router.put('/me', verifyToken, userController.updateProfile);
router.post('/me/avatar', verifyToken, userController.uploadAvatar);
router.delete('/me/avatar', verifyToken, userController.deleteAvatar);

// ✅ IMPORTANT: Follow/Unfollow routes - make sure path matches
router.post('/:id/follow', verifyToken, userController.followUser);
router.post('/:id/unfollow', verifyToken, userController.unfollowUser);

// Suggestions & Trending
router.get('/suggestions', verifyToken, userController.getSuggestedFriends);
router.get('/trending-topics', userController.getTrendingTopics);

// ✅ Saved Posts routes
router.post('/posts/:postId/save', verifyToken, userController.toggleSavePost);
router.get('/saved-posts', verifyToken, userController.getSavedPosts);

// Public routes
router.get('/:id', userController.getUserProfilePublic);
router.get('/:id/products', userController.getUserProducts);

module.exports = router;
