// API Configurations
const CRYPTOLENS_API = {
    BASE_URL: 'https://api.cryptolens.io/api',
    TOKEN: 'WyIxMDIxMzQ2NTkiLCJrMVNvb0gyaU9aOCtQZlFYcmswdFVvR05peXpFV3VZU3VMd2diU2w5Il0=',
    PRODUCT_ID: 28722
};

// Linkvertise configuration
const LINKVERTISE_CONFIG = {
    ANTI_BYPASS_TOKEN: 'd295691dd15818e4a2aa35399c4db784eada7dd53afa569e9722ba7d7a748433'
};

// Track verification progress
let currentStep = 0;

// Make KeyManagement available globally
window.KeyManagement = class {
    static async validateKey(key) {
        try {
            if (!key || typeof key !== 'string') {
                throw new Error('Please enter a valid license key');
            }

            const response = await fetch('/api/validate-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    key: key,
                    machineId: this.getMachineCode()
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    data: {
                        expires: data.data.expires,
                        period: 1, // 1 day for generated keys
                        maxNoOfMachines: data.data.maxNoOfMachines,
                        machinesUsed: data.data.machinesUsed,
                        expired: Date.now() > data.data.expires,
                        created: Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
                    }
                };
            }

            throw new Error(data.error || 'Invalid license key');
        } catch (error) {
            console.error('Key validation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to validate key'
            };
        }
    }

    static getMachineCode() {
        // Generate a unique machine ID (you might want to make this more sophisticated)
        let machineId = localStorage.getItem('machineId');
        if (!machineId) {
            machineId = 'CHERRY-' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('machineId', machineId);
        }
        return machineId;
    }

    static formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static updateKeyInfo(keyData) {
        const keyInfo = document.getElementById('keyInfo');
        const keyStatus = document.getElementById('keyStatus');
        const expirationDate = document.getElementById('expirationDate');
        const keyType = document.getElementById('keyType');
        const machinesUsed = document.getElementById('machinesUsed');

        keyInfo.classList.remove('hidden');
        keyStatus.classList.remove('hidden');

        // Update expiration
        const expires = new Date(keyData.expires * 1000);
        expirationDate.textContent = expires.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Update key type
        const daysLeft = Math.ceil((expires - new Date()) / (1000 * 60 * 60 * 24));
        keyType.textContent = keyData.period === 0 ? 'Lifetime' : `${daysLeft} days remaining`;

        // Update machines count
        machinesUsed.textContent = `${keyData.machinesUsed} / ${keyData.maxNoOfMachines}`;

        // Update status indicator
        const statusSpan = keyStatus.querySelector('span');
        if (keyData.expired) {
            statusSpan.className = 'px-3 py-1 rounded text-sm bg-red-500/20 text-red-400';
            statusSpan.textContent = 'Expired';
        } else {
            statusSpan.className = 'px-3 py-1 rounded text-sm bg-green-500/20 text-green-400';
            statusSpan.textContent = 'Active';
        }
    }

    static async verifyLinkvertiseAndGetKey() {
        try {
            // Track completion in localStorage with timestamps
            let linkProgress = JSON.parse(localStorage.getItem('linkvertiseProgress') || '{"step": 0, "links": [], "currentLink": null, "startTime": null}');
            const requiredLinks = 3;
            
            // Show progress
            const progressElement = document.getElementById('linkProgress');
            if (progressElement) {
                progressElement.textContent = `${linkProgress.step}/${requiredLinks} links completed`;
            }

            // If all links completed, make request to get key
            if (linkProgress.step >= requiredLinks) {
                const response = await fetch('/api/get-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completedLinks: linkProgress.links,
                        verificationData: linkProgress
                    })
                });

                const data = await response.json();
                if (data.success && data.key) {
                    // Display the key to the user
                    const keyDisplay = document.getElementById('userKeyDisplay');
                    const keyText = document.getElementById('userKeyText');
                    if (keyDisplay && keyText) {
                        keyDisplay.classList.remove('hidden');
                        keyText.textContent = data.key;
                    }
                    // Clear progress
                    localStorage.removeItem('linkvertiseProgress');
                    return true;
                }
            }

            // Show current step
            const linksContainer = document.getElementById('linkvertiseLinks');
            if (linksContainer) {
                if (!linkProgress.currentLink || !linkProgress.startTime) {
                    // Generate new link if there isn't one or if too much time has passed
                    linksContainer.innerHTML = `
                        <div class="text-center">
                            <button onclick="window.KeyManagement.startLinkvertiseProcess()" 
                                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Start Link ${linkProgress.step + 1}
                            </button>
                        </div>
                    `;
                } else {
                    // Show verification page if link is active
                    const timeElapsed = (Date.now() - linkProgress.startTime) / 1000;
                    const minTimeRequired = 15; // Minimum time in seconds required on Linkvertise

                    if (timeElapsed < minTimeRequired) {
                        linksContainer.innerHTML = `
                            <div class="text-center">
                                <p class="text-yellow-400 mb-4">Please complete the Linkvertise process</p>
                                <p class="text-sm text-gray-400">Time remaining: ${Math.ceil(minTimeRequired - timeElapsed)}s</p>
                                <a href="${linkProgress.currentLink}" target="_blank" 
                                    class="inline-block px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Return to Linkvertise
                                </a>
                            </div>
                        `;
                    } else {
                        linksContainer.innerHTML = `
                            <div class="text-center">
                                <p class="text-green-400 mb-4">You can now verify this link</p>
                                <button onclick="window.KeyManagement.verifyCurrentLink()"
                                    class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                    Verify Completion
                                </button>
                            </div>
                        `;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('Error in Linkvertise verification:', error);
            return false;
        }
    }

    static async startLinkvertiseProcess() {
        try {
            // Request new Linkvertise link from server
            const response = await fetch('/api/generate-linkvertise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LINKVERTISE_CONFIG.ANTI_BYPASS_TOKEN}`
                },
                body: JSON.stringify({
                    step: JSON.parse(localStorage.getItem('linkvertiseProgress') || '{"step": 0}').step
                })
            });

            const data = await response.json();
            if (data.success && data.link) {
                // Save progress
                let progress = JSON.parse(localStorage.getItem('linkvertiseProgress') || '{"step": 0, "links": [], "currentLink": null, "startTime": null}');
                progress.currentLink = data.link;
                progress.startTime = Date.now();
                localStorage.setItem('linkvertiseProgress', JSON.stringify(progress));

                // Open Linkvertise in new tab
                window.open(data.link, '_blank');
                
                // Update UI
                this.verifyLinkvertiseAndGetKey();
            } else {
                throw new Error('Failed to generate Linkvertise link');
            }
        } catch (error) {
            console.error('Error starting Linkvertise process:', error);
            showNotification('Failed to start Linkvertise process. Please try again.', 'error');
        }
    }

    static async verifyCurrentLink() {
        try {
            let progress = JSON.parse(localStorage.getItem('linkvertiseProgress') || '{"step": 0, "links": [], "currentLink": null, "startTime": null}');
            
            // Verify with Linkvertise API
            const response = await fetch('/api/verify-linkvertise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LINKVERTISE_CONFIG.ANTI_BYPASS_TOKEN}`
                },
                body: JSON.stringify({
                    link: progress.currentLink,
                    startTime: progress.startTime,
                    step: progress.step,
                    user_id: LINKVERTISE_CONFIG.USER_ID
                })
            });

            const data = await response.json();
            if (data.success) {
                // Update progress
                progress.links.push({
                    link: progress.currentLink,
                    completedAt: Date.now(),
                    timeSpent: Date.now() - progress.startTime
                });
                progress.step += 1;
                progress.currentLink = null;
                progress.startTime = null;
                localStorage.setItem('linkvertiseProgress', JSON.stringify(progress));

                showNotification(`Link ${progress.step} completed successfully!`, 'success');
                this.verifyLinkvertiseAndGetKey();
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Error verifying link:', error);
            showNotification(error.message || 'Failed to verify link completion', 'error');
        }
    }

    // Make methods available globally for button onclick handlers
    static initializeGlobalHandlers() {
        window.KeyManagement = {
            startLinkvertiseProcess: this.startLinkvertiseProcess.bind(this),
            verifyCurrentLink: this.verifyCurrentLink.bind(this)
        };
    }
}

