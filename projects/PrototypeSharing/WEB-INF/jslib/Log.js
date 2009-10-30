var stores = require("stores");
var Restrictive = require("facet").Restrictive;
var logStore = require("db/Log").store;
var deepCopy = require("util/copy").deepCopy;
var email = require("mail/smtp");
var emailConfig = require("config/mail").config;
var auth = require("jsgi/auth");

var queryToSql = require("store/sql").JsonQueryToSQLWhere("Log", ["id","user","action", "prototype_id", "date"])
var LogClass = stores.registerStore("Log", logStore, 
	{
		query: function(query, options){
			options = options || {};
			var sql = queryToSql(query, options);
			if(sql){
				return logStore.executeSql(
					"SELECT Log.id, prototype_id, Log.user, action, name, date, notes FROM Log, Prototype WHERE prototype_id = Prototype.id AND " +
					sql, options);
			}
			throw new stores.NotFoundError("Query not acceptable");
		},
		prototype: {
			initialize: function(){
				this.date = new Date();
				this.user = auth.currentUser;
				if(this.sendEmail){
					//TODO: get the email address from this.user
					var userEmail = "kriszyp@gmail.com";
					var component = PrototypeClass.get(this.prototype_id);
					email.send(emailConfig,
						{
							recipient: userEmail,
							subject: "Component " + component.name + " was " + this.action,
							message: "Component " + component.name + " was " + this.action +
								this.action == "Accepted" ?
									"." : " due to " + this.notes
						});
				
				}
				delete this.sendEmail; // we don't want to save that property
			}
		}
	}
);
exports.LogClass = LogClass;
exports.LogFacet = Restrictive(LogClass, {});
var PrototypeClass = require("Prototype").PrototypeClass;