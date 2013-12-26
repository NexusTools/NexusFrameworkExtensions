<?php
if (isset($_GET['delwidget'])) {
	$widget = VirtualPages::fetchWidget($_GET['delwidget']);
	
	if ($widget) {
		$location = $widget['location'];
		$section = $widget['section'];
		$parent = $widget['parent'];
		$slot = $widget['slot'];
		
		VirtualPages::dropWidget($widget['rowid']);
		echo "<banner class=\"success\">Widget Deleted!</banner><br />";
	} else {
		echo "<banner class=\"error\">Unknown Error</banner><br />";
		return;
	}
} else {
	$location = isset($_GET['location']) ? $_GET['location'] : 0;
	$section = isset($_GET['section']) ? $_GET['section'] : "pages";
	$parent = isset($_GET['parent']) ? $_GET['parent'] : 0;
	$slot = isset($_GET['slot']) ? $_GET['slot'] : VirtualPages::PAGEAREA;
}

if (isset($_GET['swap'])) {
	$parts = explode("-", $_GET['swap']);
	echo "<banner class=\"success\">Swapped Widgets</banner>";
	VirtualPages::getDatabase()->update("widgets", Array("rowid" => - 1), Array("rowid" => $parts[0]));
	VirtualPages::getDatabase()->update("widgets", Array("rowid" => $parts[0]), Array("rowid" => $parts[1]));
	VirtualPages::getDatabase()->update("widgets", Array("rowid" => $parts[1]), Array("rowid" => - 1));
}

switch($slot) {
	case VirtualPages::LEFTCOLUMN:
		$subtitle = "Left Column";
		break;
	
	case VirtualPages::PAGEAREA:
		$subtitle = "Page Area";
		break;
	
	case VirtualPages::RIGHTCOLUMN:
		$subtitle = "Right Column";
		break;
	
	default:
		$subtitle = "Widgets";
		break;
}

$state = "subtitle: ".htmlspecialchars('"'.$_GET['subtitle'].'"')
	.", title: ".htmlspecialchars('"'.$_GET['title'].'"')
	.", location: ".$location
	.", section: ".htmlspecialchars("\"$section\"")
	.", parent: ".$parent
	.", slot: ".$slot;

$widgets = VirtualPages::fetchWidgets($location, $slot, $parent, $section);
$lid = 0;
$first = true;
$ddown = false;
if (count($widgets))
	foreach ($widgets as $widget) {
		if ($lid)
			echo "<input type=\"button\" class=\"button\" value=\"Move Down\" onclick=\"ControlPanel.loadPage('Content', 'Edit Widgets', {swap: '$widget[rowid]-$lid', ".$state."})\" /><br />";
		else
			if (!$first)
				$ddown = true;
			else
				$first = false;

		$widget['config'] = unserialize($widget['config']);
		if (isset($widget['config']['title'])) {
			if (strlen($widget['config']['title'])) {
				echo strip_tags($widget['config']['title']);
				echo ' (';
				echo StringFormat::displayForID($widget['type']);
				echo ')';
			} else
				echo StringFormat::displayForID($widget['type']);
		} else
			if (isset($widget['config']['__widget_name']) && strlen($widget['config']['__widget_name'])) {
				echo htmlspecialchars($widget['config']['__widget_name']);
				echo ' (';
				echo StringFormat::displayForID($widget['type']);
				echo ')';
			} else
				echo StringFormat::displayForID($widget['type']);

		echo "<br /><input type=\"button\" class=\"button\" value=\"Edit\" onclick=\"ControlPanel.loadPage('Content', 'Edit Widget', {id: $widget[rowid], ".$state."})\" />";
		echo "<input type=\"button\" class=\"button\" value=\"Delete\" onclick=\"ControlPanel.loadPopup('Content', 'Delete Widget', {id: $widget[rowid]})\" />";
		if ($lid)
			echo "<input type=\"button\" class=\"button\" value=\"Move Up\" onclick=\"ControlPanel.loadPage('Content', 'Edit Widgets', {swap: '$widget[rowid]-$lid', ".$state."})\" />";

		$lid = $widget['rowid'];
	}
else
	echo "<h3>No Widgets</h3>";
?><br /><select onchange="var value = $(this).getValue();if(value.length < 1)return;ControlPanel.loadPage('Content', 'Create Widget', {slot: <?php echo $slot; ?>, section: <?php echo htmlspecialchars("\"$section\""); ?>, parent: <?php echo $parent; ?>, location: <?php echo $location; ?>, type: value});"><option value="">Add Widget</option>
<option value="">------------------------</option><?php
if ($parent > 0)
	$slot = VirtualPages::EMBEDDABLE;
else
	$slot = $slot ? VirtualPages::SIDEBAR : VirtualPages::PAGEAREA;

foreach (VirtualPages::getWidgetTypes($slot) as $type) {
	echo "<option value=\"$type\">";
	echo StringFormat::displayForID($type);
	echo "</option>";
}
?></select><pagebuttons><?php


ControlPanel::renderStockButton("discard", "ControlPanel.loadPage('Content', 'Edit', {id: $location})");
?></pagebuttons><?php
if($section == "pages") {
	$page = Array("title" => "Edit Page", "action" => "ControlPanel.loadPage('Content', 'Edit', {id: $location});");
} else
	$page = "Unknown Container";

return array(false, $page, array("title" => $subtitle));
?>
