
<?php
// Set headers to allow CORS and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Prevent any HTML output before JSON response
ob_clean();

// Debug logging
error_log("Delete slide request received");

// Check if the request method is OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK for preflight requests
    exit(0);
}

// Check if the request method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["error" => "Only DELETE method is allowed"]);
    exit;
}

// Get the filename from the URL
$uri = $_SERVER['REQUEST_URI'];
$parts = explode('/', $uri);
$fileName = end($parts);

if (empty($fileName)) {
    echo json_encode(["error" => "No file name provided"]);
    exit;
}

// Get the directory with slides
$slidesDir = "../uploads/slides/";
$filePath = $slidesDir . $fileName;

error_log("Attempting to delete: $filePath");

// Check if file exists
if (!file_exists($filePath)) {
    echo json_encode(["error" => "File not found"]);
    exit;
}

// Attempt to delete the file
if (unlink($filePath)) {
    // Update the order file if it exists
    $orderFile = $slidesDir . "slides_order.json";
    if (file_exists($orderFile)) {
        $orderData = json_decode(file_get_contents($orderFile), true);
        if (isset($orderData['slides']) && is_array($orderData['slides'])) {
            $slideOrder = $orderData['slides'];
            $slideOrder = array_filter($slideOrder, function($item) use ($fileName) {
                return $item !== $fileName;
            });
            $orderData['slides'] = array_values($slideOrder);
            $orderData['lastUpdated'] = time() * 1000;
            file_put_contents($orderFile, json_encode($orderData, JSON_PRETTY_PRINT));
        }
    }
    
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Failed to delete file"]);
}
?>
