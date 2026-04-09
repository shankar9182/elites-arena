const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['HOST_ACCESS', 'SUPPORT', 'OTHER'],
        default: 'HOST_ACCESS'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    message: {
        type: String,
        required: true
    },
    adminNote: {
        type: String,
        default: ''
    },
    keyGenerated: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Request', RequestSchema);
