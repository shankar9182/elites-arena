const User = require('../../database/models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register a new user (Player or Host/Admin)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, accountType, hostKey } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine role — only grant ADMIN if hostKey matches server secret
        let role = 'PLAYER';
        if (accountType === 'HOST') {
            const AccessKey = require('../../database/models/AccessKey');
            const validDbKey = await AccessKey.findOne({ key: hostKey.trim(), isRevoked: false });
            const expectedSecret = process.env.HOST_SECRET || 'ELITEARENA_HOST_2026';

            if (validDbKey || hostKey === expectedSecret) {
                role = 'ADMIN';
                // Deactivate single-use keys
                if (validDbKey && validDbKey.useType === 'SINGLE') {
                    validDbKey.isRevoked = true;
                    await validDbKey.save();
                }
            } else {
                return res.status(403).json({ message: 'Invalid or revoked host key. Access denied.' });
            }
        }

        // Create user
        const user = await User.create({ name, email: normalizedEmail, password, role });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.avatar = req.body.avatar || user.avatar;
            
            // Only update email if provided and different
            if (req.body.email && req.body.email.toLowerCase() !== user.email) {
                const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
                user.email = req.body.email.toLowerCase();
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                level: updatedUser.level,
                xp: updatedUser.xp,
                sector: updatedUser.sector,
                rank: updatedUser.rank
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
