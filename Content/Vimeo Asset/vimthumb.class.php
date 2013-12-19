<?php
class VimeoThumbnail extends CachedObject {

	private $vidID;
	
	public function __construct($id) {
		$this->vidID = $id;
	}
	
	public function getID() {
		return $this->vidID;
	}
	
	public function getPrefix() {
		return "vimeo-thumbnails";
	}
	
	public function getLifetime() {
		return 500000;
	}
	
	public function needsUpdate() {
		return false;
	}
	
	public function updateMeta(&$meta) {}
	
	public function update() {
		$xml = simplexml_load_file("http://vimeo.com/api/v2/video/" . $this->vidID . ".xml");
		
		return array("small" => (string)$xml->video->thumbnail_small,
					"medium" => (string)$xml->video->thumbnail_medium,
					"large" => (string)$xml->video->thumbnail_large);
	}
	
	public function isValid() {
		return true;
	}
	
	public function isShared() {
		return true;
	}
	

}
?>
