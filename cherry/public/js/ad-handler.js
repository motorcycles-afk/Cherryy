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

// Enhanced detection methods with specific checks for popular ad blockers
function enhancedAdBlockDetection() {
    return new Promise((resolve) => {
        let detectionPoints = 0;
        const checks = [];

        // Test 1: Multiple bait elements with common ad blocker targets
        const baitClasses = [
            'ad', 'ads', 'adsbox', 'doubleclick', 'ad-placement',
            'ad-placeholder', 'adbadge', 'BannerAd', 'sponsorad',
            'adsbygoogle', 'banner-ads', 'ad-banner', 'ad_wrapper'
        ];

        baitClasses.forEach(className => {
            const bait = document.createElement('div');
            bait.className = className;
            bait.style.cssText = 'position:absolute;left:-999px;top:-999px;width:1px;height:1px;';
            document.body.appendChild(bait);
            
            if (window.getComputedStyle(bait).display === 'none' 
                || bait.offsetHeight === 0 
                || bait.offsetParent === null) {
                detectionPoints++;
            }
            bait.remove();
        });

        // Test 2: Check for common ad scripts
        const adScripts = [
            '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
            '//ads.example.com/ads.js',
            '//partner.googleadservices.com/gampad/ads',
            '//securepubads.g.doubleclick.net/tag/js/gpt.js'
        ];

        adScripts.forEach(script => {
            const testScript = document.createElement('script');
            testScript.src = script;
            testScript.onerror = () => detectionPoints++;
            document.body.appendChild(testScript);
            setTimeout(() => testScript.remove(), 100);
        });

        // Test 3: Check for ad network domains
        const adNetworks = [
            'google-analytics.com',
            'doubleclick.net',
            'googleadservices.com',
            'buysellads.com'
        ];

        adNetworks.forEach(network => {
            const img = new Image();
            img.src = `//${network}/pixel.gif`;
            img.onerror = () => detectionPoints++;
        });

        // Test 4: Check for AdBlock Plus specific elements
        const abpBait = document.createElement('div');
        abpBait.innerHTML = '&nbsp;';
        abpBait.className = 'adsbygoogle';
        document.body.appendChild(abpBait);
        if (window.getComputedStyle(abpBait).display === 'none') {
            detectionPoints += 2; // Higher weight for ABP detection
        }
        abpBait.remove();

        // Test 5: Check for uBlock Origin specific elements
        const ubBait = document.createElement('div');
        ubBait.setAttribute('class', 'textads banner-ads banner_ads ad-zone ad-space adsbox');
        document.body.appendChild(ubBait);
        if (ubBait.offsetHeight === 0) {
            detectionPoints += 2; // Higher weight for uBlock detection
        }
        ubBait.remove();

        // Wait for all checks and evaluate
        setTimeout(() => {
            // Threshold adjusted based on testing
            const adBlockDetected = detectionPoints >= 3;
            if (adBlockDetected) {
                console.log('AdBlock detected with confidence');
                restrictWebsiteAccess();
            } else {
                console.log('No AdBlock detected');
                enableWebsiteAccess();
            }
            resolve(adBlockDetected);
        }, 500);
    });
}

// Function to completely restrict website access
function restrictWebsiteAccess() {
    // Create full-page overlay
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
        <h2 style="color: #ff4444; margin-bottom: 20px;">Ad Blocker Detected!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We've detected that you're using an ad blocker. Our service relies on advertising revenue to stay free.
            Please disable your ad blocker or whitelist our site to continue using our service.
        </p>
        <button onclick="location.reload()" style="
            padding: 10px 20px;
            font-size: 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        ">I've Disabled My Ad Blocker</button>
        <p style="font-size: 14px; margin-top: 20px; color: #888;">
            After disabling your ad blocker, click the button above or refresh the page.
        </p>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    // Disable all interactive elements
    const elements = document.querySelectorAll('a, button, input, select, textarea');
    elements.forEach(element => {
        if (element.closest('#adblock-overlay') === null) {
            element.style.pointerEvents = 'none';
            if (element.tagName.toLowerCase() !== 'a') {
                element.disabled = true;
            }
        }
    });

    // Prevent right-click
    document.addEventListener('contextmenu', e => {
        if (!e.target.closest('#adblock-overlay')) {
            e.preventDefault();
        }
    });

    // Block keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
            e.preventDefault();
        }
    });
}

// Function to enable website access
function enableWebsiteAccess() {
    const overlay = document.getElementById('adblock-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = '';
    
    // Re-enable all interactive elements
    const elements = document.querySelectorAll('a, button, input, select, textarea');
    elements.forEach(element => {
        element.style.pointerEvents = '';
        if (element.tagName.toLowerCase() !== 'a') {
            element.disabled = false;
        }
    });
}

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

// Initialize detection
function initAdBlockDetection() {
    // Add some random delay to avoid pattern detection
    const randomDelay = Math.floor(Math.random() * 500) + 500;
    setTimeout(() => {
        enhancedAdBlockDetection().then(detected => {
            if (!detected) {
                loadAds();
            }
        });
    }, randomDelay);
}

// Check for ad blocker and create ads on page load
window.addEventListener('load', () => {
    setTimeout(initAdBlockDetection, 500);
});
