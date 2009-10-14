
Class({
        "id": "LDAPConfig",
        "properties": {
                "configType":{optional: true, type: "string"},
	 	"ldapHost": {optional: true, type: "string"},	
                "dn":{optional: true, type: "string"},
                "password":{optional: true, type: "string"},
                "configName":{optional: false, type: "string"}
        },
	"instances": "../LDAPConfig/" 
});
