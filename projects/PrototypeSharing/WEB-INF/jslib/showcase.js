var model = require("model");
var Permissive = require("facet").Permissive;
var Restrictive = require("facet").Restrictive;
var confluenceSettings = require("settings").confluence;
var HOST_URL_PREFIX = require("settings").HOST_URL_PREFIX;
var File = require("file");
var read = File.read;
var write = File.write;
var JSFile = require("store/js-file").JSFile;
var Replicated = require("store/replicated").Replicated;
var Confluence = require("store/confluence").Confluence;
var confluenceStore = new Confluence({});
var dataFolder = require("settings").dataFolder;
showcaseStore = Replicated(JSFile(dataFolder + "/Showcase"), confluenceStore, {replicateFirst: true});
var unzip = require("zip").unzip;
var Unzip = require("zip").Unzip;

var ShowcaseClass = model.Model("Showcase", showcaseStore, {
	put: function(object){
		showcaseStore.query("").forEach(function(showcase){
			if(showcase.id != object.id && showcase.title == object.title){
				throw new Error("Duplicate name " + showcase.title + " not allowed");
			}
		});
		checkZipFile(object);
		var redefine = !object.id;
		defineContent(object);
		var id = showcaseStore.put(object);
		if(redefine){
			// now that we have the id, we need to do it again
			defineContent(object);
			showcaseStore.put(object);
		}
		setupShowcase(object);
		return id;
	},
	"delete": function(id){
		showcaseStore["delete"](id);
		recreateListing();
		var targetDir = require("settings").APACHE_TARGET + id;
		File.rmtree(targetDir);
	},
	prototype: {
		initialize: function(){
			this.space = confluenceSettings.space;
			this.parentId = confluenceSettings.listingPageId;
			this.content = "Description: " + this.description;
			this.uploaded = new Date();
		}
	},
	properties:{
		title:{type:"string", unique: true, minLength:1},
		key:{unique:true, minLength:1},
		description: {type:"string", minLength:1},
		author: {type:"string", minLength:1},
		email: {type:"string", minLength:1, pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}"},
		appVersion: {type:["string", "number"], minLength:1},
		runtime: {type:"string", minLength:1}
	}
});
function defineContent(object){
	if(!object.zip){
		throw new Error("Zip file must be included");
	}
	object.content = "h2. " + object.title + "\n\n" +
		"h3. " + object.author + " - " + new Date() + " - Version: " + object.appVersion + "\n\n" +
		object.description + "\n\n" +
		"[Launch Demo|" + HOST_URL_PREFIX + object.id + "/launch.html]" +
		(object.license == "open-source" ? 
		   "[Download Source|" + HOST_URL_PREFIX + object.id + '/' + object.zip.tempfile + "]" : ""); 
}
function checkZipFile(object){
	if(!object.zip.tempfile){
		throw new Error("No file provided");
	}
	var unzipper = new Unzip(object.zip.tempfile);
	try{
		var foundConfigXml;
		unzipper.forEach(function (entry) {
	        if(entry.getName().match(/config\.xml$/)){
	        	foundConfigXml = true;
	        }
		});
		
		if(!foundConfigXml){
			throw new Error("config.xml not found");
		}
	}finally{
		unzipper.close();
	}
}
function setupShowcase(object){
	var targetDir = require("settings").APACHE_TARGET + object.id + '/';
	unzip(object.zip.tempfile, targetDir);
	var appDirectory;
	File.list(targetDir).forEach(function (name) {
            if(File.isDirectory(File.join(targetDir, name))){
            	if(appDirectory){
            		appDirectory = true;
            	}else{
            		appDirectory = name;
            	}
            }
        });
   	if(File.isFile(targetDir + object.zip.tempfile)){
		File.remove(targetDir + object.zip.tempfile);
	}
	File.move(object.zip.tempfile, targetDir + object.zip.tempfile);
	var launchTemplate;
	require.paths.some(function(path){
		try{
			launchTemplate = read(path + "/launch.html");
			return true;
		}catch(e){
			
		}
	});
	write(targetDir + "launch.html", launchTemplate.replace(/@(\w+)@/g, function(t, name){
		switch(name){
			case "CONTAINERPATH":
				return object.runtime;
			case "APPPATH":
				return appDirectory === true ? "." : appDirectory;
			case "TITLE":
				return object.title;
		}
	}));
	if(object.proxy){
		write(targetDir + ".htaccess", "RewriteEngine On\n" +
			object.proxy.replace(/.+/g,function(t){
				return "RewriteRule " + t + " [P]\n";
			}));
	} 
	recreateListing();
}

function recreateListing(){
		// now recreate the listing page with the confluence table plugin
	var listingPage = confluenceStore.get(confluenceSettings.listingPageId);
	var content = "These are the showcase applications:\n\n" + 
		"{table-plus}\n|| Title || Author || Description || Uploaded ||\n";
	var showcases = showcaseStore.query("", {});
	showcases.forEach(function(showcase){
		if(showcase.publish){
			content += "| [" + confluenceSettings.space + ":" + showcase.title + "] | " + 
				showcase.author + " | " + (showcase.description && showcase.description.substring(0,100)) + " | " + 
				showcase.uploaded + " |\n";
		}
	});
	content += "{table-plus}\n";
	listingPage.content = content;
	confluenceStore.put(listingPage);
};	