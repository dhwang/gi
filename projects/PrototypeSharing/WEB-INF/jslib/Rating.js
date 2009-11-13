var persisted = require("persisted");
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


var RatingClass = persisted.Class("Rating", ratingStore, 
	{
	}
);
exports.RatingClass = RatingClass;
exports.RatingFacet = Restrictive(RatingClass, {
	create: function(object){
		object.rating = parseInt(object.rating, 10);
		if(isNaN(object.rating) || object.rating < 0 || object.rating > 5){
			throw new Error("Invalid rating vote");
		}

		var prototype = PrototypeClass.get(object.prototype_id); // should throw an error if the prototype doesn't exist

		object.user = auth.currentUser.uid;
		var lastRating = ratingStore.executeSql("SELECT * FROM Rating WHERE user=? AND prototype_id=?", {
				parameters: [auth.currentUser.uid, object.prototype_id]
			}).rows.first();

		if(lastRating){
			var ratingTotal = prototype.rating * prototype.ratingsCount + object.rating - lastRating.rating;
			lastRating.rating = object.rating;
			ratingStore.executeSql("UPDATE Rating SET rating=? WHERE user=? AND prototype_id=?", {
					parameters:[object.rating, auth.currentUser.uid, object.prototype_id]}).rows;
		}
		else{
			var ratingTotal = prototype.rating * prototype.ratingsCount + object.rating;
			prototype.ratingsCount++;
			RatingClass.create(object);
		}
		
		prototype.rating = ratingTotal / prototype.ratingsCount;
		prototype.save();
		
		object.newRating = prototype.rating;
	},
	quality: 2
});
