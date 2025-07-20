
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$jobId = $_GET['id'] ?? '';

if (empty($jobId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Job ID is required']);
    exit;
}

$jobsFile = '../jobs/jobs.json';

if (!file_exists($jobsFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Jobs file not found']);
    exit;
}

$jobsData = json_decode(file_get_contents($jobsFile), true);

if ($jobsData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid JSON in jobs file']);
    exit;
}

$job = null;
foreach ($jobsData['jobs'] as $j) {
    if ($j['id'] === $jobId && $j['active'] === true) {
        $job = $j;
        break;
    }
}

if ($job === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Job not found']);
    exit;
}

echo json_encode($job);
?>
