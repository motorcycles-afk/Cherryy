<?php
// Update these with your database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');  // default XAMPP username
define('DB_PASS', '');      // default XAMPP password is empty
define('DB_NAME', 'cherry_executor');

// Generate a random JWT secret or use a secure key
define('JWT_SECRET', 'your_secure_random_string_here');
define('WEBHOOK_URL', 'your_discord_webhook_url');

// Connect to database
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
    );
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?> 