<?php

function __virtualPageSearch_Callback($matches, $filters) {
	$results = array();
	
	$query = $matches[0];
	$matches = preg_replace("/[^\\w\\d]+/", "", $query);
	
	$res = VirtualPages::queryPages(array("LIKE title" => "%$matches%",
										"LIKE path" => "%$matches%"), false, false);
	foreach($res['results'] as $page) {
		var_dump($page);
		$title = $page['title'];
		$url = $page['path'];
		similar_text($query, $title, $match1);
		similar_text($query, $title, $match2);
		array_push($results, array("ref" => "page:".
			Framework::uniqueHash("$title$url"),
			"url" => $url, "title" => $title,
			"match" => ($match1 + $match2) / 2));
	}
	
	return $results;
}

SearchCore::registerHandler(".+", "__virtualPageSearch_Callback", "VirtualPages", "Pages");
?>
