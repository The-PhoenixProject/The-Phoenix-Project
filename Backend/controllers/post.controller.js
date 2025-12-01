// controllers/post.controller.js - FIXED WITH CORRECT RESPONSE FORMAT
const Post = require('../models/post.model');
const User = require('../models/user.model');
const EcoPointsService = require('../services/ecoPoints.service');
const logger = require('../utlis/logger');
const fs = require('fs').promises;

/**
 * @desc    Get feed posts
 * @route   GET /api/posts/feed
 * @access  Private
 */
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'fullName profilePicture')
      .populate('comments.user', 'fullName profilePicture')
      .limit(20);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get current user's posts
 * @route   GET /api/posts/my
 * @access  Private
 */
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName profilePicture')
      .populate('comments.user', 'fullName profilePicture');
    
    res.status(200).json({ 
      success: true, 
      posts: posts
    });
  } catch (error) {
    logger.error('Get my posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create post - WITH ECO POINTS
 * @route   POST /api/posts
 * @access  Private
 */
exports.createPost = async (req, res) => {
  try {
    let mediaData = null;
    
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `/uploads/${req.file.filename}`;
      const isVideo = req.file.mimetype.startsWith('video');
      
      mediaData = {
        url: `${baseUrl}${imageUrl}`,
        type: isVideo ? 'video' : 'image'
      };
    }

    const postData = {
      content: req.body.content,
      media: mediaData,
      user: req.user.userId,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      category: req.body.category || 'other'
    };

    // Create post
    const post = await Post.createPost(postData);
    await post.populate('user', 'fullName profilePicture');
    
    // ✅ Award eco points for creating post
    try {
      const user = await User.findById(req.user.userId);
      const isFirstPost = user.postsCount === 1;
      
      await EcoPointsService.awardPoints(
        req.user.userId, 
        'createPost',
        { isFirstPost }
      );
      
      logger.info(`Eco points awarded for post creation: User ${req.user.userId}`);
    } catch (pointsError) {
      logger.error('Error awarding eco points:', pointsError);
      // Don't fail the request if points fail
    }
    
    res.status(201).json({ 
      success: true, 
      post: post,
      message: 'Post created successfully! +10 Eco Points earned! 🌿'
    });
  } catch (error) {
    logger.error('Create post error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Update post - FIXED RESPONSE
 * @route   PUT /api/posts/:id
 * @access  Private
 */
exports.updatePost = async (req, res) => {
  try {
    const { content, tags, category } = req.body;
    
    // Find the post and verify ownership
    const post = await Post.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found or unauthorized' 
      });
    }
    
    // Update fields
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (category !== undefined) post.category = category;
    
    await post.save();
    await post.populate('user', 'fullName profilePicture');
    
    // ✅ FIXED: Return consistent response format
    res.status(200).json({ 
      success: true, 
      data: post,
      message: 'Post updated successfully'
    });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * @desc    Delete post - WITH ECO POINTS DEDUCTION
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found or unauthorized' 
      });
    }
    
    // Delete associated media file if exists
    if (post.media && post.media.url) {
      const filename = post.media.url.split('/uploads/')[1];
      if (filename) {
        const filepath = `uploads/${filename}`;
        await fs.unlink(filepath).catch(err => {
          logger.warn(`Failed to delete file ${filepath}:`, err.message);
        });
      }
    }
    
    // Delete the post (this also updates user's postsCount via model static method)
    await Post.deletePost(req.params.id, req.user.userId);
    
    // ✅ Deduct eco points (optional - you can remove this if you don't want to penalize deletions)
    try {
      const user = await User.findById(req.user.userId);
      if (user.ecoPoints >= 10) {
        user.ecoPoints -= 10;
        await user.save();
        logger.info(`Deducted 10 eco points for post deletion: User ${req.user.userId}`);
      }
    } catch (pointsError) {
      logger.error('Error deducting eco points:', pointsError);
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * @desc    Like/unlike post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    const userIdStr = req.user.userId.toString();
    const index = post.likes.findIndex(id => id.toString() === userIdStr);
    
    if (index === -1) {
      post.likes.push(req.user.userId);
    } else {
      post.likes.splice(index, 1);
    }
    
    await post.save();
    
    res.status(200).json({ 
      success: true, 
      data: post.likes.length,
      isLiked: index === -1
    });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * @desc    Comment on post
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
exports.commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          comments: { 
            user: req.user.userId, 
            content: content.trim(),
            createdAt: new Date()
          } 
        } 
      },
      { new: true }
    )
    .populate('comments.user', 'fullName profilePicture')
    .populate('user', 'fullName profilePicture');
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      data: post.comments 
    });
  } catch (error) {
    logger.error('Comment post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};