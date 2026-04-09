const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequest, getUserRequests } = require('../controllers/requestController');
const { protect, admin } = require('../middleware/auth');

// Note: 'admin' middleware was updated to allow 'MASTER' role as well
router.post('/', protect, createRequest);
router.get('/user', protect, getUserRequests);
router.get('/', protect, admin, getRequests);
router.put('/:id', protect, admin, updateRequest);

module.exports = router;
