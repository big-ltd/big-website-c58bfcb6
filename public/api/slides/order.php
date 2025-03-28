
<?php
// Set headers to allow CORS and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Prevent any HTML output before JSON response
ob_clean();

// Debug logging
error_log("Save slide order request received");

// Check if the request method is OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK for preflight requests
    exit(0);
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST method is allowed"]);
    exit;
}

// Get JSON from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['slideOrder']) || !is_array($data['slideOrder'])) {
    echo json_encode(["error" => "Invalid data format"]);
    exit;
}

// Save the new order
$slidesDir = "../uploads/slides/";
$orderFile = $slidesDir . "slides_order.json";

// Create directory if it doesn't exist
if (!file_exists($slidesDir)) {
    mkdir($slidesDir, 0777, true);
}

$orderData = [
    "slides" => $data['slideOrder'],
    "lastUpdated" => time() * 1000
];

if (file_put_contents($orderFile, json_encode($orderData, JSON_PRETTY_PRINT))) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Failed to save order"]);
}
?>
