<?php

if (isset($_GET['delete'])) {
	$tpage = VirtualPages::fetchPage($_GET['delete']);
	if ($tpage) {
		VirtualPages::dropPage($tpage['rowid']);
		echo "<banner class=\"success\">Deleted page `$tpage[title]`</banner><br />";
	}
} else
	if (isset($_GET['toggle']))
		VirtualPages::togglePublished($_GET['toggle']);

ControlPanel::renderManagePage(VirtualPages::getDatabase(), "pages", Array("title" => Array(
	"value-html" => "{{title}} {{small}}({{type}}){{endsmall}}\n{{small}}<a target='_blank' href='{{BASE_URL}}{{path}}'>{{path}}</a>{{endsmall}}"
),
	"condition" => Array(
		"display" => "Visibility",
		"render" => "StringFormat::formatCondition"
	)), Array(
	"Edit" => "Content/Edit?id={{rowid}}",
	"Delete" => "Content/Delete?id={{rowid}}&popup=true"
), true, Array(
	"new" => Array(
		"text" => "Create",
		"page" => "Create"
	)
), "title");
?>
