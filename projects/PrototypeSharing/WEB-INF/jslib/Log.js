var stores = require("stores");
var SchemaFacet = require("facet").SchemaFacet;

var logStore = require("db/Log").store;

var queryToSql = require("store/sql").JsonQueryToSQL("Log", ["id","user","action", "date"], ["id","user","action", "date"])
var logClass = stores.registerStore("Log", logStore,
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
	});
	
SchemaFacet({
	additionalProperties: {readonly: true},
	prototype: {
	}
});
