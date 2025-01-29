// Anti Ad-blocker detection and handling
function detectAdBlock() {
    return new Promise((resolve) => {
        // Create multiple fake ad elements with different classes and attributes
const testAds = [
    { className: 'adsbox', innerHTML: '&nbsp;' },
    { className: 'ad', innerHTML: '&nbsp;' },
    { className: 'ad-banner', innerHTML: '&nbsp;' },
    { className: 'ad-placeholder', innerHTML: '&nbsp;' },
    { className: 'ad-slot', innerHTML: '&nbsp;' },
    { className: 'ad-unit', innerHTML: '&nbsp;' },
    { className: 'advert', innerHTML: '&nbsp;' },
    { className: 'advertisement', innerHTML: '&nbsp;' },
    { className: 'advertisement-banner', innerHTML: '&nbsp;' },
    { className: 'advertisement-placeholder', innerHTML: '&nbsp;' },
    { className: 'advertisement-unit', innerHTML: '&nbsp;' },
    { className: 'advertisement-slot', innerHTML: '&nbsp;' },
    { className: 'advertisement-banner', innerHTML: '&nbsp;' },
    { className: 'advertisement-placeholder', innerHTML: '&nbsp;' },
    { className: 'advertisement-unit', innerHTML: '&nbsp;' },
    { className: 'advertisement-slot', innerHTML: '&nbsp;' },
    { className: 'advertisement-banner', innerHTML: '&nbsp;' },
    { className: 'advertisement-placeholder', innerHTML: '&nbsp;' },
    { className: 'advertisement-unit', innerHTML: '&nbsp;' },
    { className: 'advertisement-slot', innerHTML: '&nbsp;' },
];

        testAds.forEach(testAd => {
            const adElement = document.createElement('div');
            adElement.innerHTML = testAd.innerHTML;
            adElement.className = testAd.className;
            document.body.appendChild(adElement);
        });

        window.setTimeout(() => {
const adBlockDetected = testAds.some(testAd => {
    const element = document.querySelector(`.${testAd.className}`);
    return element && (element.offsetHeight === 0 || element.offsetWidth === 0 || getComputedStyle(element).display === 'none');
});

            if (adBlockDetected || document.querySelector('iframe[data-aa]')?.offsetHeight === 0) {
                console.log('AdBlock detected');
                showAdvancedAdBlockWarning();
                resolve(true);
            } else {
                console.log('No AdBlock detected');
                resolve(false);
            }

            testAds.forEach(testAd => {
                const element = document.querySelector(`.${testAd.className}`);
                if (element) {
                    element.remove();
                }
            });
        }, 300);
    });
}

function showAdvancedAdBlockWarning() {
    if (!document.getElementById('adblock-warning')) {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'adblock-warning';
        warningDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: #ff4444; color: white;
                        padding: 10px; text-align: center; z-index: 9999; font-weight: bold;">
                Please disable your ad blocker to support us and continue using our service. Advanced ad blockers like AdBlock Plus are detected.
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
