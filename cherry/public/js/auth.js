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
                credentials: 'include'  // Important for cookies
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }

            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_id', data.userId);
            localStorage.setItem('username', data.username);

            // Redirect to dashboard
            window.location.href = '/user-dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
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
                credentials: 'include'  // Important for cookies
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_id', data.userId);
            localStorage.setItem('username', data.username);

            // Redirect to dashboard
            window.location.href = '/user-dashboard.html';
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
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

    static logout() {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        
        // Clear the auth cookie by setting it to expire
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        window.location.href = '/login.html';
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

// Initialize auth check when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only check auth if not on login, register, or key generation pages
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html') && 
        !window.location.pathname.includes('key-generation.html')) {
        Auth.checkAuth();
    }
});
