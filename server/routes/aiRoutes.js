const express = require('express');
const router = express.Router();
const { chat, learn } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/chat', protect, chat);
router.post('/learn', protect, authorize('student'), learn);

module.exports = router;