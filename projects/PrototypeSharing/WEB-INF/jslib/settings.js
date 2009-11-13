exports.MAIL = {
	host:"mail.dojotoolkit.com",
	defaultFrom: "prototype-admin@generalinterface.org"
};

exports.DATABASE = {
	connection:"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8&autoReconnect=true",
	type: "mysql"
};

exports.CONFLUENCE = {
	url: "http://localhost:8040/",
	space: "ds",
	username: "kriszyp",
	password: "lacking",
	listingPageId: "32789"
};

exports.BYPASS_SECURITY= true;

exports.APACHE_TARGET = "C:/wamp/www/";