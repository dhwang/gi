var persisted = require("persisted");
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

var AuthClass = persisted.Class("Auth", authStore, {});
var BYPASS_SECURITY = require("settings").BYPASS_SECURITY;

security.authClass = AuthClass; 
security.authenticate = function(username, password){
	if(BYPASS_SECURITY){
		return {uid:username,isAdmin:true};
	}
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
	LDAPConfig.getAllGroups(context).some(function(group){
		if(group.cn === "gi-source"){
			user.isAdmin = group.members.some(function(userString){
				return userString.match("^uid=" + username + ",");
			});
			return true;
		}
	});
	return user;
};
var ADMIN_USERS = require("settings").ADMIN_USERS;
security.getAllowedFacets = function(user, request){
	if(user){
		if(user.isAdmin){
			return [Prototype.AdminFacet, RatingFacet, FullAccess, Authenticate];
		}
		return [Prototype.AuthenticatedBuilderFacet, RatingFacet, Authenticate];
	}
	return [Prototype.BuilderFacet, Authenticate];
}

security.getUsername = function(user){
	return user && user.uid;
};