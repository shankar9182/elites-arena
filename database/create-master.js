require('dotenv').config({ path: '../server/.env' });
const User = require('./models/User');
const connectDB = require('./connect');
const bcrypt = require('bcryptjs');

const createOrPromoteMaster = async (name, email, password) => {
    try {
        await connectDB();
        
        let user = await User.findOne({ email });

        if (user) {
            user.role = 'MASTER';
            if (password) {
                user.password = password; // mongoose should handle hashing
            }
            await user.save();
            console.log(`[ELITE-MASTER] Success: ${user.name} promoted to MASTER.`);
        } else {
            if (!password) {
                console.log(`[ELITE-MASTER] Error: User not found. Please provide a password to create a new user.`);
                process.exit(1);
            }
            user = await User.create({
                name,
                email,
                password,
                role: 'MASTER'
            });
            console.log(`[ELITE-MASTER] Success: New MASTER user created: ${user.name}`);
        }
        process.exit(0);
    } catch (error) {
        console.error(`[ELITE-MASTER] Error: ${error.message}`);
        process.exit(1);
    }
};

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node create-master.js <name> <email> [password]');
    console.log('Example (Promote): node create-master.js "Root Men" rootmen@gmail.com');
    console.log('Example (Create):  node create-master.js "Root Men" rootmen@gmail.com MySecretPass123');
    process.exit(1);
}

const [name, email, password] = args;
createOrPromoteMaster(name, email, password);
