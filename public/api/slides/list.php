<?php
// Set headers to allow CORS and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Prevent any HTML output before JSON response
ob_clean();

// Debug logging
error_log("List slides request received");

// Check if the request method is OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK for preflight requests
    exit(0);
}

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["error" => "Only GET method is allowed"]);
    exit;
}

// Get the directory with slides
$slidesDir = "../uploads/slides/";
$slides = [];

// Read order file if it exists
$orderFile = $slidesDir . "slides_order.json";
$slideOrder = [];

if (file_exists($orderFile)) {
    $orderData = json_decode(file_get_contents($orderFile), true);
    if (isset($orderData['slides']) && is_array($orderData['slides'])) {
        $slideOrder = $orderData['slides'];
    }
}

// If we have an order file, use it to order the slides
if (!empty($slideOrder)) {
    foreach ($slideOrder as $slideName) {
        if (file_exists($slidesDir . $slideName) && is_file($slidesDir . $slideName)) {
            $slides[] = [
                "name" => $slideName,
                "url" => "/uploads/slides/" . $slideName
            ];
        }
    }
} else {
    // Otherwise, list all image files in the directory
    if (is_dir($slidesDir)) {
        $files = scandir($slidesDir);
        
        foreach ($files as $file) {
            $filePath = $slidesDir . $file;
            if (is_file($filePath) && $file !== "." && $file !== ".." && $file !== "slides_order.json") {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    $slides[] = [
                        "name" => $file,
                        "url" => "/uploads/slides/" . $file
                    ];
                }
            }
        }
    }
}

// Return the list of slides
echo json_encode($slides);
?>
