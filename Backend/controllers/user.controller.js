// controllers/user.controller.js - COMPLETE FIXED VERSION
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Product = require('../models/product.model');
const logger = require('../utlis/logger');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Get current user profile with all data
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -refreshTokens -firebaseUid')
      .populate('followers', 'fullName email profilePicture')
      .populate('following', 'fullName email profilePicture')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get user's products count
    const productsCount = await Product.countDocuments({ seller: user._id });

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          productsCount
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    logger.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update profile - FIXED VERSION
 * @route   PUT /api/users/me
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, location } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          bio: user.bio,
          location: user.location
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get suggested friends (users to follow)
 * @route   GET /api/users/suggestions
 * @access  Private
 */
exports.getSuggestedFriends = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId)
      .select('following')
      .lean();

    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const suggestions = await User.find({
      _id: { 
        $ne: req.user.userId,
        $nin: currentUser.following || []
      },
      isActive: true,
      isSuspended: false
    })
    .select('fullName email profilePicture bio ecoPoints level')
    .limit(10)
    .sort({ followersCount: -1, ecoPoints: -1 })
    .lean();

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get suggested friends error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get suggestions' 
    });
  }
};

/**
 * @desc    Get trending topics from posts
 * @route   GET /api/users/trending-topics
 * @access  Public
 */
exports.getTrendingTopics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await Post.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
    .select('tags createdAt')
    .lean();

    // Count tags with recency weight
    const tagData = {};
    const now = Date.now();
    
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        // Calculate recency score (more recent posts get higher weight)
        const daysOld = (now - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.max(1, 30 - daysOld) / 30; // 0-1 score
        
        post.tags.forEach(tag => {
          const cleanTag = tag.replace('#', '').toLowerCase().trim();
          if (cleanTag) {
            if (!tagData[cleanTag]) {
              tagData[cleanTag] = { count: 0, weightedScore: 0 };
            }
            tagData[cleanTag].count += 1;
            tagData[cleanTag].weightedScore += recencyWeight;
          }
        });
      }
    });

    // Sort by weighted score (combines popularity + recency)
    const trending = Object.entries(tagData)
      .map(([tag, data]) => ({
        tag: `#${tag}`,
        count: `${data.count} post${data.count > 1 ? 's' : ''}`,
        score: data.weightedScore,
        rawCount: data.count
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Get top 15 instead of 10

    // If no trending topics found, return comprehensive default list
    if (trending.length === 0) {
      return res.json({
        success: true,
        data: {
          trending: [
            { tag: "#SustainableLiving", count: "Trending", score: 100 },
            { tag: "#EcoFriendly", count: "Trending", score: 95 },
            { tag: "#RecycleMore", count: "Trending", score: 90 },
            { tag: "#ZeroWaste", count: "Trending", score: 85 },
            { tag: "#GreenAction", count: "Trending", score: 80 },
            { tag: "#ClimateChange", count: "Trending", score: 75 },
            { tag: "#Upcycling", count: "Trending", score: 70 },
            { tag: "#PlasticFree", count: "Trending", score: 65 },
            { tag: "#RenewableEnergy", count: "Trending", score: 60 },
            { tag: "#EcoWarrior", count: "Trending", score: 55 },
            { tag: "#SaveThePlanet", count: "Trending", score: 50 },
            { tag: "#GoGreen", count: "Trending", score: 45 },
            { tag: "#EarthDay", count: "Trending", score: 40 },
            { tag: "#Sustainability", count: "Trending", score: 35 },
            { tag: "#GreenLiving", count: "Trending", score: 30 }
          ]
        }
      });
    }

    res.json({
      success: true,
      data: { trending }
    });
  } catch (error) {
    console.error('Get trending topics error:', error);
    
    // Return default trending on error
    res.json({
      success: true,
      data: {
        trending: [
          { tag: "#SustainableLiving", count: "Popular" },
          { tag: "#EcoFriendly", count: "Popular" },
          { tag: "#RecycleMore", count: "Popular" },
          { tag: "#ZeroWaste", count: "Popular" },
          { tag: "#GreenAction", count: "Popular" },
          { tag: "#ClimateChange", count: "Popular" },
          { tag: "#Upcycling", count: "Popular" },
          { tag: "#PlasticFree", count: "Popular" },
          { tag: "#RenewableEnergy", count: "Popular" },
          { tag: "#EcoWarrior", count: "Popular" }
        ]
      }
    });
  }
};

/**
 * @desc    Toggle save post
 * @route   POST /api/users/posts/:postId/save
 * @access  Private
 */
exports.toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const postId = req.params.postId;

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const savedIndex = user.savedPosts.findIndex(
      id => id.toString() === postId
    );

    let isSaved;
    let message;

    if (savedIndex === -1) {
      user.savedPosts.push(postId);
      user.savedPostsCount = (user.savedPostsCount || 0) + 1;
      isSaved = true;
      message = 'Post saved';
    } else {
      user.savedPosts.splice(savedIndex, 1);
      user.savedPostsCount = Math.max((user.savedPostsCount || 0) - 1, 0);
      isSaved = false;
      message = 'Post unsaved';
    }

    await user.save();

    res.json({
      success: true,
      message,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Toggle save post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save post' 
    });
  }
};

/**
 * @desc    Get saved posts
 * @route   GET /api/users/saved-posts
 * @access  Private
 */
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'savedPosts',
        populate: [
          { path: 'user', select: 'fullName profilePicture' },
          { path: 'comments.user', select: 'fullName profilePicture' }
        ],
        options: { sort: { createdAt: -1 } }
      })
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const savedPosts = (user.savedPosts || []).map(post => ({
      ...post,
      isSaved: true
    }));

    res.json({
      success: true,
      data: { posts: savedPosts }
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get saved posts' 
    });
  }
};

/**
 * @desc    Upload avatar
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

      if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
        try {
          await fs.unlink(user.profilePicture);
        } catch (error) {
          console.log('Old avatar not found or already deleted');
        }
      }

      const newPath = `uploads/${req.file.filename}${path.extname(req.file.originalname)}`;
      await fs.rename(req.file.path, newPath);

      user.profilePicture = newPath;
      await user.save();

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        url: `${baseUrl}/${newPath}`,
        path: newPath
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

    if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
      await fs.unlink(user.profilePicture).catch(() => {});
    }

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

/**
 * @desc    Public: Get a user profile by id
 * @route   GET /api/users/:id
 * @access  Public
 */
exports.getUserProfilePublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens -firebaseUid')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
      user.profilePicture = `${API_BASE_URL}/${user.profilePicture}`;
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get public profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's products
 * @route   GET /api/users/:id/products
 * @access  Public
 */
exports.getUserProducts = async (req, res) => {
  try {
    const userId = req.params.id;

    const products = await Product.find({ seller: userId })
      .populate('seller', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    const API_BASE_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const mapped = products.map(p => ({
      ...p,
      image: p.image && p.image.startsWith('uploads/') ? `${API_BASE_URL}/${p.image}` : p.image,
      images: (p.images || []).map(img => img.startsWith('uploads/') ? `${API_BASE_URL}/${img}` : img)
    }));

    res.json({ success: true, data: { products: mapped } });
  } catch (error) {
    logger.error('Get user products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};