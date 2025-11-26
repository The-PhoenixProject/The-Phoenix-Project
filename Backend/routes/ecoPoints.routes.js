// routes/ecoPoints.routes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const EcoPointsService = require('../services/ecoPoints.service');

/**
 * @desc    Get user's eco stats
 * @route   GET /api/eco-points/stats
 * @access  Private
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await EcoPointsService.getUserEcoStats(req.user.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get eco stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Get level progress
 * @route   GET /api/eco-points/progress
 * @access  Private
 */
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const User = require('../models/user.model');
    const user = await User.findById(req.user.userId).select('ecoPoints').lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progress = EcoPointsService.getLevelProgress(user.ecoPoints);
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Update user's streak
 * @route   POST /api/eco-points/streak
 * @access  Private
 */
router.post('/streak', verifyToken, async (req, res) => {
  try {
    const result = await EcoPointsService.updateStreak(req.user.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Get leaderboard
 * @route   GET /api/eco-points/leaderboard
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await EcoPointsService.getLeaderboard(limit);
    res.json({ success: true, data: { leaderboard } });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Get points configuration
 * @route   GET /api/eco-points/config
 * @access  Public
 */
router.get('/config', (req, res) => {
  const { ECO_POINTS_CONFIG, LEVEL_THRESHOLDS, BADGES } = require('../services/ecoPoints.service');
  res.json({
    success: true,
    data: {
      pointsConfig: ECO_POINTS_CONFIG,
      levels: LEVEL_THRESHOLDS,
      badges: BADGES
    }
  });
});

module.exports = router;