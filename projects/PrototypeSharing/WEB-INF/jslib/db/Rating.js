var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
	connection:"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8&autoReconnect=true",
	table: "Rating",
	type: "mysql",
	starterStatements:[
		"CREATE TABLE Rating (user VARCHAR(100), prototype_id INT, rating TINYINT)",
		"CREATE INDEX user_index ON Prototype (user)",
		"CREATE INDEX prototype_id_index ON Prototype (prototype_id)"
		],
	idColumn:"id"
});
