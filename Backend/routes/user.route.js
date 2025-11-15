// routes/user.route.js
const express = require('express');
const verifyToken = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Protected routes (يحتاج token)
router.use(verifyToken);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.post('/me/avatar', userController.uploadAvatar);
router.delete('/me/avatar', userController.deleteAvatar);

// Friends
router.post('/friends/:id', userController.addFriend);
router.delete('/friends/:id', userController.removeFriend);

// Follow
router.post('/follow/:id', userController.followUser);
router.delete('/follow/:id', userController.unfollowUser);

module.exports = router;