// Anti Ad-blocker detection and handling
function detectAdBlock() {
    return new Promise((resolve) => {
        // Create a fake ad element
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);

        // Create actual ad containers
        createAdContainers();

        window.setTimeout(() => {
            if (testAd.offsetHeight === 0 && document.querySelector('iframe[data-aa]')?.offsetHeight === 0) {
                console.log('AdBlock detected');
                showAdBlockWarning();
                resolve(true);
            } else {
                console.log('No AdBlock detected');
                resolve(false);
            }
            testAd.remove();
        }, 300);
    });
}

// Enhanced detection methods with debugging
function enhancedAdBlockDetection() {
    return new Promise((resolve) => {
        let detectionPoints = 0;
        const debugInfo = [];

        // Test 1: AdBlock Plus specific test
        const abpBait = document.createElement('div');
        abpBait.innerHTML = '&nbsp;';
        abpBait.className = 'adsbygoogle';
        document.body.appendChild(abpBait);
        
        // Test 2: uBlock specific test
        const ubBait = document.createElement('div');
        ubBait.setAttribute('class', 'banner_ad adsbox');
        document.body.appendChild(ubBait);

        // Test 3: Generic ad script test
        const testScript = document.createElement('script');
        testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        testScript.onerror = () => {
            detectionPoints++;
            debugInfo.push('Ad script load failed');
        };
        document.body.appendChild(testScript);

        // Wait and check
        setTimeout(() => {
            // Check AdBlock Plus bait
            if (window.getComputedStyle(abpBait).display === 'none') {
                detectionPoints++;
                debugInfo.push('ABP bait hidden');
            }

            // Check uBlock bait
            if (ubBait.offsetHeight === 0) {
                detectionPoints++;
                debugInfo.push('uBlock bait hidden');
            }

            // Clean up
            abpBait.remove();
            ubBait.remove();
            testScript.remove();

            // Only detect if we have strong evidence
            const adBlockDetected = detectionPoints >= 2;

            console.log('Debug Info:', {
                detectionPoints,
                checks: debugInfo,
                detected: adBlockDetected
            });

            if (adBlockDetected) {
                console.log('AdBlock detected with confidence');
                restrictWebsiteAccess();
            } else {
                console.log('No AdBlock detected');
                enableWebsiteAccess();
            }
            resolve(adBlockDetected);
        }, 100);
    });
}

// Function to completely restrict website access
function restrictWebsiteAccess() {
    // Remove any existing overlay first
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
        flex-direction: column;
        color: white;
        font-family: Arial, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        text-align: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        max-width: 600px;
        margin: 20px;
    `;
    
    content.innerHTML = `
        <h2 style="color: #ff4444; margin-bottom: 20px;">Ad Blocker Detected</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We've detected that you're using an ad blocker. Our service relies on advertising revenue to stay free.
            Please disable your ad blocker or whitelist our site to continue.
        </p>
        <button onclick="window.location.reload()" style="
            padding: 10px 20px;
            font-size: 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        ">I've Disabled My Ad Blocker</button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Prevent scrolling
    document.body.style.overflow = 'hidden';
}

// Function to enable website access
function enableWebsiteAccess() {
    const overlay = document.getElementById('adblock-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = '';
}

// Initialize detection with retry
function initAdBlockDetection() {
    let retryCount = 0;
    const maxRetries = 2;

    function tryDetection() {
        enhancedAdBlockDetection().then(detected => {
            if (detected && retryCount < maxRetries) {
                // If detected, wait and try again to reduce false positives
                retryCount++;
                console.log(`Retry attempt ${retryCount}...`);
                setTimeout(tryDetection, 1000);
            } else if (!detected) {
                console.log('Site enabled - no ad blocker detected');
            }
        });
    }

    // Add random delay to avoid detection
    setTimeout(tryDetection, Math.random() * 500 + 500);
}

// Start detection on page load
window.addEventListener('load', initAdBlockDetection);

// Function to show warning with more detailed message
function showAdBlockWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'adblock-warning';
    warningDiv.innerHTML = `
        <div class="warning-content">
            <h3>AdBlock Detected</h3>
            <p>We noticed you're using an ad blocker. Our service relies on ads to keep running. Please disable your ad blocker or whitelist our site to continue.</p>
            <button onclick="location.reload()">I've disabled my ad blocker</button>
        </div>
    `;
    document.body.appendChild(warningDiv);

    // Make the website unusable
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '24px';
    overlay.style.fontWeight = 'bold';
    overlay.innerHTML = 'Ad blocker detected. Please disable your ad blocker to continue using our service.';
    document.body.appendChild(overlay);

    // Disable all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
    interactiveElements.forEach(element => {
        element.disabled = true;
        element.style.pointerEvents = 'none';
    });
}

// Function to create ad containers
function createAdContainers() {
    const adPositions = [
        { id: '2378720', size: '728x90' },
        { id: '2378720', size: '728x90' },
        { id: '2378720', size: '728x90' }
    ];

    // Find main content area
    const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
    const children = Array.from(mainContent.children);

    // Calculate positions to insert ads
    const spacing = Math.floor(children.length / (adPositions.length + 1));

    adPositions.forEach((ad, index) => {
        const position = (index + 1) * spacing;
        if (children[position]) {
            const adContainer = document.createElement('div');
            adContainer.className = 'ad-container';
            adContainer.innerHTML = `
                <iframe data-aa='${ad.id}'
                        src='//ad.a-ads.com/${ad.id}?size=${ad.size}'
                        style='width:${ad.size.split('x')[0]}px; height:${ad.size.split('x')[1]}px;
                        border:0px; padding:0; overflow:hidden; background-color: transparent;'>
                </iframe>
            `;
            children[position].parentNode.insertBefore(adContainer, children[position]);
        }
    });
}

// Function to load ads
function loadAds() {
    // Add your ad loading logic here
    console.log('Loading ads...');
    insertAdsDynamically();
}

// Dynamic ad insertion
function insertAdsDynamically() {
    const adPositions = [
        { id: '2378720', size: '728x90' },
        { id: '2378720', size: '728x90' },
        { id: '2378720', size: '728x90' }
    ];

    const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
    const children = Array.from(mainContent.children);

    const spacing = Math.floor(children.length / (adPositions.length + 1));

    adPositions.forEach((ad, index) => {
        const position = (index + 1) * spacing;
        if (children[position]) {
            const adContainer = document.createElement('div');
            adContainer.className = 'ad-container';
            adContainer.innerHTML = `
                <iframe data-aa='${ad.id}'
                        src='//ad.a-ads.com/${ad.id}?size=${ad.size}'
                        style='width:${ad.size.split('x')[0]}px; height:${ad.size.split('x')[1]}px;
                        border:0px; padding:0; overflow:hidden; background-color: transparent;'>
                </iframe>
            `;
            children[position].parentNode.insertBefore(adContainer, children[position]);
        }
    });
}
