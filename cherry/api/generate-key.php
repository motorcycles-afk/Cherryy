<?php
require_once 'config.php';
header('Content-Type: application/json');

function generateCryptoLensKey() {
    // Replace with actual CryptoLens API call
    $apiKey = 'YOUR_CRYPTOLENS_API_KEY';
    $response = file_get_contents("https://api.cryptolens.io/v1/key?api_key=$apiKey");
    $data = json_decode($response, true);
    if ($data['success']) {
        return $data['key'];
    } else {
        throw new Exception('Failed to generate key from CryptoLens');
    }
}

try {
    $key = generateCryptoLensKey();

    $stmt = $pdo->prepare("INSERT INTO license_keys (key_string, user_id) VALUES (?, ?)");
    $stmt->execute([$key, $_POST['user_id']]);
    
    // Log the action
    $stmt = $pdo->prepare("INSERT INTO activity_logs (action, details, user_id) VALUES (?, ?, ?)");
    $stmt->execute(['key_generated', "New key generated: $key", $_POST['user_id']]);
    
    echo json_encode(['success' => true, 'key' => $key]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>