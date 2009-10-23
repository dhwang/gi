var stores = require("stores");
var SchemaFacet = require("facet").SchemaFacet;
var security = require("pintura").pinturaApp.security;
var FullAccess = require("security").FullAccess;
var ReadOnly = require("security").ReadOnly;
var authStore = require("db/Auth").store;
var Prototype = require("Prototype");

var AuthClass = stores.registerStore("Auth", authStore);

security.authStore = authStore;
adminUsers = ["kris", "bryan"];
security.getAllowedFacets = function(user, request){
	if(adminUsers.indexOf(user) > -1){
		return [FullAccess];//[Prototype.AdminFacet, FullAccess];
	}
	if(user){
		return [FullAccess];//[Prototype.BuilderFacet];
	}
	return [ReadOnly];
}

SchemaFacet(AuthClass, {
	additionalProperties: {readonly: true},
	prototype: {
	}
});
