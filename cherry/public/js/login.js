// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        redirectToUserDashboard(user);
    }
}

// Redirect user based on role
function redirectToUserDashboard(user) {
    const currentPath = window.location.pathname;
    const targetPath = user.isAdmin ? '/admin-dashboard.html' : '/user-dashboard.html';
    
    // Only redirect if we're not already on the target page
    if (!currentPath.endsWith(targetPath)) {
        window.location.href = targetPath;
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();

    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Reset messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        successMessage.textContent = 'Login successful! Redirecting...';
        successMessage.style.display = 'block';

        // Redirect user
        setTimeout(() => redirectToUserDashboard(data.user), 1000);
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = error.message || 'Login failed. Please try again.';
        errorMessage.style.display = 'block';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});
