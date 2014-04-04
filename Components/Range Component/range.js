Framework.Components.registerComponent("range", {
	
	getValue: function() {
		return this.values;
	},
	
	getMinimum: function() {
		return this.min;
	},
	
	getMaximum: function() {
		return this.max;
	},
	
	setMinimum: function(min) {
		this.min = min;
		this.updateValues();
	},
	
	setMaximum: function(max) {
		this.max = max;
		this.updateValues();
	},
	
	setValue: function(val) {
		if(this.oldValues[0] == val[0] && this.oldValues[1] == val[1]) {
			this.updateLayout();
			return; // No update
		}
		
		this.values = val;
		this.oldValues = val.slice(0);
		this.updateValues();
	},
	
	updateLayout: function() {
		var el = this.getElement();
		var width = el.measure("width")-(this.knobSize*2);
		var minPerc = ((this.values[0] - this.min) / this.valMod);
		var maxPerc = ((this.values[1] - this.min) / this.valMod);
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
	},
	
	updateValues: function() {
		var el = this.getElement();
		this.updateLayout(el);
		
		Event.simulate(el, "change");
	},
	
	hook: function(el) {
		el.getValue = this.getValue.bind(this);
		el.setValue = this.setValue.bind(this);
	},
	
	updateAttributes: function(el) {
		this.min = el.readAttribute("min")*1 || 0;
		this.max = el.readAttribute("max")*1 || 100;
		this.tick = el.readAttribute("tick")*1 || 1;
		this.valMod = this.max-this.min;
		
		this.values = el.readAttribute("value");
		if(this.values) {
			this.values = this.values.split(/[,\s]+/);
			this.values = [this.values[0]*1,this.values[1]*1];
		} else
			this.values = [this.min,this.max];
		this.oldValues = this.values.slice(0);
		
		this.updateLayout(el);
	},

	setup: function(el) {
		this.backTrack = $C(el, "track");
		this.back = $C(this.backTrack, "back");
		
		this.barTrack = $C(el, "track");
		this.bar = $C(this.barTrack, "bar");
		
		this.minKnob = $C(el, "knob.min");
		this.maxKnob = $C(el, "knob.max");
		
		el.addClassName("setup");
	},
	
	setupLayout: function(el) {
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
			var right = (this.knobSize+(((this.values[1] - this.min) / this.valMod)*width));
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
			
			var left = (((this.values[0] - this.min) / this.valMod)*width);
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
			console.log(val);
			val *= this.valMod;
			val += this.min;
			
			val = [val,Math.max(val, this.values[1])];
			val[0] = Math.round(val[0] * this.tick) / this.tick;
			val[1] = Math.round(val[1] * this.tick) / this.tick;
			this.setValue(val);
		}).bind(this));
		Event.on(this.maxKnob, "drag:stop", (function(e) {
			var val = this.maxKnob.measure("left");
			
			val -= this.knobSize;
			val /= el.measure("width")-(this.knobSize*2);
			console.log(val);
			val *= this.valMod;
			val += this.min;
			
			val = [Math.min(this.values[0], val),val];
			val[0] = Math.round(val[0] * this.tick) / this.tick;
			val[1] = Math.round(val[1] * this.tick) / this.tick;
			this.setValue(val);
		}).bind(this));
	},
	
	destroy: function(el) {
		this.bar.remove();
		this.maxKnob.remove();
		this.minKnob.remove();
		
		el.removeClassName("setup");
	}

});