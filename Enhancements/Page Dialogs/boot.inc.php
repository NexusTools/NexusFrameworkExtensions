<?php
Template::addGlobalScript("script.js");
if (LEGACY_BROWSER || preg_match('/Opera/i', $_SERVER['HTTP_USER_AGENT']))
	Template::addGlobalStyle("popup.legacy.css");
else
	Template::addGlobalStyle("popup.css");
?>
