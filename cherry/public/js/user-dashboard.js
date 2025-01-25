import { KeyManagement } from './key-management.js';

// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80 },
        color: { value: '#ffffff' },
        opacity: { value: 0.5 },
        size: { value: 3 },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 6
        }
    }
});

// Helper function to format component names
function formatComponentName(name) {
    return name.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper function to get status color
function getStatusColor(status) {
    const colors = {
        'online': 'text-green-400',
        'operational': 'text-green-400',
        'offline': 'text-red-400',
        'maintenance': 'text-yellow-400',
        'updating': 'text-blue-400',
        'degraded': 'text-orange-400',
        'partial_outage': 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
}

// Update user status display
async function updateUserStatus() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const statusGrid = document.getElementById('statusGrid');
            statusGrid.innerHTML = '';
            
            data.statuses.forEach(status => {
                const statusColor = getStatusColor(status.status);
                const statusCard = `
                    <div class="glass p-6">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="font-bold">${formatComponentName(status.component)}</h4>
                            <span class="${statusColor}">
                                <i class="fas fa-circle mr-1"></i>${status.status}
                            </span>
                        </div>
                        ${status.message ? `<p class="text-sm text-gray-400">${status.message}</p>` : ''}
                    </div>
                `;
                statusGrid.innerHTML += statusCard;
            });
        }
    } catch (error) {
        console.error('Failed to update status:', error);
    }
}

// Check authentication and initialize dashboard
async function initializeDashboard() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Verify token is still valid
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Invalid token');
        }

        // Update UI with user data
        const user = JSON.parse(userData);
        document.getElementById('username').textContent = user.username;
        
        // Show admin panel button if user is admin
        if (user.role === 'admin') {
            document.getElementById('adminPanel').classList.remove('hidden');
        }
        
        // Initialize dashboard components
        updateUserStatus();
        
        // Setup logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });

    } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    KeyManagement.initializeGlobalHandlers();
    initializeKeySystem();
});

async function initializeKeySystem() {
    // Check if user already has a key
    const savedKey = localStorage.getItem('userKey');
    if (savedKey) {
        const validation = await KeyManagement.validateKey(savedKey);
        if (validation.success) {
            showKeyInfo(validation.data);
            return;
        }
    }

    // Show Linkvertise system
    await KeyManagement.verifyLinkvertiseAndGetKey();
}

function showKeyInfo(keyData) {
    const keyContainer = document.getElementById('keyContainer');
    if (keyContainer) {
        keyContainer.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-semibold mb-4 text-white">Your License Key</h3>
                <div id="userKeyDisplay" class="mb-4">
                    <div class="bg-gray-900 p-3 rounded flex justify-between items-center">
                        <code id="userKeyText" class="text-green-400">${localStorage.getItem('userKey')}</code>
                        <button onclick="copyKeyToClipboard()" class="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Copy
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-gray-300">
                    <div>
                        <p class="text-sm text-gray-400">Status</p>
                        <p id="keyStatus" class="font-medium">
                            <span class="${keyData.expired ? 'text-red-400' : 'text-green-400'}">
                                ${keyData.expired ? 'Expired' : 'Active'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Expires</p>
                        <p id="expirationDate" class="font-medium">
                            ${new Date(keyData.expires * 1000).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Type</p>
                        <p id="keyType" class="font-medium">
                            ${keyData.period === 0 ? 'Lifetime' : `${keyData.period} days`}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Machines</p>
                        <p id="machinesUsed" class="font-medium">
                            ${keyData.machinesUsed} / ${keyData.maxNoOfMachines}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Copy key to clipboard
window.copyKeyToClipboard = () => {
    const keyText = document.getElementById('userKeyText');
    if (keyText) {
        navigator.clipboard.writeText(keyText.textContent)
            .then(() => {
                showNotification('Key copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy key:', err);
                showNotification('Failed to copy key', 'error');
            });
    }
};

// Handle Linkvertise completion
window.completeLinkvertise = async (linkIndex) => {
    const completed = await KeyManagement.completeLinkvertise(linkIndex);
    if (completed) {
        showNotification('All links completed! Your key has been generated.', 'success');
    }
}; 