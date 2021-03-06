var Media = require("media").Media;
Media({
	id:"CDF",
	mediaType:"application/cdf+xml",
	getQuality: function(){
		return 1;
	},
	serialize: function(object, request, response){
		if(typeof object == "string"){
			response.headers["content-disposition"] = "attachment; filename=component.xml";
			return [object];
		}
		return {forEach:function(write){
				write('<data jsxid="jsxroot">\n');
				if(object instanceof Array){
					object.forEach(writeRecord);
				}
				else{
					writeRecord(object);
				}
				function writeRecord(item){
					write(' <record jsxid="' +item.id + '"');
					for(var i in item){
						if(i == "component"){
							continue;
						}
						if(item.hasOwnProperty(i)){
							var value = item[i];
							if(value instanceof Date){
								value = value.getTime();
							}
							if(typeof value == 'string'){
								write(' ' + i + '="' + value.replace(/"/g,"&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"');
							}
							else{
								write(' ' + i + '="' + value + '"');
							}
						}
					}
					write('/>\n');
				}
				write('</data>');
				
		}};
		
	},
	deserialize: function(input, env){
		throw new Error("not implemented yet");
	}
});
