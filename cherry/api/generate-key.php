<?php
require_once 'config.js';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

$data = json_decode(file_get_contents('php://input'), true);
$key = $data['key'] ?? '';

try {
    // Generate key logic here
    // For example, you might want to save the key to the database
    // and return a success message

    echo json_encode(['success' => true, 'key' => $key]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
