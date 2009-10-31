var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
	connection:"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8&autoReconnect=true",
	table: "Auth",
	type: "mysql",
	starterStatements:[
		"CREATE TABLE Auth (id BIGINT NOT NULL, user VARCHAR(1000), PRIMARY KEY(id))"],
	idColumn:"id"
});
