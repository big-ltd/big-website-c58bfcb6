
<?php
// Disable output buffering completely
while (ob_get_level()) {
    ob_end_clean();
}

// Set default content type to JSON for all responses
header('Content-Type: application/json');

// Enable all error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to the client
ini_set('log_errors', 1);
error_log("API request started: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

// Constants
define('SLIDES_DIR', '../../uploads/slides');
define('SLIDES_ORDER_FILE', '../../uploads/slides_order.json');

// Prevent any HTML output
if (ob_get_length()) ob_clean();

// Create the uploads directory if it doesn't exist
if (!file_exists('../../uploads')) {
    error_log("Creating uploads directory");
    mkdir('../../uploads', 0755, true);
}

// Create the slides directory if it doesn't exist
if (!file_exists(SLIDES_DIR)) {
    error_log("Creating slides directory");
    mkdir(SLIDES_DIR, 0755, true);
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the request path
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';

error_log("Processing {$method} request to {$path}");

// Parse the request
switch ($method) {
    case 'GET':
        if ($path === '/list') {
            listSlides();
        } else {
            respond(404, ['error' => 'Not Found']);
        }
        break;
    
    case 'POST':
        if ($path === '/upload') {
            uploadSlides();
        } elseif ($path === '/order') {
            saveOrder();
        } elseif ($path === '/move') {
            moveSlide();
        } else {
            respond(404, ['error' => 'Not Found']);
        }
        break;
    
    case 'DELETE':
        if ($path === '/clear') {
            clearAllSlides();
        } elseif (strpos($path, '/delete/') === 0) {
            $slideName = substr($path, 8);
            deleteSlide($slideName);
        } else {
            respond(404, ['error' => 'Not Found']);
        }
        break;
    
    default:
        respond(405, ['error' => 'Method Not Allowed']);
        break;
}

// List all slides
function listSlides() {
    $slides = [];
    $order = [];
    
    // Get the order if it exists
    if (file_exists(SLIDES_ORDER_FILE)) {
        $orderData = json_decode(file_get_contents(SLIDES_ORDER_FILE), true);
        $order = isset($orderData['slideOrder']) ? $orderData['slideOrder'] : [];
    }
    
    // If we have an order, use it to construct the slides
    if (!empty($order)) {
        foreach ($order as $slideName) {
            if (file_exists(SLIDES_DIR . '/' . $slideName)) {
                $slides[] = [
                    'name' => $slideName,
                    'url' => '/uploads/slides/' . $slideName
                ];
            }
        }
    } else {
        // If no order exists, build the slides from the directory
        if (is_dir(SLIDES_DIR)) {
            $files = scandir(SLIDES_DIR);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && is_file(SLIDES_DIR . '/' . $file)) {
                    $slides[] = [
                        'name' => $file,
                        'url' => '/uploads/slides/' . $file
                    ];
                }
            }
            
            // Save the order
            saveOrderData(array_column($slides, 'name'));
        }
    }
    
    respond(200, $slides);
}

// Upload slides
function uploadSlides() {
    // Make absolutely sure there's no output before we start
    if (ob_get_length()) ob_clean();
    
    error_log("=== Upload function called ===");
    error_log("POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));
    
    $response = [];
    $uploadedFiles = [];
    
    // Check if files were uploaded
    if (!isset($_FILES['slides'])) {
        error_log("No files found in upload request");
        respond(400, ['error' => 'No files uploaded']);
        return;
    }
    
    error_log("Files found in request: " . print_r($_FILES['slides'], true));
    
    // Check for PHP upload errors
    if (isset($_FILES['slides']['error']) && $_FILES['slides']['error'] !== UPLOAD_ERR_OK) {
        $errorMessage = getUploadErrorMessage($_FILES['slides']['error']);
        error_log("PHP Upload Error: " . $errorMessage);
        respond(400, ['error' => 'File upload error: ' . $errorMessage]);
        return;
    }
    
    // Get the current order
    $order = [];
    if (file_exists(SLIDES_ORDER_FILE)) {
        $orderData = json_decode(file_get_contents(SLIDES_ORDER_FILE), true);
        $order = isset($orderData['slideOrder']) ? $orderData['slideOrder'] : [];
    }
    
    // Handle multiple files
    $files = restructureFiles($_FILES['slides']);
    error_log("Restructured files: " . count($files));
    
    foreach ($files as $file) {
        if ($file['error'] === UPLOAD_ERR_OK) {
            // Verify this is an image file
            $fileType = $file['type'];
            error_log("File type: " . $fileType);
            
            if (!strpos($fileType, 'image/') === 0) {
                error_log("File is not an image: " . $file['name'] . " (type: " . $fileType . ")");
                continue;
            }
            
            // Generate a unique filename
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName = generateUniqueFileName($fileExtension);
            $targetPath = SLIDES_DIR . '/' . $newFileName;
            
            error_log("Moving file to: " . $targetPath);
            
            // Move the uploaded file
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $order[] = $newFileName;
                $uploadedFiles[] = [
                    'name' => $newFileName,
                    'url' => '/uploads/slides/' . $newFileName,
                    'originalName' => $file['name']
                ];
                error_log("File moved successfully: " . $newFileName);
            } else {
                error_log("Failed to move uploaded file: " . $file['name'] . " - PHP Error: " . error_get_last()['message']);
            }
        } else {
            $errorMessage = getUploadErrorMessage($file['error']);
            error_log("Upload error for file: " . $file['name'] . ", error code: " . $file['error'] . " - " . $errorMessage);
        }
    }
    
    // Save the updated order
    saveOrderData($order);
    
    error_log("Upload complete. Files processed: " . count($uploadedFiles));
    error_log("Response data: " . json_encode($uploadedFiles));
    
    respond(200, $uploadedFiles);
}

