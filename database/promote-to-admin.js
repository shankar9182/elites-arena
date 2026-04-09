require('dotenv').config({ path: '../server/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./connect');

const promoteToAdmin = async (email) => {
    try {
        await connectDB();
        
        const user = await User.findOneAndUpdate(
            { email },
            { role: 'ADMIN' },
            { new: true }
        );

        if (!user) {
            console.log(`[ELITE-PROMO] Error: User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`[ELITE-PROMO] Success: ${user.name} (${user.email}) has been promoted to ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error(`[ELITE-PROMO] Error: ${error.message}`);
        process.exit(1);
    }
};

const emailArg = process.argv[2];
if (!emailArg) {
    console.log('Usage: node promote-to-admin.js <user-email>');
    process.exit(1);
}

promoteToAdmin(emailArg);
