// controllers/conversation.controller.js - COMPLETELY FIXED VERSION
const { Conversation, Message } = require('../models/conversation.model');
const User = require('../models/user.model');

const getAvatarUrl = (profilePicture) => {
  if (!profilePicture) return 'https://via.placeholder.com/150';
  if (profilePicture.startsWith('http')) return profilePicture;
  if (profilePicture.startsWith('/uploads')) {
    return `${process.env.API_URL || 'http://localhost:3000'}${profilePicture}`;
  }
  if (profilePicture.startsWith('uploads/')) {
    return `${process.env.API_URL || 'http://localhost:3000'}/${profilePicture}`;
  }
  return profilePicture;
};

// Helper to check if user is online
const isUserOnline = (req, userId) => {
  const activeUsers = req.app.get('activeUsers');
  return activeUsers ? activeUsers.has(userId.toString()) : false;
};

// Create or get existing conversation
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

    if (userId === sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot start conversation with yourself' 
      });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, sellerId] }
    }).populate('participants', 'fullName profilePicture email');

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, sellerId],
        lastMessageTime: new Date()
      });
      
      conversation.setUserData(userId, 'unreadCount', 0);
      conversation.setUserData(sellerId, 'unreadCount', 0);
      conversation.setUserData(userId, 'archived', false);
      conversation.setUserData(sellerId, 'archived', false);
      
      await conversation.save();
      await conversation.populate('participants', 'fullName profilePicture email');
    }

    // Get the other user info
    const otherUser = conversation.participants.find(p => p._id.toString() !== userId);
    const online = isUserOnline(req, otherUser._id);
    
    // Get existing messages
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'fullName profilePicture email _id')
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => {
      const isOwn = msg.sender._id.toString() === userId;
      const readByArray = Array.isArray(msg.readBy) ? msg.readBy : [];
      const isRead = readByArray.some(id => id.toString() === userId);

      return {
        id: msg._id.toString(),
        senderId: msg.sender._id.toString(),
        text: msg.deletedForAll ? 'This message was deleted' : msg.text,
        sender: msg.sender?.fullName || 'Unknown',
        senderAvatar: getAvatarUrl(msg.sender?.profilePicture),
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestampDate: msg.createdAt,
        isOwn: isOwn,
        read: isRead,
        isDeleted: msg.deletedForAll
      };
    });
    
    res.json({
      success: true,
      data: {
        conversationId: conversation._id.toString(),
        id: conversation._id.toString(),
        userId: otherUser?._id.toString(),
        name: otherUser?.fullName || 'Unknown User',
        avatar: getAvatarUrl(otherUser?.profilePicture),
        status: online ? 'Online' : 'Offline',
        lastMessage: conversation.lastMessage?.text || 'No messages yet',
        time: conversation.lastMessageTime,
        timestampDate: conversation.lastMessageTime,
        unread: 0,
        archived: false,
        messages: formattedMessages,
        pinnedMessages: conversation.pinnedMessages || [],
        deletedForMeMessages: []
      }
    });
  } catch (error) {
    console.error('createConversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'fullName profilePicture email')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });

    const formatted = conversations
      .filter(conv => !conv.getUserData(userId, 'deleted'))
      .map(conv => {
        const otherUser = conv.participants.find(p => p._id.toString() !== userId);
        const online = isUserOnline(req, otherUser._id);

        return {
          id: conv._id.toString(),
          userId: otherUser?._id.toString(),
          name: otherUser?.fullName || 'Unknown User',
          avatar: getAvatarUrl(otherUser?.profilePicture),
          status: online ? 'Online' : 'Offline',
          lastMessage: conv.lastMessage?.text || 'No messages yet',
          time: conv.lastMessageTime || conv.createdAt,
          timestampDate: conv.lastMessageTime || conv.createdAt,
          unread: conv.getUserData(userId, 'unreadCount') || 0,
          archived: conv.getUserData(userId, 'archived') || false,
          messages: [],
          pinnedMessages: conv.pinnedMessages || [],
          deletedForMeMessages: conv.getUserData(userId, 'deletedForMeMessages') || []
        };
      });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'fullName profilePicture email');

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    const isParticipant = conversation.participants.some(p => p._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this conversation' 
      });
    }

    const otherUser = conversation.participants.find(p => p._id.toString() !== userId);
    const online = isUserOnline(req, otherUser._id);

    res.json({
      success: true,
      data: {
        id: conversation._id.toString(),
        userId: otherUser?._id.toString(),
        name: otherUser?.fullName || 'Unknown',
        avatar: getAvatarUrl(otherUser?.profilePicture),
        status: online ? 'Online' : 'Offline',
        messages: [],
        pinnedMessages: conversation.pinnedMessages || [],
        deletedForMeMessages: conversation.getUserData(userId, 'deletedForMeMessages') || []
      }
    });
  } catch (error) {
    console.error('getConversationById error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get messages for a conversation
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

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Fetch all messages for this conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName profilePicture email _id')
      .sort({ createdAt: 1 });

    const deletedForMeMessages = conversation.getUserData(userId, 'deletedForMeMessages') || [];

    const formattedMessages = messages
      .filter(msg => !deletedForMeMessages.some(id => id.toString() === msg._id.toString()))
      .map(msg => {
        const readByArray = Array.isArray(msg.readBy) ? msg.readBy : [];
        const isRead = readByArray.some(id => id.toString() === userId);
        const isOwn = msg.sender._id.toString() === userId;

        return {
          id: msg._id.toString(),
          senderId: msg.sender._id.toString(),
          text: msg.deletedForAll ? 'This message was deleted' : msg.text,
          sender: msg.sender?.fullName || 'Unknown',
          senderAvatar: getAvatarUrl(msg.sender?.profilePicture),
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          timestampDate: msg.createdAt,
          isOwn: isOwn,
          read: isRead,
          isDeleted: msg.deletedForAll
        };
      });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: userId }, 
        readBy: { $nin: [userId] } 
      },
      { $addToSet: { readBy: userId } }
    );

    conversation.setUserData(userId, 'unreadCount', 0);
    await conversation.save();

    // Emit read receipt via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('messages:read', {
        conversationId,
        readBy: userId
      });
    }

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pinnedMessages: conversation.pinnedMessages || [],
        deletedForMeMessages: deletedForMeMessages.map(id => id.toString())
      }
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Send a message - STORES IN DATABASE
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'fullName profilePicture email');

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    const isParticipant = conversation.participants.some(p => p._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // ✅ CREATE AND SAVE MESSAGE TO DATABASE
    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      text: message.trim(),
      readBy: [userId]
    });

    await newMessage.save();
    await newMessage.populate('sender', 'fullName profilePicture email');

    // ✅ UPDATE CONVERSATION
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageTime = new Date();

    // Update unread count for other participants
    conversation.participants.forEach(p => {
      if (p._id.toString() !== userId) {
        const currentCount = conversation.getUserData(p._id.toString(), 'unreadCount') || 0;
        conversation.setUserData(p._id.toString(), 'unreadCount', currentCount + 1);
      }
    });
    
    await conversation.save();

    const messageData = {
      id: newMessage._id.toString(),
      senderId: userId,
      text: newMessage.text,
      sender: newMessage.sender.fullName,
      senderAvatar: getAvatarUrl(newMessage.sender.profilePicture),
      timestamp: new Date(newMessage.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestampDate: newMessage.createdAt,
      isOwn: true,
      read: true
    };

    // Emit via Socket.io to all participants
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('message:received', {
        conversationId,
        message: messageData
      });

      // Send notification to other participants
      const otherParticipants = conversation.participants.filter(p => p._id.toString() !== userId);
      otherParticipants.forEach(participant => {
        io.to(`user:${participant._id}`).emit('notification:new', {
          type: 'message',
          conversationId,
          from: newMessage.sender.fullName,
          preview: message.substring(0, 50),
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      data: {
        message: messageData
      }
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Archive conversation
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

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    conversation.setUserData(userId, 'archived', true);
    await conversation.save();

    res.json({ 
      success: true, 
      message: 'Conversation archived' 
    });
  } catch (error) {
    console.error('archiveConversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error archiving conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Unarchive conversation
exports.unarchiveConversation = async (req, res) => {
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

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    conversation.setUserData(userId, 'archived', false);
    await conversation.save();

    res.json({ 
      success: true, 
      message: 'Conversation unarchived' 
    });
  } catch (error) {
    console.error('unarchiveConversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error unarchiving conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete conversation - FIXED
exports.deleteConversation = async (req, res) => {
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

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Mark as deleted for this user only
    conversation.setUserData(userId, 'deleted', true);
    await conversation.save();

    console.log(`✅ Conversation ${conversationId} marked as deleted for user ${userId}`);

    res.json({ 
      success: true, 
      message: 'Conversation deleted successfully' 
    });
  } catch (error) {
    console.error('deleteConversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (messageIds && Array.isArray(messageIds)) {
      await Message.updateMany(
        { 
          _id: { $in: messageIds },
          conversation: conversationId 
        },
        { $addToSet: { readBy: userId } }
      );
    }

    conversation.setUserData(userId, 'unreadCount', 0);
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('messages:read', {
        conversationId,
        messageIds,
        readBy: userId
      });
    }

    res.json({ 
      success: true, 
      message: 'Messages marked as read' 
    });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId
    });

    const totalUnread = conversations.reduce((total, conv) => {
      if (conv.getUserData(userId, 'deleted')) return total;
      return total + (conv.getUserData(userId, 'unreadCount') || 0);
    }, 0);

    res.json({ 
      success: true, 
      data: { totalUnread } 
    });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Pin/Unpin conversation
exports.pinConversation = async (req, res) => {
  res.json({ success: true, message: 'Pin conversation handled on frontend' });
};

exports.unpinConversation = async (req, res) => {
  res.json({ success: true, message: 'Unpin conversation handled on frontend' });
};