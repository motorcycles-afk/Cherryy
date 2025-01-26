import express from 'express';
import { Status, Incident } from '../models/Status.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

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
        
        const count = await Incident.countDocuments();
        
        res.json({
            success: true,
            incidents,
            totalPages: Math.ceil(count / limit),
            currentPage: page
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
            overallStatus,
            components = [],
            metrics = {},
            maintenanceWindows = []
        } = req.body;

        if (!message || !importantInfo) {
            return res.status(400).json({ success: false, error: 'Required fields missing' });
        }

        const status = new Status({
            message,
            importantInfo,
            overallStatus,
            components,
            metrics,
            maintenanceWindows
        });

        await status.save();
        res.json({ success: true, status });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

// Create new incident (admin only)
router.post('/incidents', [auth, admin], async (req, res) => {
    try {
        const {
            title,
            description,
            severity,
            affectedComponents
        } = req.body;

        const incident = new Incident({
            title,
            description,
            severity,
            affectedComponents,
            updates: [{
                message: description,
                status: 'investigating'
            }]
        });

        await incident.save();
        res.json({ success: true, incident });
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(500).json({ success: false, error: 'Failed to create incident' });
    }
});

// Update incident (admin only)
router.patch('/incidents/:id', [auth, admin], async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            message,
            resolvedTime
        } = req.body;

        const incident = await Incident.findById(id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        if (status) incident.status = status;
        if (resolvedTime) incident.resolvedTime = resolvedTime;
        
        if (message) {
            incident.updates.push({
                message,
                status: status || incident.status
            });
        }

        await incident.save();
        res.json({ success: true, incident });
    } catch (error) {
        console.error('Error updating incident:', error);
        res.status(500).json({ success: false, error: 'Failed to update incident' });
    }
});

// Schedule maintenance (admin only)
router.post('/maintenance', [auth, admin], async (req, res) => {
    try {
        const {
            title,
            description,
            scheduledStart,
            scheduledEnd
        } = req.body;

        const status = await Status.findOne().sort({ createdAt: -1 });
        if (!status) {
            return res.status(404).json({ success: false, error: 'Status not found' });
        }

        status.maintenanceWindows.push({
            title,
            description,
            scheduledStart: new Date(scheduledStart),
            scheduledEnd: new Date(scheduledEnd)
        });

        await status.save();
        res.json({ success: true, status });
    } catch (error) {
        console.error('Error scheduling maintenance:', error);
        res.status(500).json({ success: false, error: 'Failed to schedule maintenance' });
    }
});

export default router;
