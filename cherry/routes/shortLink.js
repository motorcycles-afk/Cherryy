import express from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Generate short link using Cuty.io API
router.get('/generate-short-link', async (req, res) => {
    try {
        const { url, alias } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: 'error',
                message: 'URL parameter is required'
            });
        }

        // Using Cuty.io API
        const response = await fetch('https://cuty.io/api/v1/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CUTY_API_KEY || 'your-cuty-api-key'}`
            },
            body: JSON.stringify({
                url: decodeURIComponent(url),
                alias: alias || undefined
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            logger.error('Cuty.io API error:', data);
            return res.status(response.status).json({
                status: 'error',
                message: data.message || 'Failed to generate short link'
            });
        }

        res.json({
            status: 'success',
            shortenedUrl: data.shortLink
        });
    } catch (error) {
        logger.error('Error generating short link:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

export default router;
