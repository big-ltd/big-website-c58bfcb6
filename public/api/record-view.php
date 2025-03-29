
<?php
header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

// Validate the input
if (!isset($data['hash']) || empty($data['hash'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Hash is required']);
    exit;
}

// Get the client IP address - check various headers and fallback to REMOTE_ADDR
function getClientIP() {
    $headers = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (isset($_SERVER[$header])) {
            foreach (explode(',', $_SERVER[$header]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Function to get IP location data
function getIPLocation($ip) {
    if ($ip === '0.0.0.0' || $ip === '127.0.0.1' || $ip === 'localhost') {
        return [
            'city' => 'Local',
            'country' => 'Development',
            'status' => 'success'
        ];
    }
    
    // Call ip-api.com API
    $response = @file_get_contents("http://ip-api.com/json/{$ip}");
    
    if ($response === false) {
        return [
            'city' => 'Unknown',
            'country' => 'Unknown',
            'status' => 'error'
        ];
    }
    
    $locationData = json_decode($response, true);
    
    if (!$locationData || $locationData['status'] !== 'success') {
        return [
            'city' => 'Unknown',
            'country' => 'Unknown',
            'status' => 'error'
        ];
    }
    
    return $locationData;
}

// File to store hash codes
$hashCodesFile = 'data/hash-codes.json';

// Check if the file exists
if (!file_exists($hashCodesFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'No hash codes found']);
    exit;
}

// Read the hash codes file
$hashCodesData = json_decode(file_get_contents($hashCodesFile), true);
$hashCodes = $hashCodesData['hashCodes'] ?? [];

// Find the hash code with the given hash
$hashIndex = -1;
foreach ($hashCodes as $index => $hashCode) {
    if ($hashCode['hash'] === $data['hash']) {
        $hashIndex = $index;
        break;
    }
}

if ($hashIndex === -1) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Hash code not found']);
    exit;
}

// Get IP and location
$ipAddress = getClientIP();
$locationData = getIPLocation($ipAddress);

// Create a new device entry
$deviceId = uniqid();
$newDevice = [
    'id' => $deviceId,
    'ipAddress' => $ipAddress,
    'city' => $locationData['city'] ?? 'Unknown',
    'country' => $locationData['country'] ?? 'Unknown',
    'userAgent' => $data['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    'timestamp' => date('Y-m-d\TH:i:s\Z')
];

// Add the new device to the hash code's devices array
$hashCodes[$hashIndex]['devices'][] = $newDevice;

// Save the updated hash codes to the file
$hashCodesData['hashCodes'] = $hashCodes;
file_put_contents($hashCodesFile, json_encode($hashCodesData, JSON_PRETTY_PRINT));

// Return success response
echo json_encode([
    'success' => true
]);
?>
