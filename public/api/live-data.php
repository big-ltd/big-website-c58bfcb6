<?php
// Live Data Access API - Secure endpoint for accessing /data/ directory
// Secret key: L3rs9Et0nJBLGOnlsmoOE8yjGyhEi3ZX

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
$SECRET_KEY = 'L3rs9Et0nJBLGOnlsmoOE8yjGyhEi3ZX';

// Directory mapping - maps directory codes to filesystem paths
$ALLOWED_DIRECTORIES = [
    'ua' => '../../ua.big-ltd.com/data/',
    'pm' => '../../pm.big-ltd.com/data/',
    'default' => '../data/'
];

// Helper function to send error response
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'timestamp' => date('c')
    ]);
    exit;
}

// Helper function to send success response
function sendSuccess($action, $data) {
    echo json_encode([
        'success' => true,
        'action' => $action,
        'data' => $data,
        'timestamp' => date('c')
    ]);
    exit;
}

// Security check
$providedKey = $_GET['key'] ?? '';
if ($providedKey !== $SECRET_KEY) {
    sendError('Unauthorized - Invalid or missing key', 401);
}

// Get and validate directory parameter
$directory = $_GET['directory'] ?? 'default';

if (!array_key_exists($directory, $ALLOWED_DIRECTORIES)) {
    sendError('Invalid directory parameter. Allowed values: ua, pm', 400);
}

$DATA_DIR = $ALLOWED_DIRECTORIES[$directory];

// Get action parameter
$action = $_GET['action'] ?? '';

// Ensure data directory exists
if (!is_dir($DATA_DIR)) {
    sendError('Data directory not found: ' . $directory, 500);
}

// Handle different actions
switch ($action) {
    case 'list':
        handleListAction();
        break;
    case 'read':
        handleReadAction();
        break;
    default:
        sendError('Invalid action. Use "list" or "read"', 400);
}

function handleListAction() {
    global $DATA_DIR, $directory;
    
    $files = [];
    
    try {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($DATA_DIR, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($iterator as $file) {
            $relativePath = str_replace($DATA_DIR, '', $file->getPathname());
            $relativePath = ltrim($relativePath, '/\\');
            
            $fileInfo = [
                'path' => $relativePath,
                'type' => $file->isDir() ? 'directory' : 'file',
                'size' => $file->isFile() ? $file->getSize() : 0,
                'modified' => date('c', $file->getMTime()),
                'permissions' => substr(sprintf('%o', $file->getPerms()), -4)
            ];
            
            $files[] = $fileInfo;
        }
        
        // Sort by path for better organization
        usort($files, function($a, $b) {
            return strcmp($a['path'], $b['path']);
        });
        
        sendSuccess('list', [
            'directory' => $directory === 'default' ? 'default (big.com.cy)' : $directory,
            'total_files' => count(array_filter($files, function($f) { return $f['type'] === 'file'; })),
            'total_directories' => count(array_filter($files, function($f) { return $f['type'] === 'directory'; })),
            'files' => $files
        ]);
        
    } catch (Exception $e) {
        sendError('Error scanning directory: ' . $e->getMessage(), 500);
    }
}

function handleReadAction() {
    global $DATA_DIR, $directory;
    
    $filePath = $_GET['file'] ?? '';
    
    if (empty($filePath)) {
        sendError('File parameter is required for read action', 400);
    }
    
    // Security check - prevent directory traversal
    $fullPath = realpath($DATA_DIR . $filePath);
    $dataDirRealPath = realpath($DATA_DIR);
    
    if ($fullPath === false || strpos($fullPath, $dataDirRealPath) !== 0) {
        sendError('Invalid file path - access denied', 403);
    }
    
    if (!file_exists($fullPath)) {
        sendError('File not found', 404);
    }
    
    if (!is_file($fullPath)) {
        sendError('Path is not a file', 400);
    }
    
    try {
        $fileSize = filesize($fullPath);
        $fileContent = file_get_contents($fullPath);
        
        if ($fileContent === false) {
            sendError('Unable to read file', 500);
        }
        
        // Determine if file is binary
        $isBinary = !ctype_print($fileContent) || strpos($fileContent, "\0") !== false;
        
        $fileInfo = [
            'directory' => $directory === 'default' ? 'default (big.com.cy)' : $directory,
            'filename' => basename($fullPath),
            'path' => $filePath,
            'size' => $fileSize,
            'modified' => date('c', filemtime($fullPath)),
            'mime_type' => mime_content_type($fullPath),
            'is_binary' => $isBinary,
            'content' => $isBinary ? base64_encode($fileContent) : $fileContent,
            'encoding' => $isBinary ? 'base64' : 'utf-8'
        ];
        
        sendSuccess('read', $fileInfo);
        
    } catch (Exception $e) {
        sendError('Error reading file: ' . $e->getMessage(), 500);
    }
}
?>
