
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

if (!isset($data['filePath'])) {
    echo json_encode([
        'error' => 'Invalid data format',
        'details' => 'The "filePath" property is missing from the JSON data'
    ]);
    exit;
}

$filePath = $data['filePath'];
// Convert relative path to server path
$serverPath = '..' . $filePath;

// Check if the file exists
if (file_exists($serverPath)) {
    // Check if the file is writable/deletable
    if (!is_writable($serverPath)) {
        echo json_encode([
            'error' => 'File not writable',
            'details' => [
                'path' => $serverPath,
                'permissions' => [
                    'filePerms' => substr(sprintf('%o', fileperms($serverPath)), -4),
                    'owner' => function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($serverPath))['name'] : fileowner($serverPath),
                    'writable' => is_writable($serverPath)
                ]
            ]
        ]);
        exit;
    }
    
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
    echo json_encode([
        'error' => 'File not found',
        'details' => [
            'requestedPath' => $filePath,
            'serverPath' => $serverPath,
            'exists' => file_exists($serverPath)
        ]
    ]);
}
?>
