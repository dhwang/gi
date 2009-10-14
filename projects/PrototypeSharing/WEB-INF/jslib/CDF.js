var Media = require("media").Media;
Media({
	id:"CDF",
	mediaType:"application/cdf+xml",
	getQuality: function(){
		return 1;
	},
	serialize: function(object, env){
		
		return {forEach:function(write){
				write('<data jsxid="jsxroot">\n');
				print("CDF " + (object instanceof Array) + " " + object.forEach);
				if(object instanceof Array){
					object.forEach(function(item){
						print("in foreach");
						write(' <record jsxid="' +item.id + '"');
						for(var i in item){
							if(item.hasOwnProperty(i)){
								var value = item[i];
								if(typeof value == 'string'){
									write(' ' + i + '="' + value.replace(/"/,"&quot") + '"');
								}
								else{
									write(' ' + i + '="' + value + '"');
								}
							}
						}
						write('/>\n');
					});
				}
				write('</data>');
				
		}};
		
	},
	deserialize: function(input, env){
		throw new Error("not implemented yet");
	}
});
