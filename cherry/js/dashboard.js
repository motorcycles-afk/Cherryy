// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ff6b6b' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ff6b6b',
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        }
    },
    retina_detect: true
});

// Admin Panel Functions
const adminFunctions = {
    updateStatus: async (component, status) => {
        try {
            const response = await fetch('/api/admin/update-status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ component, status })
            });
            const data = await response.json();
            if (data.success) {
                showNotification(`${component} status updated successfully!`, 'success');
                updateSystemStatus();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showNotification(`Failed to update status: ${error.message}`, 'error');
        }
    },

    blacklistKey: async (key) => {
        try {
            const response = await fetch('/api/admin/blacklist-key.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Key blacklisted successfully!', 'success');
                updateKeyStats();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showNotification(`Failed to blacklist key: ${error.message}`, 'error');
        }
    },

    updateWebhook: async (url) => {
        try {
            const response = await fetch('/api/admin/update-webhook.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Webhook updated successfully!', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showNotification(`Failed to update webhook: ${error.message}`, 'error');
        }
    }
};

// Notification function using SweetAlert2
function showNotification(message, type = 'info') {
    Swal.fire({
        text: message,
        icon: type,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#ffffff'
    });
}

// Update system status display
async function updateSystemStatus() {
    try {
        const response = await fetch('/api/admin/get-status.php');
        const data = await response.json();
        
        Object.entries(data).forEach(([component, status]) => {
            const statusElement = document.querySelector(`[data-status="${component}"]`);
            if (statusElement) {
                statusElement.innerHTML = `<i class="fas fa-circle"></i> ${status}`;
                statusElement.className = `text-${status === 'online' || status === 'active' ? 'green' : 'red'}-400`;
            }
        });
    } catch (error) {
        console.error('Failed to update system status:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    updateSystemStatus();
    
    // Add event listeners to all admin action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const component = e.target.dataset.component;
            const status = e.target.dataset.status;
            
            if (adminFunctions[action]) {
                adminFunctions[action](component, status);
            }
        });
    });

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Implement logout logic
        // window.location.href = 'index.html';
    });
}); 