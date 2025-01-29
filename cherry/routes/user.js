import express from 'express';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// User route to get user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`Attempt to access profile for non-existent user ID: ${userId}`);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        logger.info(`User profile accessed: ${userId}`);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Error accessing user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during profile access'
        });
    }
});

export default router;
