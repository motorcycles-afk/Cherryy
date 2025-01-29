// Import CRYPTOLENS_API configuration
import { CRYPTOLENS_API } from './key-management.js';

// Initialize particles.js (keep existing particles config)

// Admin Panel Functions
const adminFunctions = {
    updateStatus: async (component, newStatus) => {
        try {
            const message = document.querySelector('#statusMessage').value;
            const visibility = document.querySelector('#messageVisibility').value;
            
            const response = await fetch('/api/admin/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    component,
                    status: newStatus,
                    message,
                    visibility
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showNotification(`${component} status updated to ${newStatus}`, 'success');
                updateSystemStatus();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showNotification(`Failed to update status: ${error.message}`, 'error');
        }
    },

    updateMessage: async () => {
        const component = document.querySelector('#messageComponent').value;
        const message = document.querySelector('#statusMessage').value;
        const visibility = document.querySelector('#messageVisibility').value;

        try {
            const response = await fetch('/api/admin/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    component,
                    message,
                    visibility
                })
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Status message updated', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showNotification(`Failed to update message: ${error.message}`, 'error');
        }
    },

    generateKey: async () => {
        try {
            const period = document.getElementById('keyPeriod').value;
            const maxMachines = document.getElementById('maxMachines').value;
            
            if (!period || !maxMachines) {
                throw new Error('Please fill in all required fields');
            }

            const url = new URL(`${CRYPTOLENS_API.BASE_URL}/key/CreateKey`);
            url.searchParams.append('token', CRYPTOLENS_API.TOKEN);
            url.searchParams.append('ProductId', CRYPTOLENS_API.PRODUCT_ID);
            url.searchParams.append('Period', period);
            url.searchParams.append('F1', 'False');
            url.searchParams.append('F2', 'False');
            url.searchParams.append('F3', 'False');
            url.searchParams.append('F4', 'False');
            url.searchParams.append('F5', 'False');
            url.searchParams.append('F6', 'False');
            url.searchParams.append('F7', 'False');
            url.searchParams.append('F8', 'False');
            url.searchParams.append('Notes', 'Generated from admin panel');
            url.searchParams.append('Block', 'False');
            url.searchParams.append('CustomerId', '0');
            url.searchParams.append('TrialActivation', 'False');
            url.searchParams.append('MaxNoOfMachines', maxMachines);
            url.searchParams.append('NoOfKeys', '1');
            url.searchParams.append('format', 'json');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.result === 0 && data.key) {
                const keyDisplay = document.getElementById('generatedKey');
                const keyText = document.getElementById('keyText');
                keyDisplay.classList.remove('hidden');
                keyText.textContent = data.key;
                
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + parseInt(period));
                showNotification(`Key generated successfully! Expires: ${expirationDate.toLocaleDateString()} | Max Machines: ${maxMachines}`, 'success');
            } else {
                throw new Error(data.message || 'Failed to generate key');
            }
        } catch (error) {
            console.error('Key generation error:', error);
            showNotification(`Failed to generate key: ${error.message}`, 'error');
        }
    },

    copyKey: () => {
        const keyText = document.getElementById('keyText').textContent;
        navigator.clipboard.writeText(keyText)
            .then(() => {
                alert('Key copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy key:', err);
                alert('Failed to copy key');
            });
    }
};

// Update system status display
async function updateSystemStatus() {
    try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        if (data.success) {
            data.statuses.forEach(status => {
                const statusElement = document.querySelector(`[data-status="${status.component}"]`);
                if (statusElement) {
                    const statusClass = status.status === 'online' || status.status === 'operational' 
                        ? 'text-green-400' 
                        : 'text-red-400';
                    
                    statusElement.innerHTML = `
                        <i class="fas fa-circle"></i> ${status.status}
                    `;
                    statusElement.className = statusClass;
                }
            });
        }
    } catch (error) {
        console.error('Failed to update system status:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateSystemStatus();
    
    // Add click handlers for status toggle buttons
    document.querySelectorAll('[data-status-toggle]').forEach(button => {
        button.addEventListener('click', (e) => {
            const component = e.target.dataset.component;
            const currentStatus = e.target.dataset.currentStatus;
            const newStatus = currentStatus === 'online' ? 'offline' : 'online';
            
            adminFunctions.updateStatus(component, newStatus);
        });
    });
}); 