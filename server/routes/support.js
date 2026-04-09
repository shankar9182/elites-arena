const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesForUser, getAllConversations } = require('../controllers/supportController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, admin, getAllConversations);
router.get('/', protect, getMessagesForUser);
router.get('/:userId', protect, getMessagesForUser);

module.exports = router;
