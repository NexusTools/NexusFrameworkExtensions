<?php
Template::addStyle("css/cp-style.css");
Template::addScript("js/cp-script.js");

if(array_key_exists("popup", $_GET))
	Template::addStyle("css/cp-popup.css");

$externStyle = fullpath("cp-theme.css");
if (file_exists($externStyle))
	Template::addStyle($externStyle);
?>
