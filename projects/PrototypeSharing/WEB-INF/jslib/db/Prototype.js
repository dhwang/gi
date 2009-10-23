var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
	connection: "jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
	table: "Prototype",
	driver: "com.mysql.jdbc.Driver",
	starterStatements: [
		"CREATE TABLE Prototype (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100), category VARCHAR(100), rating FLOAT, ratingsCount INT, downloads INT, license_id INT, uploaded DATETIME, enabled BOOL, description VARCHAR(2000), component TEXT, user VARCHAR(100), featured BOOL, status VARCHAR(10), PRIMARY KEY(id))"],
	idColumn: "id"
});