const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Status = require('../models/Status');
const User = require('../models/User');

// Get all system statuses (including private)
router.get('/status', protect, authorize('admin'), async (req, res) => {
    try {
        const statuses = await Status.find();
        res.json({ success: true, statuses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update system status
router.post('/update-status', protect, authorize('admin'), async (req, res) => {
    try {
        const { component, status, message, visibility } = req.body;
        
        const updatedStatus = await Status.findOneAndUpdate(
            { component },
            { status, message, visibility, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json({ success: true, status: updatedStatus });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user statistics
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const stats = {
            totalUsers,
            activeUsers: Math.floor(totalUsers * 0.8), // Example statistic
            premiumUsers: Math.floor(totalUsers * 0.3), // Example statistic
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 