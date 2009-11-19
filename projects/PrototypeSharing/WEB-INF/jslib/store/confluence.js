/**
 * A store for connecting to the confluence wiki
 */
var jsonQuery = require("../json-query").jsonQuery;
var extendSome = require("lazy").extendSome;
var XmlRpc = require("xml-rpc").XmlRpc;
var CONFLUENCE = require("settings").CONFLUENCE;
var token;
exports.Confluence = function(options){
	var rpc = XmlRpc(CONFLUENCE.url + "rpc/xmlrpc");
	function confluenceCall(methodName, params){
		params.unshift(token);
		try{
			return rpc("confluence1." + methodName, params);
		}catch(e){
			if(e.message.match(/NotPermittedException/)){
				// failed to login, time to re-login and try again
				params[0] = token = rpc("confluence1.login", [CONFLUENCE.username, CONFLUENCE.password]);
				return rpc("confluence1." + methodName, params);
			}
		} 
		
	}
	return {
		get: function(id){
			return confluenceCall("getPage", [id]);
		},
		put: function(object, id){
			var newObject = confluenceCall("storePage", [object]);
			print("stored " + newObject);
			for(var i in newObject){
				object[i] = newObject[i];
			}
			return object.id;
		},
		query: function(query, options){
			return confluenceCall("getChildren", [CONFLUENCE.listingPageId]);
		},
		"delete": function(id){
			return confluenceCall("removePage", [id]);
		}
	};
};