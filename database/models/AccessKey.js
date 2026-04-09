const mongoose = require('mongoose');

const AccessKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    useType: {
        type: String,
        enum: ['SINGLE', 'MULTI'],
        default: 'SINGLE'
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    note: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AccessKey', AccessKeySchema);
