var Tooltip = Class.create({

	getElement: function() {
		return this.element;
	},
	
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
		
		this.boundUpdate = this.update.bind(this);
		this.arrowTop = document.createElement("arrow");
		this.arrowBottom = document.createElement("arrow");
		Element.addClassName(this.arrowBottom, "vflip");
		this.arrowLeft = document.createElement("arrow");
		Element.addClassName(this.arrowLeft, "xflip");
		this.arrowRight = document.createElement("arrow");
		Element.addClassName(this.arrowRight, "xflip");
		Element.addClassName(this.arrowRight, "hflip");
		this.overlap = 0;
		
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
		this.viewport = document.createElement("viewport");
		this.viewport.appendChild(this.content);
		this.padding = document.createElement("padding");
		this.padding.appendChild(this.viewport);
		this.element.appendChild(this.arrowBottom);
		this.element.appendChild(this.arrowRight);
		this.element.appendChild(this.padding);
		this.element.appendChild(this.arrowLeft);
		this.element.appendChild(this.arrowTop);
		document.body.appendChild(this.element);
	},
	
	"getElement": function() {
		return this.element;
	},
	
	"show": function() {
		this.element.fadeIn();
		this.update();
	},
	
	// Moves this tooltip to point to the element specified
	"attachTo": function(element, overlap) {
		this.overlap = overlap || 0;
		
		if(!this.attachedElement && this.updateTimer) {
			clearTimeout(this.updateTimer);
			this.updateTimer = false;
		}
		this.attachedElement = element;
		this.updateTimeout = 10;
		this.update();
	},
	
	"update": function(secondRun) {
		if(this.updateTimer)
			clearTimeout(this.updateTimer);
		
		if(!this.attachedElement || !Element.visible(this.attachedElement))
			this.hide();
		else {
			if(!this.updateTimer) {
				Event.observe(window, "resize", this.boundUpdate);
				Event.observe(window, "scroll", this.boundUpdate);
				Event.observe(window, "mousewheel", this.boundUpdate);
				Event.observe(window, "DOMMouseScroll", this.boundUpdate);
				
				this.lastChanges = {bottom: false, top: false, left: false, right: false};
			}
		
			try {
				var attachmentLayout;
				var viewportSize = document.viewport.getDimensions();
				if(!secondRun) {
					var maxHeight = viewportSize.height - 30;
					if(this.lastMaxHeight != maxHeight) {
						this.viewport.setStyle({"max-height": maxHeight + "px", "width": null});
						
						this.lastMaxHeight = maxHeight;
						//try{clearTimeout(this.timer);}catch(e){}
						//this.timer = setTimeout((function() {
							Element.setStyle(this.viewport, {"width": false});
							if(this.viewport.scrollHeight >= this.lastMaxHeight-12) {
								var contentLayout = Element.getLayout(this.content);
								var width = contentLayout.get("border-box-width")+24;
								Element.setStyle(this.viewport, {"width":
											Math.min(300, width) + "px"});
							}
						//}).bind(this), 5000);
						
						this.update(true);
						return;
					}
				}
				attachmentLayout = Element.getLayout(this.attachedElement);
				var size = [attachmentLayout.get("border-box-width"),
							attachmentLayout.get("border-box-height")];
			
				if(size[0] < 5 || size[1] < 5)
					return; // Skip
					
				var positionOffset = Element.cumulativeOffset(this.attachedElement);
				var scrollOffset = Element.cumulativeScrollOffset(this.attachedElement);
				var position = [positionOffset.left-scrollOffset.left,
								positionOffset.top-scrollOffset.top];
				
				var myLayout = Element.getLayout(this.element);
				var mySize = [myLayout.get("border-box-width"),
								myLayout.get("border-box-height")];
				
				var changes = 0;
				var targetStyle;
				//console.log(viewportSize);
				
				var overflow;
				var yTarget = position[1]+size[1]/2;
				
				if(yTarget > viewportSize.height/2)
					overflow = position[1] - mySize[1] < 40;
				else
					overflow = position[1] + size[1] + mySize[1] > viewportSize.height-40;
				// size[1] + mySize[1] > viewportSize.height-10
				
				if(overflow) {
					if(!this.element.hasClassName("xlock")) {
						this.element.addClassName("xlock");
						this.update(true);
						return;
					}
					
					var arrow;
					var xTarget = position[0]+size[0]/2;
					if(xTarget > viewportSize.width/2) {
						targetStyle = {
							"left": null,
							"right": Math.max(5, viewportSize.width-(position[0]+10))
						};
						arrow = this.arrowLeft;
						if(this.element.hasClassName("flipped")) {
							this.element.removeClassName("flipped");
							if(!secondRun) {
								this.update(true);
								return;
							}
						}
					} else {
						targetStyle = {
							"right": null,
							"left": Math.max(5, position[0]+size[0]-10)
						};
						arrow = this.arrowRight;
						if(!this.element.hasClassName("flipped")) {
							this.element.addClassName("flipped");
							if(!secondRun) {
								this.update(true);
								return;
							}
						}
					}
					var rTarget;
					var yFlip = yTarget > viewportSize.height / 2;
					yTarget = position[1]+size[1]/2;
					if(yFlip) {
						targetStyle["top"] = null;
						yTarget = viewportSize.height-yTarget-mySize[1]/2;
						targetStyle["bottom"] = rTarget = Math.max(5, yTarget);
					} else {
						targetStyle["bottom"] = null;
						yTarget = yTarget-mySize[1]/2;
						targetStyle["top"] = rTarget = Math.max(5, yTarget);
					}
					var arrowOffset = mySize[1]/2-17;
					if(yFlip)
						arrowOffset = Math.min(Math.min(mySize[1]-40, 
							this.lastMaxHeight-6), arrowOffset - (yTarget - rTarget));
					else
						arrowOffset = Math.max(6, arrowOffset + (yTarget - rTarget));
					
					if(arrow.offset != arrowOffset) {
						arrow.offset = arrowOffset;
						Element.setStyle(arrow, {
							"top": arrowOffset + "px"
								});
						changes ++;
					}
					
					//console.log(targetStyle);
				} else {
					if(this.element.hasClassName("xlock")) {
						this.element.removeClassName("xlock");
						if(!secondRun) {
							this.update(true);
							return;
						}
					}
					
					var arrow;
					if(yTarget > viewportSize.height/2) {
						targetStyle = {
							"top": null,
							"bottom": Math.max(-8, viewportSize.height-(position[1]+this.overlap))
						};
						arrow = this.arrowTop;
						if(this.element.hasClassName("flipped")) {
							this.element.removeClassName("flipped");
							if(!secondRun) {
								this.update(true);
								return;
							}
						}
					} else {
						targetStyle = {
							"bottom": null,
							"top": Math.max(-8, position[1]+size[1]-this.overlap)
						};
						arrow = this.arrowBottom;
						if(!this.element.hasClassName("flipped")) {
							this.element.addClassName("flipped");
							if(!secondRun) {
								this.update(true);
								return;
							}
						}
					}
					var rTarget;
					var xTarget = position[0]+size[0]/2;
					var xFlip = xTarget > viewportSize.width / 2;
					if(xFlip) {
						targetStyle["left"] = null;
						xTarget = viewportSize.width-xTarget-mySize[0]/2;
						targetStyle["right"] = rTarget = Math.max(5, xTarget);
					} else {
						targetStyle["right"] = null;
						xTarget = xTarget-mySize[0]/2;
						targetStyle["left"] = rTarget = Math.max(5, xTarget);
					}
					var arrowOffset = mySize[0]/2-17;
					if(xFlip)
						arrowOffset = Math.min(mySize[0]-40, arrowOffset - (xTarget - rTarget));
					else
						arrowOffset = Math.max(6, arrowOffset + (xTarget - rTarget));
					
					if(arrow.offset != arrowOffset) {
						arrow.offset = arrowOffset;
						Element.setStyle(arrow, {
							"left": arrowOffset + "px"
								});
						changes ++;
					}
				}
				
				var changeArray = {};
				//console.log(targetStyle);
				$H(targetStyle).each((function(stylePair) {
					var value = this.lastChanges[stylePair.key];
					if(value === stylePair.value || value == stylePair.value)
						return;
					
					value = stylePair.value;
					if(value)
						value += "px";
					changeArray[stylePair.key] = value;
					this.lastChanges[stylePair.key] = stylePair.value;
					changes++;
				}).bind(this));
				//console.log(changeArray);
				if(!changes)
					throw "No Changes";
				
				//console.log(changeArray);
				this.element.setStyle(changeArray);
				if(this.updateTimeout > 10)
					this.updateTimeout /= 2;
			} catch(e) {
				/*if("" + e != "No Changes") {
					console.log("" + e);
					console.log(e.stack);
				}*/
			
				if(this.updateTimeout < 600)
					this.updateTimeout *= 1.25;
			}

			this.updateTimer = setTimeout(this.update.bind(this), this.updateTimeout);
		}
	},
	
	"hide": function() {
		try{clearTimeout(this.updateTimer);}catch(e){}
		if(this.attachedElement) {
			Event.stopObserving(window, "resize", this.boundUpdate);
			Event.stopObserving(window, "scroll", this.boundUpdate);
			Event.stopObserving(window, "mousewheel", this.boundUpdate);
			Event.stopObserving(window, "DOMMouseScroll", this.boundUpdate);
		}
		this.updateTimer = false;
		
		this.element.fadeOut({
			"callback": (function() {
				this.element.remove();
				Event.fire(this.element, "tooltip:destroyed");
			
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
			Event.on(this.tooltip.getElement(),"tooltip:destroyed", (function() {
				this.tooltip = false;
			}).bind(this));
			if(this.interactive) {
				var element = this.tooltip.getElement();
				element.observe("mouseenter", this.showEvent);
				element.observe("mousemove", this.showEvent);
				element.observe("mouseleave", this.hideEvent);
			}
		}
		if(this.parentTooltip)
			this.parentTooltip.show();
		this.tooltip.attachTo(this.getElement(), this.overlap);
		this.tooltip.show();
	},
	
	"hide": function() {
		if(this.tooltip)
			this.tooltip.hide();
	},

	"setup": function(element) {
		var overlap = 0;
		this.interactive = null;
		this.parentTooltip = $(element).up("tooltip");
		this.tooltipContent = document.createElement("content");
		["title", "tooltip"].each((function(attr) {
			var overlapAttr = attr + "-overlap";
			if(element.hasAttribute(overlapAttr))
				overlap = element.readAttribute(overlapAttr)*1;
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
				var overlapAttr = attr + "-overlap";
				if(element.hasAttribute(overlapAttr))
					overlap = element.readAttribute(overlapAttr)*1;
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
		this.overlap = overlap;
			
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