// Helper function to get upload error message
function getUploadErrorMessage($errorCode) {
    switch ($errorCode) {
        case UPLOAD_ERR_INI_SIZE:
            return "The uploaded file exceeds the upload_max_filesize directive in php.ini";
        case UPLOAD_ERR_FORM_SIZE:
            return "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
        case UPLOAD_ERR_PARTIAL:
            return "The uploaded file was only partially uploaded";
        case UPLOAD_ERR_NO_FILE:
            return "No file was uploaded";
        case UPLOAD_ERR_NO_TMP_DIR:
            return "Missing a temporary folder";
        case UPLOAD_ERR_CANT_WRITE:
            return "Failed to write file to disk";
        case UPLOAD_ERR_EXTENSION:
            return "A PHP extension stopped the file upload";
        default:
            return "Unknown upload error";
    }
}

// Save slide order
function saveOrder() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['slideOrder'])) {
        saveOrderData($data['slideOrder']);
        respond(200, ['message' => 'Order saved successfully']);
    } else {
        respond(400, ['error' => 'Invalid data']);
    }
}

// Move a slide (reorder)
function moveSlide() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['sourceIndex']) && isset($data['destinationIndex'])) {
        $sourceIndex = $data['sourceIndex'];
        $destinationIndex = $data['destinationIndex'];
        
        // Get the current order
        if (file_exists(SLIDES_ORDER_FILE)) {
            $orderData = json_decode(file_get_contents(SLIDES_ORDER_FILE), true);
            $order = isset($orderData['slideOrder']) ? $orderData['slideOrder'] : [];
            
            if (!empty($order) && $sourceIndex >= 0 && $sourceIndex < count($order) && 
                $destinationIndex >= 0 && $destinationIndex < count($order)) {
                
                // Remove the item from the source position
                $item = $order[$sourceIndex];
                array_splice($order, $sourceIndex, 1);
                
                // Insert it at the destination position
                array_splice($order, $destinationIndex, 0, [$item]);
                
                // Save the new order
                saveOrderData($order);
                
                // Return the updated slides
                $slides = [];
                foreach ($order as $slideName) {
                    if (file_exists(SLIDES_DIR . '/' . $slideName)) {
                        $slides[] = [
                            'name' => $slideName,
                            'url' => '/uploads/slides/' . $slideName
                        ];
                    }
                }
                
                respond(200, $slides);
            } else {
                respond(400, ['error' => 'Invalid indices']);
            }
        } else {
            respond(404, ['error' => 'No order file exists']);
        }
    } else {
        respond(400, ['error' => 'Invalid data']);
    }
}

// Clear all slides
function clearAllSlides() {
    if (is_dir(SLIDES_DIR)) {
        $files = scandir(SLIDES_DIR);
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..' && is_file(SLIDES_DIR . '/' . $file)) {
                unlink(SLIDES_DIR . '/' . $file);
            }
        }
    }
    
    // Clear the order
    saveOrderData([]);
    
    respond(200, ['message' => 'All slides cleared successfully']);
}

// Delete a single slide
function deleteSlide($slideName) {
    $filePath = SLIDES_DIR . '/' . $slideName;
    
    if (file_exists($filePath)) {
        unlink($filePath);
        
        // Update the order
        if (file_exists(SLIDES_ORDER_FILE)) {
            $orderData = json_decode(file_get_contents(SLIDES_ORDER_FILE), true);
            $order = isset($orderData['slideOrder']) ? $orderData['slideOrder'] : [];
            
            // Remove the slide from the order
            $order = array_filter($order, function($item) use ($slideName) {
                return $item !== $slideName;
            });
            
            // Re-index the array
            $order = array_values($order);
            
            // Save the updated order
            saveOrderData($order);
        }
        
        respond(200, ['message' => 'Slide deleted successfully']);
    } else {
        respond(404, ['error' => 'Slide not found']);
    }
}

// Helper function to save order data
function saveOrderData($order) {
    $orderData = [
        'slideOrder' => $order,
        'lastUpdated' => time()
    ];
    
    file_put_contents(SLIDES_ORDER_FILE, json_encode($orderData));
}

// Helper function to generate a unique filename
function generateUniqueFileName($extension) {
    return time() . '_' . mt_rand(10000, 99999) . '.' . $extension;
}

// Helper function to restructure files array for multiple file uploads
function restructureFiles($files) {
    $result = [];
    
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            $result[] = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];
        }
    } else {
        $result[] = $files;
    }
    
    return $result;
}

// Helper function to send a JSON response
function respond($statusCode, $data) {
    // Make absolutely sure there's no output before we send headers
    if (ob_get_length()) ob_clean();
    
    // Set the HTTP status code
    http_response_code($statusCode);
    
    // Always set content type to application/json
    header('Content-Type: application/json');
    
    // Debug output to log
    error_log("Sending response [status: $statusCode]: " . json_encode($data));
    
    // Ensure proper JSON encoding with error handling
    $json = json_encode($data);
    if ($json === false) {
        // If JSON encoding fails, send a fallback error
        error_log("JSON encoding failed: " . json_last_error_msg());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to encode response: ' . json_last_error_msg()]);
    } else {
        echo $json;
    }
    exit;
}
