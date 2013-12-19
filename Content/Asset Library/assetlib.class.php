<?php
class AssetLibrary {
	
	private static $database = false;
	private static $types = array();
	
	public static function getDatabase() {
		if(!self::$database)
			self::$database = Database::getInstance();
		return self::$database;
	}
	
	public static function getTypeSelect() {
		$types = array();
		foreach(self::$types as $type => $handler)
			$types[$type] = StringFormat::displayForID($type);
			
		return $types;
	}
	
	public static function yesNo($yes) {
		return $yes ? "Yes": "No";
	}
	
	public static function categoryName($id) {
		$db = self::getDatabase();
		return $db->selectField("categories", array("rowid" => $id), "name");
	}
	
	public static function registerType($type, $handler) {
		self::$types[$type] = $handler;
	}

}

AssetLibrary::registerType("file", __DIR__ . DIRSEP . "types" . DIRSEP . "file.inc.php");
AssetLibrary::registerType("video", __DIR__ . DIRSEP . "types" . DIRSEP . "video.inc.php");
AssetLibrary::registerType("image", __DIR__ . DIRSEP . "types" . DIRSEP . "image.inc.php");
AssetLibrary::registerType("audio", __DIR__ . DIRSEP . "types" . DIRSEP . "audio.inc.php");
?>
