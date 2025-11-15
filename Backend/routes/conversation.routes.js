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

module.exports = router;