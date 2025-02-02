import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Ticket from '../models/Ticket.js';
import { protect as auth } from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads/tickets'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

// Create a new ticket
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
    try {
        const ticket = new Ticket({
            ...req.body,
            createdBy: req.user._id,
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                path: file.path
            })) : []
        });
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all tickets (admin)
router.get('/admin', [auth, admin], async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ createdBy: req.user._id })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific ticket
router.get('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('comments.author', 'name email');
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        if (!req.user.isAdmin && ticket.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ticket (admin only)
router.patch('/:id', [auth, admin], async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add comment to ticket
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        ticket.comments.push({
            content: req.body.content,
            author: req.user._id
        });
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete ticket (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
