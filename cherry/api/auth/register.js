<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Cherry Executor</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body class="min-h-screen">
    <div id="particles-js"></div>

    <div class="container mx-auto px-4 h-screen flex items-center justify-center">
        <div class="glass p-8 w-full max-w-md">
            <h1 class="text-3xl font-bold gradient-text mb-6 text-center">Create Account</h1>
            
            <form id="registerForm" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-2">Username</label>
                    <input type="text" id="username" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2" required>
                </div>
                
                <div>
                    <label class="block text-sm text-gray-400 mb-2">Password</label>
                    <input type="password" id="password" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2" required>
                </div>

                <button type="submit" class="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded">
                    Register
                </button>
            </form>

            <div class="mt-4 text-center">
                <a href="login.html" class="text-pink-500 hover:text-pink-400">Already have an account? Login</a>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await axios.post('https://cherryy-okja.onrender.com/api/auth/register', {
                    username,
                    password
                });

                if (response.data.success) {
                    // Store token
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                    // Redirect to dashboard
                    window.location.href = '/user-dashboard.html';
                } else {
                    alert(response.data.error);
                }
            } catch (error) {
                alert('Registration failed');
            }
        });
    </script>
</body>
</html>
