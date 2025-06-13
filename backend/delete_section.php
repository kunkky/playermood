<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit();
}

require 'db.php';

$input = json_decode(file_get_contents("php://input"), true);
$sessionId = isset($input['id']) ? (int) $input['id'] : null;

if (!$sessionId) {
    echo json_encode(['success' => false, 'message' => 'Session ID is required.']);
    exit;
}

$checkQuery = "SELECT id FROM training_mood WHERE id = $sessionId LIMIT 1";
$checkResult = mysqli_query($conn, $checkQuery);

if (!$checkResult || mysqli_num_rows($checkResult) === 0) {
    echo json_encode(['success' => false, 'message' => 'Session not found.']);
    exit;
}

$deleteQuery = "DELETE FROM training_mood WHERE id = $sessionId";
$deleteResult = mysqli_query($conn, $deleteQuery);

echo json_encode([
    'success' => (bool)$deleteResult,
    'message' => $deleteResult ? 'Session deleted successfully.' : 'Failed to delete session.'
]);


mysqli_close($conn);
