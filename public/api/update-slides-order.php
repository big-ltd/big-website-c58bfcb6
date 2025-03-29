
<?php
// Ensure the slides directory exists
$uploadDir = '../slides/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Failed to create slides directory',
            'details' => error_get_last()
        ]);
        exit;
    }
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
    echo json_encode([
        'error' => 'Method not allowed',
        'details' => 'Only POST requests are supported'
    ]);
    exit;
}

// Get JSON data from request body
$jsonData = file_get_contents('php://input');
if ($jsonData === false) {
    echo json_encode([
        'error' => 'Failed to read request body',
        'details' => error_get_last()
    ]);
    exit;
}

$data = json_decode($jsonData, true);

if ($data === null) {
    echo json_encode([
        'error' => 'Invalid JSON data',
        'details' => json_last_error_msg()
    ]);
    exit;
}

if (!isset($data['slides'])) {
    echo json_encode([
        'error' => 'Invalid data format',
        'details' => 'The "slides" property is missing from the JSON data'
    ]);
    exit;
}

// Save the slides data to order.json
$orderFile = $uploadDir . 'order.json';
if (file_put_contents($orderFile, $jsonData)) {
    echo json_encode(['success' => true]);
} else {
    $phpError = error_get_last();
    echo json_encode([
        'error' => 'Failed to save order data',
        'details' => [
            'phpError' => $phpError,
            'permissions' => [
                'orderFile' => $orderFile,
                'directory' => $uploadDir,
                'readable' => is_readable($uploadDir),
                'writable' => is_writable($uploadDir),
                'fileExists' => file_exists($orderFile),
                'fileWritable' => file_exists($orderFile) ? is_writable($orderFile) : 'N/A'
            ]
        ]
    ]);
}
?>
