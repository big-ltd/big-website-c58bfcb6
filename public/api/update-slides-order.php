
<?php
// Ensure the slides directory exists
$uploadDir = '../slides/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON data from request body
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

if (!$data || !isset($data['slides'])) {
    echo json_encode(['error' => 'Invalid data format']);
    exit;
}

// Save the slides data to order.json
$orderFile = $uploadDir . 'order.json';
if (file_put_contents($orderFile, $jsonData)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
        'error' => 'Failed to save order data',
        'details' => error_get_last()
    ]);
}
?>
