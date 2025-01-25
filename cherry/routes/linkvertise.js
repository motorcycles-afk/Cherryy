const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Linkvertise API configuration
const LINKVERTISE_CONFIG = {
    ANTI_BYPASS_TOKEN: 'd295691dd15818e4a2aa35399c4db784eada7dd53afa569e9722ba7d7a748433'
};

// In-memory storage
const activeTokens = new Map();
const generatedKeys = new Map();
const completedSteps = new Map();

// Generate a temporary page with Linkvertise script
router.get('/generate-page/:step', (req, res) => {
    const step = req.params.step;
    const returnUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/user-dashboard.html`;

    // Generate HTML with Linkvertise script
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Verification Step ${step}</title>
            <style>
                body {
                    background: #111827;
                    color: white;
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    background: rgba(31, 41, 55, 0.5);
                    padding: 2rem;
                    border-radius: 0.5rem;
                    backdrop-filter: blur(10px);
                }
                .loading {
                    margin-top: 1rem;
                    color: #9CA3AF;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Step ${step} of 3</h2>
                <p class="loading">Loading verification...</p>
            </div>
            <script src="https://publisher.linkvertise.com/cdn/linkvertise.js"></script>
            <script>
                linkvertise(1282136, {
                    whitelist: [], 
                    blacklist: [""],
                    antiBypassToken: '${LINKVERTISE_CONFIG.ANTI_BYPASS_TOKEN}'
                });

                // Listen for completion
                window.addEventListener('linkvertise-success', () => {
                    // Update progress in localStorage
                    let progress = parseInt(localStorage.getItem('verifyProgress') || '0');
                    progress++;
                    localStorage.setItem('verifyProgress', progress);
                    
                    // Redirect back to dashboard
                    window.location.href = '${returnUrl}';
                });
            </script>
        </body>
        </html>
    `;

    res.send(html);
});

// Check progress and generate key if complete
router.post('/check-progress', async (req, res) => {
    try {
        const progress = parseInt(req.body.progress || '0');
        
        if (progress >= 3) {
            // Generate key using CryptoLens
            const keyResponse = await fetch('https://api.cryptolens.io/api/key/CreateKey?' + new URLSearchParams({
                token: 'WyIxMDIxMzQ2NTkiLCJrMVNvb0gyaU9aOCtQZlFYcmswdFVvR05peXpFV3VZU3VMd2diU2w5Il0=',
                ProductId: '28722',
                Period: '1',
                F1: 'False',
                F2: 'False',
                F3: 'False',
                F4: 'False',
                F5: 'False',
                F6: 'False',
                F7: 'False',
                F8: 'False',
                Notes: 'Generated through Linkvertise verification',
                Block: 'False',
                CustomerId: '0',
                TrialActivation: 'True',
                MaxNoOfMachines: '1',
                NoOfKeys: '1',
                format: 'plaintext'
            }));

            const key = await keyResponse.text();
            
            // Save the key
            await saveKeyToDatabase(key, {
                generatedAt: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                maxMachines: 1,
                used: false
            });

            res.json({
                success: true,
                completed: true,
                key: key
            });
        } else {
            res.json({
                success: true,
                completed: false,
                progress: progress
            });
        }
    } catch (error) {
        console.error('Error checking progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check progress'
        });
    }
});

// Database helper functions
async function saveKeyToDatabase(key, metadata) {
    generatedKeys.set(key, {
        ...metadata,
        machines: []
    });
}

async function getKeyFromDatabase(key) {
    return generatedKeys.get(key);
}

async function updateKeyUsage(key, machineId) {
    const keyData = generatedKeys.get(key);
    if (keyData && !keyData.machines.includes(machineId)) {
        keyData.machines.push(machineId);
        generatedKeys.set(key, keyData);
    }
}

module.exports = router; 