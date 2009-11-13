exports.MAIL = {
	host:"mail.dojotoolkit.com",
	defaultFrom: "prototype-admin@generalinterface.org"
};

exports.DATABASE = {
	connection:"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8&autoReconnect=true",
	type: "mysql"
};

exports.CONFLUENCE = {
	url: "http://localhost:8080/",
	space: "ds",
	username: "user",
	password: "pass",
	listingPageId: "32789"
};

exports.APACHE_TARGET = "/srv/www/htdocs/";