const express = require('express');
const router = express.Router();
const { Status, Incident } = require('../models/Status');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get current status with all details
router.get('/current', async (req, res) => {
    try {
        const status = await Status.findOne().sort({ createdAt: -1 });
        const incidents = await Incident.find({ 
            status: { $ne: 'resolved' } 
        }).sort({ startTime: -1 });
        
        res.json({ 
            success: true, 
            status,
            activeIncidents: incidents
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch status' });
    }
});

// Get incident history
router.get('/incidents', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const incidents = await Incident.find()
            .sort({ startTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        res.json({
            success: true,
            incidents
        });
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch incidents' });
    }
});

// Update status (admin only)
router.post('/update', [auth, admin], async (req, res) => {
    try {
        const { 
            message, 
            importantInfo, 
            components 
        } = req.body;

        const status = await Status.create({
            message,
            importantInfo,
            components,
            updatedBy: req.user.id
        });

        res.json({
            success: true,
            status
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

module.exports = router;
