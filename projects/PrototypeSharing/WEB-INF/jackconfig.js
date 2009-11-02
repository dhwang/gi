/**
 * The starting point for Pintura running as a Jack app.
 */
var pintura = require("pintura");
require("persvr");
require("CDF");
require("tibco-application");
require("Prototype");
require("Log");
require("Rating");
require("Auth");
require("LDAPUser");

exports.app = require("jack/cascade").Cascade([ 
		// cascade from static to pintura REST handling
	require("jack/static").Static(null,{urls:[""],root:"../"}),
	pintura.app
]);

new (require("worker").SharedWorker)("console");