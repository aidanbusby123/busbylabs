<!DOCTYPE html>
<html>
    <head>
        <title>West Seattle High School Math Club</title>
        <meta name="description" content="The official website of the West Seattle High School Math Club.">
        <link rel = "stylesheet" href = "../style.css">
        <link rel="author" content="Aidan Busby">
        <link rel = "icon" href="../wshsmathclub/media/cowculator.ico">
    </head>
    <body>
        <h1 class="title">West Seattle High School Math Club</h1>
        <div class="menu">
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="https://bit.ly/3RBTxwB" style="border:none"><img src="../wshsmathclub/media/discord-mark-blue.png" width="40vw"></a>
            <a href="https://instagram.com/wshsmathclub" style="border:none"><img src="../wshsmathclub/media/480px-Instagram_logo_2022.svg.png" width="40vw"></a>
            <div class="drop-menu">
                <p class="dropdown">Resources</p>
                <div class="drop-content-menu">
                    <ul>
                        <li><a href="../wshsmathclub/media/(AoPS Competition Preparation) Richard Rusczyk_ Sandor Lehoczky - The Art of Problem Solving, Volume 2_ and Beyond. 2-AoPS Incorporated (2003).pdf">AOPS Volume 2</a></li>
                        <li><a href="../wshsmathclub/media/(AoPS Competition Preparation) Richard Rusczyk_ Sandor Lehoczky - the Art of Problem Solving, Volume 2_ and Beyond-AoPS Incorporated_nobr class=_greyText__(first published June 2003)__nobr_ (2006).pdf">AOPS Volume 2 Solutions</a></li>
                    </ul>
                </div>
            </div>
            <a href="problems">Problem Sets</a>
        </div>
            <?php
            $path = "problems/probs/*";

            $latest_ctime = 0;
            $latest_filename = '';

            $files = glob($path);
            foreach($files as $file)
            {
                    if (is_file($file) && filectime($file) > $latest_ctime)
                    {
                            $latest_ctime = filectime($file);
                            $latest_filename = $file;
                    }
            }
            printf('
            <h2>Current Problem Set</h2>
            <a href="%1$s">Download (%2$s)</a>
            <br>
            <div style="height:70vh;">
            <iframe src="%1$s" width="50%%" height="100%%">
            </div>
            ',
            $latest_filename, basename($latest_filename));
            ?>

    </body>
</html>
