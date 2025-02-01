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
    static currentLinkStep = 0;
    static pageStartTime = 0;
    static minimumTimeRequired = 50; // seconds
    static originalUrls = [
        'https://discord.com/invite/cherry',
        'https://youtube.com/@cherry',
        'https://github.com/cherry'
    ];

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
        // Reset and start page timer
        this.pageStartTime = Date.now();
        
        try {
            // Generate first short link
            await this.generateShortLink(this.originalUrls[0], 0);
            
            // Show verify button but disable it initially
            const button = document.querySelector('#verifyButton');
            button.style.display = 'block';
            button.disabled = true;
            
            // Start the page timer
            this.startPageTimer(button);
            
            return true;
        } catch (error) {
            console.error('Error starting process:', error);
            throw error;
        }
    }

    static startPageTimer(button) {
        const timerDiv = document.querySelector('#cooldownTimer');
        let timeSpent = 0;
        
        const timer = setInterval(() => {
            timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
            const timeRemaining = this.minimumTimeRequired - timeSpent;
            
            if (timeRemaining > 0) {
                timerDiv.innerHTML = `
                    <div class="text-yellow-400 text-center mt-2">
                        <i class="fas fa-clock"></i> Please wait <span class="font-bold">${timeRemaining}</span> seconds before verifying
                    </div>
                `;
            } else {
                clearInterval(timer);
                button.disabled = false;
                timerDiv.innerHTML = `
                    <div class="text-green-400 text-center mt-2">
                        <i class="fas fa-check-circle"></i> You can now verify this link!
                    </div>
                `;
            }
        }, 1000);
    }

    static async verifyCurrentLink() {
        try {
            const button = document.querySelector('#verifyButton');
            const statusDiv = document.querySelector('#verificationStatus');
            const timerDiv = document.querySelector('#cooldownTimer');
            
            // Check if minimum time has elapsed
            const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
            if (timeSpent < this.minimumTimeRequired) {
                const timeRemaining = this.minimumTimeRequired - timeSpent;
                statusDiv.innerHTML = `
                    <div class="text-yellow-400">
                        <i class="fas fa-clock"></i> Please wait ${timeRemaining} seconds before verifying
                    </div>
                `;
                return;
            }
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            
            const key = localStorage.getItem('lastGeneratedKey');
            if (!key) {
                throw new Error('No key found');
            }

            const response = await fetch(`/api/verify-link/${this.currentLinkStep}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    key,
                    timeSpent 
                })
            });

            const data = await response.json();

            if (!data.success) {
                if (response.status === 429) {
                    // Handle cooldown period
                    button.innerHTML = 'Verify Link';
                    this.startCooldownTimer(data.remainingTime, button, timerDiv);
                    statusDiv.innerHTML = `
                        <div class="text-yellow-400">
                            <i class="fas fa-clock"></i> ${data.error}
                        </div>
                    `;
                } else {
                    throw new Error(data.error);
                }
                return;
            }

            // Update UI for success
            statusDiv.innerHTML = `
                <div class="text-green-400">
                    <i class="fas fa-check-circle"></i> Link verified successfully!
                </div>
            `;
            
            // Move to next step
            this.currentLinkStep = data.nextStep;
            
            // Update progress
            const progress = (this.currentLinkStep / this.originalUrls.length) * 100;
            document.querySelector('.progress-fill').style.width = `${progress}%`;
            
            // Reset page timer for next link
            this.pageStartTime = Date.now();
            
            // Enable button for next step if not finished
            if (this.currentLinkStep < this.originalUrls.length) {
                button.disabled = true; // Disable until minimum time passes
                button.innerHTML = 'Verify Next Link';
                // Generate next link and start timer
                await this.generateShortLink(this.originalUrls[this.currentLinkStep], this.currentLinkStep);
                this.startPageTimer(button);
            } else {
                button.innerHTML = 'All Links Verified!';
                statusDiv.innerHTML = `
                    <div class="text-green-400">
                        <i class="fas fa-check-circle"></i> All links verified! Generating your key...
                    </div>
                `;
                // Start key generation process
                await this.generateCryptolensKey();
            }
        } catch (error) {
            console.error('Error verifying link:', error);
            const statusDiv = document.querySelector('#verificationStatus');
            statusDiv.innerHTML = `
                <div class="text-red-400">
                    <i class="fas fa-times-circle"></i> ${error.message}
                </div>
            `;
            const button = document.querySelector('#verifyButton');
            button.disabled = false;
            button.innerHTML = 'Try Again';
        }
    }

    static startCooldownTimer(remainingSeconds, button, timerDiv) {
        let timeLeft = remainingSeconds;
        button.disabled = true;

        const updateTimer = () => {
            timerDiv.innerHTML = `
                <div class="text-yellow-400 text-center mt-2">
                    <i class="fas fa-clock"></i> Next verification available in <span class="font-bold">${timeLeft}</span> seconds
                </div>
            `;
        };

        updateTimer(); // Initial display
        const timer = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                clearInterval(timer);
                button.disabled = false;
                timerDiv.innerHTML = `
                    <div class="text-green-400 text-center mt-2">
                        <i class="fas fa-check-circle"></i> You can now verify the next link!
                    </div>
                `;
                // Clear the success message after 3 seconds
                setTimeout(() => {
                    timerDiv.innerHTML = '';
                }, 3000);
            }
        }, 1000);
    }

    static async generateShortLink(url, step) {
        try {
            console.log('Generating short link for:', url);
            const encodedUrl = encodeURIComponent(url);
            
            // Generate a short alias (max 12 chars)
            // Use last 4 digits of timestamp + random 3 letters + step number
            const timestamp = Date.now().toString().slice(-4);
            const randomStr = Math.random().toString(36).substring(2, 5);
            const alias = `c${timestamp}${randomStr}${step}`.toLowerCase();
            
            console.log('Generated alias:', alias);
            
            // Using our proxy endpoint
            const response = await fetch(`/api/generate-short-link?url=${encodedUrl}&alias=${alias}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            console.log('Cuty.io response:', data);
            
            if (data.status === 'error') {
                throw new Error(data.message || 'Failed to generate short link');
            }
            
            return data.shortenedUrl;
        } catch (error) {
            console.error('Error generating short link:', error);
            throw new Error('Failed to generate link. Please try again.');
        }
    }

    static async generateCryptolensKey() {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    urls: this.originalUrls || []
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to generate key');
            }

            // Store key and expiration time
            localStorage.setItem('lastGeneratedKey', data.key);
            localStorage.setItem('keyExpiresAt', data.expiresAt);
            
            return data.key;
        } catch (error) {
            console.error('Error generating Cryptolens key:', error);
            throw new Error('Failed to generate key. Please try again.');
        }
    }

    static async checkKeyStatus(key) {
        try {
            const response = await fetch(`/api/check/${key}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'  // Important for cookies
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to check key status');
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to check key status');
            }
            return data;
        } catch (error) {
            console.error('Error checking key status:', error);
            throw error;
        }
    }

    static formatTimeLeft(ms) {
        if (ms <= 0) return 'Expired';
        
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);

        let timeString = '';
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;

        return timeString.trim();
    }

    static async verifyLinkCompletion() {
        try {
            const shortUrl = localStorage.getItem(`shortUrl_${this.currentLinkStep}`);
            if (!shortUrl) {
                throw new Error('No link found for current step');
            }

            // Get the button that was clicked
            const button = event.target;
            const originalButtonHtml = button.innerHTML;
            
            // Disable the button and show loading state
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Verifying...';

            try {
                // Add a small delay for UX
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Clear the stored URL and proceed
                localStorage.removeItem(`shortUrl_${this.currentLinkStep}`);
                this.currentLinkStep++;
                await this.startKeyGeneration();
            } catch (error) {
                console.error('Error verifying link:', error);
                button.disabled = false;
                button.innerHTML = originalButtonHtml;
                throw new Error('Please visit the link before continuing');
            }
        } catch (error) {
            console.error('Error in link verification:', error);
            alert(error.message || 'Error verifying link completion. Please try again.');
        }
    }

    static async startKeyGeneration() {
        try {
            const keyInfoDiv = document.getElementById('keyInfo');
            if (!keyInfoDiv) {
                throw new Error('Key info div not found');
            }

            // Hide the start button if it exists
            const startButton = document.querySelector('button[onclick="KeyManagement.startKeyGeneration()"]');
            if (startButton) {
                startButton.style.display = 'none';
            }

            if (this.currentLinkStep >= 3) {
                // All links completed, generate key
                keyInfoDiv.innerHTML = '<div class="glass p-4 rounded-lg"><p class="text-center">Generating your key...</p></div>';
                const key = await this.generateCryptolensKey();
                
                // Get key expiration time
                const expiresAt = localStorage.getItem('keyExpiresAt');
                const timeLeft = new Date(expiresAt) - Date.now();
                const formattedTime = this.formatTimeLeft(timeLeft);
                
                keyInfoDiv.innerHTML = `
                    <div class="glass p-4 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-green-400 text-center">✅ Key Generated Successfully!</h3>
                        <p class="mb-2 text-center">Your key: <span class="text-green-400 font-mono">${key}</span></p>
                        <p class="mb-4 text-center text-yellow-400">⚠️ Key expires in: ${formattedTime}</p>
                        <div class="flex space-x-2 mt-4">
                            <button onclick="navigator.clipboard.writeText('${key}')" class="nav-btn">
                                <i class="fas fa-copy"></i> Copy Key
                            </button>
                            <button onclick="KeyManagement.resetAndStart()" class="nav-btn">
                                <i class="fas fa-redo"></i> Generate Another
                            </button>
                        </div>
                    </div>
                `;
                this.currentLinkStep = 0;
                return;
            }

            // Show loading state
            keyInfoDiv.innerHTML = '<div class="glass p-4 rounded-lg"><p class="text-center">Generating link...</p></div>';

            // Generate next Cuty.io short link
            const shortUrl = await this.generateShortLink(this.originalUrls[this.currentLinkStep], this.currentLinkStep);
            console.log('Generated short URL:', shortUrl);
            
            // Store the short URL for verification
            localStorage.setItem(`shortUrl_${this.currentLinkStep}`, shortUrl);

            keyInfoDiv.innerHTML = `
                <div class="glass p-4 rounded-lg">
                    <h3 class="text-xl font-bold mb-4 text-center">Step ${this.currentLinkStep + 1} of 3</h3>
                    <div class="mb-4">
                        <div class="flex items-center justify-center mb-2">
                            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                                ${this.currentLinkStep + 1}
                            </div>
                            <span>Complete this link to continue</span>
                        </div>
                        <div class="h-1 bg-blue-500 rounded-full" style="width: ${((this.currentLinkStep + 1) / 3) * 100}%"></div>
                    </div>
                    <div class="flex flex-col space-y-4">
                        <a href="${shortUrl}" target="_blank" class="nav-btn inline-block text-center" id="openLinkBtn">
                            <i class="fas fa-external-link-alt mr-2"></i> Open Link in New Tab
                        </a>
                        <button onclick="KeyManagement.verifyLinkCompletion()" class="nav-btn bg-green-600 hover:bg-green-700" disabled id="verifyBtn">
                            <i class="fas fa-check mr-2"></i> I've Completed the Link
                        </button>
                    </div>
                </div>
            `;

            // Enable verify button only after link is clicked
            const openLinkBtn = document.getElementById('openLinkBtn');
            const verifyBtn = document.getElementById('verifyBtn');
            
            if (openLinkBtn && verifyBtn) {
                openLinkBtn.addEventListener('click', () => {
                    verifyBtn.disabled = false;
                });
            }

        } catch (error) {
            console.error('Error in key generation process:', error);
            const keyInfoDiv = document.getElementById('keyInfo');
            if (keyInfoDiv) {
                keyInfoDiv.innerHTML = `
                    <div class="glass p-4 rounded-lg text-red-400">
                        <h3 class="text-xl font-bold mb-4 text-center">❌ Error</h3>
                        <p class="mb-4 text-center">${error.message}</p>
                        <button onclick="KeyManagement.resetAndStart()" class="nav-btn">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                `;
            }
        }
    }

    static resetAndStart() {
        this.currentLinkStep = 0;
        this.startKeyGeneration();
    }

    static initializeGlobalHandlers() {
        console.log('Key management initialized');
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    KeyManagement.initializeGlobalHandlers();
});