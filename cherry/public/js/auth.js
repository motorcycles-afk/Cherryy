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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.userId);
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.userId);
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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Logout failed');
            }

            localStorage.removeItem('username');
            localStorage.removeItem('userId');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static isLoggedIn() {
        return !!localStorage.getItem('username');
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

// Initialize auth check when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only check auth if not on login, register, or key generation pages
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html') && 
        !window.location.pathname.includes('key-generation.html')) {
        Auth.checkAuth();
    }
});
