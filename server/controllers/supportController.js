const SupportMessage = require('../../database/models/Support');
const User = require('../../database/models/User');

// @desc    Send a support message
// @route   POST /api/support
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { message, userId, adminId, senderRole } = req.body;

        const newMessage = await SupportMessage.create({
            userId: userId || req.user._id,
            adminId: adminId || null,
            message,
            senderRole: senderRole || (req.user.role === 'PLAYER' ? 'PLAYER' : 'ADMIN'),
            timestamp: Date.now()
        });

        res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get support messages for a user
// @route   GET /api/support/:userId
// @access  Private
exports.getMessagesForUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;

        const messages = await SupportMessage.find({ userId })
            .sort({ timestamp: 1 })
            .populate('userId', 'name avatar')
            .populate('adminId', 'name avatar');

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all unique player conversations (Admin only)
// @route   GET /api/support/conversations
// @access  Private/Admin
exports.getAllConversations = async (req, res) => {
    try {
        const conversations = await SupportMessage.aggregate([
            {
                $addFields: {
                    userId_obj: { $toObjectId: "$userId" }
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: '$userId_obj',
                    lastMessage: { $first: '$message' },
                    lastSender: { $first: '$senderRole' },
                    timestamp: { $first: '$timestamp' },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ['$senderRole', 'PLAYER'] }, { $eq: ['$read', false] }] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    lastSender: 1,
                    timestamp: 1,
                    unreadCount: 1,
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    avatar: '$userDetails.avatar'
                }
            },
            {
                $sort: { timestamp: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
