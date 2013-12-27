<?php
$path = CONFIG_PATH . "Overrides" . DIRSEP;
if(!is_dir($path) && !mkdir($path, 0777, true))
	throw new Exception("Unable to create Config Directory");
$path = $path . "script.js";

if (isset($_POST['action']) && $_POST['action'] == "apply") {
	LocalFile::setContentFor($path, $content = $_POST['content'], false);
	echo "<banner class='success'>Global Style Updated Successfully!</banner>";
} else
	try {
		$content = LocalFile::getContentFor($path, false);
	} catch(Exception $e) {}
?><pagebuttons><?php
ControlPanel::renderStockButton("apply");
ControlPanel::renderStockButton("discard", "ControlPanel.loadPage('Website', 'Configure')");
?></pagebuttons><form action="control://Website/Global Script">
<textarea name="content" style="width: 100%; height: 380px;"><?php
echo htmlspecialchars($content); ?></textarea></form>
