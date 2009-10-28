require("LDAPConfig");

Class({
	id: "LDAPUser",

	"createUser":function(username, password, firstName, lastName, email){
		console.log("createUser", username, password);
		var adminContext = LDAPConfig.getContext()

		var q = "LDAPUser/[?uid='" + username + "']"
		var preexisting = load(q);

		if (preexisting && preexisting[0] && typeof preexisting[0] != 'undefined'){
			throw new Error("Username already exists, please try another"); 
		}
		var pass = "{SHA}"+new java.lang.String(org.apache.commons.codec.digest.DigestUtils.sha(password));
		var ldapUser = LDAPConfig.createUser({username: username, password: password, firstName: firstName, lastName: lastName, email: email})

		var u = {name: username, uid: username, mail: email};
		var toHash = username
		u['regKey']=org.apache.commons.codec.digest.DigestUtils.md5Hex(toHash);

		console.log("Registration Key: ", u['regKey'])
		user = new LDAPUser(u);
		commit();
		try {
			ExternalApp.triggerHooks("createUser", {username: username, password: password, firstName: firstName, lastName: lastName, email: email});
		} catch (e) {
			console.log("Error triggering external createUser hook: ", e);
		}

		var msg = "http://my.dojofoundation.org/verification.html#" + u['regKey']
		var sub = "Account Registration Completed";
		Mail.send(email, msg, sub);	
		return true;
	},

	"importLDAPUser": function(username){
		var q = "LDAPUser/[?uid='" + username + "']"
		var preexisting = load(q);

		if (preexisting && preexisting[0] && typeof preexisting[0] != 'undefined'){
		 	pUser = preexisting[0]
		}else{
			pUser = new LDAPUser({uid: username, name: username});
		}

	
		//var context = LDAPConfig.getContext();
		var dn = LDAPConfig.getUserDN(username);
		var attr = LDAPConfig.getAllAttributes(dn);	
		while (attr.hasMoreElements()){
	                var element = attr.nextElement();
			var name = element.getID();
			var val = element.get();
			if (name != "userPassword"){
				pUser[name]=val;
			}
		}
		commit();

		ExternalApp.triggerHooks("syncUser", pUser);
		return pUser;
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
			var adminContext = LDAPConfig.getContext();
			console.log("User: ", user, user.id, user.uid, user.userPassword + '');
			var mod= new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REMOVE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("pwdAccountLockedTime"));
			adminContext.modifyAttributes(LDAPConfig.getUserDN(user.uid + ''), [mod]);		
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
				var context = LDAPConfig.getContext(uid, oldPassword);
			}catch(e){
				console.log("e", e);
			}
			var mod = new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REPLACE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("userPassword", newPassword));
			context.modifyAttributes(LDAPConfig.getUserDN(uid +''), [mod]);
		}else{
			//console.log("Invalid Password.");
			throw new Error("Unable to change password.  User not authenticated");
		}
	},

	"requestResetPassword": function(email){
	       	//try {
			var total=0;
			console.log("Resetting password for ", email);	
			var adminContext = LDAPConfig.getContext();
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
			 
				var context = LDAPConfig.getContext();
				var mods= [];
				mods.push(new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REPLACE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("userPassword", tempPass)));
				if (!pwdReset){
					mods.push(new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.ADD_ATTRIBUTE, new javax.naming.directory.BasicAttribute("pwdReset", "TRUE")));
				}else{
					mods.push(new javax.naming.directory.ModificationItem(javax.naming.directory.DirContext.REPLACE_ATTRIBUTE, new javax.naming.directory.BasicAttribute("pwdReset", "TRUE")));
				}
				context.modifyAttributes(LDAPConfig.getUserDN(uid), mods);

				var sub = "Password Reset";
				var msg = "Please login using the temporary password '" + tempPass + "'. This password will only work once, so you must change your password on login.";
				console.log("sub: ", sub, "msg: ", msg);
				console.log("To: ", mail);
				Mail.send(mail, msg, sub);	
			}else{	
				throw new Error("Account not found. Please try again or Register.");
			}
	
	},
	"authenticate":function(username,password){
		if (username && password){
			try {
				console.log("call LDAPConfig's Authenticate: ", username, password);
				var user = authenticate(username,password);
				console.log("end LDAPConfig's Authenticate()", user);
			}catch(e){
				if (e.javaException && e.javaException.getMessage()=="[LDAP: error code 50 - Operations are restricted to bind/unbind/abandon/StartTLS/modify password]"){
					throw Error("PasswordResetRequired");
				}
				throw e;
			}
		}else{
			user=null;
		}

	        var requestResponse = org.persvr.remote.Client.getCurrentObjectResponse();
		var request = requestResponse.getHttpRequest();

		if(request != null && !request.getAttribute("cross-site")){
			// allowing authentication from cross-site could allow login CSRF
			var session = request.getSession();
			console.log("Updating session Attribute: ", user);
			if (user && user.uid) {
				session.setAttribute("user",user);
				console.log("setAuthorizedUser: ", user, user.uid);
				requestResponse.getConnection().setAuthorizedUser(user);
				console.log("After setAuthorizedUser Header: ", user);
				return user;
			}else{
				console.log("Clearing user session attribute");
				session.setAttribute("user",null);
				requestResponse.getConnection().setAuthorizedUser(null);
				return null;
			}
        	}
	},

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

searchForUser = function(context, searchstr){
	console.log("searching ldap for user", context, searchstr);
	var searchFilter = "(&(objectclass=*)(|(uid=" +searchstr+ ")(mail="+searchstr+")))"; //(mail=" + searchstr+ "))";
	var returnAttrs = ["uid", "mail", "pwdReset"];
	console.log("Search Filter: ", searchFilter);
	var searchControls = new javax.naming.directory.SearchControls();
	searchControls.setReturningAttributes(returnAttrs);
	var searchBase = LDAPConfig.getBaseUserDN();
	var results = context.search(searchBase, searchFilter, searchControls);
	console.log("Results: ", results.toString());
	return results;
}

getCurrentUser = function(){
        var requestResponse = org.persvr.remote.Client.getCurrentObjectResponse();
	var request = requestResponse.getHttpRequest();
	var session = request.getSession();
	var user=session.getAttribute("user");
	return user;
}

