const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    avatar: String
}, { strict: false });

// Disable buffering to fail fast if connection isn't ready
mongoose.set('bufferCommands', false);

const User = mongoose.model('UserFix', UserSchema, 'users');

const VALID_AVATARS = [
    'Sentinel',
    'assassin',
    'droid',
    'generic',
    'generic2',
    'generic3',
    'goblin',
    'hacker',
    'hunter',
    'jonathan',
    'mage',
    'ninja',
    'pilot',
    'samurai',
    'scout',
    'soldier',
    'vr_gamer',
    'warrior'
];

const fixAvatars = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
        });
        console.log('Connected.');

        console.log('Fetching users...');
        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking avatars...`);

        let updatedCount = 0;

        for (const user of users) {
            if (!VALID_AVATARS.includes(user.avatar)) {
                console.log(`User [${user.name}] has invalid avatar: "${user.avatar}". Resetting to "generic".`);
                await User.updateOne({ _id: user._id }, { $set: { avatar: 'generic' } });
                updatedCount++;
            }
        }

        console.log(`\nScan complete.`);
        console.log(`Users updated: ${updatedCount}`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

fixAvatars();
