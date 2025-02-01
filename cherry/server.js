import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { logger, requestLogger } from './utils/logger.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { inject } from "@vercel/analytics";

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
import keyGenerationRoutes from './routes/keyGeneration.js';

// Mount routes
api.use('/api/auth', authRoutes);
api.use('/api/admin', adminRoutes);
api.use('/api/user', userRoutes);
api.use('/api/keys', keyGenerationRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    logger.info('MongoDB connected successfully');
}).catch((error) => {
    logger.error('MongoDB connection error:', error);
});

// Error handling middleware
api.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
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

// Start server
const PORT = process.env.PORT || 3000;
api.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

inject();

export default api;
