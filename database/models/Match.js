const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    teams: [{
        name: String,
        players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        score: { type: Number, default: 0 },
        isWinner: { type: Boolean, default: false }
    }],
    status: {
        type: String,
        enum: ['PENDING', 'LIVE', 'COMPLETED'],
        default: 'PENDING'
    },
    winner: {
        type: String, // Team name or ID
    },
    resultVerification: {
        status: { type: String, enum: ['UNVERIFIED', 'VERIFIED', 'DISPUTED'], default: 'UNVERIFIED' },
        screenshot: String, // URL to verification image
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/Moderator
    },
    scheduledAt: Date,
    completedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Match', MatchSchema);
