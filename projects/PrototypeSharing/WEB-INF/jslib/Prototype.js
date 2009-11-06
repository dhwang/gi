var stores = require("stores");
var Permissive = require("facet").Permissive;
var Restrictive = require("facet").Restrictive;

var SQLStore = require("store/sql").SQLStore;

var prototypeStore = SQLStore({
	table: "Prototype",
	starterStatements: [
		"CREATE TABLE Prototype (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100), rating FLOAT, ratingsCount INT, downloads INT, license_id INT, uploaded DATETIME, enabled BOOL, description VARCHAR(2000), component TEXT, user VARCHAR(100), featured BOOL, deleted BOOL, status VARCHAR(10), PRIMARY KEY(id))",
		"CREATE INDEX rating_index ON Prototype (rating)",
		"CREATE INDEX status_index ON Prototype (status)"
		],
	idColumn: "id"
});

prototypeStore = require("store/full-text").FullText(prototypeStore, "Prototype");
var QueryRegExp = require("json-query").QueryRegExp;
var queryToSql = require("store/sql").JsonQueryToSQLWhere("Prototype", ["id","user","name", "uploaded","downloads","enabled","featured","status","deleted"])
var deepCopy = require("util/copy").deepCopy;
var auth = require("jsgi/auth");
var AccessError = require("./errors").AccessError;

var PrototypeClass = exports.PrototypeClass = stores.registerStore("Prototype", prototypeStore, 
	{
		query: function(query, options){
			var matches;
			if(matches = query.match(
					QueryRegExp(/^\?fulltext\($value\)$/))){
				return prototypeStore.fulltext(eval(matches[1]), ["description", "name"], options);
			}
			var sql = queryToSql(query, options);
			
			if(sql){
				(options.parameters || (options.parameters = [])).unshift(auth.currentUser && auth.currentUser.uid, false);
				return prototypeStore.executeSql(
					"SELECT id, name, Prototype.rating as rating, ratingsCount, downloads, license_id, description, uploaded, enabled, Prototype.user as user, featured, status, Rating.rating as myRating FROM Prototype " +
					"LEFT JOIN Rating ON Prototype.id = Rating.prototype_id AND Rating.user=? " + 
					"WHERE deleted=? AND " +
					sql, options);
			}
		},
		"delete": function(id){
			var instance = this.get(id);
			instance.deleted = true;
			instance.save();
		},
		purge: function(){
			prototypeStore.executeSql("DELETE FROM Prototype WHERE deleted=?", { parameters: [true] });
		},
		create: function(object){
			var errors = verifyComponent(object.component);
			if(errors.length){
				print("Errors found in verification");
				object.enabled = false;
				object.status = "Pending";
			}
			var id = prototypeStore.create(object);
		
			if(errors.length){
				// do this afterwards so we get the right id
				LogClass.create({
					action: "Pending",
					user: auth.currentUser.uid, 
					notes: errors.join(", \n"),
					date: new Date(),
					prototype_id: id
				});
			}
			return id;
		},
		prototype: {
			initialize: function(){
				this.status = "New";
				this.downloads = 0;
				this.enabled = true;
				this.deleted = false;
				this.featured = false;
				this.user = auth.currentUser.uid; 
				this.uploaded = new Date();
				this.ratingsCount = 0;
				this.rating = 0;
			},
			get: function(name){
				if(name == "component"){
					this.downloads++;
					this.save();
				}
				return this[name];
			},
			flag: function(accusation){
				LogClass.create({
					action: "Flagged",
					user: auth.currentUser.uid, 
					notes: accusation,
					date: new Date(),
					prototype_id: this.id
				});
				if(this.status == "Flagged"){
					this.enabled = false;
				}
				this.status = "Flagged";
				this.save();
			}
			
		},
		// these are used by atom
		getTitle: function(item){
			return item.name;
		},
		getSummary: function(item){
			return item.description;
		},
		getUpdated: function(item){
			return item.uploaded;
		},
		getId: function(item){
			return item.id;
		}
	});

var LogClass = require("Log").LogClass;

exports.BuilderFacet = Restrictive(PrototypeClass, {
	prototype: {		
	}
});
exports.AuthenticatedBuilderFacet = Restrictive(PrototypeClass, {
	create: function(object){
		return PrototypeClass.create(object);
	},
	prototype: {
		flag: function(accusation, source){
			if(this.flagged){
				throw new Error("Can not change flagged after it has been set")
			}
			source.flag(accusation);
			this.load();
		}
		
	},
	"delete": function(id){
		if(this.get(id).user != auth.currentUser.uid){
			throw AccessError("Can only delete components created by you"); 
		}
		PrototypeClass["delete"](id);
	}
});

