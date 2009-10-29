var stores = require("stores");
var Permissive = require("facet").Permissive;
var Restrictive = require("facet").Restrictive;

var prototypeStore = require("db/Prototype").store;
prototypeStore = require("store/lucene").Lucene(prototypeStore, "Prototype");
var QueryRegExp = require("json-query").QueryRegExp;
var queryToSql = require("store/sql").JsonQueryToSQLWhere("Prototype", ["id","user","name", "uploaded","downloads","enabled","featured","status","deleted"])
var deepCopy = require("util/copy").deepCopy;

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
				return prototypeStore.executeSql(
					"SELECT id, name, rating, ratingsCount, downloads, license_id, description, uploaded, enabled, user, featured, status FROM Prototype " + 
					"WHERE deleted=false AND " +
					sql, options);
			}
		},
		"delete": function(id){
			var instance = this.get(id);
			instance.deleted = true;
		},
		purge: function(){
			prototypeStore.executeSql("DELETE FROM Prototype WHERE deleted=true");
		},
		properties:{
			component: {
				type: "string",
				set: function(value, source, oldValue){
					var errors = verifyComponent(value);
				
					if(errors.length){
						print("Errors found in verification");
						LogClass.create({
							action: "Pending",
							notes: errors.join(", \n"),
							date: new Date(),
							prototype_id: this.id || 0
						});
						source.enabled = false;
						this.enabled = false;
						source.status = "Pending";
						this.status = "Pending";
					}
					return value;
				}
			},
			name: {
				type: "string"
			}
		},
		prototype: {
			initialize: function(){
				this.status = "New";
				this.downloads = 0;
				this.enabled = true;
				this.deleted = false;
				this.featured = false;
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
			rate: function(rating){
				if(rating < 0 || rating > 5){
					throw new Error("Invalid rating vote");
				}
				var ratingTotal = this.rating * this.ratingsCount + rating;
				this.ratingsCount++;
				this.rating = ratingTotal / this.ratingsCount;
				this.save();
			},
			flag: function(accusation){
				LogClass.put({
					action: "Flagged",
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
		rate: function(rating, source){
			source.rate(rating);
			this.load();
		},
		flag: function(accusation, source){
			if(this.flagged){
				throw new Error("Can not change flagged after it has been set")
			}
			source.flag(accusation);
			this.load();
		}
		
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
