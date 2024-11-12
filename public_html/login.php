<?php
session_start();

// Path to the file where the hashed password is stored
$password_file = '../adminpassword';

// Check if the password file exists
if (!file_exists($password_file)) {
    die('Password file not found.');
}

$stored_hash = '$2y$10$EgNW9unKp9vuzZi5IuU6MeR2HiUbFU99RCx1jWIMZybGOJTjVzCyi'; // file_get_contents($password_file);  // Read the stored hash from the file

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if the username is correct (you can hardcode the username or add a check)
    if ($username == 'admin' && password_verify($password, $stored_hash)) {
        $_SESSION['loggedin'] = true;
        header('Location: admin.php');
        exit();
    } else {
        $error_message = "Invalid login credentials.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>
    <h2>Login</h2>
    <?php if (isset($error_message)) { echo "<p style='color:red;'>$error_message</p>"; } ?>
    <form method="POST">
        <label>Username:</label>
        <input type="text" name="username" required><br>
        <label>Password:</label>
        <input type="password" name="password" required><br>
        <button type="submit">Login</button>
    </form>
</body>
</html>
