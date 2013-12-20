<?php

function __urlTargetComponent__callback($module, $section, $args) {
	if ($module != "ControlPanel" || $section != "Header")
		return;

	Template::importPrototypeAddon("simulate");
	Template::addScript(__DIR__.DIRSEP."url-editor.js");
	Template::addStyle(__DIR__.DIRSEP."results.css");
}

Triggers::watchModule("ControlPanel", "__urlTargetComponent__callback");
?>
