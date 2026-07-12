const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * DELETE /api/admin/purge
 * Secret admin route — wipes ALL messages and users from the database.
 * Protected by ADMIN_SECRET_KEY header or query param.
 *
 * Usage (keep this confidential):
 *   Header:  x-admin-secret: <ADMIN_SECRET_KEY>
 *   OR
 *   Query:   ?secret=<ADMIN_SECRET_KEY>
 */
const purgeAll = async (req, res, next) => {
  try {
    const secret =
      req.headers['x-admin-secret'] || req.query.secret;

    const expectedSecret = process.env.ADMIN_SECRET_KEY;

    if (!expectedSecret) {
      logger.warn('ADMIN_SECRET_KEY is not configured in .env');
      return res.status(503).json({ success: false, message: 'Admin feature not configured' });
    }

    if (!secret || secret !== expectedSecret) {
      logger.warn(`Unauthorized purge attempt from ${req.ip}`);
      // Return 404 to keep the route's existence secret
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    // Perform the purge
    const [msgResult, userResult] = await Promise.all([
      Message.deleteMany({}),
      User.deleteMany({}),
    ]);

    logger.warn(
      `⚠️  ADMIN PURGE executed by ${req.ip} — ` +
      `deleted ${msgResult.deletedCount} messages and ${userResult.deletedCount} users`
    );

    res.status(200).json({
      success: true,
      message: 'All data purged successfully',
      deleted: {
        messages: msgResult.deletedCount,
        users: userResult.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { purgeAll };
