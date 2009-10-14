Class({
	id: "LDAPUser",

	"createUser":function(username, password, firstName, lastName, email){
		console.log("createUser", username, password);
		var adminContext = getLdapContext("admin");
		if (isLdapUser(adminContext, username)){
			throw new Error("Username already exists");
		}
			var pass = "{SHA}"+new java.lang.String(org.apache.commons.codec.digest.DigestUtils.sha(password));
			var ldapUser = createLdapUser("admin", adminContext, username, password, firstName, lastName, email)

			var u = {name: username, uid: username, mail: email};
			var toHash = username
			u['regKey']=org.apache.commons.codec.digest.DigestUtils.md5Hex(toHash);

			console.log("Registration Key: ", u['regKey'])
			user = new LDAPUser(u);
			//.createUser(u);

			commit();
			sendNewAccountMail(email, u['regKey']);		
				
			return true;
	},
	"grantAccess":function(username, resource, accessLevel){
		console.log("grantAccess", username, resource, accessLevel);	
	},

	"verify": function(token){
        	try {
			var user=load("LDAPUser/[?regKey=$1]",token)[0];
			if (!user){
				throw new Error("Invalid Registration Key");
			}

			console.log("Resetting password for ", user.uid, user.userPassword);	
			var adminContext = getLdapContext("admin");
			console.log("User: ", user, user.id, user.uid, user.userPassword + '');
			var mod= new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REMOVE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("pwdAccountLockedTime"));
			adminContext.modifyAttributes(getUserDn("user", user.uid + ''), [mod]);		
			user['regKey']=undefined;
			commit();
                }catch(e){
                	throw AccessError(e);
	        }

	},

	"changePassword": function(oldPassword, newPassword, username){
		if (!oldPassword){
			throw new Error("Old Password must be supplied");
		}			

		if (!newPassword){
			throw new Error("New Password cannot be empty");
		}	

		var currentUser = getCurrentUser();
		if (currentUser){
			var user = authenticate(currentUser.uid, oldPassword);
		}
		var uid;
		if (user && user.uid){
			uid=user.uid;
		}else{
			if (username){
				uid=username;
			}else{
				throw Error("no username supplied");
			}
		}

		if (uid){
			try {
				var context = getLdapContext("user", uid, oldPassword);
			}catch(e){
				console.log("e", e);
			}
			var mod = new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REPLACE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("userPassword", newPassword));
			context.modifyAttributes(getUserDn("user", uid +''), [mod]);
		}else{
			//console.log("Invalid Password.");
			throw new Error("Unable to change password.  User not authenticated");
		}
	},

	"requestResetPassword": function(email){
	       	//try {
			var total=0;
			console.log("Resetting password for ", email);	
			var adminContext = getLdapContext("admin");
			console.log("Admin Context: ", adminContext);
			var searchResults = searchForUser(adminContext, email);
			console.log("searchResults", searchResults);

			if(searchResults.hasMoreElements()){
				var sr = searchResults.next();
				var attrs = sr.getAttributes();
				var uid=attrs.get("uid").get();
				var mail=attrs.get("mail").get();
				try {
					var pwdReset=attrs.get("pwdReset").get();
				}catch(e){}
				console.log("uid: ", uid, mail);
				if (!uid){
					throw new Error("Account not found.  Please register.");
				}
				if (!uid && !mail){
					throw new Error("Invalid Email Address.  Contact support");	
				}

				function randomString() {
					var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
					var string_length = 16;
					var randomstring = '';
					for (var i=0; i<string_length; i++) {
						var rnum = Math.floor(Math.random() * chars.length);
						randomstring += chars.substring(rnum,rnum+1);
					}
					return randomstring
				}
				var tempPass = randomString();
			 
				var context = getLdapContext("admin");
				var mods= [];
				mods.push(new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REPLACE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("userPassword", tempPass)));
				if (!pwdReset){
					mods.push(new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.ADD_ATTRIBUTE, new javax.naming.directory.BasicAttribute("pwdReset", "TRUE")));
				}else{
					mods.push(new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REPLACE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("pwdReset", "TRUE")));
				}
				context.modifyAttributes(getUserDn("user", uid), mods);

				sendResetPasswordMail(mail, tempPass);
			}else{	
				throw new Error("Account not found. Please try again or Register.");
			}
	
	},
	"authenticate":function(username,password){
		console.log("LDAPUser auth func start");
		if (username && password){
			try {
				var user = authenticate(username,password);
			}catch(e){
				if (e.javaException && e.javaException.getMessage()=="[LDAP: error code 50 - Operations are restricted to bind/unbind/abandon/StartTLS/modify password]"){
					throw Error("PasswordResetRequired");
				}
				throw e;
			}

		}else{
			user=null;
		}
		console.log("authenticated user: ", user);
	        var requestResponse = org.persvr.remote.Client.getCurrentObjectResponse();
		var request = requestResponse.getHttpRequest();

		if(request != null && !request.getAttribute("cross-site")){
			// allowing authentication from cross-site could allow login CSRF
			var session = request.getSession();
			console.log("setting user session attribute", user);
			if (user && user.uid) {
				console.log("UID: ", user.uid);
			}
			console.log("session.setAttribute", user);
			session.setAttribute("user",user);
			console.log("setAuthorizedUser: ", user, user.uid);
			requestResponse.getConnection().setAuthorizedUser(user);
			console.log("after setAuthorizedUser");
        	}
		return user;
	},
	/*
	"getCurrentUser":function(){
		//return session.getAttribute("user");
		//return getCurrentUser();
		console.log("LDAPUser getCurrentUser: ", security.currentUser, getCurrentUser());
		return security.currentUser;
	},*/

	"instances":{"$ref":"../LDAPUser/"}
});
getUserName = function(){
	var user = getCurrentUser();
	console.log("getUsername", user);
	// best attempt at the current user name
	if (user && user.uid) {
		console.log("Got username from user: ", user.uid);
		return user.uid;
	}else if(user && typeof user=='string'){
		console.log("user was a string, returning as uname");
		return user;
	}else{
		console.log("no user returned from getCurrentUser");
		return null;
	}
}


