
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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if files were uploaded
if (!isset($_FILES['slide']) || empty($_FILES['slide']['name'])) {
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['slide'];
$timestamp = time();
$randomNum = mt_rand(1000, 9999);
$fileName = $timestamp . '_' . $randomNum . '.jpg';
$uploadPath = $uploadDir . $fileName;

// Only allow JPG files
$fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($fileType !== 'jpg' && $fileType !== 'jpeg') {
    echo json_encode(['error' => 'Only JPG files are allowed']);
    exit;
}

// Move the uploaded file
if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    $relativePath = '/slides/' . $fileName;
    echo json_encode([
        'success' => true,
        'filePath' => $relativePath
    ]);
} else {
    echo json_encode([
        'error' => 'Failed to upload file',
        'details' => error_get_last()
    ]);
}
?>
