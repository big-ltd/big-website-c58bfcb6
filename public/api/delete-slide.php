
<?php
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

if (!$data || !isset($data['filePath'])) {
    echo json_encode(['error' => 'Invalid data format']);
    exit;
}

$filePath = $data['filePath'];
// Convert relative path to server path
$serverPath = '..' . $filePath;

// Check if the file exists
if (file_exists($serverPath)) {
    // Delete the file
    if (unlink($serverPath)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode([
            'error' => 'Failed to delete file',
            'details' => error_get_last()
        ]);
    }
} else {
    echo json_encode(['error' => 'File not found']);
}
?>
