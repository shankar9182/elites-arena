require('dotenv').config({ path: '../server/.env' });
const User = require('./models/User');
const connectDB = require('./connect');

const promoteToMaster = async (email) => {
    try {
        await connectDB();
        
        const user = await User.findOneAndUpdate(
            { email },
            { role: 'MASTER' },
            { new: true }
        );

        if (!user) {
            console.log(`[ELITE-MASTER] Error: User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`[ELITE-MASTER] Success: ${user.name} (${user.email}) has been promoted to MASTER.`);
        process.exit(0);
    } catch (error) {
        console.error(`[ELITE-MASTER] Error: ${error.message}`);
        process.exit(1);
    }
};

const emailArg = process.argv[2];
if (!emailArg) {
    console.log('Usage: node promote-to-master.js <user-email>');
    process.exit(1);
}

promoteToMaster(emailArg);
