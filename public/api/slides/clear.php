
<?php
// Set headers to allow CORS and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Prevent any HTML output before JSON response
ob_clean();

// Debug logging
error_log("Clear all slides request received");

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

// Get the directory with slides
$slidesDir = "../uploads/slides/";
$success = true;
$deleted = 0;

// Get all files in the directory
if (is_dir($slidesDir)) {
    $files = scandir($slidesDir);
    
    foreach ($files as $file) {
        $filePath = $slidesDir . $file;
        if (is_file($filePath) && $file !== "." && $file !== ".." && $file !== "slides_order.json") {
            if (unlink($filePath)) {
                $deleted++;
            } else {
                $success = false;
                error_log("Failed to delete file: $filePath");
            }
        }
    }
    
    // Reset the order file
    $orderFile = $slidesDir . "slides_order.json";
    if (file_exists($orderFile)) {
        $orderData = ["slides" => [], "lastUpdated" => time() * 1000];
        file_put_contents($orderFile, json_encode($orderData, JSON_PRETTY_PRINT));
    }
}

echo json_encode([
    "success" => $success,
    "deleted" => $deleted
]);
?>
