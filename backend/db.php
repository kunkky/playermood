
<?php
header("Access-Control-Allow-Origin: *"); 
header("Content-Type: application/json");


$host = 'localhost';
$db   = 'teampulse';
$user = 'root';
$pass = '';

// Connect using mysqli (procedural)
$conn = mysqli_connect($host, $user, $pass, $db);

// Check connection
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}
?>
