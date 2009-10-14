var stores = require("stores");
var SQLStore = require("store/sql").SQLStore;
var SchemaFacet = require("facet").SchemaFacet;

var prototypeStore = SQLStore({
		"connection":"jdbc:mysql://localhost/prototype?user=root&password=&useUnicode=true&characterEncoding=utf-8",
		"table":"Prototype",
		"starterStatements":[
			"CREATE TABLE Prototype (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100), rating FLOAT, ratingsCount INT, downloads INT, license_id INT, uploaded DATETIME, enabled BOOL, description VARCHAR(2000), component VARCHAR(100000), user VARCHAR(100), featured BOOL)"],
		"idColumn":"id"
	});
prototypeStore = require("store/lucene").Lucene(prototypeStore, "Prototype");

var QueryRegExp = require("json-query").QueryRegExp;
var prototypeClass = stores.registerStore("Prototype", prototypeStore,
	{
		query: function(query, options){
			var matches;
			if(matches = query.match(
					QueryRegExp(/^\?fulltext\($value\)$/))){
				return prototypeStore.fulltext(eval(matches[1]), options);
			}
			if((matches = query.match(
					QueryRegExp(/^(\[\?$prop=$value\])?(\[[\/\\]$prop\])?$/)))){
				var sql = "SELECT id, name, rating, ratingsCount, downloads, license_id, uploaded, enabled, user, featured FROM Prototype ";
				if(matches[2]){
					if(matches[2] != "status"){
						throw new Error("Can only query by status");
					} 
					options.parameters = [eval(matches[3].toString())];
					sql += "WHERE " + matches[2] + "=?";
				}
				if(matches[5]){
					sql += " ORDER BY " + matches[5] + " " + (matches[4].charAt(1) == '/' ? "ASC" : "DESC");
				}
				print("sql " + sql);
				return prototypeStore.query(sql, options);
			}
			throw new stores.NotFoundError("Query not acceptable");
		},
		put: function(object, id){
			validateComponent(object.component);
			return prototypeStore.put(object, id);
		},
		prototype: {
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
				if(!this.flagged){
					this.flagged = accusation;
				}
				this.save();
			},
			
		}
	});
	
SchemaFacet({
	additionalProperties: {readonly: true},
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
		},
		
	}
});

function validateComponent(component){
	var parser = javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder();
	var doc = parser.parse(new java.io.ByteArrayInputStream(new org.mozilla.javascript.NativeJavaObject(global, component, null).getBytes("UTF-8"))).getDocumentElement();
	if("urn:tibco.com/v3.0" != doc.getAttribute("xmlns")){
		throw new TypeError("Invalid root element for component");
	}
	var nl = doc.getChildNodes();
	var objectElement;
	for(var i = 0; i < nl.getLength(); i++){
		var child = nl.item(i);
		if(child.getTagName){
			var tagName = child.getTagName();
		
			if(tagName == "object"){
				if(objectElement){
					throw new Error('Multiple object elements are not allowed');
				}
				objectElement = child;
			}
			if(tagName == "onAfterDeserialization" || tagName == "onBeforeDeserialization"){
				var deserializationNl = child.getChildNodes();
				for(var j = 0; j < deserializationNl.getLength(); j++){
					deserializationChild = deserializationNl.item(j);
					if(deserializationChild.getTagName){ 
						throw new TypeError(tagName + " can not have children");
					}
					if(!deserializationChild.getNodeValue().match(/^\s*$/)){
						throw new TypeError(tagName + " can not have any contents");
					}
				}	
			
			}				
		}
	}
	if(!objectElement || objectElement.getChildNodes().getLength() == 0){
		throw new TypeError('Serialization element must have a valid "object" element');
	}
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
