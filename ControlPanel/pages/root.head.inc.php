<?php
Template::reset();

Template::setRobotsPolicy(false);
Template::setMetaTag("keywords", "nexustools, framework, php, controlpanel");
Template::setMetaTag("description", "The NexusTools PHP Framework Official ControlPanel");
$base = dirname(dirname(__FILE__)).DIRSEP;
$owdir = getcwd();
chdir($base);

$externStyle = fullpath("cp-theme.css");
if (file_exists($externStyle))
	Template::addStyle($externStyle);

requireAddon("eventable-object");
requireAddon("unfinished-work");
requireAddon("file-upload");

Template::setTitleFormat("{{PAGENAME}} [ControlPanel]");
Template::setTitle("Dashboard");

PageModule::setThemePath($base."theme");
chdir($owdir);
?>
