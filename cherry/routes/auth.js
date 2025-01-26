import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Helper function to create token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Authorization', `Bearer ${token}`);
    
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            role: user.role
        }
    });
};

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            logger.warn('Registration attempt without username or password');
            return res.status(400).json({
                success: false,
                error: 'Please provide both username and password'
            });
        }

        // Check if user exists
        let user = await User.findOne({ username });
        if (user) {
            logger.warn(`Registration attempt with existing username: ${username}`);
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }

         // Hash password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            username,
            password: hashedPassword,
            role: 'user' // Default role
        });

        logger.info(`New user registered: ${username}`);
        sendTokenResponse(user, 201, res);
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during registration'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Log incoming request
        logger.info('Login attempt for username:', username);

        // Validate username & password
        if (!username || !password) {
            logger.warn('Login attempt without username or password');
            return res.status(400).json({
                success: false,
                error: 'Please provide username and password'
            });
        }

        // Check for user and include password field
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            logger.warn(`Login attempt with non-existent username: ${username}`);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if password matches using the schema method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.warn(`Failed login attempt for user: ${username}`);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        logger.info(`Successful login for user: ${username}`);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// Validate token
router.get('/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            logger.warn('Token validation attempt without token');
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                message: 'Please provide a valid token'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            logger.warn(`Token validation failed: User not found for token`);
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: 'The provided token is invalid or has expired'
            });
        }

        logger.info(`Token validated successfully for user: ${user.username}`);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Token validation error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token',
            message: 'The provided token is invalid or has expired'
        });
    }
});

export default router;
