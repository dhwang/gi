var stores = require("stores");
var SchemaFacet = require("facet").SchemaFacet;
var logStore = require("db/Log").store;
var deepCopy = require("util/copy").deepCopy;

var queryToSql = require("store/sql").JsonQueryToSQL("Log", ["id","user","action", "date"], ["id","user","action", "date"])
var LogClass = stores.registerStore("Log", logStore, deepCopy(logStore.getSchema(),
	{
		query: function(query, options){
			var sql = queryToSql(query);
			if(sql){
				return logStore.executeSql(sql, options);
			}
			throw new stores.NotFoundError("Query not acceptable");
		},
		prototype: {
			initialize: function(){
				this.date = new Date();
			}
		}
	}));
	
SchemaFacet(LogClass, {
	additionalProperties: {readonly: true},
	prototype: {
	}
});
