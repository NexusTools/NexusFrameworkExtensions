<?php
	Template::addStyles(Array(FRAMEWORK_PATH."resources/stylesheets/widgets.css", "css/cp-style.css"));
	Template::addScript("js/cp-script.js");

	if(array_key_exists("popup", $_GET))
		Template::addStyle("css/cp-popup.css");
?>
