var Tooltip = Class.create({
	
	initialize: function(content, interactive) {
		this.element = document.createElement("tooltip");
		if(interactive)
			this.element.addClassName("interactive");
		if(Object.isElement(content)) {
			this.content = content;
			if("containerClass" in this.content)
				this.element.addClassName(this.content.containerClass);
		} else {
			this.content = document.createElement("content");
			this.content.innerHTML = content;
		}
		
		this.arrowTop = document.createElement("arrow");
		this.arrowBottom = document.createElement("arrow");
		Element.addClassName(this.arrowBottom, "flip");
		
		this.imagesHooked = [];
		this.imageLoadedUpdate = (function(e) {
			this.update();
			var img = e.findElement("img");
			img.stopObserving("load", this.imageLoadedUpdate);
			img.stopObserving("error", this.imageLoadedUpdate);
			this.imagesHooked.splice(this.imagesHooked.indexOf(img), 1);
		}).bind(this);
		Element.select(this.content, "img").each((function(img) {
			if(img.complete)
				return; // Already loaded
			img.observe("load", this.imageLoadedUpdate);
			img.observe("error", this.imageLoadedUpdate);
			this.imagesHooked.push(img);
		}).bind(this));
		Element.setStyle(this.element, {"opacity": 0});
		this.element.appendChild(this.arrowBottom);
		this.element.appendChild(this.content);
		this.element.appendChild(this.arrowTop);
		document.body.appendChild(this.element);
	},
	
	"getElement": function() {
		return this.element;
	},
	
	"show": function() {
		this.element.fadeIn();
	},
	
	// Moves this tooltip to point to the element specified
	"attachTo": function(element, overlap) {
		this.overlap = overlap || 0;
		
		this.attachedElement = element;
		this.updateTimeout = 10;
		this.update();
	},
	
	"update": function() {
		try{clearTimeout(this.updateTimer);}catch(e){}

		if(!this.attachedElement.parentNode)
			this.hide();
		else {
			var elDim = this.attachedElement.getLayout();
			var elPos = this.attachedElement.cumulativeOffset();
			var elScr = this.attachedElement.cumulativeScrollOffset();
			var tlDim = this.element.getLayout();
			var pos = [elPos.left + elDim.get("padding-box-width")/2
								- tlDim.get("padding-box-width")/2 - elScr.left,
						elPos.top - tlDim.get("padding-box-height") + 5 + this.overlap];

			var arrow;
			if(pos[1] < 5) {
				arrow = this.arrowBottom;
				this.element.addClassName("flipped");
				pos[1] = elPos.top + elDim.get("padding-box-height") - 5 - this.overlap;
			} else {
				arrow = this.arrowTop;
				this.element.removeClassName("flipped");
			}

			if(pos[0] < 5) {
				arrow.setStyle({
						"left": pos[0] + "px"
					});
				pos[0] = 5;
			} else {
				var width = document.body.getWidth()-5;
				var right = pos[0] + tlDim.get("padding-box-width");
				if(right > width) {
					arrow.setStyle({
							"left": (right - width) + "px"
						});
					pos[0] = width - tlDim.get("padding-box-width");
				} else
					arrow.setStyle({
						"left": "0px"
					});
			}

			if(this.lastX != pos[0] || this.lastY != pos[1]) {
				this.element.setStyle({
						"left": pos[0] + "px",
						"top": pos[1] + "px"
					});
				this.lastX = pos[0];
				this.lastY = pos[1];
				if(this.updateTimeout > 10)
					this.updateTimeout /= 2;
			} else if(this.updateTimeout < 250)
				this.updateTimeout *= 1.25;

			this.updateTimer = setTimeout(this.update.bind(this), this.updateTimeout);
		}
	},
	
	"hide": function(callback) {
		this.element.fadeOut({
			"callback": (function() {
				this.element.remove();
				if(callback)
					try{callback();}catch(e){}
			
				this.imagesHooked.each((function(img) {
					img.stopObserving("load", this.imageLoadedUpdate);
					img.stopObserving("error", this.imageLoadedUpdate);
				}).bind(this));
				this.imagesHooked = [];
			}).bind(this)
		});
				
	}
	
});

