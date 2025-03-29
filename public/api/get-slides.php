
<?php
// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Path to the order.json file
$orderFile = '../slides/order.json';

// Check if the file exists
if (file_exists($orderFile)) {
    $jsonData = file_get_contents($orderFile);
    echo $jsonData;
} else {
    // Return empty slides array if the file doesn't exist
    echo json_encode(['slides' => []]);
}
?>
