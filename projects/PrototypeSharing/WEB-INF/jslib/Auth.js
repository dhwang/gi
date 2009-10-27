var stores = require("stores");
var Restrictive = require("facet").Restrictive;
var security = require("pintura").pinturaApp.security;
var FullAccess = require("security").FullAccess;
var Authenticate = require("security").Authenticate;
var ReadOnly = require("security").ReadOnly;
var authStore = require("db/Auth").store;
var Prototype = require("Prototype");

var AuthClass = stores.registerStore("Auth", authStore);

security.authStore = authStore;
adminUsers = ["kris", "bryan"];
security.getAllowedFacets = function(user, request){
	if(adminUsers.indexOf(user) > -1){
		return [Prototype.AdminFacet, FullAccess, Authenticate];
	}
	if(user){
		return [Prototype.AuthenticatedBuilderFacet, Authenticate];
	}
	return [Prototype.BuilderFacet, Authenticate];
}