Framework.Components.registerComponent("*[title], *[title-html], *[menu-tooltip], *[tooltip], *[tooltip-html], *[tooltip-menu], *[menu-html], *[tooltip-menu-name], *[menu-html-name], *[menu-tooltip-name]"
, {

	"lastShowTime": false,
	
	"getName": function() {
		return "tooltip";
	},

	"show": function() {
		if(!this.tooltip) {
			this.tooltip = new Tooltip(this.tooltipContent, this.interactive);
			if(this.interactive) {
				var element = this.tooltip.getElement();
				element.observe("mouseenter", this.showEvent);
				element.observe("mousemove", this.showEvent);
				element.observe("mouseleave", this.hideEvent);
			}
		}
		if(this.parentTooltip)
			this.parentTooltip.show();
		this.tooltip.attachTo(this.getElement());
		this.tooltip.show();
	},
	
	"hide": function() {
		if(this.tooltip)
			this.tooltip.hide((function() {
				this.tooltip = false;
			}).bind(this));
	},

	"setup": function(element) {
		this.interactive = null;
		this.parentTooltip = element.up("tooltip");
		this.tooltipContent = document.createElement("content");
		["title", "tooltip"].each((function(attr) {
			if(!element.hasAttribute(attr)) {
				attr += "-html";
				if(!element.hasAttribute(attr))
					return; // skip
			
				this.tooltipContent.setContent(element.readAttribute(attr));
				element.writeAttribute(attr, false);
				this.interactive = false;
				throw $break;
			}
			
			this.tooltipContent.setTextContent(element.readAttribute(attr));
			element.writeAttribute(attr, false);
			this.interactive = false;
			throw $break;
		}).bind(this));
		if(this.interactive === null)
			["menu-html", "tooltip-menu", "menu-tooltip"].each((function(attr) {
				if(!element.hasAttribute(attr)) {
					var idAttr = attr + "-name";
					if(!element.hasAttribute(idAttr))
						return; // skip
					var sourceElement = $$((attr + "-html").
							camelize() + "[name='" + element.readAttribute(idAttr)
							+ "']")[0];
					if(!sourceElement) {
						console.log("Source missing", attr, idAttr, element);
						return;
					}
					
					var html = sourceElement.innerHTML;
					html = html.substring(4);
					html = html.substring(0, html.length-3);
					
					this.tooltipContent.setContent(html.trim());
				} else
					this.tooltipContent.setContent(element.readAttribute(attr));
				
				if(element.hasAttribute(attr + "-class")) {
					this.tooltipContent.containerClass = element.readAttribute(attr + "-class");
					element.writeAttribute(attr + "-class", false);
				}
				if(element.hasAttribute(attr + "-callback")) {
					var initFunc = element.readAttribute(attr + "-callback");
					initFunc = "(" + initFunc.replace(/[^\w\d_]/g, "") + ")";
					element.writeAttribute(attr + "-callback", false);
					try {
						eval(initFunc).apply(this.tooltipContent, [element]);
					} catch(e) {}
				}
				element.writeAttribute(attr, false);
				this.interactive = true;
			
				throw $break;
			}).bind(this));
		if(this.interactive === null)
			throw "No valid arguments found";
			
		/*if(this.interactive) {
			this.mouseOver = false;
			this.hasInputFocus = false;
			this.showEvent = (function tooltipInteractiveShowEvent(e) {
				try{clearTimeout(this.showHideTimer);}catch(e){}
				this.showHideTimer = setTimeout((function() {
					this.mouseOver = true;
					this.show.bind(this);
				}).bind(this), 400);
			}).bind(this);
			this.hideEvent = (function tooltipInteractiveHideEvent(e) {
				try{clearTimeout(this.showHideTimer);}catch(e){}
				this.showHideTimer = setTimeout((function() {
					this.mouseOver = false;
					if(!this.hasInputFocus)
						this.hide.bind(this);
				}).bind(this), 400);
			}).bind(this);
			
			this.inputFocusEvent = (function tooltipInputFocusEvent(e) {
				this.hasInputFocus = true;
				try{clearTimeout(this.showHideTimer);}catch(e){}
				this.show.bind(this);
			}).bind(this);
			this.inputBlurEvent = (function tooltipInputBlurEvent(e) {
				this.hasInputFocus = false;
				if(!this.mouseOver) {
					try{clearTimeout(this.showHideTimer);}catch(e){}
					this.showHideTimer = setTimeout(this.hide.bind(this), 400);
				}
			}).bind(this);
			this.inputCheckElements = Element.select(this.tooltipContent, "input, select");
			this.inputCheckElements.each((function(element) {
				Event.observe(element, "focus", this.inputFocusEvent);
				Event.observe(element, "blur", this.inputBlurEvent);
			}).bind(this));
			Event.observe(window, "blur", this.inputBlurEvent);
		} else {*/
			this.showEvent = (function tooltipShowEvent(e) {
				try{clearTimeout(this.showHideTimer);}catch(e){}
				this.showHideTimer = setTimeout(this.show.bind(this), 400);
			}).bind(this);
			this.hideEvent = (function tooltipHideEvent(e) {
				try{clearTimeout(this.showHideTimer);}catch(e){}
				this.showHideTimer = setTimeout(this.hide.bind(this), 400);
			}).bind(this);
		//}
		
		element.observe("mouseenter", this.showEvent);
		element.observe("mousemove", this.showEvent);
		element.observe("mouseleave", this.hideEvent);
		Event.observe(window, "blur", this.hideEvent);
	},
	
	"destroy": function(element) {
		element.stopObserving("mouseenter", this.showEvent);
		element.stopObserving("mousemove", this.showEvent);
		element.stopObserving("mouseleave", this.hideEvent);
		Event.stopObserving(window, "blur", this.hideEvent);
		
		/*if(this.interactive) {
			Event.stopObserving(window, "blur", this.inputBlurEvent);
			inputCheckElements.each((function(element) {
				Event.stopObserving(element, "focus", this.inputFocusEvent);
				Event.stopObserving(element, "blur", this.inputBlurEvent);
			}).bind(this));
		}*/
		
		this.hide();
	}
});

function scrollFixEvent(e) {
	var tooltip = e.findElement("tooltip");
	if(tooltip) {
		var top = e.element();
		var delta = e.wheelDelta || -e.detail;
		console.log(top, tooltip, delta);
		var stopScroll = false;
		while(top != tooltip) {
			var scrollHeight = top.scrollHeight - $(top).getHeight();
			if(scrollHeight > 5 && top.getStyle("overflow") != "hidden") {
				console.log(top.scrollTop, $(top).getHeight());
				if (delta > 0 && top.scrollTop > 0)
					return true;
				if (delta < 0 && top.scrollTop < scrollHeight)
					return true;
			
				stopScroll = true;
			}
			top = top.parentNode;
		}
		
		if(stopScroll) {
			e.stop();
			return false;
		}
	}
}

Event.observe(window, "DOMMouseScroll", scrollFixEvent);
Event.observe(window, "mousewheel", scrollFixEvent);
