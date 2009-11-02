dependencies = {
	layers: [
		{
			name: "../admin-deps.js",
			dependencies: [
				"dojox.rpc.JsonRest",
				"persevere.persevere",
				"dojox.data.PersevereStore",
				"dojox.grid.DataGrid",
				"dojo.cookie",
				"dijit.layout.BorderContainer",
				"dijit.layout.TabContainer",
				"dijit.layout.ContentPane",
				"dojox.highlight",
				"dojox.highlight.languages.xml",
				"dijit.Dialog"
			]
		},
		{
			name: "../persevere/Login.js",
			dependencies: [
				"persevere.Login"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}
