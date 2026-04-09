const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['PLAYER', 'ADMIN', 'MASTER'],
        default: 'PLAYER'
    },
    sector: {
        type: String,
        default: 'SEC-01'
    },
    avatar: {
        type: String,
        default: 'generic'
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    nextLevelXp: {
        type: Number,
        default: 1000
    },
    banner: {
        type: String,
        default: 'default'
    },
    frame: {
        type: String,
        default: 'none'
    },
    rank: {
        type: String,
        default: 'RECRUIT'
    },
    stats: {
        tournamentsPlayed: { type: Number, default: 0 },
        victories: { type: Number, default: 0 },
        winRate: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 }
    },
    achievements: [{
        id: String,
        unlockedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
