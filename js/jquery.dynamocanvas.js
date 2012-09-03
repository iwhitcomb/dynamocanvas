(function($) {

	$.extend($.fn, {
		dynamoCanvas : function (settings) {
			var settings = $.extend({
				width : this.width(),
				height : this.height()
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
				newLayer : function () {
					var n;
					this.each(function (i, obj) {
						n = layers.length;
						layers[n] = $('<canvas />').addClass('layer').dynamoCanvas(settings);
					});
					return layers[n] || null;
				},
				
				// Lines
				line : function (x1, y1, x2, y2, properties) {
					var properties = $.extend({
						color : '#000',
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
						background : '#000',
						borderColor : '#000',
						borderWidth : 0,
						mode : 'add', // add, subtract, intersect, exclude
					}, properties || {});
					
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						context.fillStyle = properties.background;
						context.strokeStyle = properties.borderColor;
						context.lineWidth = properties.borderWidth;
						
						switch (properties.mode) {
							case 'subtract' :
								context.clearRect(x1, y1, x2, y2);
								break;
							default :
								context.fillRect(x1, y1, x2, y2);
						}
										
						if (properties.borderWidth > 0) {
							context.strokeRect(x1, y1, x2, y2);
						}
						
					});
					return this;
				},
				
				// Shapes
				shape : function (coords, properties) {
					var properties = $.extend({
						background : '#000',
						borderColor : '#000',
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
						background : '#000',
						borderColor : '#000',
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
						color : '#000',
						fontFamily : 'sans-serif',
						fontStyle : 'normal',
						fontSize : '12px',
						borderColor : '#000',
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
					var properties = $.extend({}, properties || {});
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						var img = new Image();
						img.src = url;
						img.onload = function () {
							context.drawImage(this, x, y);
						};
					});
					return this;
				},
				
				// Flatten all layers
				flatten : function () {
					this.each(function (i, obj) {
						var context = obj.getContext('2d');
						$(layers).each(function (n, layer) {
							layer.flatten();
							//var img = new Image();
							var source = layer.context();
							console.log(source);
							//img.src = data;
							//img.onload = function() {
								context.drawImage(source, 0, 0);
							//}
						});
					});
					return this;
				},
				
				context : function() {
					var context;
					this.each(function (i, obj) {
						context = obj.getContext('2d');
					});
					return context;
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
