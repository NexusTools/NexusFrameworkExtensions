<?php
switch (VirtualPages::getMode()) {
case VirtualPages::HEADER:
	$basepath = dirname(__FILE__);
	Template::addStyle("$basepath/video.css");
	break;

case VirtualPages::CREATE:
	return Array("url" => false, "height" => 436);
	break;

case VirtualPages::RENDER_EDITOR:
	$config = VirtualPages::getArguments();
	echo "<banner>Place your images in the /media folder of your install.</banner>";
	echo "Height<br /><input name=\"height\" type=\"text\" value=\"";
	echo $config['height'];
	echo "\" class=\"text\" /><br />Video URL<br /><textarea style=\"width: 350px; height: 200px;\" name=\"slides\">";
	foreach ($config['slides'] as $file => $link) {
		if (is_numeric($file))
			echo "$link\n";
		else
			echo "$file:$link\n";
	}
	echo "</textarea>";
	break;

case VirtualPages::UPDATE_CONFIG:
	$slides = Array();
	$slideData = $_POST['slides'];
	foreach (explode("\n", $_POST['slides']) as $line) {
		$line = trim($line);
		if (!strlen($line))
			continue;

		$line = explode(":", $line);
		if (count($line) == 1)
			array_push($slides, $line[0]);
		else
			$slides[$line[0]] = $line[1];
	}
	return Array("slides" => $slides, "height" => $_POST['height']);

case VirtualPages::RENDER:
	$config = VirtualPages::getArguments();
	echo "<slideshow_widget style=\"height: $config[height]px\">";
	foreach ($config['slides'] as $file => $link) {
		if (is_numeric($file))
			echo "<img src=\"".Framework::getReferenceURI($link)."\" />";
		else
			echo "<img url=\"".BASE_URI."$link\" src=\"".Framework::getReferenceURI($file)."\" />";
	}
	echo "</slideshow_widget>";
	break;
}
?>
