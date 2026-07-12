const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Dummy login — creates or retrieves user by username
 */
const login = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const trimmed = username.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 2 and 30 characters',
      });
    }

    // Upsert: create if not exists, else return existing
    let user = await User.findOne({ username: trimmed });
    if (!user) {
      user = await User.create({ username: trimmed });
      logger.info(`New user registered: ${trimmed}`);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/users
 * Fetch all users and their online status
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username isOnline lastSeen').sort({ isOnline: -1, username: 1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getUsers };
