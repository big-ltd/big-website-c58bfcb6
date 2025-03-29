
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
if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Hash code ID is required']);
    exit;
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

// Find the hash code with the given ID
$filteredHashCodes = array_filter($hashCodes, function($hashCode) use ($data) {
    return $hashCode['id'] !== $data['id'];
});

// Check if any hash code was removed
if (count($filteredHashCodes) === count($hashCodes)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Hash code not found']);
    exit;
}

// Save the updated hash codes to the file
$hashCodesData['hashCodes'] = array_values($filteredHashCodes); // Re-index the array
file_put_contents($hashCodesFile, json_encode($hashCodesData, JSON_PRETTY_PRINT));

// Return success response
echo json_encode([
    'success' => true
]);
?>
