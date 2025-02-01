document.addEventListener('DOMContentLoaded', function() {
    loadUserSettings();
    setupEventListeners();
});

async function loadUserSettings() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('/api/users/settings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load settings');
        }

        const settings = await response.json();
        populateSettings(settings);
        loadApiKeys();
    } catch (error) {
        console.error('Error loading settings:', error);
        showMessage('Failed to load settings. Please try again.', 'error');
    }
}

function populateSettings(settings) {
    // Profile settings
    document.getElementById('username').value = settings.username || '';
    document.getElementById('email').value = settings.email || '';
    document.getElementById('language').value = settings.language || 'en';
    document.getElementById('timezone').value = settings.timezone || 'UTC';
    if (settings.profilePicture) {
        document.getElementById('profilePreview').src = settings.profilePicture;
    }

    // Security settings
    document.getElementById('2fa').checked = settings.twoFactorEnabled || false;

    // Notification settings
    document.getElementById('emailNotifications').checked = settings.notifications?.email || false;
    document.getElementById('securityAlerts').checked = settings.notifications?.security || false;
    document.getElementById('marketingUpdates').checked = settings.notifications?.marketing || false;

    // Appearance settings
    const theme = settings.appearance?.theme || 'dark';
    const fontSize = settings.appearance?.fontSize || 16;
    const animations = settings.appearance?.animations ?? true;

    // Apply theme
    setTheme(theme);
    document.querySelector(`[data-theme="${theme}"]`)?.classList.add('selected');

    // Apply font size
    document.getElementById('fontSizeDisplay').textContent = `${fontSize}px`;
    document.body.style.fontSize = `${fontSize}px`;

    // Apply animation settings
    document.getElementById('animations').checked = animations;
    if (!animations) {
        document.documentElement.style.setProperty('--transition-speed', '0s');
    }
}

// Theme functionality
function setTheme(theme) {
    // Remove selected class from all theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selected class to chosen theme
    document.querySelector(`[data-theme="${theme}"]`)?.classList.add('selected');

    // Apply theme
    document.body.setAttribute('data-theme', theme);

    // Save theme preference
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.appearance = {
        ...settings.appearance,
        theme
    };
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Font size functionality
function adjustFontSize(direction) {
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    let fontSize = parseInt(fontSizeDisplay.textContent);

    if (direction === 'increase' && fontSize < 24) {
        fontSize++;
    } else if (direction === 'decrease' && fontSize > 12) {
        fontSize--;
    }

    // Update display and apply font size
    fontSizeDisplay.textContent = `${fontSize}px`;
    document.body.style.fontSize = `${fontSize}px`;

    // Save font size preference
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.appearance = {
        ...settings.appearance,
        fontSize
    };
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Animation toggle functionality
function toggleAnimations(enabled) {
    if (enabled) {
        document.documentElement.style.removeProperty('--transition-speed');
    } else {
        document.documentElement.style.setProperty('--transition-speed', '0s');
    }

    // Save animation preference
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.appearance = {
        ...settings.appearance,
        animations: enabled
    };
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Event listeners for appearance settings
document.addEventListener('DOMContentLoaded', function() {
    // Load saved appearance settings
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const appearance = settings.appearance || {};

    // Apply theme
    if (appearance.theme) {
        setTheme(appearance.theme);
    }

    // Apply font size
    if (appearance.fontSize) {
        document.getElementById('fontSizeDisplay').textContent = `${appearance.fontSize}px`;
        document.body.style.fontSize = `${appearance.fontSize}px`;
    }

    // Apply animation settings
    const animationsToggle = document.getElementById('animations');
    if (animationsToggle) {
        animationsToggle.checked = appearance.animations ?? true;
        animationsToggle.addEventListener('change', (e) => {
            toggleAnimations(e.target.checked);
        });
    }
});

async function loadApiKeys() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/api-keys', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load API keys');
        }

        const keys = await response.json();
        const keysList = document.getElementById('apiKeysList');
        keysList.innerHTML = '';

        keys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'flex items-center justify-between p-3 bg-gray-800 rounded-lg';
            keyElement.innerHTML = `
                <div>
                    <p class="font-mono text-sm">${maskApiKey(key.key)}</p>
                    <p class="text-xs text-gray-400">Created: ${new Date(key.created).toLocaleDateString()}</p>
                </div>
                <button onclick="revokeApiKey('${key.id}')" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            keysList.appendChild(keyElement);
        });
    } catch (error) {
        console.error('Error loading API keys:', error);
    }
}

function maskApiKey(key) {
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
}

async function generateApiKey() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/api-keys', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate API key');
        }

        const result = await response.json();
        showMessage('API key generated successfully!', 'success');
        loadApiKeys();
    } catch (error) {
        console.error('Error generating API key:', error);
        showMessage('Failed to generate API key. Please try again.', 'error');
    }
}

async function revokeApiKey(keyId) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/api-keys/${keyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to revoke API key');
        }

        showMessage('API key revoked successfully!', 'success');
        loadApiKeys();
    } catch (error) {
        console.error('Error revoking API key:', error);
        showMessage('Failed to revoke API key. Please try again.', 'error');
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.settings-nav button').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Form submission
    document.querySelector('form').addEventListener('submit', saveSettings);

    // Profile picture preview
    document.getElementById('profilePicture').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profilePreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function switchTab(tabId) {
    // Update active button
    document.querySelectorAll('.settings-nav button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabId).classList.remove('hidden');
}

async function saveSettings(event) {
    event.preventDefault();
    const form = event.target;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            language: formData.get('language'),
            timezone: formData.get('timezone'),
            twoFactorEnabled: formData.get('2fa') === 'on',
            notifications: {
                email: formData.get('emailNotifications') === 'on',
                security: formData.get('securityAlerts') === 'on',
                marketing: formData.get('marketingUpdates') === 'on'
            },
            appearance: {
                theme: document.body.getAttribute('data-theme') || 'dark',
                fontSize: parseInt(document.getElementById('fontSizeDisplay').textContent),
                animations: document.getElementById('animations').checked
            }
        };

        // Handle password change
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }
            data.currentPassword = formData.get('currentPassword');
            data.newPassword = newPassword;
        }

        // Handle profile picture
        const profilePicture = formData.get('profilePicture');
        if (profilePicture && profilePicture.size > 0) {
            data.profilePicture = await toBase64(profilePicture);
        }

        const response = await fetch('/api/users/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update settings');
        }

        showMessage('Settings updated successfully!', 'success');

        // Update local storage with new settings
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        settings.appearance = data.appearance;
        localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
        console.error('Error updating settings:', error);
        showMessage(error.message || 'Failed to update settings. Please try again.', 'error');
    }
}

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'text-green-500' : 'text-red-500';
    messageDiv.style.opacity = '1';

    setTimeout(() => {
        messageDiv.style.opacity = '0';
    }, 3000);
}

async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
