
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
    echo json_encode([
        'error' => 'Method not allowed',
        'details' => 'Only GET requests are supported'
    ]);
    exit;
}

// Path to the order.json file
$orderFile = '../slides/order.json';

// Check if the file exists
if (file_exists($orderFile)) {
    // Check if the file is readable
    if (!is_readable($orderFile)) {
        echo json_encode([
            'error' => 'File not readable',
            'details' => [
                'path' => $orderFile,
                'permissions' => [
                    'filePerms' => substr(sprintf('%o', fileperms($orderFile)), -4),
                    'owner' => function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($orderFile))['name'] : fileowner($orderFile),
                    'readable' => is_readable($orderFile)
                ]
            ]
        ]);
        exit;
    }
    
    $jsonData = file_get_contents($orderFile);
    if ($jsonData === false) {
        echo json_encode([
            'error' => 'Failed to read file',
            'details' => error_get_last()
        ]);
        exit;
    }
    
    // Validate the JSON data
    $data = json_decode($jsonData, true);
    if ($data === null) {
        echo json_encode([
            'error' => 'Invalid JSON data in file',
            'details' => json_last_error_msg()
        ]);
        exit;
    }
    
    echo $jsonData;
} else {
    // Return empty slides array if the file doesn't exist
    echo json_encode([
        'slides' => [],
        'info' => 'Order file does not exist yet. No slides have been uploaded.'
    ]);
}
?>
