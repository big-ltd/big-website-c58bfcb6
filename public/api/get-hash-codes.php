
<?php
header('Content-Type: application/json');

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

// Return the hash codes
echo json_encode([
    'success' => true,
    'hashCodes' => $hashCodesData['hashCodes'] ?? []
]);
?>
