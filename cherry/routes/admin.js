const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Notice = require('../models/Notice');
const Status = require('../models/Status'); // Assuming you have a Status model

// Admin dashboard route
router.get('/admin-dashboard', protect, authorize('admin'), (req, res) => {
    res.send('Admin Dashboard');
});

// Create a new notice
router.post('/create-notice', protect, authorize('admin'), async (req, res) => {
    try {
        const { text, type } = req.body;
        const notice = new Notice({ text, type });
        await notice.save();
        res.status(201).json({ success: true, notice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all notices
router.get('/get-notices', protect, async (req, res) => {
    try {
        const notices = await Notice.find();
        res.status(200).json({ success: true, notices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update a notice
router.put('/update-notice/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { text, type } = req.body;
        const notice = await Notice.findByIdAndUpdate(req.params.id, { text, type }, { new: true });
        if (!notice) {
            return res.status(404).json({ success: false, error: 'Notice not found' });
        }
        res.status(200).json({ success: true, notice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a notice
router.delete('/delete-notice/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) {
            return res.status(404).json({ success: false, error: 'Notice not found' });
        }
        res.status(200).json({ success: true, message: 'Notice deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update status message
router.post('/update-status', protect, authorize('admin'), async (req, res) => {
    try {
        const { statusMessage, importantInfo } = req.body;
        let status = await Status.findOne();
        if (!status) {
            status = new Status({ message: statusMessage, importantInfo });
        } else {
            status.message = statusMessage;
            status.importantInfo = importantInfo;
        }
        await status.save();
        res.status(200).json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get status message
router.get('/get-status', protect, async (req, res) => {
    try {
        const status = await Status.findOne();
        res.status(200).json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
