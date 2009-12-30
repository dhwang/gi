var model = require("model");
var Restrictive = require("facet").Restrictive;
var deepCopy = require("util/copy").deepCopy;
var email = require("mail/smtp");
var auth = require("jsgi/auth");
var NotFoundError = require("errors").NotFoundError;
var SQLStore = require("store/sql").SQLStore;

var logStore = SQLStore({
	table: "Log",
	starterStatements:[
		"CREATE TABLE Log (id INT NOT NULL AUTO_INCREMENT, prototype_id INT, user VARCHAR(100), action VARCHAR(100), notes VARCHAR(2000), date DATETIME, PRIMARY KEY(id))"],
	idColumn:"id",
	indexedColumns: ["id","user","action", "prototype_id", "date"]
});


var LogClass = model.Model("Log", logStore, 
	{
		query: function(query, options){
			options = options || {};
			var sql = logStore.getWhereClause(query, options);
			if(sql){
				return logStore.executeQuery(
					"SELECT Log.id, prototype_id, Log.user, action, name, date, notes FROM Log, Prototype WHERE prototype_id = Prototype.id AND " +
					sql, options);
			}
			throw NotFoundError("Query not acceptable");
		},
		prototype: {
			initialize: function(){
				this.date = new Date();
				this.user = auth.currentUser.uid;
				if(this.sendEmail){
					//TODO: get the email address from this.user
					var userEmail = this.user + "@dojotoolkit.org";
					var component = PrototypeClass.get(this.prototype_id);
					email.send(
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