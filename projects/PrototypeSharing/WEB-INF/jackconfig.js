/**
 * The starting point for Pintura running as a Jack app.
 */
require.paths.push("jslib");
var pintura = require("pintura");
require("persvr");
require("CDF");
require("tibco-application");
require("Prototype");
require("Log");
require("Rating");
require("Auth");
require("LDAPUser");
require("showcase");

var defaultApp = require("jack/cascade").Cascade([ 
		// cascade from static to pintura REST handling
	require("jack/static").Static(null,{urls:[""],root:"../"}),
	pintura.app
]);

exports.app = function(request){
	if(request.pathInfo.indexOf('/feeds/') == 0){
		request.headers.accept = "application/atom+xml";
		switch(request.pathInfo.slice(6)){
			case '/top_rated/':
				request.pathInfo = '/Prototype/';
				request.queryString = 'sort(+rating)';
				break;
			case '/most_popular/':
				request.pathInfo = '/Prototype/';
				request.queryString = 'sort(+downloads)';
				break;
			case '/most_recent/':
				request.pathInfo = '/Prototype/';
				request.queryString = 'sort(-uploaded)';
				break;
		}
		print(request.queryString);
	}
	return defaultApp(request);
};
new (require("worker").SharedWorker)("narwhal/repl");
