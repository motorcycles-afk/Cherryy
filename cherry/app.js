import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import keyGenerationRouter from './routes/keyGeneration.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.set('strictQuery', false);
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Routes that don't require auth
app.use('/api/auth', authRouter);

// Routes for key generation and checking
app.use('/api', keyGenerationRouter);  // Includes /api/check/:key endpoint

// Auth check endpoint
app.get('/api/check-auth', authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

// Serve static pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/key-generation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'key-generation.html'));
});

// Protected routes
app.get('/user-dashboard.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user-dashboard.html'));
});

// Default route
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
