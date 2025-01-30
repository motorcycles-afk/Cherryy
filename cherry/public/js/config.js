// API Configuration
const config = {
    apiBaseUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api'
};

export default config;
