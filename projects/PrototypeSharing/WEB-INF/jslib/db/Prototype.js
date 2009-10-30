var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
	connection: "jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
	table: "Prototype",
	type: "mysql",
	starterStatements: [
		"CREATE TABLE Prototype (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100), rating FLOAT, ratingsCount INT, downloads INT, license_id INT, uploaded DATETIME, enabled BOOL, description VARCHAR(2000), component TEXT, user VARCHAR(100), featured BOOL, deleted BOOL, status VARCHAR(10), PRIMARY KEY(id))",
		"CREATE INDEX rating_index ON Prototype (rating)",
		"CREATE INDEX status_index ON Prototype (status)"
		],
	idColumn: "id"
});