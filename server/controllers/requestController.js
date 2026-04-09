const Request = require('../../database/models/Request');
const Notification = require('../../database/models/Notification');
const AccessKey = require('../../database/models/AccessKey');
const crypto = require('crypto');

// @desc    Create a new request (Player)
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
    try {
        const { message, type } = req.body;
        
        // Check if a pending request already exists
        const existingRequest = await Request.findOne({ 
            userId: req.user._id, 
            status: 'PENDING',
            type: type || 'HOST_ACCESS'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request.' });
        }

        const newRequest = await Request.create({
            userId: req.user._id,
            type: type || 'HOST_ACCESS',
            message
        });

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user requests
// @route   GET /api/requests/user
// @access  Private
const getUserRequests = async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getUserRequests = getUserRequests;

// @desc    Get all requests (Master)
// @route   GET /api/requests
// @access  Private/Master
exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject request (Master)
// @route   PUT /api/requests/:id
// @access  Private/Master
exports.updateRequest = async (req, res) => {
    try {
        const { status, adminNote, generateKey } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        request.adminNote = adminNote || '';
        request.updatedAt = Date.now();

        let grantedKey = null;
        if (status === 'APPROVED' && generateKey) {
            const keyString = `EA-HOST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            grantedKey = await AccessKey.create({
                key: keyString,
                useType: 'SINGLE',
                note: `Granted via request from ${request.userId}`,
                createdBy: req.user._id
            });
            request.keyGenerated = keyString;
        }

        await request.save();

        // Create notification for the user
        let notificationMessage = `Your request has been ${status.toLowerCase()}.`;
        if (adminNote) notificationMessage += ` Note: ${adminNote}`;
        if (request.keyGenerated) notificationMessage += ` Your Host Access Key: ${request.keyGenerated}`;

        await Notification.create({
            userId: request.userId,
            title: `Request ${status}`,
            message: notificationMessage,
            type: status === 'APPROVED' ? 'KEY_GRANT' : 'ALERT'
        });

        res.json({ request, key: grantedKey });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
