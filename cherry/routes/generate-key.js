import express from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Cryptolens API configuration
const CRYPTOLENS_CONFIG = {
    BASE_URL: 'https://api.cryptolens.io/api',
    TOKEN: process.env.CRYPTOLENS_TOKEN || 'WyIxMDIxMzQ2NTkiLCJrMVNvb0gyaU9aOCtQZlFYcmswdFVvR05peXpFV3VZU3VMd2diU2w5Il0=',
    PRODUCT_ID: 28722
};

router.post('/generate-key', async (req, res) => {
    const { userId, lootlinksCompleted } = req.body;

    // Validate request
    if (!userId) {
        logger.warn('Key generation attempted without user ID');
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    if (!lootlinksCompleted) {
        logger.warn(`Key generation attempted without completing Lootlinks for user: ${userId}`);
        return res.status(400).json({ 
            success: false, 
            error: 'Please complete all required steps' 
        });
    }

    try {
        // Generate key using Cryptolens API
        const response = await fetch(
            `${CRYPTOLENS_CONFIG.BASE_URL}/key/CreateKey?` + 
            `token=${CRYPTOLENS_CONFIG.TOKEN}&` +
            `ProductId=${CRYPTOLENS_CONFIG.PRODUCT_ID}&` +
            'Period=1&F1=False&F2=False&F3=False&F4=False&F5=False&' +
            'F6=False&F7=False&F8=False&Notes=Generated via Cherry&' +
            'Block=False&TrialActivation=True&MaxNoOfMachines=1&' +
            `CustomerId=${userId}&AllowActivationManagement=True`
        );

        if (!response.ok) {
            throw new Error('Failed to generate key');
        }

        const key = await response.text();
        logger.info(`Successfully generated key for user: ${userId}`);

        res.json({ 
            success: true, 
            key,
            expiresIn: '24 hours',
            maxMachines: 1
        });
    } catch (error) {
        logger.error('Key generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate key. Please try again.' 
        });
    }
});

export default router;
