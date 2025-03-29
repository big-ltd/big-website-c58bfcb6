
<?php
header('Content-Type: application/json');

// Get the hash from the query parameters
$hash = $_GET['hash'] ?? null;

// Validate the input
if (!$hash) {
    echo json_encode(['valid' => false, 'message' => 'Hash is required']);
    exit;
}

// File to store hash codes
$hashCodesFile = 'data/hash-codes.json';

// Check if the file exists
if (!file_exists($hashCodesFile)) {
    echo json_encode(['valid' => false, 'message' => 'No hash codes found']);
    exit;
}

// Read the hash codes file
$hashCodesData = json_decode(file_get_contents($hashCodesFile), true);
$hashCodes = $hashCodesData['hashCodes'] ?? [];

// Check if the hash exists
$validHash = false;
foreach ($hashCodes as $hashCode) {
    if ($hashCode['hash'] === $hash) {
        $validHash = true;
        break;
    }
}

// Return the validation result
echo json_encode([
    'valid' => $validHash
]);
?>
