<?php
switch ($mode) {
case EditCore::RENDER:
	echo "<select class=\"text\" name=\"$name\" value=\"";
	echo htmlspecialchars($value);
	echo "\" style=\"width: 350px\">";
	
	print_r($meta);
	if (array_key_exists('options', $meta))
		$options = $meta['options'];
	else if(array_key_exists("retreiver", $meta))
		$options = call_user_func($meta['retreiver']);

	if (!isset($meta['force-raw']) && isset($options['database']))
		$options = Database::getInstance($options['database'])->selectFields($options['table'], isset($options['field']) ? $options['field'] : "name");

	if($value && !array_key_exists($value, $options))
		$options[$value] = StringFormat::displayForID($value);
	
	foreach ($options as $ovalue => $display) {
		echo "<option value=\"";
		echo htmlspecialchars($ovalue);
		echo "\" ";
		if ($ovalue == $value)
			echo " selected";
		echo ">$display</option>";
	}
	echo "</select>";
	break;
}
?>
