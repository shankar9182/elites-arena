const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('../database/connect');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Elite Arena API'
    });
});

// Hello Route for testing
app.get('/api/ping', (req, res) => {
    res.json({ message: 'PONG - Backend Operational' });
});

// Auth & User Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));

// Tournament Routes
app.use('/api/tournaments', require('./routes/tournament'));

// Key Management Routes
app.use('/api/keys', require('./routes/key'));

// Request & Notification Routes
app.use('/api/requests', require('./routes/request'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/support', require('./routes/support'));

// --- ADD THIS TO SERVE FRONTEND ---
const path = require('path');

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all: Send any other request to the React app (Must be at the very bottom!)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
// ----------------------------------

// Start Server
app.listen(PORT, () => {
    console.log(`[ELITE-BACKEND] Operational on port ${PORT}`);
    console.log(`Health bridge: http://localhost:${PORT}/api/health`);
});
