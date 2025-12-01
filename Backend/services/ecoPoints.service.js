// services/ecoPoints.service.js - Eco Points Management Service
const User = require('../models/user.model');
const logger = require('../utlis/logger');

// Eco Points Configuration based on documentation
const ECO_POINTS_CONFIG = {
  createPost: 10,
  purchaseProduct: 20,
  sellProduct: 30,
  completeMaintenance: 25,
  referFriend: 50,
  dailyLogin: 5,
  addProduct: 15,
  deleteProduct: -10, // Penalty for removing product
  completeProfile: 20,
  firstPost: 25, // Bonus for first post
  firstSale: 50, // Bonus for first sale
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  { name: "Eco Newbie", min: 0, max: 100 },
  { name: "Eco Enthusiast", min: 100, max: 500 },
  { name: "Eco Champion", min: 500, max: 1000 },
  { name: "Eco Legend", min: 1000, max: Infinity }
];

// Badge definitions
const BADGES = {
  FIRST_POST: { name: "First Post", description: "Created your first post", icon: "📝" },
  FIRST_SALE: { name: "First Sale", description: "Made your first sale", icon: "💰" },
  ECO_WARRIOR: { name: "Eco Warrior", description: "Listed 10 eco-friendly products", icon: "🌿" },
  STREAK_7: { name: "Week Warrior", description: "7-day activity streak", icon: "🔥" },
  STREAK_30: { name: "Monthly Master", description: "30-day activity streak", icon: "⚡" },
  POINTS_100: { name: "Rising Star", description: "Earned 100 eco points", icon: "⭐" },
  POINTS_500: { name: "Eco Champion", description: "Earned 500 eco points", icon: "🏆" },
  POINTS_1000: { name: "Eco Legend", description: "Earned 1000 eco points", icon: "👑" },
  COMMUNITY_HELPER: { name: "Community Helper", description: "Completed 5 maintenance services", icon: "🛠️" },
  SOCIAL_BUTTERFLY: { name: "Social Butterfly", description: "Gained 50 followers", icon: "🦋" },
};

