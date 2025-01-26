import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { logger, requestLogger } from './utils/logger.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app instance
const api = express();

// Middleware
api.use(cors());
api.use(express.json());
api.use(requestLogger);

// Serve static files from the public directory
api.use(express.static(path.join(__dirname, 'public')));

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import statusRoutes from './routes/status.js';

// Mount routes
api.use('/api/auth', authRoutes);
api.use('/api/admin', adminRoutes);
api.use('/api/user', userRoutes);
api.use('/api/status', statusRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    logger.info('MongoDB connected successfully');
}).catch(err => {
    logger.error('MongoDB connection error:', err);
    throw err;
});

// Error handling middleware
api.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Handle 404 errors
api.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

export default api;
