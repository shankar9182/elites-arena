require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./database/models/User');

const resetPassword = async (email, newPassword) => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elites_arena';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB:', uri);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            console.log(`User ${email} not found`);
        } else {
            console.log(`Password reset for ${user.name} (${user.email})`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword('rootmen@gmail.com', 'password123');
