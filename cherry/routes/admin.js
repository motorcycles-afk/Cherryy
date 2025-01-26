import express from 'express';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Admin route to update user status
router.post('/update-status', async (req, res) => {
    try {
        const { userId, status } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`Attempt to update status for non-existent user ID: ${userId}`);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user status
        user.status = status;
        await user.save();

        logger.info(`User status updated: ${userId} - ${status}`);
        res.status(200).json({
            success: true,
            message: 'User status updated successfully'
        });
    } catch (error) {
        logger.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during status update'
        });
    }
});

export default router;
