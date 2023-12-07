<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <header></header>
    <main>
    <?php
    $files = glob('path/to/files/*.swf');
    usort($files, function($a, $b) {
    return filemtime($b) - filemtime($a);
    });

    ?>
    </main>
    <footer></footer>
  </body>
</html>
