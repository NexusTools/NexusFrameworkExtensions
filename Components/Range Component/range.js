Framework.Components.registerComponent("range", {
	
	getValue: function() {
		return this.values;
	},
	
	setValue: function(val) {
		this.values = val;
		this.updateValues();
	},
	
	updateValues: function() {
		var el = this.getElement();
		var width = el.measure("width")-(this.knobSize*2);
		var minPerc = ((this.values[0] - this.min) / this.max);
		var maxPerc = ((this.values[1] - this.min) / this.max);
		this.minKnob.setStyle({
			"left": (minPerc*width) + "px"
		});
		this.maxKnob.setStyle({
			"left": (this.knobSize+(maxPerc*width)) + "px"
		});
		var left = minPerc*width;
		var right = (maxPerc*width)+this.knobSize;
		this.bar.setStyle({
			"left": left + "px",
			"width": (right-left) + "px"
		});
		
		Event.simulate(el, "change");
	},
	
	hook: function(el) {
		el.getValue = this.getValue.bind(this);
		el.setValue = this.setValue.bind(this);
	},

	setup: function(el) {
		this.backTrack = $C(el, "track");
		this.back = $C(this.backTrack, "back");
		
		this.barTrack = $C(el, "track");
		this.bar = $C(this.barTrack, "bar");
		
		this.minKnob = $C(el, "knob.min");
		this.maxKnob = $C(el, "knob.max");
		
		this.min = el.readAttribute("value") || 0;
		this.max = el.readAttribute("value") || 100;
		var valMod = this.max-this.min;
		
		this.values = el.readAttribute("value");
		if(this.values)
			this.values = this.values.split(/[,\s]+/g);
		else
			this.values = [this.min,this.max];
		
		el.addClassName("setup");
		setTimeout((function() {
			this.updateValues();
			this.knobSize = Element.measure(this.minKnob, "width");
			this.makeDraggable(this.minKnob);
			this.makeDraggable(this.maxKnob);
			
			Event.on(this.minKnob, "drag:move", (function(e) {
				var pos = e.memo;
				//console.log(pos);
			
				var width = el.measure("width");
				pos.left = Math.max(0, pos.left);
				pos.left = Math.min(width-(this.knobSize*2), pos.left);
				this.minKnob.setStyle({"left": pos.left + "px"});
				width -= this.knobSize*2;
				
				var left = pos.left;
				var right = (this.knobSize+(((this.values[1] - this.min) / this.max)*width));
				this.bar.setStyle({
					"left": left + "px",
					"width": Math.max(0, right-left) + "px"
				});
				
				pos.left += this.knobSize;
				this.maxKnob.setStyle({"left": Math.max(right, pos.left) + "px"});
				e.stop();
			}).bind(this));
			Event.on(this.maxKnob, "drag:move", (function(e) {
				var pos = e.memo;
				//console.log(pos);
			
				var width = el.measure("width");
				pos.left = Math.max(this.knobSize, pos.left);
				pos.left = Math.min(width-this.knobSize, pos.left);
				this.maxKnob.setStyle({"left": pos.left + "px"});
				width -= this.knobSize*2;
				
				var left = (((this.values[0] - this.min) / this.max)*width);
				var right = pos.left;
				this.bar.setStyle({
					"left": left + "px",
					"width": Math.max(0, right-left) + "px"
				});
				
				pos.left -= this.knobSize;
				this.minKnob.setStyle({"left": Math.min(left, pos.left) + "px"});
				e.stop();
			}).bind(this));
			var boundUpdateValues = this.updateValues.bind(this);
			Event.on(this.minKnob, "drag:stop", (function(e) {
				var val = this.minKnob.measure("left");
				val /= el.measure("width")-(this.knobSize*2);
				val *= valMod;
				val += this.min;
				
				this.values[0] = val;
				this.values[1] = Math.max(val, this.values[1]);
				boundUpdateValues();
			}).bind(this));
			Event.on(this.maxKnob, "drag:stop", (function(e) {
				var val = this.maxKnob.measure("left");
				
				val -= this.knobSize;
				val /= el.measure("width")-(this.knobSize*2);
				val *= valMod;
				val += this.min;
				
				this.values[1] = val;
				this.values[0] = Math.min(this.values[0], val);
				boundUpdateValues();
			}).bind(this));
			boundUpdateValues();
		}).bind(this), 0);
	},
	
	destroy: function(el) {
		this.bar.remove();
		this.maxKnob.remove();
		this.minKnob.remove();
		
		el.removeClassName("setup");
	}

});
