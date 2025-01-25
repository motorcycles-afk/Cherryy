const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { logger, requestLogger } = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    // Only send error response for API routes
    if (req.path.startsWith('/api/')) {
        res.status(err.status || 500).json({
            success: false,
            error: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
        });
    } else {
        next(err);
    }
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Set strictQuery option
mongoose.set('strictQuery', true);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Server running on port 3000'));
}).catch(err => console.log(err));

// Create default admin account
async function createDefaultAdmin() {
    try {
        const User = require('./models/User');

        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            // Create default admin account
            const admin = new User({
                username: 'admin',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
                role: 'admin'
            });
            await admin.save();
            console.log('Default admin account created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

createDefaultAdmin();
