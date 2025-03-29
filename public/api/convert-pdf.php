
<?php
// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Increase PHP execution time limit for larger PDF files
set_time_limit(300); // 5 minutes timeout
ini_set('max_execution_time', 300);
ini_set('memory_limit', '256M'); // Increase memory limit

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

// Check if file was uploaded
if (!isset($_FILES['file']) || empty($_FILES['file']['name'])) {
    echo json_encode([
        'error' => 'No file uploaded',
        'details' => 'The "file" field was not found in the uploaded data'
    ]);
    exit;
}

$file = $_FILES['file'];

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
    
    echo json_encode([
        'error' => 'File upload error',
        'details' => $errorMessage
    ]);
    exit;
}

// Check file type
$fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($fileType !== 'pdf') {
    echo json_encode([
        'error' => 'Invalid file type',
        'details' => 'Only PDF files are allowed for conversion. Received: ' . $fileType
    ]);
    exit;
}

// Ensure slides directory exists
$slidesDir = '../slides/';
if (!file_exists($slidesDir)) {
    if (!mkdir($slidesDir, 0755, true)) {
        echo json_encode([
            'error' => 'Failed to create slides directory',
            'details' => error_get_last()
        ]);
        exit;
    }
}

// Create a temporary directory for this conversion
$timestamp = time();
$randomNum = mt_rand(1000, 9999);
$tmpDirName = "tmp_" . $timestamp . "_" . $randomNum;
$tmpDir = $slidesDir . $tmpDirName . "/";

if (!mkdir($tmpDir, 0755, true)) {
    echo json_encode([
        'error' => 'Failed to create temporary directory',
        'details' => error_get_last()
    ]);
    exit;
}

// Move uploaded file to temporary directory
$tmpFilePath = $tmpDir . basename($file['name']);
if (!move_uploaded_file($file['tmp_name'], $tmpFilePath)) {
    echo json_encode([
        'error' => 'Failed to move uploaded file',
        'details' => error_get_last()
    ]);
    
    // Clean up the temporary directory
    rmdir($tmpDir);
    exit;
}

// Prepare output base name
$outputBase = pathinfo($file['name'], PATHINFO_FILENAME);
$outputPattern = $slidesDir . $timestamp . "_" . $randomNum . "_page_%d.jpg";

try {
    // Check if Imagick is available
    if (!extension_loaded('imagick')) {
        throw new Exception('ImageMagick PHP extension is not installed');
    }

    // Convert PDF to JPG using ImageMagick
    $imagick = new Imagick();
    $imagick->setResolution(300, 300); // 300 DPI
    $imagick->readImage($tmpFilePath);
    $imagick->setImageFormat('jpeg');
    $imagick->setImageCompression(Imagick::COMPRESSION_JPEG);
    $imagick->setImageCompressionQuality(50); // 50% quality
    
    $totalPages = $imagick->getNumberImages();
    $slidesPaths = [];
    
    // For large PDFs, process pages individually to prevent memory issues
    for ($i = 0; $i < $totalPages; $i++) {
        // Periodically reset time limit for very large PDFs
        if ($i % 5 === 0) {
            set_time_limit(300); // Reset timeout every 5 pages
        }
        
        $imagick->setIteratorIndex($i);
        $currentPage = $imagick->getImage();
        $pagePath = sprintf($outputPattern, $i + 1);
        $currentPage->writeImage($pagePath);
        $currentPage->clear();
        
        // Add to result paths
        $relativePath = '/slides/' . basename($pagePath);
        $slidesPaths[] = $relativePath;
    }
    
    // Clean up
    $imagick->clear();
    unlink($tmpFilePath); // Delete the original PDF
    rmdir($tmpDir); // Remove temporary directory
    
    // Return success with the paths to all created images
    echo json_encode([
        'success' => true,
        'totalSlides' => $totalPages,
        'slides' => $slidesPaths
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'ImageMagick error',
        'details' => $e->getMessage()
    ]);
    
    // Clean up on error
    if (file_exists($tmpFilePath)) {
        unlink($tmpFilePath);
    }
    if (file_exists($tmpDir)) {
        rmdir($tmpDir);
    }
}
?>
