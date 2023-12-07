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
    $files = glob('problems/probs/*.pdf');
    echo('test');
    usort($files, create_function('$a,$b', 'return filemtime($b)-filemtime($a);'));

    ?>
    </main>
    <footer></footer>
  </body>
</html>
