// models/conversation.model.js
const mongoose = require('mongoose');

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
  
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  
  archived: {
    type: Map,
    of: Boolean,
    default: {}
  },
  
  deleted: {
    type: Map,
    of: Boolean,
    default: {}
  },
  
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  
  deletedForMeMessages: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId],
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

// ========================================

// models/message.model.js
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
  
  attachments: [{
    type: String,
    url: String,
    filename: String
  }],
  
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  deleted: {
    type: Boolean,
    default: false
  },
  
  deletedForAll: {
    type: Boolean,
    default: false
  },
  
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };