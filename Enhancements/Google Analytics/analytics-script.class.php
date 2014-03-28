<?php
class AnalyticsScript extends CachedFile {

	private $settings;

	public function __construct() {
		$this->settings = new Settings("Google Analytics");
		CachedFile::__construct($this->settings->getStoragePath());
	}

	public function getPrefix() {
		return "analytics";
	}

	public function isShared() {
		return false;
	}

	public function getMimeType() {
		return "text/javascript";
	}

	public function update() {
		if (strlen($code = $this->settings->getValue("code"))) {
			$script = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');";

			if (!strlen($domain = $this->settings->getValue("domain")))
				$domain = "auto";
			$script .= "ga('create', '$code', '$domain');";
			
			$script .= "try{if(\"TrackingInstructions\" in Framework.Config){";
			$script .= "Framework.Config.TrackingInstructions.each(function(instruction) {";
			$script .= "ga.apply(this, Object.isArray(instruction) ? instruction : [instruction]);";
			$script .= "});";
			$script .= "}}catch(e){}";
			
			$script .= "ga('send', 'pageview');";
			
			return $script;
		}
		return null;
	}

}
?>
