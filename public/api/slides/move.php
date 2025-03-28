
<?php
// Set headers to allow CORS and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Prevent any HTML output before JSON response
ob_clean();

// Debug logging
error_log("Move slide request received");

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

if (!$data || !isset($data['sourceIndex']) || !isset($data['destinationIndex'])) {
    echo json_encode(["error" => "Invalid data format"]);
    exit;
}

$sourceIndex = intval($data['sourceIndex']);
$destinationIndex = intval($data['destinationIndex']);

// Get the slides order
$slidesDir = "../uploads/slides/";
$orderFile = $slidesDir . "slides_order.json";
$slideOrder = [];

if (file_exists($orderFile)) {
    $orderData = json_decode(file_get_contents($orderFile), true);
    if (isset($orderData['slides']) && is_array($orderData['slides'])) {
        $slideOrder = $orderData['slides'];
    }
}

// If we don't have an order file yet, list all slides
if (empty($slideOrder)) {
    if (is_dir($slidesDir)) {
        $files = scandir($slidesDir);
        
        foreach ($files as $file) {
            $filePath = $slidesDir . $file;
            if (is_file($filePath) && $file !== "." && $file !== ".." && $file !== "slides_order.json") {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    $slideOrder[] = $file;
                }
            }
        }
    }
}

// Make sure indices are valid
if ($sourceIndex < 0 || $sourceIndex >= count($slideOrder) || 
    $destinationIndex < 0 || $destinationIndex >= count($slideOrder)) {
    echo json_encode(["error" => "Invalid source or destination index"]);
    exit;
}

// Move the slide
$movedSlide = $slideOrder[$sourceIndex];
array_splice($slideOrder, $sourceIndex, 1);
array_splice($slideOrder, $destinationIndex, 0, [$movedSlide]);

// Save the new order
$orderData = [
    "slides" => $slideOrder,
    "lastUpdated" => time() * 1000
];

if (file_put_contents($orderFile, json_encode($orderData, JSON_PRETTY_PRINT))) {
    // Return the updated slides with their URLs
    $slides = [];
    foreach ($slideOrder as $slideName) {
        $slides[] = [
            "name" => $slideName,
            "url" => "/uploads/slides/" . $slideName
        ];
    }
    
    echo json_encode($slides);
} else {
    echo json_encode(["error" => "Failed to save order"]);
}
?>
