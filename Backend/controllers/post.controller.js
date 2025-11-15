// controllers/post.controller.js
const Post = require('../models/post.model');
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
      posts: posts // ✅ Return as 'posts' to match frontend expectation
    });
  } catch (error) {
    logger.error('Get my posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create post
 * @route   POST /api/posts
 * @access  Private
 */
exports.createPost = async (req, res) => {
  try {
    let mediaData = null;
    
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // ✅ Determine media type
      const isVideo = req.file.mimetype.startsWith('video');
      
      mediaData = {
        url: `${baseUrl}${imageUrl}`, // ✅ Full URL
        type: isVideo ? 'video' : 'image'
      };
    }

    const postData = {
      content: req.body.content,
      media: mediaData, // ✅ Single media object, not array
      user: req.user.userId,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      category: req.body.category || 'other'
    };

    const post = await Post.createPost(postData);
    
    // ✅ Populate user info before sending response
    await post.populate('user', 'fullName profilePicture');
    
    res.status(201).json({ 
      success: true, 
      post: post // ✅ Return as 'post' to match frontend
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
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.deletePost(req.params.id, req.user.userId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const index = post.likes.indexOf(req.user.userId);
    if (index === -1) {
      post.likes.push(req.user.userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.status(200).json({ success: true, data: post.likes.length });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user.userId, content } } },
      { new: true }
    ).populate('comments.user', 'fullName profilePicture');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(201).json({ success: true, data: post.comments });
  } catch (error) {
    logger.error('Comment post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};