authenticate = function(username, password){
	console.log("normal authenticate function start");
        if(username == null){
                //signing out
		console.log("authenticate username:", username, password);
		throw new AccessError("Missing Username or Password");
        }

//                var context = getLdapContext("admin", username, password);
   //             var attr = getLdapAttributes(context, getUserDn("auth", username));
		var query = "LDAPUser/[?uid=$1]";
		console.log("Query: ", query, username);
                var users=load("LDAPUser/[?uid=$1]",username)
		console.log("users: ", users);
		for (var i in users){
			console.log("users ", i, users[i]);
		}
		//user was authenticated, but not in persevere, create them
		if (!users || users.length<1){
			//console.log("LDAPUser didn't exist for ", username, ': Auto Import');
			//var u = new LDAPUser({uid: username, name: username});
			//commit();
			throw AccessError("AutoImport Disabled");
		}else{
			console.log("Have user in auth: ", u);
			var u=users[0];
		}
		console.log
		// copy over all the ldap props, except pass
    /*            while (attr.hasMoreElements()){
                        var element = attr.nextElement();
                        var name = element.getID();
                        var val = element.get();
                        if (name != "userPassword"){
                                u[name]=val;
                        }
                }*/
		commit();
		console.log("Returning user from auth function: ", u);
                return u;
}

