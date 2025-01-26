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

// Create Express app instance for serverless
const api = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://getcherry.vercel.app',
  'https://cherryy-4erdtau8k-motorcycles-afks-projects.vercel.app',
  'https://cherryy-okja.onrender.com'
];

api.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization']
}));

// Add OPTIONS handling for preflight requests
api.options('*', cors());

api.use(express.json());
api.use(requestLogger);

// Serve static files from the public directory
api.use(express.static(path.join(__dirname, 'public')));

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';

// Mount routes
api.use('/api/auth', authRoutes);
api.use('/api/admin', adminRoutes);
api.use('/api/user', userRoutes);

// Error handling middleware
api.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    // Send error response
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

// Set strictQuery option
mongoose.set('strictQuery', true);

// Ensure required environment variables are present
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    logger.error('MongoDB URI is not defined in environment variables');
    throw new Error('MongoDB URI is required. Please set MONGO_URI environment variable.');
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    logger.info('MongoDB connected successfully');
}).catch(err => {
    logger.error('MongoDB connection error:', err);
    throw err;
});

// Create default admin account
async function createDefaultAdmin() {
    try {
        const User = (await import('./models/User.js')).default;

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

// Export the Express API
export default api;
