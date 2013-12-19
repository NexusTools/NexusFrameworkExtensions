<?php
Template::reset();

Template::setRobotsPolicy(false);
Template::setMetaTag("keywords", "nexustools, framework, php, controlpanel");
Template::setMetaTag("description", "The NexusTools PHP Framework Official ControlPanel");
$base = dirname(dirname(__FILE__)).DIRSEP;
$owdir = getcwd();
chdir($base);

requireAddon("eventable-object");
requireAddon("unfinished-work");
requireAddon("file-upload");

Template::setTitleFormat("{{PAGENAME}} [ControlPanel]");
Template::setTitle("Dashboard");

PageModule::setThemePath($base."theme");
chdir($owdir);
?>
