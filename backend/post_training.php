<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php'; // contains $conn for mysqli connection

// Get the raw POST data
$data = json_decode(file_get_contents('php://input'), true);
$title = trim($data['title'] ?? '');

// Validation
if ($title === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Title is required']);
    exit;
}

// Check if the title already exists
$checkQuery = "SELECT id FROM training_mood WHERE title = ? ";
$stmt = mysqli_prepare($conn, $checkQuery);
mysqli_stmt_bind_param($stmt, 's', $title);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['error' => 'Training mood with this title already exists']);
    exit;
}

// Insert new training mood
$insertQuery = "INSERT INTO training_mood (title, time_stamp) VALUES (?, NOW())";
$insertStmt = mysqli_prepare($conn, $insertQuery);
mysqli_stmt_bind_param($insertStmt, 's', $title);
$success = mysqli_stmt_execute($insertStmt);

if ($success) {
    echo json_encode(['message' => 'Training mood created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to insert training mood']);
}

mysqli_close($conn);
?>
