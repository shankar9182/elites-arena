const AccessKey = require('../../database/models/AccessKey');
const crypto = require('crypto');

// @desc    Generate a new access key
// @route   POST /api/keys/generate
// @access  Private/Admin
exports.generateKey = async (req, res) => {
    try {
        const { useType, note } = req.body;
        const key = `EA-HOST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const accessKey = await AccessKey.create({
            key,
            useType: useType || 'SINGLE',
            note: note || '',
            createdBy: req.user._id
        });

        res.status(201).json(accessKey);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all access keys
// @route   GET /api/keys
// @access  Private/Admin
exports.getAllKeys = async (req, res) => {
    try {
        const keys = await AccessKey.find()
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Revoke an access key
// @route   PUT /api/keys/revoke/:id
// @access  Private/Admin
exports.revokeKey = async (req, res) => {
    try {
        const key = await AccessKey.findById(req.params.id);
        if (!key) return res.status(404).json({ message: 'Key not found' });

        key.isRevoked = true;
        await key.save();

        res.json({ message: 'Key revoked successfully', key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
