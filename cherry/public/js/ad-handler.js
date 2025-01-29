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

function showAdBlockWarning() {
    if (!document.getElementById('adblock-warning')) {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'adblock-warning';
        warningDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: #ff4444; color: white;
                        padding: 10px; text-align: center; z-index: 9999; font-weight: bold;">
                Please disable your ad blocker to support us and continue using our service.
            </div>
        `;
        document.body.prepend(warningDiv);

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

// Check for ad blocker and create ads on page load
window.addEventListener('load', () => {
    setTimeout(detectAdBlock, 500);
});

// Enhanced detection methods
function enhancedAdBlockDetection() {
    return new Promise((resolve) => {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);

        const testIframe = document.createElement('iframe');
        testIframe.src = '//ad.a-ads.com/2378720?size=728x90';
        testIframe.style.display = 'none';
        document.body.appendChild(testIframe);

        window.setTimeout(() => {
            if (testAd.offsetHeight === 0 || testIframe.offsetHeight === 0) {
                console.log('AdBlock detected');
                showAdBlockWarning();
                resolve(true);
            } else {
                console.log('No AdBlock detected');
                resolve(false);
            }
            testAd.remove();
            testIframe.remove();
        }, 300);
    });
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

// Check for ad blocker and create ads on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        Promise.all([detectAdBlock(), enhancedAdBlockDetection()]).then((results) => {
            if (results.some(result => result)) {
                showAdBlockWarning();
            } else {
                insertAdsDynamically();
            }
        });
    }, 500);
});
