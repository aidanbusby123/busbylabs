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
    $files = glob('probs/*.pdf');
    foreach($files as $file){
    printf('<tr>
            <td><a href="%1$s" target="_blank">%1$s</a></td>
            <td>%2$s</td></tr>\n', 
            basename($file), // or basename($file) for just the filename w\out path
            date('F d Y, H:i:s', filemtime($file)));
}


    ?>
    </main>
    <footer></footer>
  </body>
</html>
