<?php
class FontAwesomeCharset {

	private static $charset = false;
	
	public function getCharset() {
		if(!self::$charset)
			self::$charset = LocalFile::getContentFrom(__DIR__ . DIRSEP . "charset.json");
	}

}
?>
