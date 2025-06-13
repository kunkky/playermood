# Player Mood Backend (PHP)

### Requirements

- PHP 7.4+
- MySQL or MariaDB
- Postman or curl for testing API

### Setup

1. Create the database:

````sql
CREATE DATABASE teampulse;

USE teampulse;

CREATE TABLE training_mood (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time_stamp DATETIME NOT NULL,
    happy_count INT DEFAULT 0,
    sad_count INT DEFAULT 0,
    neutral_count INT DEFAULT 0
);

CREATE TABLE trainer_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    training_mood_id INT NOT NULL,
    users JSON NOT NULL,
    FOREIGN KEY (training_mood_id) REFERENCES training_mood(id) ON DELETE CASCADE
);



2. Update `db.php` with your MySQL credentials.

3. Run PHP server:

```bash
php -S localhost:8000
````

4. Endpoints:

- `POST http://localhost/teampulse/backend/post_training.php` with JSON `{
  "title": "Morning Drills"
}` ## To create a training section

- `POST http://localhost/teampulse/backend/post_mood.php` with JSON `{
  "user": "bola",
  "mood": "happy",
  "title": "Morning Drills"
}
` ## To record your mood

- `Get http://localhost/teampulse/backend/get_training_mood.php?user=bola`
  ` ## To fetch training sections and mood count. user query param is optional

- `Get http://localhost/teampulse/backend/get_latest_training.php`
  ` ## To fetch latest training section
- `Delete http://localhost/teampulse/backend/get_latest_training.php`
  ` ## To fetch latest training section


### Example curl

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
"title": "Morning Drills 2"
});

const requestOptions = {
method: "POST",
headers: myHeaders,
body: raw,
redirect: "follow"
};

fetch("http://localhost/teampulse/backend/post_training.php", requestOptions)
.then((response) => response.text())
.then((result) => console.log(result))
.catch((error) => console.error(error));
