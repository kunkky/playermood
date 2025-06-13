<?php
header('Content-Type: application/json');
require 'db.php'; // includes $conn for mysqli

$query = "SELECT id, title, time_stamp, happy_count, sad_count, neutral_count 
          FROM training_mood 
          ORDER BY time_stamp DESC 
          LIMIT 1";

$result = mysqli_query($conn, $query);

if ($result && mysqli_num_rows($result) > 0) {
    $latestTraining = mysqli_fetch_assoc($result);
    echo json_encode($latestTraining);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'No training mood found']);
}

mysqli_close($conn);
?>
