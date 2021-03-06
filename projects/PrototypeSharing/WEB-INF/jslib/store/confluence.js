/**
 * A store for connecting to the confluence wiki
 */
var jsonQuery = require("../json-query").jsonQuery;
var extendSome = require("lazy").extendSome;
var XmlRpc = require("xml-rpc").XmlRpc;
var confluenceSettings = require("settings").confluence;
var token;
exports.Confluence = function(options){
	var rpc = XmlRpc(confluenceSettings.url + "rpc/xmlrpc");
	function confluenceCall(methodName, params){
		params.unshift(token);
		try{
			return rpc("confluence1." + methodName, params);
		}catch(e){
			if(e.message.match(/NotPermittedException|InvalidSessionException/)){
				// failed to login, time to re-login and try again
				params[0] = token = rpc("confluence1.login", [confluenceSettings.username, confluenceSettings.password]);
				return rpc("confluence1." + methodName, params);
			}
			throw e;
		} 
		
	}
	return {
		get: function(id){
			return confluenceCall("getPage", [id]);
		},
		put: function(object, id){
			var newObject = confluenceCall("storePage", [object]);
			for(var i in newObject){
				object[i] = newObject[i];
			}
			//confluenceCall("addLabelByName",[object.tags, object.id]);
			return object.id;
		},
		query: function(query, options){
			return confluenceCall("getChildren", [confluenceSettings.listingPageId]);
		},
		"delete": function(id){
			return confluenceCall("removePage", [id]);
		}
	};
};