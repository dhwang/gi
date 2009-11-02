var stores = require("stores");
var Restrictive = require("facet").Restrictive;

var auth = require("jsgi/auth");
var PrototypeClass = require("Prototype").PrototypeClass;
var SQLStore = require("store/sql").SQLStore;

var ratingStore = SQLStore({
	table: "Rating",
	starterStatements:[
		"CREATE TABLE Rating (user VARCHAR(100), prototype_id INT, rating TINYINT)",
		"CREATE INDEX user_index ON Rating (user)",
		"CREATE INDEX prototype_id_index ON Rating (prototype_id)"
		],
	idColumn:"id"
});


var RatingClass = stores.registerStore("Rating", ratingStore, 
	{
	}
);
exports.RatingClass = RatingClass;
exports.RatingFacet = Restrictive(RatingClass, {
	create: function(object){
		if(isNaN(object.rating) || object.rating < 0 || object.rating > 5){
			throw new Error("Invalid rating vote");
		}

		var prototype = PrototypeClass.get(object.prototype_id); // should throw an error if the prototype doesn't exist

		if(ratingStore.executeSql("SELECT * FROM Rating WHERE user=? AND prototype_id=?", {
				parameters: [auth.currentUser.uid, object.prototype_id]
			}).totalCount){
			throw new Error("You have already rating this component");
		}

		object.user = auth.currentUser.uid;
		
		var ratingTotal = prototype.rating * prototype.ratingsCount + object.rating;
		prototype.ratingsCount++;
		prototype.rating = ratingTotal / prototype.ratingsCount;
		prototype.save();
		
		RatingClass.create(object);
		object.newRating = prototype.rating;
	},
	quality: 2
});
