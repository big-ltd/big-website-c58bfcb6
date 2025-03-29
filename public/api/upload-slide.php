
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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Method not allowed',
        'details' => 'Only POST requests are supported'
    ]);
    exit;
}

// Check if files were uploaded
if (!isset($_FILES['slide']) || empty($_FILES['slide']['name'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'No file uploaded',
        'details' => 'The "slide" field was not found in the uploaded data'
    ]);
    exit;
}

$file = $_FILES['slide'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
    ];
    
    $errorMessage = isset($uploadErrors[$file['error']]) ? $uploadErrors[$file['error']] : 'Unknown upload error';
    
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'File upload error',
        'details' => $errorMessage
    ]);
    exit;
}

$timestamp = time();
$randomNum = mt_rand(1000, 9999);
$fileName = $timestamp . '_' . $randomNum . '.jpg';
$uploadPath = $uploadDir . $fileName;

// Only allow JPG files
$fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($fileType !== 'jpg' && $fileType !== 'jpeg') {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Invalid file type',
        'details' => 'Only JPG files are allowed. Received: ' . $fileType
    ]);
    exit;
}

// Move the uploaded file
if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    $relativePath = '/slides/' . $fileName;
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'filePath' => $relativePath
    ]);
} else {
    header('Content-Type: application/json');
    $phpError = error_get_last();
    echo json_encode([
        'error' => 'Failed to upload file',
        'details' => [
            'message' => 'Could not move uploaded file',
            'phpError' => $phpError,
            'permissions' => [
                'uploadPath' => $uploadPath,
                'readable' => is_readable(dirname($uploadPath)),
                'writable' => is_writable(dirname($uploadPath))
            ]
        ]
    ]);
}
?>
