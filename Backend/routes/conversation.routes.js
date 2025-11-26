const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const verifyToken = require('../middlewares/auth.middleware');

// ✅ All routes require authentication
router.post('/', verifyToken, conversationController.createConversation);
router.get('/', verifyToken, conversationController.getConversations);
router.get('/:conversationId', verifyToken, conversationController.getConversationById);
router.get('/:conversationId/messages', verifyToken, conversationController.getMessages);
router.post('/:conversationId/messages', verifyToken, conversationController.sendMessage);
router.patch('/:conversationId/archive', verifyToken, conversationController.archiveConversation);
router.patch('/:conversationId/unarchive', verifyToken, conversationController.unarchiveConversation);
router.delete('/:conversationId', verifyToken, conversationController.deleteConversation);
router.patch('/:conversationId/pin', verifyToken, conversationController.pinConversation);
router.patch('/:conversationId/unpin', verifyToken, conversationController.unpinConversation);
router.patch('/:conversationId/read', verifyToken, conversationController.markAsRead);
router.get('/unread/count', verifyToken, conversationController.getUnreadCount);

module.exports = router;
