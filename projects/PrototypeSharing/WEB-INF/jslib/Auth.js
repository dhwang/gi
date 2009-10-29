var stores = require("stores");
var Restrictive = require("facet").Restrictive;
var security = require("pintura").config.security;
var FullAccess = require("security").FullAccess;
var Authenticate = require("security").Authenticate;
var ReadOnly = require("security").ReadOnly;
var authStore = require("db/Auth").store;
var Prototype = require("Prototype");
var LDAPConfig = require("LDAPConfig").LDAPConfig;

var AuthClass = stores.registerStore("Auth", authStore);

security.authClass = AuthClass;
security.authenticate = function(username, password){
	return username;
	var context = LDAPConfig.getContext(username, password);
	var attr = LDAPConfig.getAllAttributes(LDAPConfig.getUserDN(username), context);
};
adminUsers = require("config/admin-users").adminUsers;
security.getAllowedFacets = function(user, request){
	if(adminUsers.indexOf(user) > -1){
		return [Prototype.AdminFacet, FullAccess, Authenticate];
	}
	if(user){
		return [Prototype.AuthenticatedBuilderFacet, Authenticate];
	}
	return [Prototype.BuilderFacet, Authenticate];
}