exports.AdminFacet = Permissive(PrototypeClass, {
	properties: {
		log: {
			get: function(){
				return this.id ? LogClass.query("?prototype_id=" + this.id).
					map(function(item){
						delete item.id;
						return item;
					}) : [];
			}
		}
	},
	quality: 2
});


function verifyComponent(component){
	var errors = [];
	try{
		var parser = javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder();
		var doc = parser.parse(new java.io.ByteArrayInputStream(new org.mozilla.javascript.NativeJavaObject(global, component, null).getBytes("UTF-8"))).getDocumentElement();
		if("urn:tibco.com/v3.0" != doc.getAttribute("xmlns") || doc.getTagName() != "serialization"){
			errors.push("Invalid root element for component");
		}
		var nl = doc.getChildNodes();
		var objectElement;
		for(var i = 0; i < nl.getLength(); i++){
			var child = nl.item(i);
			if(child.getTagName){
				var tagName = child.getTagName();
			
				if(tagName == "object"){
					if(objectElement){
						errors.push('Multiple object elements are not allowed');
					}
					objectElement = child;
				}
				if(tagName == "onAfterDeserialization" || tagName == "onBeforeDeserialization"){
					var deserializationNl = child.getChildNodes();
					for(var j = 0; j < deserializationNl.getLength(); j++){
						deserializationChild = deserializationNl.item(j);
						if(deserializationChild.getTagName){ 
							errors.push(tagName + " can not have children");
						}
						if(!deserializationChild.getNodeValue().match(/^\s*$/)){
							errors.push(tagName + " can not have any contents");
						}
					}	
				
				}				
			}
		}
		if(!objectElement || objectElement.getChildNodes().getLength() == 0){
			errors.push('Serialization element must have a valid "object" element');
		}
		else{
			var childNodes = objectElement.getChildNodes();
			for(var i = 0; i < childNodes.getLength();i++){
				var child = childNodes.item(i);
				if(!child.getTagName){
					continue;
				}
				var tagName = child.getTagName();
				print("child tag " + tagName);
				if(tagName == "variants"){
					var attrs = child.getAttributes();
					for(var j = 0; j < attrs.getLength();j++){
						try{
							// will throw a SyntaxError if it is not valid JSON
							JSON.parse(attrs.item(j).getValue());
						}
						catch(e){
							errors.push("Variant value for " + attrs.item(j).getName() + " is not a valid JSON value: " + attrs.item(j).getValue());
						}
					}
				}
				if(tagName == "events"){
					var attrs = child.getAttributes();
					for(var j = 0; j < attrs.getLength();j++){
						if(attrs.item(j).getValue()){
							errors.push("Event handlers may not be defined");
						}
					}
				}
			}
		}
	}
	catch(e){
		errors.push(e.message);
	}
	return errors;
}


/*require("persvr");

var MySQL = require("stores/MySQL").MySQL;
var Lucene = require("stores/Lucene").Lucene;

Class({
	id:"Prototype",
	query: function(query, target, start, end){
		var fulltext = query.match(/fulltext\($value\)/);
		if(fulltext){
			console.log(fulltext[1], start, end);
			return store.fulltext(JSON.parse(fulltext[1].toString()), start, end);
		}
		console.log("no match");
	},
	prototype:{
		hello: function(){console.log("hi")},
		onSave: function(){
			validateComponent(this.component);
		}
		
	}
});
      
var store = persvr.registerStore(Prototype, Lucene(MySQL), {
		"connection":"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
		"dataColumns":[
			"name",
			"rating",
			"ratingsCount",
			"downloads",
			{
				"relationshipType":"many-to-one",
				"foreignSource":"License",
				"databaseColumn":"license_id",
				"objectColumn":"license"
				},
			"uploaded",
			"enabled",
			"description",
			"component",
			"user",
			"featured"
		],
		"table":"Prototype",
		"starterStatements":[
			"CREATE TABLE Prototype (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100), rating FLOAT, ratingsCount INT, downloads INT, license_id INT, uploaded DATETIME, enabled BOOL, description VARCHAR(2000), component VARCHAR(100000), user VARCHAR(100), featured BOOL)"],
		"idColumn":"id"
	});
console.log("store",store);
*/
