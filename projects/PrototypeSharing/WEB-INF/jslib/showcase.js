var persisted = require("persisted");
var Permissive = require("facet").Permissive;
var Restrictive = require("facet").Restrictive;
var CONFLUENCE = require("settings").CONFLUENCE;
var remove = require("file").remove;
var read = require("file").read;
var write = require("file").write;

var ConfluenceStore = require("store/confluence").Confluence;
showcaseStore = new ConfluenceStore({});
var unzip = require("zip").unzip;

persisted.Class("Showcase", showcaseStore, {
	create: function(object){
		debugger;
		var id = showcaseStore.create(object);
		setupShowcase(object);
		return id;
	},
	prototype: {
		initialize: function(){
			this.space = CONFLUENCE.space;
			this.parentId = CONFLUENCE.listingPageId;
			this.content = "Description: " + this.description;
		}
	},
	properties:{
		title:{type:"string"}
	}
});
function setupShowcase(object){
	var targetDir = require("settings").APACHE_TARGET + object.id;
	unzip(object.zip.tempfile, targetDir);
	//remove(object.zip.tempfile);
	var launchTemplate = read(require.paths[require.paths.length-1] + "/launch.html");
	write(targetDir + "/launch.html", launchTemplate.replace(/@(\w+)@/g, function(t, name){
		switch(name){
			case "CONTAINERPATH":
				return object.runtime;
			case "APPPATH":
				return object.id;
		}
	}));
	recreateListing();
}

function recreateListing(){
		// now recreate the listing page with the confluence table plugin
	var listingPage = showcaseStore.get(CONFLUENCE.listingPageId);
	var content = "These are the showcase applications:\n\n" + 
		"{table-plus}\n|| Title || Author || Description || Uploaded ||\n";
	var showcases = showcaseStore.query("", {});
	showcases.forEach(function(showcase){
		showcase = showcaseStore.get(showcase.id);
		content += "| [" + CONFLUENCE.space + ":" + showcase.title + "] | " + 
			showcase.modifier + " | " + showcase.content.substring(0,100) + " | " + 
			showcase.modified + " |\n";
	});
	content += "{table-plus}\n";
	listingPage.content = content;
	showcaseStore.put(listingPage);
};	