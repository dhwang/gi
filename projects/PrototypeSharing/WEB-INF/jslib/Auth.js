var persistence = require("persistence");
var Restrictive = require("facet").Restrictive;
var security = require("pintura").config.security;
var FullAccess = require("security").FullAccess;
var Authenticate = require("security").Authenticate;
var ReadOnly = require("security").ReadOnly;
var Prototype = require("Prototype");
var RatingFacet = require("Rating").RatingFacet;
var LDAPConfig = require("LDAPConfig").LDAPConfig;

var SQLStore = require("store/sql").SQLStore;

var authStore = SQLStore({
	table: "Auth",
	starterStatements:[
		"CREATE TABLE Auth (id BIGINT NOT NULL, user VARCHAR(1000), PRIMARY KEY(id))"],
	idColumn:"id"
});

var AuthClass = persistence.Class("Auth", authStore, {});

security.authClass = AuthClass; 
security.authenticate = function(username, password){
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
var ADMIN_USERS = require("settings").ADMIN_USERS;
security.getAllowedFacets = function(user, request){
	if(user && (ADMIN_USERS.indexOf(user.uid) > -1)){
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