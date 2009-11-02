var stores = require("stores");
var Restrictive = require("facet").Restrictive;
var security = require("pintura").config.security;
var FullAccess = require("security").FullAccess;
var Authenticate = require("security").Authenticate;
var ReadOnly = require("security").ReadOnly;
var authStore = require("db/Auth").store;
var Prototype = require("Prototype");
var RatingFacet = require("Rating").RatingFacet;
var LDAPConfig = require("LDAPConfig").LDAPConfig;

var AuthClass = stores.registerStore("Auth", authStore);

security.authClass = AuthClass;
security.authenticate = function(username, password){
	return {uid:username};
	var context = LDAPConfig.getContext(username, password);
	var attr = LDAPConfig.getAllAttributes(LDAPConfig.getUserDN(username), null);
	// copy over all the ldap props, except pass
	var user = {};
	while (attr.hasMoreElements()){
		var element = attr.nextElement();
		var name = element.getID();
		var val = element.get();
		if (name != "userPassword"){
			user[name]=val;
		}
	}
	return user;
};
adminUsers = require("config/admin-users").adminUsers;
security.getAllowedFacets = function(user, request){
	if(user && (adminUsers.indexOf(user.uid) > -1)){
		return [Prototype.AdminFacet, RatingFacet, FullAccess, Authenticate];
	}
	if(user){
		return [Prototype.AuthenticatedBuilderFacet, RatingFacet, Authenticate];
	}
	return [Prototype.BuilderFacet, Authenticate];
}

security.getUsername = function(user){
	return user && user.uid;
};