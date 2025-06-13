<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$user = $data['user'] ?? null;
$mood = $data['mood'] ?? null;
$title = $data['title'] ?? null;

if (!$user || !$mood || !$title) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user, mood, or title']);
    exit;
}

if (!in_array($mood, ['happy', 'sad', 'neutral'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid mood']);
    exit;
}

$userEsc = mysqli_real_escape_string($conn, $user);
$moodEsc = mysqli_real_escape_string($conn, $mood);
$titleEsc = mysqli_real_escape_string($conn, $title);

// Get training mood section
$res = mysqli_query($conn, "SELECT * FROM training_mood WHERE title = '$titleEsc' LIMIT 1");
if (!$res || mysqli_num_rows($res) === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Training section not found']);
    exit;
}
$training = mysqli_fetch_assoc($res);
$trainingId = $training['id'];

// Get interaction
$getInteraction = mysqli_query($conn, "
    SELECT * FROM trainer_interactions WHERE training_mood_id = $trainingId LIMIT 1
");

$usersArray = [];
$interactionId = null;
$previousMood = null;

if (mysqli_num_rows($getInteraction) > 0) {
    $row = mysqli_fetch_assoc($getInteraction);
    $interactionId = $row['id'];
    $usersArray = json_decode($row['users'], true);

    foreach ($usersArray as &$entry) {
        if ($entry['user'] === $user) {
            $previousMood = $entry['mood'];
            $entry['mood'] = $mood; // update mood
            break;
        }
    }
    unset($entry); // break reference
}

// Handle counts
$updateCounts = '';
if ($previousMood && $previousMood !== $mood) {
    // Mood changed — increment new, decrement old
    $updateCounts = "
        UPDATE training_mood SET
        {$previousMood}_count = {$previousMood}_count - 1,
        {$mood}_count = {$mood}_count + 1
        WHERE id = $trainingId
    ";
} elseif (!$previousMood) {
    // New submission
    $usersArray[] = ['user' => $user, 'mood' => $mood];
    $updateCounts = "
        UPDATE training_mood SET
        {$mood}_count = {$mood}_count + 1
        WHERE id = $trainingId
    ";
}

// Run count update
if ($updateCounts) {
    mysqli_query($conn, $updateCounts);
}

// Save updated users JSON
$usersJson = mysqli_real_escape_string($conn, json_encode($usersArray));

if ($interactionId) {
    mysqli_query($conn, "
        UPDATE trainer_interactions SET users = '$usersJson' WHERE id = $interactionId
    ");
} else {
    mysqli_query($conn, "
        INSERT INTO trainer_interactions (training_mood_id, users)
        VALUES ($trainingId, '$usersJson')
    ");
}

echo json_encode([
    'message' => $previousMood
        ? ($previousMood === $mood ? 'No change — same mood' : 'Mood updated from ' . $previousMood . ' to ' . $mood)
        : 'Mood submitted'
]);

mysqli_close($conn);
?>
