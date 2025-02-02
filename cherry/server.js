import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { logger, requestLogger } from './utils/logger.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { inject } from '@vercel/analytics';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import keyGenerationRoutes from './routes/keyGeneration.js';
import shortLinkRoutes from './routes/shortLink.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app instance
const api = express();

// Enable Vercel Analytics in production
if (process.env.NODE_ENV === 'production') {
    inject();
}

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://getcherry.vercel.app', process.env.VERCEL_URL].filter(Boolean)
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

api.use(cors(corsOptions));
api.use(express.json());
api.use(cookieParser());
api.use(requestLogger);

// Security headers
api.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// Rate limiting for production
if (process.env.NODE_ENV === 'production') {
    const rateLimit = (await import('express-rate-limit')).default;
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    api.use(limiter);
}

// Serve static files from the public directory
api.use(express.static(path.join(__dirname, 'public')));

// Mount routes
api.use('/api/auth', authRoutes);
api.use('/api/admin', adminRoutes);
api.use('/api/user', userRoutes);
api.use('/api/keys', keyGenerationRoutes);
api.use('/api', shortLinkRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}).then(() => {
    logger.info('MongoDB connected successfully');
}).catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
});

// Error handling middleware
api.use((err, req, res, next) => {
    logger.error('Global error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON payload'
        });
    }

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred'
            : err.message
    });
});

// Handle 404 - Route not found
api.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Start server
const PORT = process.env.PORT || 3000;
api.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default api;
