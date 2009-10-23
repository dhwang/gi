var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
	connection:"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
	table: "Auth",
	type: "mysql",
	starterStatements:[
		"CREATE TABLE Auth (id BIGINT NOT NULL, user VARCHAR(100), PRIMARY KEY(id))"],
	idColumn:"id"
});
