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

        // Using Cuty.io Legacy API
        const apiUrl = `https://cuty.io/api?api=9881c9e87938fa5c7f22d70d3d36b1ef13d5b6e6&url=${encodeURIComponent(url)}${alias ? `&alias=${alias}` : ''}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: data.message || 'Failed to generate short link'
            });
        }

        res.json({
            status: 'success',
            shortenedUrl: data.shortenedUrl
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
