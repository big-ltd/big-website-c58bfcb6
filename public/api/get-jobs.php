
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

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

// Filter only active jobs for public API
$activeJobs = array_filter($jobsData['jobs'], function($job) {
    return $job['active'] === true;
});

echo json_encode(['jobs' => array_values($activeJobs)]);
?>
