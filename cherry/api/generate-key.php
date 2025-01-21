<?php
require_once 'config.php';
header('Content-Type: application/json');

function generateUniqueKey($length = 24) {
    $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $key = '';
    for ($i = 0; $i < $length; $i++) {
        $key .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $key;
}

try {
    $key = generateUniqueKey();
    
    $stmt = $pdo->prepare("INSERT INTO license_keys (key_string) VALUES (?)");
    $stmt->execute([$key]);
    
    // Log the action
    $stmt = $pdo->prepare("INSERT INTO activity_logs (action, details) VALUES (?, ?)");
    $stmt->execute(['key_generated', "New key generated: $key"]);
    
    echo json_encode(['success' => true, 'key' => $key]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?> 