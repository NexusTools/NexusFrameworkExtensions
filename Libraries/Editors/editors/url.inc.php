<?php
switch ($mode) {
case EditCore::RENDER:
	echo "<input name=\"$name\" class=\"text\" type=\"url\" value=\"";
	echo htmlspecialchars($value);
	echo "\" style=\"width: 350px\" />";
	break;

case EditCore::VALIDATE:
	if ($meta['required'] && !trim($value))
		return "Required";
	return false;
	break;
}
?>
