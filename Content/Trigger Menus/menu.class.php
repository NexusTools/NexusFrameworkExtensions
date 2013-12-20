<?php
class TriggerMenus {

	private static $capture = false;
	private static $database = false;
	
	public static function getDatabase() {
		if(!self::$database)
			self::$database = Database::getInstance();
		return self::$database;
	}

	public static function getPositions() {
		self::$capture = array();
		
		$module = new PageModule("/");
		$module->initializeTheme();
		
		$captured = self::$capture;
		self::$capture = false;
		
		return $captured;
	}
	
	protected static function genMenu($pos, $parent =0) {
		$menu = array();
		
		$db = self::getDatabase();
		foreach($db->select("entries", array("menu" => $pos, "parent" => $parent)) as $entry) {
			if($entry['condition'] && !eval("return $entry[condition];"))
				continue;
				
			if(startsWith($entry['target'], "/")) {
				if($entry['check-page']*1) {
					$mod = new PageModule($entry['target']);
					//$mod->initialize(false);
					if($mod->hasError())
						continue;
				}
				$entry['target'] = cleanpath(BASE_URI . $entry['target']);
			}
			
			array_push($menu, array("text" => interpolate($entry['display']),
					"url" => $entry['target'],
					"submenu" => self::genMenu($pos, $entry['rowid'])));
		}
		
		return $menu;
	}
	
	public static function trigger($module, $pos, $opts) {
		$pos = StringFormat::idForDisplay($pos);
		if(self::$capture !== false)
			self::$capture[$pos] = StringFormat::displayForID($pos);
		else
			return self::genMenu(StringFormat::idForDisplay($pos));
	}

}
?>
