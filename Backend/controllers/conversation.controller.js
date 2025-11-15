// controllers/conversation.controller.js
const { Conversation, Message } = require('../models/conversation.model');
const User = require('../models/user.model');

// ✅ START/GET CONVERSATION
exports.createConversation = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.userId;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, sellerId] }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, sellerId],
        lastMessageTime: new Date()
      });
      await conversation.save();
    }

    res.json({
      success: true,
      data: {
        conversationId: conversation._id
      }
    });
  } catch (error) {
    console.error('createConversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation'
    });
  }
};

// ✅ GET ALL CONVERSATIONS FOR USER
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId,
      [`deleted.${userId}`]: { $ne: true }
    })
      .populate('participants', 'fullName profilePicture')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .lean();

    // Format conversations for frontend
    const formatted = conversations.map(conv => {
      const otherUser = conv.participants.find(
        p => p._id.toString() !== userId
      );

      return {
        id: conv._id,
        name: otherUser?.fullName || 'Unknown User',
        avatar: otherUser?.profilePicture || 'https://via.placeholder.com/150',
        status: 'Offline', // You can implement online status later
        lastMessage: conv.lastMessage?.text || 'No messages yet',
        time: conv.lastMessageTime,
        unread: conv.unreadCount?.get(userId) || 0,
        archived: conv.archived?.get(userId) || false
      };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
};

// ✅ GET CONVERSATION BY ID
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'fullName profilePicture')
      .lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const otherUser = conversation.participants.find(
      p => p._id.toString() !== userId
    );

    const formatted = {
      id: conversation._id,
      name: otherUser?.fullName || 'Unknown User',
      avatar: otherUser?.profilePicture || 'https://via.placeholder.com/150',
      status: 'Offline',
      linkedTo: 'Product Inquiry',
      messages: [],
      pinnedMessages: conversation.pinnedMessages || [],
      deletedForMeMessages: conversation.deletedForMeMessages?.get(userId) || []
    };

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('getConversationById error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
};

// ✅ GET MESSAGES
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      deleted: false
    })
      .populate('sender', 'fullName')
      .sort({ createdAt: 1 })
      .lean();

    // Get deleted for me messages
    const deletedForMe = conversation.deletedForMeMessages?.get(userId) || [];

    // Format messages
    const formatted = messages
      .filter(msg => !deletedForMe.some(id => id.toString() === msg._id.toString()))
      .map(msg => ({
        id: msg._id,
        text: msg.deletedForAll ? 'This message was deleted' : msg.text,
        sender: msg.sender?.fullName || 'Unknown',
        timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestampDate: msg.createdAt,
        isOwn: msg.sender._id.toString() === userId,
        read: msg.readBy?.some(id => id.toString() === userId),
        deleted: msg.deletedForAll,
        isDeleted: msg.deletedForAll
      }));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    // Reset unread count
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.json({
      success: true,
      data: {
        messages: formatted,
        pinnedMessages: conversation.pinnedMessages || [],
        deletedForMeMessages: deletedForMe
      }
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

// ✅ SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create message
    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      text: message.trim(),
      readBy: [userId]
    });

    await newMessage.save();

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageTime = new Date();
    
    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    res.json({
      success: true,
      data: {
        message: newMessage
      }
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// ✅ ARCHIVE CONVERSATION
exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.archived.set(userId, true);
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived'
    });
  } catch (error) {
    console.error('archiveConversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive conversation'
    });
  }
};