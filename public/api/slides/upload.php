
<?php
// Set headers to allow CORS and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Prevent any HTML output before JSON response
ob_clean();

// Debug logging
error_log("Upload request received");

// Check if the request method is OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK for preflight requests
    exit(0);
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST method is allowed"]);
    exit;
}

// Get target directory
$targetDir = "../uploads/slides/";

// Create directory if it doesn't exist
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// Check if files were uploaded
if (!isset($_FILES['slides'])) {
    error_log("No files found in the request");
    echo json_encode(["error" => "No files were uploaded"]);
    exit;
}

$files = $_FILES['slides'];
$uploadedFiles = [];

// Debug logging
error_log("Processing " . count($files['name']) . " files");

// Process each file
for ($i = 0; $i < count($files['name']); $i++) {
    $fileName = $files['name'][$i];
    $fileSize = $files['size'][$i];
    $fileTmpName = $files['tmp_name'][$i];
    $fileError = $files['error'][$i];
    
    // Debug logging
    error_log("Processing file: $fileName, size: $fileSize, error: $fileError");
    
    // Check for upload errors
    if ($fileError !== 0) {
        error_log("Error uploading file $fileName: Error code $fileError");
        continue;
    }
    
    // Validate file type
    $fileType = $files['type'][$i];
    if (!preg_match('/^image\//', $fileType)) {
        error_log("Invalid file type: $fileType for $fileName");
        continue;
    }
    
    // Generate unique filename
    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
    $uniqueName = time() . '_' . uniqid() . '.' . $extension;
    $targetFile = $targetDir . $uniqueName;
    
    // Attempt to move the uploaded file
    if (move_uploaded_file($fileTmpName, $targetFile)) {
        $publicUrl = "/uploads/slides/" . $uniqueName;
        error_log("File uploaded successfully: $targetFile");
        
        $uploadedFiles[] = [
            "name" => $uniqueName,
            "url" => $publicUrl,
            "originalName" => $fileName
        ];
    } else {
        error_log("Failed to move uploaded file from $fileTmpName to $targetFile");
    }
}

// Return the list of successfully uploaded files
echo json_encode($uploadedFiles);
?>
