const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    game: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'],
        default: 'UPCOMING'
    },
    prizePool: {
        type: Number,
        default: 0
    },
    entryFee: {
        type: Number,
        default: 0
    },
    slots: {
        total: { type: Number, required: true },
        booked: { type: Number, default: 0 }
    },
    startTime: {
        type: Date,
        required: true
    },
    platform: {
        type: String,
        default: 'PC/PLATFORM'
    },
    description: String,
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        slotIndex: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tournament', TournamentSchema);
