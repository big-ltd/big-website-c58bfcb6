
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$jobsFile = '../jobs/jobs.json';

// Ensure jobs file exists
if (!file_exists($jobsFile)) {
    file_put_contents($jobsFile, json_encode(['jobs' => []]));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $jobsData = json_decode(file_get_contents($jobsFile), true);
        echo json_encode($jobsData);
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $jobsData = json_decode(file_get_contents($jobsFile), true);
        
        $newJob = [
            'id' => generateJobId($input['title']),
            'title' => $input['title'],
            'location' => $input['location'],
            'type' => $input['type'],
            'description' => $input['description'],
            'active' => true,
            'createdAt' => date('c')
        ];
        
        $jobsData['jobs'][] = $newJob;
        file_put_contents($jobsFile, json_encode($jobsData, JSON_PRETTY_PRINT));
        echo json_encode($newJob);
        break;
        
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $jobsData = json_decode(file_get_contents($jobsFile), true);
        
        for ($i = 0; $i < count($jobsData['jobs']); $i++) {
            if ($jobsData['jobs'][$i]['id'] === $input['id']) {
                $jobsData['jobs'][$i] = array_merge($jobsData['jobs'][$i], $input);
                break;
            }
        }
        
        file_put_contents($jobsFile, json_encode($jobsData, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
        break;
        
    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $jobsData = json_decode(file_get_contents($jobsFile), true);
        
        $jobsData['jobs'] = array_filter($jobsData['jobs'], function($job) use ($input) {
            return $job['id'] !== $input['id'];
        });
        
        $jobsData['jobs'] = array_values($jobsData['jobs']);
        file_put_contents($jobsFile, json_encode($jobsData, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
        break;
}

function generateJobId($title) {
    return strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', trim($title)));
}
?>
