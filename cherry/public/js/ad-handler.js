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

// Enhanced detection methods with multiple checks to reduce false positives
function enhancedAdBlockDetection() {
    return new Promise((resolve) => {
        let detectionPoints = 0;
        const checks = [];

        // Test 1: Basic ad element check
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
        testAd.style.cssText = 'position: absolute; left: -999px; top: -999px; width: 1px; height: 1px;';
        document.body.appendChild(testAd);
        checks.push(new Promise(resolve => {
            setTimeout(() => {
                if (testAd.offsetHeight === 0 || testAd.offsetParent === null) {
                    detectionPoints++;
                }
                testAd.remove();
                resolve();
            }, 100);
        }));

        // Test 2: Bait script loading
        const testScript = document.createElement('script');
        testScript.src = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        testScript.onerror = () => detectionPoints++;
        document.body.appendChild(testScript);
        checks.push(new Promise(resolve => {
            setTimeout(() => {
                testScript.remove();
                resolve();
            }, 100);
        }));

        // Test 3: Check for common ad network domains
        const testImg = new Image();
        testImg.src = '//adserver.example.com/pixel.gif';
        testImg.onerror = () => detectionPoints++;
        checks.push(new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        }));

        // Wait for all checks to complete
        Promise.all(checks).then(() => {
            // Require at least 2 detection points to reduce false positives
            const adBlockDetected = detectionPoints >= 2;
            if (adBlockDetected) {
                console.log('AdBlock detected with confidence');
                showAdBlockWarning();
            } else {
                console.log('No AdBlock detected');
            }
            resolve(adBlockDetected);
        });
    });
}

// Show warning with more detailed message
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
    enhancedAdBlockDetection().then(detected => {
        if (!detected) {
            // Load ads only if no ad blocker detected
            loadAds();
        }
    });
}

// Check for ad blocker and create ads on page load
window.addEventListener('load', () => {
    setTimeout(initAdBlockDetection, 500);
});