class EcoPointsService {
  /**
   * Award eco points to a user
   * @param {string} userId - User ID
   * @param {string} action - Action type (createPost, sellProduct, etc.)
   * @param {object} options - Additional options
   * @returns {object} - Updated user data with points info
   */
  static async awardPoints(userId, action, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const points = ECO_POINTS_CONFIG[action];
      if (points === undefined) {
        logger.warn(`Unknown action type: ${action}`);
        return { success: false, message: 'Unknown action type' };
      }

      const previousPoints = user.ecoPoints;
      const previousLevel = user.level;

      // Add points
      user.ecoPoints = Math.max(0, user.ecoPoints + points);

      // Update level based on new points
      const newLevel = this.calculateLevel(user.ecoPoints);
      user.level = newLevel.name;

      // Check for badges
      const newBadges = await this.checkAndAwardBadges(user, action, options);

      await user.save();

      // Log the points transaction
      logger.info(`Eco points awarded: User ${userId}, Action: ${action}, Points: ${points}, New Total: ${user.ecoPoints}`);

      return {
        success: true,
        pointsAwarded: points,
        previousPoints,
        currentPoints: user.ecoPoints,
        previousLevel,
        currentLevel: user.level,
        leveledUp: previousLevel !== user.level,
        newBadges,
        message: points > 0 
          ? `+${points} Eco Points earned for ${action}!` 
          : `${points} Eco Points deducted for ${action}`
      };
    } catch (error) {
      logger.error('Award points error:', error);
      throw error;
    }
  }

  /**
   * Calculate user level based on points
   * @param {number} points - Current eco points
   * @returns {object} - Level info
   */
  static calculateLevel(points) {
    for (const level of LEVEL_THRESHOLDS) {
      if (points >= level.min && points < level.max) {
        return level;
      }
    }
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }

  /**
   * Get level progress information
   * @param {number} points - Current eco points
   * @returns {object} - Progress info
   */
  static getLevelProgress(points) {
    const currentLevel = this.calculateLevel(points);
    const levelIndex = LEVEL_THRESHOLDS.indexOf(currentLevel);
    const nextLevel = LEVEL_THRESHOLDS[levelIndex + 1];

    if (!nextLevel) {
      return {
        currentLevel,
        nextLevel: null,
        progress: 100,
        pointsToNext: 0,
        pointsInLevel: points - currentLevel.min
      };
    }

    const pointsInLevel = points - currentLevel.min;
    const totalForLevel = currentLevel.max - currentLevel.min;
    const progress = (pointsInLevel / totalForLevel) * 100;

    return {
      currentLevel,
      nextLevel,
      progress: Math.min(progress, 100),
      pointsToNext: currentLevel.max - points,
      pointsInLevel
    };
  }

  /**
   * Check and award badges based on achievements
   * @param {object} user - User document
   * @param {string} action - Current action
   * @param {object} options - Additional options
   * @returns {array} - Newly awarded badges
   */
  static async checkAndAwardBadges(user, action, options = {}) {
    const newBadges = [];
    const existingBadgeNames = user.badges.map(b => b.name);

    // Check points milestones
    if (user.ecoPoints >= 100 && !existingBadgeNames.includes(BADGES.POINTS_100.name)) {
      newBadges.push(BADGES.POINTS_100);
    }
    if (user.ecoPoints >= 500 && !existingBadgeNames.includes(BADGES.POINTS_500.name)) {
      newBadges.push(BADGES.POINTS_500);
    }
    if (user.ecoPoints >= 1000 && !existingBadgeNames.includes(BADGES.POINTS_1000.name)) {
      newBadges.push(BADGES.POINTS_1000);
    }

    // Check streak badges
    if (user.streak >= 7 && !existingBadgeNames.includes(BADGES.STREAK_7.name)) {
      newBadges.push(BADGES.STREAK_7);
    }
    if (user.streak >= 30 && !existingBadgeNames.includes(BADGES.STREAK_30.name)) {
      newBadges.push(BADGES.STREAK_30);
    }

    // Check first-time badges
    if (action === 'createPost' && user.postsCount === 1 && !existingBadgeNames.includes(BADGES.FIRST_POST.name)) {
      newBadges.push(BADGES.FIRST_POST);
    }

    if (action === 'sellProduct' && options.isFirstSale && !existingBadgeNames.includes(BADGES.FIRST_SALE.name)) {
      newBadges.push(BADGES.FIRST_SALE);
    }

    // Check follower badges
    if (user.followersCount >= 50 && !existingBadgeNames.includes(BADGES.SOCIAL_BUTTERFLY.name)) {
      newBadges.push(BADGES.SOCIAL_BUTTERFLY);
    }

    // Add new badges to user
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        user.badges.push({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earnedAt: new Date()
        });
      });
    }

    return newBadges;
  }

  /**
   * Get user's eco stats
   * @param {string} userId - User ID
   * @returns {object} - Eco statistics
   */
  static async getUserEcoStats(userId) {
    try {
      const user = await User.findById(userId)
        .select('ecoPoints level streak badges postsCount productsCount')
        .lean();

      if (!user) {
        throw new Error('User not found');
      }

      const levelProgress = this.getLevelProgress(user.ecoPoints);

      return {
        ecoPoints: user.ecoPoints,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        levelProgress,
        stats: {
          postsCount: user.postsCount,
          productsCount: user.productsCount
        },
        pointsConfig: ECO_POINTS_CONFIG
      };
    } catch (error) {
      logger.error('Get eco stats error:', error);
      throw error;
    }
  }

  /**
   * Update daily streak
   * @param {string} userId - User ID
   * @returns {object} - Updated streak info
   */
  static async updateStreak(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date().setHours(0, 0, 0, 0);
      const lastActivity = user.lastActivityDate 
        ? new Date(user.lastActivityDate).setHours(0, 0, 0, 0) 
        : 0;

      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      
      let streakBroken = false;
      let bonusPoints = 0;

      if (daysDiff === 0) {
        // Same day, no change
        return { streak: user.streak, changed: false };
      } else if (daysDiff === 1) {
        // Consecutive day
        user.streak += 1;
        bonusPoints = ECO_POINTS_CONFIG.dailyLogin;
        user.ecoPoints += bonusPoints;
      } else {
        // Streak broken
        streakBroken = user.streak > 0;
        user.streak = 1;
        bonusPoints = ECO_POINTS_CONFIG.dailyLogin;
        user.ecoPoints += bonusPoints;
      }

      user.lastActivityDate = new Date();
      
      // Check for streak badges
      await this.checkAndAwardBadges(user, 'dailyLogin');
      
      await user.save();

      return {
        streak: user.streak,
        changed: true,
        streakBroken,
        bonusPoints,
        message: streakBroken 
          ? 'Streak reset! Start building again!' 
          : `🔥 ${user.streak} day streak! +${bonusPoints} points`
      };
    } catch (error) {
      logger.error('Update streak error:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   * @param {number} limit - Number of users to return
   * @returns {array} - Top users by eco points
   */
  static async getLeaderboard(limit = 10) {
    try {
      const users = await User.find({ isActive: true, isSuspended: false })
        .select('fullName profilePicture ecoPoints level streak badges')
        .sort({ ecoPoints: -1 })
        .limit(limit)
        .lean();

      return users.map((user, index) => ({
        rank: index + 1,
        id: user._id,
        name: user.fullName,
        avatar: user.profilePicture,
        ecoPoints: user.ecoPoints,
        level: user.level,
        streak: user.streak,
        badgeCount: user.badges?.length || 0
      }));
    } catch (error) {
      logger.error('Get leaderboard error:', error);
      throw error;
    }
  }
}

module.exports = EcoPointsService;
module.exports.ECO_POINTS_CONFIG = ECO_POINTS_CONFIG;
module.exports.LEVEL_THRESHOLDS = LEVEL_THRESHOLDS;
module.exports.BADGES = BADGES;