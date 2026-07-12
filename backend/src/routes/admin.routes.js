const express = require('express');
const { purgeAll } = require('../controllers/admin.controller');

const router = express.Router();

// Secret admin route — intentionally undocumented
// DELETE /api/admin/purge
router.delete('/purge', purgeAll);

module.exports = router;
