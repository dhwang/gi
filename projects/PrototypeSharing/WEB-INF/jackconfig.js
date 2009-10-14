/**
 * The starting point for Pintura running as a Jack app.
 */
var pintura = require("pintura");
require.paths.push("jslib");
require("persvr");
require("CDF");
require("Prototype");
require("LDAPUser");

exports.app = require("jack/cascade").Cascade([ 
		// cascade from static to pintura REST handling
	require("jack/static").Static(null,{urls:[""],root:["web"]}),
	pintura.app
]);