debugLdapAttr = function(attr){
                while (attr.hasMoreElements()){
                        var element = attr.nextElement();
                        var name = element.getID();
                        var val = element.get();
			console.log("Name: ", name, "val: ", val);
                }
}
getLdapContext= function(config, username, password){
        var authEnv = new java.util.Hashtable(11);
	if (username) {
		var dn = getUserDn(config, username);	
		var ldapURL="ldap://ldap.dojotoolkit.com";
	}else{
		var dn="cn=Admin,dc=dojotoolkit,dc=org";
		var ldapURL="ldap://ldap.dojotoolkit.com";
		var password = "Dldp1nS."
	}

	console.log("getLdapContext: ", dn, ldapURL);
        authEnv.put(javax.naming.Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        authEnv.put(javax.naming.Context.PROVIDER_URL, ldapURL);
        authEnv.put(javax.naming.Context.SECURITY_AUTHENTICATION, "simple");
        authEnv.put(javax.naming.Context.SECURITY_PRINCIPAL, dn);
        authEnv.put(javax.naming.Context.SECURITY_CREDENTIALS, password);

        return new javax.naming.directory.InitialDirContext(authEnv);
}

createLdapUser = function(config, context, username, password, firstName, lastName, email){
	var attrs = new javax.naming.directory.BasicAttributes(true);
	attrs.put(new javax.naming.directory.BasicAttribute("uid", username));
	attrs.put(new javax.naming.directory.BasicAttribute("userPassword", password));
	attrs.put(new javax.naming.directory.BasicAttribute("givenName", firstName));
	attrs.put(new javax.naming.directory.BasicAttribute("sn", lastName));
	attrs.put(new javax.naming.directory.BasicAttribute("mail", email));
	attrs.put(new javax.naming.directory.BasicAttribute("cn", firstName + " " + lastName));
        attrs.put(new javax.naming.directory.BasicAttribute("pwdAccountLockedTime", "000001010000Z"));
        var objClasses = new javax.naming.directory.BasicAttribute("objectclass");
	objClasses.add("top");
	objClasses.add("inetOrgPerson");
	attrs.put(objClasses);
	var dn = getUserDn(config, username)
	var entry = context.createSubcontext(dn, attrs);
}

getUserDn = function(config, username, base){
	if (!base){
		base = "ou=people,dc=dojotoolkit,dc=org";
	}
	return "uid="+username+","+base
}
getLdapAttributes = function(context, dn){
       console.log("Getting Ldap Attributes for: ", dn);
       return context.getAttributes(dn).getAll();
}

searchForUser = function(context, searchstr){
	console.log("searching ldap for user", context, searchstr);
	var searchFilter = "(&(objectclass=*)(|(uid=" +searchstr+ ")(mail="+searchstr+")))"; //(mail=" + searchstr+ "))";
	var returnAttrs = ["uid", "mail", "pwdReset"];
	console.log("Search Filter: ", searchFilter);
	var searchControls = new javax.naming.directory.SearchControls();
	searchControls.setReturningAttributes(returnAttrs);
	var searchBase = "ou=people,dc=dojotoolkit,dc=org";
	var results = context.search(searchBase, searchFilter, searchControls);
	console.log("Results: ", results.toString());
	return results;
}

isLdapUser = function(context, username){
	try {
		var attr = getLdapAttributes(context, getUserDn("admin", username));
		return true;
	}catch(e){
		console.log("Not an ldap user:", username)	
		return false;
	}
}

sendNewAccountMail = function(recipient, key){
	var props =  new java.util.Properties();
	props.put("mail.smtp.host", "192.168.37.25");
	props.put("mail.smtp.port", "25");
	var session = javax.mail.Session.getDefaultInstance(props);
	var msg = new javax.mail.internet.MimeMessage(session);
	var from = new javax.mail.internet.InternetAddress("support@dojotoolkit.org");
	msg.setFrom(from);
	var to = new javax.mail.internet.InternetAddress(recipient);
	msg.setRecipients(javax.mail.Message.RecipientType.TO, to);
	msg.setSubject("Account Registration Completed");
	msg.setText("http://mail.dojotoolkit.org/s/verification.html#" + key);
	console.log("Sending Message: ", msg);
	//session.getTransport().Transport(msg);
	javax.mail.Transport.send(msg);
}
sendResetPasswordMail = function(recipient, tempPass){
	var props =  new java.util.Properties();
	props.put("mail.smtp.host", "192.168.37.25");
	props.put("mail.smtp.port", "25");
	var session = javax.mail.Session.getDefaultInstance(props);
	var msg = new javax.mail.internet.MimeMessage(session);
	var from = new javax.mail.internet.InternetAddress("support@dojotoolkit.org");
	msg.setFrom(from);
	var to = new javax.mail.internet.InternetAddress(recipient);
	msg.setRecipients(javax.mail.Message.RecipientType.TO, to);
	msg.setSubject("Password Reset");
	msg.setText("Please login using the temporary password '" + tempPass + "'. This password will only work once, so you must change your password on login.");
	console.log("Sending Message: ", msg);
	//session.getTransport().Transport(msg);
	javax.mail.Transport.send(msg);
}


getCurrentUser = function(){
	console.log("getCurrentUser global");
	
        var requestResponse = org.persvr.remote.Client.getCurrentObjectResponse();
	var request = requestResponse.getHttpRequest();
	var session = request.getSession();
	var user=session.getAttribute("user");
	console.log("global get user user: ", user);
	return user;
	
	//return security.currenUser;
}

