const express = require('express');
const router = express.Router();
const { generateKey, getAllKeys, revokeKey } = require('../controllers/keyController');
const { protect, admin } = require('../middleware/auth');

router.post('/generate', protect, admin, generateKey);
router.get('/', protect, admin, getAllKeys);
router.put('/revoke/:id', protect, admin, revokeKey);

module.exports = router;
