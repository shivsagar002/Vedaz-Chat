const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * GET /api/messages
 * Fetch chat history for a room with pagination
 */
const getMessages = async (req, res, next) => {
  try {
    const { room = 'general', page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments({ room });

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages
 * Persist a message to the database (also used by socket handler)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { sender, content, room = 'general' } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ success: false, message: 'sender and content are required' });
    }

    const message = await Message.create({ sender, content, room });
    logger.info(`Message saved from ${sender} in room ${room}`);

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/messages/read
 * Mark messages as read by a user
 */
const markMessagesRead = async (req, res, next) => {
  try {
    const { room = 'general', username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'username is required' });
    }

    // Update messages not sent by this user and not yet read by them
    await Message.updateMany(
      { room, sender: { $ne: username }, readBy: { $nin: [username] } },
      { $addToSet: { readBy: username }, $set: { status: 'read' } }
    );

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage, markMessagesRead };
