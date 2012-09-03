/*
source-atop
source-in
source-out
source-over
destination-atop
destination-in
destination-out
destination-over
lighter
darker
xor
copy
*/
(function($) {

	$.extend($.fn, {
		dynamoCanvas : function (settings) {
			var settings = $.extend({
				width : this.width(),
				height : this.height(),
				op : 'destination-over'
			}, settings || {});
			var layers = [];
			
			this.addClass('dynamo-canvas').attr({
				width : settings.width,
				height : settings.height,
			});
			
			// Extend canvas with drawing methods
			$.extend(this, {
				settings : settings,
				layers : layers,
				
				// Add a new layer to this canvas
				newLayer : function (options) {
					var options = $.extend({
						width : settings.width,
						height : settings.height,
						op : 'source-over'
					}, options || {});
					var n;
					this.each(function (i, obj) {
						n = layers.length;
						layers[n] = $('<canvas />').addClass('layer').dynamoCanvas(options);
					});
					return layers[n] || null;
				},
				
				// Lines
				line : function (x1, y1, x2, y2, properties) {
					var properties = $.extend({
						color : 'black',
						width : 1,
					}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.strokeStyle = properties.color;
						context.lineWidth = properties.width;
						context.beginPath();
						context.moveTo(x1, y1);
						context.lineTo(x2, y2);
						context.stroke();
					});
					return this;
				},
				
				// Rectangles
				rect : function (x1, y1, x2, y2, properties) {
					var properties = $.extend({
						background : 'black',
						borderColor : 'black',
						borderWidth : 0,
					}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.fillStyle = properties.background;
						context.strokeStyle = properties.borderColor;
						context.lineWidth = properties.borderWidth;
						context.fillRect(x1, y1, x2, y2);
						if (properties.borderWidth > 0) {
							context.strokeRect(x1, y1, x2, y2);
						}
					});
					return this;
				},
				
				// Shapes
				shape : function (coords, properties) {
					var properties = $.extend({
						background : 'black',
						borderColor : 'black',
						borderWidth : 0,
					}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.fillStyle = properties.background;
						context.strokeStyle = properties.borderColor;
						context.lineWidth = properties.borderWidth;
						// Shapes must have a minimum of 3 points
						if (coords.length >= 3) {
							context.beginPath();
							$(coords).each(function (n, coord) {
								if (n === 0) {
									context.moveTo(coord.x, coord.y);
								}
								else {
									context.lineTo(coord.x, coord.y);
								}
							});
							context.fill();
							if (properties.borderWidth > 0) {
								context.stroke();
							}
							context.closePath();
						}						
					});
					return this;
				},
				
				// Circles
				circle : function (x, y, radius, start, stop, properties) {
					var start = start || 0; 
					var stop = stop || 360;
					var properties = $.extend({
						background : 'black',
						borderColor : 'black',
						borderWidth : 0,
					}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.fillStyle = properties.background;
						context.strokeStyle = properties.borderColor;
						context.lineWidth = properties.borderWidth;
						context.beginPath();
						context.arc(x, y, radius, ((2*Math.PI)/360) * start, ((2*Math.PI)/360) * stop);
						context.fill();
						if (properties.borderWidth > 0) {
							context.stroke();
						}
					});
					return this;
				},
				
				// Text
				text : function (text, x, y, properties) {
					var properties = $.extend({
						color : 'black',
						fontFamily : 'sans-serif',
						fontStyle : 'normal',
						fontSize : '12px',
						borderColor : 'black',
						borderWidth : 0,
						baseline : 'top' // top, bottom
					}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.fillStyle = properties.color;
						context.strokeStyle = properties.borderColor;
						context.lineWidth = properties.borderWidth;
						context.textBaseline = properties.baseline;
						context.font = properties.fontStyle + ' ' + properties.fontSize + ' ' + properties.fontFamily;
						context.fillText(text, x, y);
						if (properties.borderWidth > 0) {
							context.strokeText(text, x, y);
						}
						context.closePath();
					});
					return this;
				},
				
				// Images
				image : function (url, x, y, properties) {
					var properties = $.extend({
						width : null,
						height : null
					}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						var img = new Image();
						img.onload = function () {
							context.drawImage(this, x, y, properties.width || this.width, properties.height || this.height);
						};
						img.src = url;
					});
					return this;
				},
				
				// Linear Gradients
				linearGradient : function (x1, y1, x2, y2, stops) {
					var context, gradient;
					this.each(function (i, obj) {
						context = obj.getContext('2d');
						gradient = context.createLinearGradient(x1, y1, x2, y2);
						for (i in stops) {
							gradient.addColorStop(stops[i].position, stops[i].color);
						}
					});
					return gradient;
				},
				
				// Radial Gradients
				radialGradient : function (x1, y1, r1, x2, y2, r2, stops) {
					var context, gradient;
					this.each(function (i, obj) {
						context = obj.getContext('2d');
						gradient = context.createRadialGradient(x1, y1, r1, x2, y2, r2);
						for (i in stops) {
							gradient.addColorStop(stops[i].position, stops[i].color);
						}
					});
					return gradient;
				},
				
				// Flatten all layers
				flatten : function () {
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.globalCompositeOperation = settings.op;
						$(layers).each(function (n, layer) {
							layer.flatten();
							context.drawImage(layer.canvas(), 0, 0);
						});
					});
					return this;
				},
				
				canvas : function() {
					var canvas;
					this.each(function (i, obj) {
						canvas = obj;
					});
					return canvas;
				},
				
				// Base64 encode canvas
				encode : function () {
					var data;
					this.each(function(i, obj) {
						data = obj.toDataURL('image/png');
					});
					return data;
				}
				
				
				
			});
			return this;
		}
	});
})(jQuery);
