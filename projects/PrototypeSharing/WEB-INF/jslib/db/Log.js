var SQLStore = require("store/sql").SQLStore;

exports.store = SQLStore({
	connection:"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
	table: "Log",
	driver: "com.mysql.jdbc.Driver",
	starterStatements:[
		"CREATE TABLE Log (id INT NOT NULL AUTO_INCREMENT, prototype_id VARCHAR(100), user VARCHAR(100), action VARCHAR(100), notes VARCHAR(2000), date DATETIME, PRIMARY KEY(id))"],
	idColumn:"id"
});
