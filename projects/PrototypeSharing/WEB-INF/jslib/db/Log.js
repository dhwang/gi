var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
  connection: "jdbc:sqlite:prototype.db",
	table: "Log",
	driver: "org.sqlite.JDBC",
	starterStatements:[
		"CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, prototype_id TEXT, user TEXT, action TEXT, notes TEXT, date TEXT)"],
	idColumn:"id"
});
