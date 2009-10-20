var Media = require("media").Media;
Media({
	id:"tibco.application",
	mediaType:"application/tibco.application+xml",
	getQuality: function(){
		return 1;
	},
	serialize: function(object, env){
		return [object.component];
	},
	deserialize: function(input, env){
		throw new Error("not implemented yet");
	}
});
