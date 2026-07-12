const express = require('express');
const { getMessages, sendMessage, markMessagesRead } = require('../controllers/message.controller');

const router = express.Router();

router.get('/', getMessages);
router.post('/', sendMessage);
router.patch('/read', markMessagesRead);

module.exports = router;
