// models/conversation.model.js - COMPLETELY FIXED VERSION
const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deletedForAll: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  // Pinned messages (shared for all participants)
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  // User-specific data stored as Maps
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  archived: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  deleted: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  deletedForMeMessages: {
    type: Map,
    of: [String], // Array of message IDs per user
    default: new Map()
  }
}, { 
  timestamps: true,
  // Important: Preserve Map types
  minimize: false
});

// Indexes for performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });
messageSchema.index({ conversation: 1, createdAt: 1 });

// Helper method to safely get user-specific data from Map
conversationSchema.methods.getUserData = function(userId, field) {
  const userIdStr = userId.toString();
  
  if (!this[field]) return field === 'deletedForMeMessages' ? [] : 0;
  
  if (this[field] instanceof Map) {
    return this[field].get(userIdStr) || (field === 'deletedForMeMessages' ? [] : 0);
  }
  
  // Fallback for plain objects
  return this[field][userIdStr] || (field === 'deletedForMeMessages' ? [] : 0);
};

// Helper method to safely set user-specific data in Map
conversationSchema.methods.setUserData = function(userId, field, value) {
  const userIdStr = userId.toString();
  
  if (!this[field]) {
    this[field] = new Map();
  }
  
  if (this[field] instanceof Map) {
    this[field].set(userIdStr, value);
  } else {
    // Convert to Map if it's a plain object
    const newMap = new Map();
    Object.entries(this[field]).forEach(([key, val]) => {
      newMap.set(key, val);
    });
    newMap.set(userIdStr, value);
    this[field] = newMap;
  }
};

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };