// Auth management class
class Auth {
    static async login(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.userId);
            
            // Redirect to dashboard
            window.location.href = '/user-dashboard.html';
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    }

    static async register(username, password) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            if (!data.success) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.userId);
            
            // Redirect to dashboard
            window.location.href = '/user-dashboard.html';
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Logout failed');
            }

            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            
            // Redirect to login page
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static isLoggedIn() {
        return !!localStorage.getItem('username');
    }

    static checkAuthAndRedirect() {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login.html' || currentPath === '/register.html';
        
        if (this.isLoggedIn()) {
            // If logged in and on auth page, redirect to dashboard
            if (isAuthPage) {
                window.location.href = '/user-dashboard.html';
            }
        } else {
            // If not logged in and not on auth page, redirect to login
            if (!isAuthPage) {
                window.location.href = '/login.html';
            }
        }
    }

    static async checkAuth() {
        try {
            // Allow access to key generation without login
            if (window.location.pathname.includes('key-generation.html')) {
                return true;
            }

            // Check for cookie-based auth first
            const response = await fetch('/api/check-auth', {
                credentials: 'include'  // Important for cookies
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Auth check failed');
            }

            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('register.html') && 
                !window.location.pathname.includes('key-generation.html')) {
                // Clear any stale auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('username');
                window.location.href = '/login.html';
            }
            return false;
        }
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getUserId() {
        return localStorage.getItem('user_id');
    }

    static getUsername() {
        return localStorage.getItem('username');
    }
}

// Make Auth available globally
window.Auth = Auth;

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkAuthAndRedirect();
});
