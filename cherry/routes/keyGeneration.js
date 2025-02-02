import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Key from '../models/Key.js';
import User from '../models/User.js';
import fetch from 'node-fetch';

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Generate key route - no authentication required
router.post('/generate', async (req, res) => {
    try {
        const { urls } = req.body;

        // Generate a random key
        const key = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
        
        // Set expiration to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create new key document
        const newKey = new Key({
            key,
            expiresAt,
            urls: urls || []
        });

        // Save with proper write concern
        await newKey.save({ writeConcern: { w: 1, j: true } });

        res.json({
            success: true,
            key,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Error generating key:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate key' 
        });
    }
});

// Check key status route (protected)
router.get('/check/:key', authMiddleware, async (req, res) => {
    try {
        const keyValue = req.params.key;
        const key = await Key.findOne({ key: keyValue });

        if (!key) {
            return res.status(404).json({
                success: false,
                error: 'Key not found'
            });
        }

        // Check if key has expired
        if (key.expiresAt < new Date()) {
            return res.json({
                success: true,
                status: 'expired',
                expiresAt: key.expiresAt
            });
        }

        res.json({
            success: true,
            status: 'active',
            expiresAt: key.expiresAt,
            urls: key.urls || []
        });
    } catch (error) {
        console.error('Error checking key:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check key status'
        });
    }
});

// Redeem key
router.post('/redeem', async (req, res) => {
    try {
        const { key: keyValue } = req.body;
        const key = await Key.findOne({ key: keyValue });

        if (!key) {
            return res.json({
                success: false,
                error: 'Key not found'
            });
        }

        if (key.isExpired()) {
            return res.json({
                success: false,
                error: 'Key has expired',
                isExpired: true
            });
        }

        if (key.isUsed) {
            return res.json({
                success: false,
                error: 'Key has already been used'
            });
        }

        // Mark key as used
        key.isUsed = true;
        await key.save();

        res.json({
            success: true,
            message: 'Key redeemed successfully'
        });

    } catch (error) {
        console.error('Error redeeming key:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to redeem key'
        });
    }
});

// Verify link completion route
router.post('/verify-link/:step', async (req, res) => {
    try {
        const { step } = req.params;
        const { key, timeSpent } = req.body;
        const stepNum = parseInt(step);
        const minimumTimeRequired = 50; // seconds
        
        if (!key) {
            return res.status(400).json({
                success: false,
                error: 'Key is required'
            });
        }

        // Check minimum time spent
        if (!timeSpent || timeSpent < minimumTimeRequired) {
            return res.status(400).json({
                success: false,
                error: `You must spend at least ${minimumTimeRequired} seconds on the page`,
                remainingTime: minimumTimeRequired - (timeSpent || 0)
            });
        }

        // Find the key
        const keyDoc = await Key.findOne({ key });
        if (!keyDoc) {
            return res.status(404).json({
                success: false,
                error: 'Key not found'
            });
        }

        // Check if this step was already verified
        const existingVerification = keyDoc.linkVerifications.find(v => v.step === stepNum);
        if (existingVerification) {
            return res.status(400).json({
                success: false,
                error: 'This step was already verified'
            });
        }

        // Get the last verification
        const lastVerification = keyDoc.linkVerifications
            .sort((a, b) => b.timestamp - a.timestamp)[0];

        // Check cooldown period (50 seconds between verifications)
        if (lastVerification) {
            const cooldownPeriod = 50 * 1000; // 50 seconds in milliseconds
            const timeSinceLastVerification = Date.now() - new Date(lastVerification.timestamp).getTime();
            
            if (timeSinceLastVerification < cooldownPeriod) {
                const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastVerification) / 1000);
                return res.status(429).json({
                    success: false,
                    error: `Please wait ${remainingTime} seconds before verifying the next link`,
                    remainingTime
                });
            }
        }

        // Add verification with time spent
        keyDoc.linkVerifications.push({
            step: stepNum,
            timestamp: new Date(),
            ipAddress: req.ip,
            timeSpent
        });

        await keyDoc.save();

        res.json({
            success: true,
            message: 'Link verified successfully',
            nextStep: stepNum + 1
        });
    } catch (error) {
        console.error('Error verifying link:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify link'
        });
    }
});

// Proxy endpoint for Cuty.io
router.get('/generate-short-link', async (req, res) => {
    try {
        const { url, alias } = req.query;
        if (!url) {
            return res.status(400).json({ status: 'error', message: 'URL is required' });
        }

        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://cuty.io/api?api=9881c9e87938fa5c7f22d70d3d36b1ef13d5b6e6&url=${encodedUrl}${alias ? `&alias=${alias}` : ''}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Error generating short link:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate short link' });
    }
});

export default router;
