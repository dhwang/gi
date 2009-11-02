var LDAP_SETTINGS = require("LDAP-settings").LDAP_SETTINGS;
var LDAPConfig = exports.LDAPConfig = Class({
        "id": "LDAPConfig",
        "properties": {
	 	"ldapURL": {optional: true, type: "string"},	
                "adminDN":{optional: true, type: "string"},
                "adminPassword":{optional: true, type: "string"},
                "name":{optional: false, type: "string"},
		"baseDN": {optional: false, type: "string"},
		"baseGroupDN": {optional: true, type: "string"},
		"baseUserDN": {optional: true, type: "string"},
		"groupFilter": {optional: false, type: "string", "default":"(objectclass=groupOfNames)"},
		"groupAttributes": {optional: false, type: "array", "default":["cn", "member"]},
		"groupMemberAttribute": {optional: false, type: "string", "default":"member"},
		"defaultUserGroups": {optional: true, type: "array"},
		"userRDN": {optional: true, type: "string", "default": "uid"},
		"contexts": {optional: true, "transient": true},
		"active": {optional: true, type: "boolean", "default": true},
		"userAttributeMap":  {optional: false, type: "object", "default": {
			"uid": ["username"],
			"userPassword": ["password"],
			"givenName": ["firstName"],
			"sn": ["lastName"],
			"mail": ["email"],
			"cn": ["firstName", "lastName"]
		}},
		"userObjectClasses": {optional: false, type: "array", "default": ["top", "inetOrgPerson"]}
        },
	"prototype": {
		"getContext": function(username, password){
			print("instance getContext()", this, username);
			var authEnv = new java.util.Hashtable(11);
			if (typeof username != 'undefined') {
				var dn = this.getUserDN(username);
			}else{
				var dn=this.adminDN;
				var password = this.adminPassword;
			}

			var ldapURL = this.ldapURL;

			if (!this.contexts){
				this.contexts={};
			}

			if (this.contexts[dn]){
				print("Returning existing context");
				return this.contexts[dn];
			}
	
			print("getLdapContext: ", dn, ldapURL);
			authEnv.put(javax.naming.Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
			authEnv.put(javax.naming.Context.PROVIDER_URL, ldapURL);
			authEnv.put(javax.naming.Context.SECURITY_AUTHENTICATION, "simple");
			authEnv.put(javax.naming.Context.SECURITY_PRINCIPAL, dn);
			print("password" + password);
			authEnv.put(javax.naming.Context.SECURITY_CREDENTIALS, password);
			this.contexts[dn] = new javax.naming.directory.InitialDirContext(authEnv);
			return this.contexts[dn];
		},

		"getBaseUserDN": function(){
			return this.baseUserDN;
		},

		"getUserDN": function(username){
			var base = this.baseUserDN;
			var rdn = this.userRDN;
			return rdn + "=" + username + "," + base
		},

		"getAllAttributes": function(dn, context){
			if (!context){
				context = this.getContext();
			}
       			return context.getAttributes(dn).getAll();
		},

		"getAllGroups": function(context){
			if (!context){
				context = this.getContext();
			}
			var sc = new javax.naming.directory.SearchControls();
			sc.setReturningAttributes(this.groupAttributes);
			sc.setSearchScope(javax.naming.directory.SearchControls.SUBTREE_SCOPE);	
			var results = context.search(this.baseGroupDN, this.groupFilter, sc);
			var groups = []
			while(results.hasMore()){
				var sr = results.next();
				print("sr: ", sr);
				var g = {};
				var attrs = sr.getAttributes();
				g.members = [];
				this.groupAttributes.forEach(function(p){
					print("Getting Attribute: ", p);
					if (p==this.groupMemberAttribute){
						var mems = attrs.get(p).getAll();
						while(mems.hasMore()){
							g.members.push(mems.next());
						};
					}else{
						g[p] = attrs.get(p).get();
					}
				}, this);
				groups.push(g);	
			} 
			return groups;
		},

		"createUser": function(params){
                	var BasicAttributes = javax.naming.directory.BasicAttributes;
	                var BasicAttribute = javax.naming.directory.BasicAttribute;
			print("createUser: ", serialize(params));
			var attrs = new BasicAttributes(true);
			print("LDAP Config instance: ", this);
			if (this.userAttributeMap){
				print("found userAttributeMap")
			}else{
				print("couldn't access userAttributeMap");
			}
			for (var i in this.userAttributeMap){
				var valArr = this.userAttributeMap[i].map(function(v){
					return params[v];
				});
				var val = valArr.join(' ');
				attrs.put(new BasicAttribute(i, val));
			}
			attrs.put(new javax.naming.directory.BasicAttribute("pwdAccountLockedTime", "000001010000Z"));
			var objClasses = new javax.naming.directory.BasicAttribute("objectclass");
			this.userObjectClasses.forEach(function(c){
				objClasses.add(c);
			});
                	attrs.put(objClasses);
			var dn = LDAPConfig.getUserDN(params.username);
			var context = LDAPConfig.getContext();
			var entry = context.createSubcontext(dn, attrs);
			if (this.defaultUserGroups) {
				this.defaultUserGroups.forEach(function(g){
					var groupDN = g + "," + this.baseGroupDN;
					var errors=[]		
					try {	
						var adminContext = this.getContext();
						var mod= new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.ADD_ATTRIBUTE, new javax.naming.directory.BasicAttribute(this.groupMemberAttribute, dn));
			                        adminContext.modifyAttributes(groupDN, [mod]);
					}catch(e){
						console.warn("Unable to add user to default group:", g, groupDN, dn);
						print("Error: ", e);
						errors.push(e);
					}

					if (errors.length>0){
						throw new Error("Account was created, however you could not be added to " + errors.length + " groups.  Please notify support." + errors);
					}
				}, this);
			}
		}
	},

	getContext: function(username, password){
		return LDAP_SETTINGS.getContext.apply(LDAP_SETTINGS, arguments);
	},
	"createUser": function(params){
		return LDAP_SETTINGS.createUser.apply(LDAP_SETTINGS, arguments);
	},
	
	getBaseUserDN: function(username){
		return LDAP_SETTINGS.getBaseUserDN.apply(LDAP_SETTINGS, arguments);
	
	},

	getUserDN: function(username){
		return LDAP_SETTINGS.getUserDN.apply(LDAP_SETTINGS, arguments);
	
	},
	getAllAttributes: function(dn, context){
		return LDAP_SETTINGS.getAllAttributes.apply(LDAP_SETTINGS, arguments);
	},
	getAllGroups: function(context){
		return LDAP_SETTINGS.getAllGroups.apply(LDAP_SETTINGS, arguments);
	}

});
LDAP_SETTINGS.__proto__ = LDAPConfig.prototype;

authenticate = function(username, password){
        print("LDAPConfig authenticate()", username, password);
        if(username == null){
                throw new AccessError("Missing Username or Password");
        }

	var context = LDAPConfig.getContext(username, password);
	var attr = LDAPConfig.getAllAttributes(LDAPConfig.getUserDN(username), context);
	var query = "LDAPUser/[?uid='" + username + "']";
	print("Query: ", query, username);
	var users=load(query);
	print("load results[0]: ", users, users[0]);
	//user was authenticated, but not in persevere, create them
	if (!users || typeof users == 'undefined' || users.length<1){
		print("LDAPUser didn't exist for ", username, ': Auto Import');
		var u = new LDAPUser.importLDAPUser(username);
		//throw AccessError("AutoImport Disabled");
	}else{
		var u=users[0];
		print("Authenticated User: ", u);
	}

	// copy over all the ldap props, except pass
	while (attr.hasMoreElements()){
		var element = attr.nextElement();
		var name = element.getID();
		var val = element.get();
		if (name != "userPassword"){
			u[name]=val;
		}
	}
	commit();
	print("Returning Authenticated User: ", u);
	return u;
}
