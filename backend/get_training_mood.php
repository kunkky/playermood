<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
require 'db.php';

$user = $_GET['user'] ?? null;

$query = "SELECT id, title, happy_count, sad_count, neutral_count FROM training_mood ORDER BY id DESC";
$result = mysqli_query($conn, $query);

$moods = [];

while ($row = mysqli_fetch_assoc($result)) {
    $trainingMoodId = $row['id'];

    // Get interaction record that contains this user
    $checkQuery = "
        SELECT users FROM trainer_interactions
        WHERE training_mood_id = $trainingMoodId
        AND JSON_SEARCH(users, 'one', '$user', NULL, '$[*].user') IS NOT NULL
        LIMIT 1
    ";

    $checkResult = mysqli_query($conn, $checkQuery);
    $hasInteracted = false;
    $userMood = null;

    if ($checkResult && mysqli_num_rows($checkResult) > 0) {
        $hasInteracted = true;
        $data = mysqli_fetch_assoc($checkResult);
        $usersArray = json_decode($data['users'], true);

        // Find user's mood in array
        foreach ($usersArray as $entry) {
            if ($entry['user'] === $user) {
                $userMood = $entry['mood'];
                break;
            }
        }
    }

    $moods[] = [
        'training_title' => $row['title'],
        'id' => $row['id'],
        'happy_count'    => (int)$row['happy_count'],
        'sad_count'      => (int)$row['sad_count'],
        'neutral_count'  => (int)$row['neutral_count'],
        'has_interacted' => $hasInteracted,
        'user_mood'      => $userMood
    ];
}

echo json_encode($moods);
mysqli_close($conn);
?>
