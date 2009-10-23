var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
  connection: "jdbc:sqlite:prototype.db",
	table: "Prototype",
	driver: "org.sqlite.JDBC",
	starterStatements: [
		"CREATE TABLE Prototype (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT, rating REAL, ratingsCount INTEGER, downloads INTEGER, license_id INTEGER, uploaded TEXT, enabled TEXT, description TEXT, component TEXT, user TEXT, featured TEXT, status TEXT)"],
	idColumn: "id"
});
