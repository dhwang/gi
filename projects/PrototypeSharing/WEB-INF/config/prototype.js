{"id":"prototype.js",
"sources":[
	{
		"sourceClass":"org.persvr.datasource.MySQLSource",
		"schema":{
			"prototype":{
			}
		},
		username:"kris",
		"connection":"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
		"dataColumns":[
			"name",
			"description"
		],
		"name":"License",
		"driver":"com.mysql.jdbc.Driver",
		"table":"License",
		"starterStatements":[
			"CREATE TABLE License (id INT, name VARCHAR(100), description VARCHAR(5000))"],
		"idColumn":"id"
	}
	
]
}