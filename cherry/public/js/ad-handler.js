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
