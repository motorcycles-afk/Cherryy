import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Check if user exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username already exists' 
            });
        }

        // Create new user
        user = new User({
            username,
            password  // Store password as plain text as requested
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            success: true,
            token,
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during registration' 
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        // Compare plain text passwords
        if (password !== user.password) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({
            success: true,
            token,
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during login' 
        });
    }
});

// Check auth status
router.get('/check', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        logger.error('Auth check error:', error);
        res.status(401).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
});

export default router;
