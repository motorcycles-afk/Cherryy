<?php
require_once '../config.js';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

$data = json_decode(file_get_contents('php://input'), true);
$status = $data['status'] ?? '';
$component = $data['component'] ?? ''; // api, webhook, etc.

try {
    // Update system status in database
    $stmt = $pdo->prepare("UPDATE system_status SET status = ? WHERE component = ?");
    $stmt->execute([$status, $component]);
    
    // Log the action
    $stmt = $pdo->prepare("INSERT INTO activity_logs (action, details) VALUES (?, ?)");
    $stmt->execute(['status_update', "Updated $component status to: $status"]);
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
