
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
$atDeviceLimit = false;
$maxDevices = 1; // Default

foreach ($hashCodes as $hashCode) {
    if ($hashCode['hash'] === $hash) {
        $validHash = true;
        
        // Check device limit
        $maxDevices = $hashCode['maxDevices'] ?? 1;
        $deviceCount = count($hashCode['devices'] ?? []);
        
        // If the number of devices exceeds the limit, deny access
        if ($deviceCount >= $maxDevices) {
            $atDeviceLimit = true;
        }
        
        break;
    }
}

// Return the validation result
echo json_encode([
    'valid' => $validHash && !$atDeviceLimit,
    'message' => $atDeviceLimit ? 'Device limit reached for this access link' : null
]);
?>
