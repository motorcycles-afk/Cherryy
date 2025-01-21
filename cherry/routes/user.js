const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Status = require('../models/Status');

// Get public system status
router.get('/status', protect, async (req, res) => {
    try {
        const statuses = await Status.find({ visibility: 'public' });
        res.json({ success: true, statuses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 