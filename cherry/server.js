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

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://cherryy-4erdtau8k-motorcycles-afks-projects.vercel.app', 'https://getcherry.vercel.app', 'http://localhost:3000', 'https://cherryy-okja.onrender.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
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
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import registerRoutes from './api/auth/register.js';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth/register', registerRoutes);

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
