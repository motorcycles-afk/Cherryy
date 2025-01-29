// Simple notification about ads
function showAdNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #ff4444;
        color: white;
        text-align: center;
        padding: 10px;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    
    notification.innerHTML = `
        Our service relies on ads to stay free. Thank you for your support!
        <span style="margin-left: 10px; cursor: pointer; font-weight: bold;" onclick="this.parentElement.remove()">×</span>
    `;
    
    document.body.appendChild(notification);
}

// Show notification when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAdNotification);
} else {
    showAdNotification();
}
