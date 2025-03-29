
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
if (!isset($data['name']) || empty(trim($data['name']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name is required']);
    exit;
}

// Get the max devices count (default to 1 if not provided)
$maxDevices = isset($data['maxDevices']) && is_numeric($data['maxDevices']) ? (int)$data['maxDevices'] : 1;

// Ensure maxDevices is at least 1
if ($maxDevices < 1) {
    $maxDevices = 1;
}

// File to store hash codes
$hashCodesFile = 'data/hash-codes.json';

// Create the data directory if it doesn't exist
if (!file_exists('data')) {
    mkdir('data', 0755, true);
}

// Initialize empty hash codes array if file doesn't exist
if (!file_exists($hashCodesFile)) {
    file_put_contents($hashCodesFile, json_encode(['hashCodes' => []]));
}

// Read the hash codes file
$hashCodesData = json_decode(file_get_contents($hashCodesFile), true);
$hashCodes = $hashCodesData['hashCodes'] ?? [];

// Generate a unique ID and hash
$id = uniqid();
$hash = bin2hex(random_bytes(16)); // 32 character hash

// Create a new hash code entry
$newHashCode = [
    'id' => $id,
    'name' => trim($data['name']),
    'hash' => $hash,
    'maxDevices' => $maxDevices,
    'devices' => [],
    'createdAt' => date('Y-m-d\TH:i:s\Z')
];

// Add the new hash code to the array
$hashCodes[] = $newHashCode;

// Save the updated hash codes to the file
$hashCodesData['hashCodes'] = $hashCodes;
file_put_contents($hashCodesFile, json_encode($hashCodesData, JSON_PRETTY_PRINT));

// Return success response
echo json_encode([
    'success' => true,
    'hashCode' => $newHashCode
]);
?>
