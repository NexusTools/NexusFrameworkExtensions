<?php
class ExtensionDatabase extends BasicEmuDatabase {

	private static $instance;

	public static function getInstance() {
		return self::$instance ? self::$instance : (self::$instance = new ExtensionDatabase());
	}

	private function __construct() {
	}

	private function readExtensions($dirName, &$extensions, $section ="Not Set") {

		$dir = opendir($dirName);
		while (($ex = readdir($dir)) !== false) {
			if ($ex == ".." || $ex == ".")
				continue;

			if (is_file(($infoFile = "$dirName$ex".DIRSEP."info.json"))) {
				$infoData = json_decode(file_get_contents($infoFile), true);
				if (!$infoData)
					continue; // Corrupt info.json
				if (!isset($infoData['name']))
					continue;
				if (!isset($infoData['provides']))
					continue;

				$extInfo = Array("name" => $infoData['name']);
				if (is_array($infoData['provides'])) {
					$provides = "";
					foreach ($infoData['provides'] as $feature)
						$provides .= "$feature\n";
					$extInfo['provides'] = $provides;
				} else
					$extInfo['provides'] = $infoData['provides'];
				$extInfo['published'] = ExtensionLoader::isExtensionLoaded($infoData['name']);
				if (isset($infoData['author']))
					$extInfo['author'] = $infoData['author'];
				else
					$extInfo['author'] = "Not Set";

				if (isset($infoData['version']))
					$extInfo['version'] = $infoData['version'];
				else
					$extInfo['version'] = "Not Set";

				if (isset($infoData['description']))
					$extInfo['description'] = $infoData['description'];
				else
					$extInfo['description'] = "Missing Description.";
				$extInfo['rowid'] = crc32($infoData['name']);
				$extInfo['section'] = $section;

				$extensions[$infoData['name']] = $extInfo;
			}
		}
		closedir($dir);
	}

	protected function getEntries() {
		$extensions = Array();

		$this->readExtensions(EXT_PATH, $extensions, "User");
		
		if ($handle = opendir(FRAMEWORK_EXT_PATH)) {
			while (false !== ($entry = readdir($handle))) {
				$path = FRAMEWORK_EXT_PATH . $entry . DIRSEP;
				if(!is_dir($path) || $entry == "." || $entry == "..")
					continue;
				
				$this->readExtensions($path, $extensions, $entry);
			}

			closedir($handle);
		}

		return $extensions;
	}

}
?>
