var stores = require("stores");
var Restrictive = require("facet").Restrictive;
var logStore = require("db/Log").store;
var deepCopy = require("util/copy").deepCopy;

var queryToSql = require("store/sql").JsonQueryToSQL("Log", [], ["id","user","action", "prototype_id", "date"])
var LogClass = stores.registerStore("Log", logStore, 
	{
		query: function(query, options){
			options = options || {};
			var sql = queryToSql(query, options);
			if(sql){
				
				sql = sql.replace(/WHERE/,"AND").
					replace(/.*?FROM Log/,"SELECT Log.id, prototype_id, Log.user, action, name, date, notes FROM Log, Prototype WHERE prototype_id = Prototype.id");
				print("new sql " + sql);				
				return logStore.executeSql(sql, options);
			}
			throw new stores.NotFoundError("Query not acceptable");
		},
		prototype: {
			initialize: function(){
				this.date = new Date();
			}
		}
	}
);
exports.LogClass = LogClass;
exports.LogFacet = Restrictive(LogClass, {});
