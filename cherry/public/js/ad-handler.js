// Anti Ad-blocker detection and handling
function detectAdBlock() {
    return new Promise((resolve) => {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        
        window.setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                console.log('AdBlock detected');
                showAdBlockWarning();
                resolve(true);
            } else {
                console.log('No AdBlock detected');
                resolve(false);
            }
            testAd.remove();
        }, 100);
    });
}

function showAdBlockWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'adblock-warning';
    warningDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; background: #ff4444; color: white; 
                    padding: 10px; text-align: center; z-index: 9999; font-weight: bold;">
            Please disable your ad blocker to support us and continue using our service.
        </div>
    `;
    document.body.prepend(warningDiv);
}

// Check for ad blocker on page load
window.addEventListener('load', detectAdBlock);

// Function to reposition ads
function repositionAds() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        // Add some margin and center the ad
        container.style.margin = '20px auto';
        container.style.textAlign = 'center';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.maxWidth = '100%';
        container.style.overflow = 'hidden';
    });
}

// Initialize ad positioning
window.addEventListener('load', repositionAds);
