const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: './server/.env'});

async function reset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('password123', salt);
        await mongoose.connection.db.collection('users').updateOne({email: 'roy@gmail.com'}, {$set: {password: hashed}});
        console.log('RESET_SUCCESS: roy@gmail.com password is now password123');
        
        // Also ensure shankar@gmail.com, free@gmail.com, rootmen@gmail.com are also reset
        const emails = ['shankar@gmail.com', 'free@gmail.com', 'rootmen@gmail.com'];
        for (const email of emails) {
            await mongoose.connection.db.collection('users').updateOne({email}, {$set: {password: hashed}});
            console.log(`RESET_SUCCESS: ${email} password is now password123`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

reset();
