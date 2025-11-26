// models/User.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  }, 
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  
  // Authentication Provider
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isSuspended: {
    type: Boolean,
    default: false
  },
  
  suspensionReason: String,
  
  // Gamification
  ecoPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  badges: [{
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  level: {
    type: String,
    enum: ['Eco Newbie', 'Eco Enthusiast', 'Eco Champion', 'Eco Legend'],
    default: 'Eco Newbie'
  },
  
  streak: {
    type: Number,
    default: 0
  },
  
  lastActivityDate: Date,
  
  // Counters
  postsCount: {
    type: Number,
    default: 0
  },
  
  followersCount: {
    type: Number,
    default: 0
  },
  
  followingCount: {
    type: Number,
    default: 0
  },
  
  productsCount: {
    type: Number,
    default: 0
  },
  
  savedPostsCount: {
    type: Number,
    default: 0
  },
  
  // Subscription
  subscriptionStatus: {
    type: String,
    enum: ['none', 'active', 'expired'],
    default: 'none'
  },
  
  subscriptionExpiry: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Timestamps
  lastLoginAt: Date,
  // Online status
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: Date,
  
  // Refresh Tokens for JWT
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 days
    }
  }],
  posts: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Post'
}],
products: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product'
}],
wishlist: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product'
}],
savedPosts: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Post'
}],
maintenanceRequests: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'MaintenanceRequest'
}],
serviceOffers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ServiceOffer'
}],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes

userSchema.index({ isActive: 1, isSuspended: 1 });

// Virtual for profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/profile/${this._id}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update eco level based on points
userSchema.pre('save', function(next) {
  if (this.isModified('ecoPoints')) {
    if (this.ecoPoints >= 1000) {
      this.level = 'Eco Legend';
    } else if (this.ecoPoints >= 500) {
      this.level = 'Eco Champion';
    } else if (this.ecoPoints >= 100) {
      this.level = 'Eco Enthusiast';
    } else {
      this.level = 'Eco Newbie';
    }
  }
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    return false;
  }
};

// Add eco points
userSchema.methods.addEcoPoints = async function(points) {
  this.ecoPoints += points;
  await this.save();
};

// Update streak
userSchema.methods.updateStreak = async function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActivity = this.lastActivityDate 
    ? new Date(this.lastActivityDate).setHours(0, 0, 0, 0) 
    : 0;
  
  const daysDifference = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 1) {
    this.streak += 1;
  } else if (daysDifference > 1) {
    this.streak = 1;
  }
  
  this.lastActivityDate = new Date();
  await this.save();
};

// Check subscription
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscriptionStatus !== 'active') return false;
  if (!this.subscriptionExpiry) return false;
  return new Date(this.subscriptionExpiry) > new Date();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByFirebaseUid = function(uid) {
  return this.findOne({ firebaseUid: uid });
};
// models/User.model.js (التعديلات الجديدة فقط، أضفها للكود القديم)
userSchema.add({
  // Followers/Following/Friends
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Methods جديدة
userSchema.methods.updateProfile = async function(data) {
  const allowedFields = ['fullName', 'bio', 'location'];
  allowedFields.forEach(field => {
    if (data[field]) this[field] = data[field];
  });
  await this.save();
};

userSchema.methods.updateAvatar = async function(url) {
  this.profilePicture = url;
  await this.save();
};

userSchema.methods.removeAvatar = async function() {
  this.profilePicture = 'https://via.placeholder.com/150'; // Default
  await this.save();
};

userSchema.methods.addFriend = async function(friendId) {
  if (!this.friends.includes(friendId)) {
    this.friends.push(friendId);
    await this.save();
  }
};

userSchema.methods.removeFriend = async function(friendId) {
  this.friends = this.friends.filter(id => !id.equals(friendId));
  await this.save();
};

// نفس الشيء لـ followers/following إذا عايزة
userSchema.methods.follow = async function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    const user = await User.findById(userId);
    if (user) user.followers.push(this._id);
    await Promise.all([this.save(), user.save()]);
  }
};

userSchema.methods.unfollow = async function(userId) {
  this.following = this.following.filter(id => !id.equals(userId));
  const user = await User.findById(userId);
  if (user) user.followers = user.followers.filter(id => !id.equals(this._id));
  await Promise.all([this.save(), user.save()]);
};
userSchema.methods.toggleWishlist = async function(productId) {
  const index = this.wishlist.indexOf(productId);
  if (index === -1) {
    this.wishlist.push(productId);
  } else {
    this.wishlist.splice(index, 1);
  }
  await this.save();
};

userSchema.methods.toggleSavedPost = async function(postId) {
  const index = this.savedPosts.indexOf(postId);
  if (index === -1) {
    this.savedPosts.push(postId);
  } else {
    this.savedPosts.splice(index, 1);
  }
  await this.save();
};
// Add this to user.model.js - FIXED streak update method

// Update streak - FIXED VERSION
userSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = this.lastActivityDate 
    ? new Date(this.lastActivityDate) 
    : null;
  
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }
  
  const daysDifference = lastActivity 
    ? Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24))
    : null;
  
  let streakBroken = false;
  let bonusPoints = 0;
  let streakIncreased = false;
  
  if (daysDifference === null || daysDifference > 1) {
    // First time or streak broken
    streakBroken = this.streak > 0;
    this.streak = 1;
    bonusPoints = 5; // Daily login bonus
    this.ecoPoints += bonusPoints;
    streakIncreased = true;
  } else if (daysDifference === 1) {
    // Consecutive day
    this.streak += 1;
    bonusPoints = 5; // Daily login bonus
    this.ecoPoints += bonusPoints;
    streakIncreased = true;
    
    // Bonus points for longer streaks
    if (this.streak >= 7) {
      bonusPoints += 10; // Week bonus
      this.ecoPoints += 10;
    }
    if (this.streak >= 30) {
      bonusPoints += 25; // Month bonus
      this.ecoPoints += 25;
    }
  } else if (daysDifference === 0) {
    // Same day, no change but return current info
    return {
      streak: this.streak,
      changed: false,
      message: 'Already logged in today!'
    };
  }
  
  this.lastActivityDate = new Date();
  await this.save();
  
  return {
    streak: this.streak,
    changed: true,
    streakBroken,
    streakIncreased,
    bonusPoints,
    message: streakBroken 
      ? '🔥 Streak reset! Start building again!' 
      : streakIncreased
        ? `🔥 ${this.streak} day streak! +${bonusPoints} points`
        : 'Keep it up!'
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
