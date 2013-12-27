<?php

$path = CONFIG_PATH . "Overrides" . DIRSEP;
if(!is_dir($path) && !mkdir($path, 0777, true))
	return; // Ooops

if(is_file($file = $path . "style.css"))
	Template::addStyle($file);
if(is_file($file = $path . "script.js"))
	Template::addScript($file);
	
?>
