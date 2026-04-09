require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./database/models/User');

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elites_arena');
        const user = await User.findOne({ email: 'final@example.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        user.password = 'password123'; // The pre-save hook will hash it
        await user.save();
        
        console.log('Password reset successful for final@example.com');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetPassword();
