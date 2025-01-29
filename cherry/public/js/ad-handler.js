// Simple and reliable ad block detection
function detectAdBlock() {
    return new Promise((resolve) => {
        let adBlockEnabled = false;
        let checkComplete = false;

        // Create test ad
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbygoogle';
        document.body.appendChild(testAd);

        // Check if ad is hidden
        setTimeout(() => {
            const isBlocked = testAd.offsetHeight === 0 || 
                            testAd.offsetParent === null || 
                            window.getComputedStyle(testAd).display === 'none';
            
            if (isBlocked && !checkComplete) {
                adBlockEnabled = true;
                console.log('AdBlock detected - element blocked');
            }
            
            // Clean up
            testAd.remove();
            checkComplete = true;

            if (adBlockEnabled) {
                showBlockedOverlay();
            }
            resolve(adBlockEnabled);
        }, 100);
    });
}

function showBlockedOverlay() {
    // Remove any existing overlay
    const existingOverlay = document.getElementById('adblock-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'adblock-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    overlay.innerHTML = `
        <div style="
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            color: white;
            max-width: 500px;
        ">
            <h2 style="color: #ff4444; margin-bottom: 20px; font-size: 24px;">Please Disable Your Ad Blocker</h2>
            <p style="margin-bottom: 20px; line-height: 1.6;">
                We've detected that you're using an ad blocker. Our service relies on ads to stay free.
                Please disable your ad blocker or whitelist our site to continue.
            </p>
            <button onclick="location.reload()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">I've Disabled My Ad Blocker</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

// Initialize detection
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(detectAdBlock, 1000);
    });
} else {
    setTimeout(detectAdBlock, 1000);
}
