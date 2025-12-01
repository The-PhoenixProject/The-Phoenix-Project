// models/conversation.model.js - FIXED VERSION WITH PROPER MESSAGE STORAGE
const mongoose = require('mongoose');

// Message Schema - with all necessary fields
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
  deletedForMe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Conversation Schema - complete version
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
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
    of: [mongoose.Schema.Types.ObjectId],
    default: new Map()
  }
}, { 
  timestamps: true,
  minimize: false
});

// Indexes for performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });
conversationSchema.index({ 'participants._id': 1 });
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

// Helper method to safely get user-specific data from Map
conversationSchema.methods.getUserData = function(userId, field) {
  const userIdStr = userId.toString();
  
  if (!this[field]) {
    return field === 'deletedForMeMessages' ? [] : 0;
  }
  
  if (this[field] instanceof Map) {
    const value = this[field].get(userIdStr);
    return value !== undefined ? value : (field === 'deletedForMeMessages' ? [] : 0);
  }
  
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
    const newMap = new Map();
    Object.entries(this[field]).forEach(([key, val]) => {
      newMap.set(key, val);
    });
    newMap.set(userIdStr, value);
    this[field] = newMap;
  }
};

// Method to add message to conversation
conversationSchema.methods.addMessage = async function(messageId) {
  if (!this.messages) {
    this.messages = [];
  }
  this.messages.push(messageId);
  this.lastMessage = messageId;
  this.lastMessageTime = new Date();
  await this.save();
};

// Method to get paginated messages
conversationSchema.methods.getMessages = async function(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return await mongoose.model('Message')
    .find({ conversation: this._id })
    .populate('sender', 'fullName profilePicture email _id')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };