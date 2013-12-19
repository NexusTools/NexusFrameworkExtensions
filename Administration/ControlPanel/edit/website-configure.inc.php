<pagebuttons><?php
ControlPanel::renderStockButton("apply");
ControlPanel::renderStockButton("discard", "ControlPanel.loadPage('Website', 'Configure')");
if (User::isSuperAdmin()) {
	ControlPanel::renderStockButton("Root Password", "ControlPanel.loadPopup('Website', 'Change Root Password')", false, ControlPanel::getStockIcon("locked"));
}
?></pagebuttons><?php

$defines = Array();
$calls = Array();

$script = isset($_POST['script']) ? $_POST['script'] : false;
$handle = @fopen(INDEX_PATH."framework.config.php", "r");
if ($handle) {
	while (($buffer = fgets($handle, 4096)) !== false) {
		$buffer = trim($buffer);
		if (startsWith($buffer, "<?"))
			break;
	}

	while (($buffer = fgets($handle, 4096)) !== false) {
		$buffer = trim($buffer);
		
		if (!strlen($buffer) || (startsWith($buffer, "/*") &&
				endsWith($buffer, "*/")))
			continue;

		if (startsWith($buffer, "define")) {
			preg_match('/define\\s*\("([^"]+)", (.+)\)/', $buffer, $match);
			$defines[$match[1]] = eval("return $match[2];");
			continue;
		} else if(preg_match('/([\w_]+)\\s*\((.+)\)/', $buffer, $match)) {
			$calls[$match[1]] = eval("return $match[2];");
			continue;
		}

		break;
	}

	if (!$script) {
		$script = "";
		while (($buffer = fgets($handle, 4096)) !== false) {
			if (startsWith(trim($buffer), "?>"))
				break;

			$script .= $buffer;
		}
	}
	fclose($handle);
}

$script = trim($script);

if (isset($_POST['title_format'])) {
	$defines['TITLE_FORMAT'] = $_POST['title_format'];
	$defines['DEFAULT_PAGE_NAME'] = $_POST['default_page_name'];
	$defines['META_DESCRIPTION'] = $_POST['meta_description'];
	$defines['META_KEYWORDS'] = implode(", ", preg_split("/\s*?[\n\r]\s*?/", $_POST['meta_keywords'], 0, PREG_SPLIT_NO_EMPTY));
	
	if(!$_POST['robots']*1)
		$defines['NO_ROBOTS'] = true;
	else if(array_key_exists("NO_ROBOTS", $defines))
		unset($defines['NO_ROBOTS']);
		
	if($_POST['debugmode']*1)
		$defines['DEBUG_MODE'] = true;
	else if(array_key_exists("DEBUG_MODE", $defines))
		unset($defines['DEBUG_MODE']);
	
	if($_POST['devmode']*1)
		$defines['DEV_MODE'] = true;
	else if(array_key_exists("DEV_MODE", $defines))
		unset($defines['DEV_MODE']);
	
	if(!$_POST['dirlist']*1)
		$defines['NO_DIRECTORY_LISTINGS'] = true;
	else if(array_key_exists("NO_DIRECTORY_LISTINGS", $defines))
		unset($defines['NO_DIRECTORY_LISTINGS']);
		
	$calls['date_default_timezone_set'] = $_POST['timezone'];

	$script = $_POST['script'];

	$handle = @fopen(INDEX_PATH."framework.config.php", "w");
	fwrite($handle, "<?php // DO NOT MANUALLY MODIFY THIS FILE\n\n");
	fwrite($handle, "/* Defines */\n");
	foreach ($defines as $key => $val) {
		$val = var_export($val, true);
		fwrite($handle, "define(\"$key\", $val);\n");
	}
	fwrite($handle, "\n/* Function Calls */\n");
	foreach ($calls as $key => $val) {
		$val = var_export($val, true);
		fwrite($handle, "$key($val);\n");
	}
	fwrite($handle, "\n\n// USER LOADER SCRIPT\n");
	fwrite($handle, $script);
	fwrite($handle, "\n?>");

	echo "<banner class=\"success\">Changes Applied, Updated `framework.conf.php`.</banner>";
}
?>

