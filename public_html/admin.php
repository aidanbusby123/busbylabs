<?php
session_start();
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header('Location: login.php');
    exit();
}

$posts_directory = 'posts';  // The base directory for all posts
$files = scandir($posts_directory);  // Get a list of directories inside the posts folder
$files = array_diff($files, array('.', '..'));  // Remove . and .. from the list

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 10px; text-align: left; }
    </style>
</head>
<body>
    <h2>Admin Dashboard</h2>
    <p><a href="logout.php">Logout</a></p>
    <h3>Current Pages:</h3>
    <table>
        <tr>
            <th>Page</th>
            <th>Action</th>
        </tr>
        <?php foreach ($files as $file): ?>
            <tr>
                <td><?php echo htmlspecialchars($file); ?></td>
                <td><a href="admin.php?edit=<?php echo urlencode($file); ?>">Edit</a></td>
            </tr>
        <?php endforeach; ?>
    </table>

    <h3>Create New Page:</h3>
    <form action="admin.php" method="POST">
        <label for="new_page_name">Page Name (e.g. `newpage`):</label>
        <input type="text" name="new_page_name" id="new_page_name" required><br>
        <label for="content">Content (HTML):</label><br>
        <textarea name="content" id="content" rows="10" cols="50" required></textarea><br>
        <button type="submit" name="create_page">Create Page</button>
    </form>

    <?php
    // Handle creating a new page
    if (isset($_POST['create_page'])) {
        $page_name = $_POST['new_page_name'];
        $content = $_POST['content'];

        // Create the new directory for the post if it doesn't exist
        $new_page_directory = $posts_directory . '/' . $page_name;
        if (file_exists($new_page_directory)) {
            echo "<p style='color:red;'>The page already exists.</p>";
        } else {
            // Create the new directory and save the content
            mkdir($new_page_directory);
            file_put_contents($new_page_directory . '/index.html', $content);
            echo "<p style='color:green;'>Page created successfully!</p>";
        }
    }

    // Handle editing an existing page
    if (isset($_GET['edit'])) {
        $post_name = $_GET['edit'];
        $post_directory = $posts_directory . '/' . $post_name;
        $file_path = $post_directory . '/index.html';

        if (file_exists($file_path)) {
            $file_content = file_get_contents($file_path);
            echo "<h3>Edit Page: $post_name</h3>";
            echo "<form method='POST'>
                    <textarea name='content' rows='10' cols='50'>$file_content</textarea><br>
                    <button type='submit' name='save_changes'>Save Changes</button>
                    <input type='hidden' name='post_to_edit' value='$post_name'>
                  </form>";
        } else {
            echo "<p style='color:red;'>Page not found.</p>";
        }
    }

    // Save changes to a page
    if (isset($_POST['save_changes'])) {
        $content = $_POST['content'];
        $post_to_edit = $_POST['post_to_edit'];
        $file_path = $posts_directory . '/' . $post_to_edit . '/index.html';
        file_put_contents($file_path, $content);
        echo "<p style='color:green;'>Changes saved successfully!</p>";
    }
    ?>
</body>
</html>
