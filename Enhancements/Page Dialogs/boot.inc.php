<?php
Template::addScript("script.js");
if (LEGACY_BROWSER || preg_match('/Opera/i', $_SERVER['HTTP_USER_AGENT']))
	Template::addStyle("popup.legacy.css");
else
	Template::addStyle("popup.css");
?>