// Function to start verification step
window.startVerification = async function() {
    try {
        // Get current progress
        const progress = parseInt(localStorage.getItem('verifyProgress') || '0');
        
        if (progress >= 3) {
            // Check if we can get a key
            const response = await fetch('/api/linkvertise/check-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    progress: progress
                })
            });

            const data = await response.json();
            if (data.success && data.completed) {
                // Show key
                const keyDisplay = document.getElementById('keyDisplay');
                keyDisplay.classList.remove('hidden');
                keyDisplay.innerHTML = `
                    <div class="bg-gray-800 p-4 rounded">
                        <p class="text-green-400 mb-2">Your key has been generated:</p>
                        <code class="text-white">${data.key}</code>
                    </div>
                `;
                // Clear progress
                localStorage.removeItem('verifyProgress');
                showNotification('Key generated successfully!', 'success');
                return;
            }
        }

        // Open verification page in new tab
        const verifyUrl = `/verify.html?step=${progress + 1}`;
        const newTab = window.open(verifyUrl, '_blank');
        if (newTab) {
            showNotification('Verification page opened in new tab', 'info');
        } else {
            showNotification('Please allow popups to continue verification', 'error');
        }
    } catch (error) {
        console.error('Error starting verification:', error);
        showNotification('Failed to start verification. Please try again.', 'error');
    }
}

// Function to check progress when returning to dashboard
window.checkProgress = function() {
    const progress = parseInt(localStorage.getItem('verifyProgress') || '0');
    const progressElement = document.getElementById('linkProgress');
    if (progressElement) {
        progressElement.textContent = `${progress}/3 steps completed`;
    }

    // Update button text
    const verifyButton = document.getElementById('verifyButton');
    if (verifyButton) {
        if (progress >= 3) {
            verifyButton.textContent = 'Generate Key';
        } else {
            verifyButton.textContent = `Start Step ${progress + 1}`;
        }
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize key management
    const redeemKeyForm = document.getElementById('redeemKeyForm');
    
    if (redeemKeyForm) {
        redeemKeyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const licenseKey = document.getElementById('licenseKey').value.trim();
            const result = await KeyManagement.validateKey(licenseKey);
            
            if (result.success) {
                KeyManagement.updateKeyInfo(result.data);
                // Store the key in localStorage
                localStorage.setItem('licenseKey', licenseKey);
            } else {
                alert(result.error);
            }
        });
    }

    // Check for existing key
    const existingKey = localStorage.getItem('licenseKey');
    if (existingKey) {
        document.getElementById('licenseKey').value = existingKey;
        KeyManagement.validateKey(existingKey);
    }

    // Initialize verification button
    const verifyButton = document.getElementById('verifyButton');
    if (verifyButton) {
        verifyButton.addEventListener('click', window.startVerification);
    }

    // Check initial progress
    window.checkProgress();
}); 