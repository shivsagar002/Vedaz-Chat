const express = require('express');
const { login, getUsers } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.get('/users', getUsers);

module.exports = router;
