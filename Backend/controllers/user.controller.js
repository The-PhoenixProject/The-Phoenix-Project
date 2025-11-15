// controllers/user.controller.js
const User = require('../models/user.model');
const logger = require('../utlis/logger');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temp folder
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -refreshTokens -firebaseUid')
      .populate('friends', 'fullName email profilePicture')
      .populate('followers', 'fullName email profilePicture')
      .populate('following', 'fullName email profilePicture');

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
          friends: user.friends,
          followers: user.followers,
          following: user.following,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider,
          subscriptionStatus: user.subscriptionStatus,
          createdAt: user.createdAt,
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/users/me
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.updateProfile(req.body);
    
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          location: user.location,
          bio: user.bio,
          profilePicture: user.profilePicture,
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Upload avatar locally
 * @route   POST /api/users/me/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      logger.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: 'Upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        await fs.unlink(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Define final path
      const newPath = `uploads/${req.file.filename}.jpg`;
      await fs.rename(req.file.path, newPath);

      // Save path in DB
      user.profilePicture = newPath;
      await user.save();

      // Return full URL
      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        url: `http://localhost:3000/${newPath}`, // Added full URL
      });
    } catch (error) {
      logger.error('Upload avatar error:', error);
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  });
};

/**
 * @desc    Delete avatar
 * @route   DELETE /api/users/me/avatar
 * @access  Private
 */
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete from Cloudinary if exists
    if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`phoenix-avatars/${publicId}`);
    }

    // Delete local file if exists
    if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
      await fs.unlink(user.profilePicture).catch(() => {}); // Ignore if file not found
    }

    // Remove from DB
    user.profilePicture = null;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Avatar deleted successfully' 
    });
  } catch (error) {
    logger.error('Delete avatar error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Add friend
 * @route   POST /api/users/friends/:id
 * @access  Private
 */
exports.addFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const friendId = req.params.id;

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (friendId === req.user.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot add yourself as friend' 
      });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friend not found' 
      });
    }

    await user.addFriend(friendId);
    
    res.status(200).json({ 
      success: true,
      message: 'Friend added successfully'
    });
  } catch (error) {
    logger.error('Add friend error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Remove friend
 * @route   DELETE /api/users/friends/:id
 * @access  Private
 */
exports.removeFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.removeFriend(req.params.id);
    
    res.status(200).json({ 
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    logger.error('Remove friend error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Follow user
 * @route   POST /api/users/follow/:id
 * @access  Private
 */
exports.followUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const targetId = req.params.id;

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (targetId === req.user.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot follow yourself' 
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target user not found' 
      });
    }

    await user.follow(targetId);
    
    res.status(200).json({ 
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    logger.error('Follow user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Unfollow user
 * @route   DELETE /api/users/follow/:id
 * @access  Private
 */
exports.unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.unfollow(req.params.id);
    
    res.status(200).json({ 
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    logger.error('Unfollow user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};