<form align="center" method="post" action="control://Website/Configure">
<groupbox style="text-align: center;"><label>General</label>
<table style="height: 100%;"><tr><td>Title Format</td><td>Default Page Title</td></tr>
<tr>
	<td valign="top"><input name="title_format" value="<?php echo htmlspecialchars($defines['TITLE_FORMAT']); ?>" type="text" class="text"></td>
	<td valign="top"><input name="default_page_name" value="<?php echo $defines['DEFAULT_PAGE_NAME']; ?>" type="text" class="text"></td></tr>
<tr><td><hr /></td><td><hr /></td></tr>
<tr><td>Directory Listings</td><td>Timezone</td></tr>
<tr><td><widget class="switch">
<input type="radio" name="dirlist" value="1" id="dirlist_on"<?php
if(!array_key_exists("NO_DIRECTORY_LISTINGS", $defines))
	echo " checked";
?> /><label for="dirlist_on">Public</label> <input type="radio" name="dirlist" value="0" id="dirlist_off"<?php
if(array_key_exists("NO_DIRECTORY_LISTINGS", $defines))
	echo " checked";
?> /><label for="dirlist_off">Private</label></widget></td><td>
<select name="timezone"><?php

$ctz = StringFormat::idForDisplay($calls['date_default_timezone_set']);
foreach(DateTimeZone::listIdentifiers() as $tz) {
	echo "<option value='";
	echo htmlspecialchars($tz);
	echo "'";
	if($ctz && $ctz == StringFormat::idForDisplay($tz))
		echo " selected";
	echo ">$tz</option>";
}
?></select>
</td></tr>
<tr><td><hr /></td><td><hr /></td></tr>
<tr><td>Debug Mode</td><td>Development Mode</td></tr>
<tr><td><widget class="switch">
<input type="radio" name="debugmode" value="1" id="debugmode_on"<?php
if(array_key_exists("DEBUG_MODE", $defines))
	echo " checked";
?> /><label for="debugmode_on">Enabled</label> <input type="radio" name="debugmode" value="0" id="debugmode_off"<?php
if(!array_key_exists("DEBUG_MODE", $defines))
	echo " checked";
?> /><label for="debugmode_off">Disabled</label></widget></td><td><widget class="switch">
<input type="radio" name="devmode" value="1" id="devmode_on"<?php
if(array_key_exists("DEV_MODE", $defines))
	echo " checked";
?> /><label for="devmode_on">Enabled</label> <input type="radio" name="devmode" value="0" id="devmode_off"<?php
if(!array_key_exists("DEV_MODE", $defines))
	echo " checked";
?> /><label for="devmode_off">Disabled</label></widget></td></tr>
</table>

</groupbox>
<groupbox style="text-align: center;">
<label>MetaTags</label>
<table><tr><td>Description</td><td>Keywords</td></tr>
<tr>
	<td valign="top"><input name="meta_description" value="<?php echo $defines['META_DESCRIPTION']; ?>" type="text" class="text"></td>
	<td rowspan="4"><textarea name="meta_keywords" style="height: 100%; resize:none;"><?php
foreach (explode(",", $defines['META_KEYWORDS']) as $keyword)
	echo trim($keyword)."\n";
?></textarea></td></tr>
<tr><td><hr /></td></tr>
<tr><td>Robots</td></tr>
<tr><td><widget class="switch">
<input type="radio" name="robots" value="1" id="robots_on"<?php
if(!array_key_exists("NO_ROBOTS", $defines))
	echo " checked";
?> /><label for="robots_on">Follow</label> <input type="radio" name="robots" value="0" id="robots_off"<?php
if(array_key_exists("NO_ROBOTS", $defines))
	echo " checked";
?> /><label for="robots_off">No Follow</label></widget></td></tr></table>
</groupbox><br />

<groupbox style="width: 730px; text-align: center;">
<label>Loader Script</label>
<textarea name="script" style="width: 100%; height: 300px; box-sizing: border-box; resize:none;"><?php
echo htmlentities($script);
?></textarea>
</groupbox>

<pre><?php
print_r($calls);
?></pre>

</form></center>
