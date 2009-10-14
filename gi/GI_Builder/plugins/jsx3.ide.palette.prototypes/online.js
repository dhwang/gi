(function(plugIn){

  jsx3.$O(plugIn).extend({
    _emptyStar: plugIn.resolveURI('images/emptyStar.png'),
    _halfStar: plugIn.resolveURI('images/halfStar.png'),
    _fullStar: plugIn.resolveURI('images/fullStar.png'),

    _getStars: function(rating) {
      var rating = Number(rating),
          wholes = 0,
          fraction = 0;

      if (isNaN(rating)) {
        rating = 0;
      } else if (rating > 0) {
        wholes = Math.floor(rating);
        fraction = (rating - wholes);
      }

      var hasHalf = false;
      if (fraction >= .75) {
        wholes++;
      } else if (fraction > .25 && fraction < .75) {
        hasHalf = true;
      }

      var result = [];
      for(var i=0; i<5; i++){
        if (i < wholes) {
          result.push(this._fullStar._path);
        } else if (i == wholes && hasHalf) {
          result.push(this._halfStar._path);
        } else {
          result.push(this._emptyStar._path);
        }
      }
      return result;
    },

    formatRating: function(element, cdfkey, matrix, column, rownumber, server) {
      var record = matrix.getRecord(cdfkey);

      element.innerHTML = "<img src='" + plugIn._getStars(record.rating).join("'/><img src='") + "'/>";
    },

    _onOnlineFilterMenuExecute: function(objMenu, objMatrix, strRecordId) {
      objMenu.selectItem(strRecordId, true);
      var recordNode = objMenu.getRecordNode(strRecordId);
      var column = objMatrix.getChild('filterColumn');

      switch (strRecordId) {
        default:
        case "all":
          break;
        case "featured":
          break;
        case "rating":
        case "downloads":
        case "user":
        case "uploaded":
          column.setPath(strRecordId, true);
          column.setDataType(
            strRecordId != "user" ? jsx3.gui.Matrix.Column.TYPE_NUMBER : jsx3.gui.Matrix.Column.TYPE_TEXT
          );
          column.setSortDataType(
            strRecordId != "user" ? jsx3.gui.Matrix.Column.TYPE_NUMBER : jsx3.gui.Matrix.Column.TYPE_TEXT
          );
          column.setText(recordNode.getAttribute('jsxtext'), false);

          var formatHandler = this.formatRating;
          if (strRecordId == "downloads") {
            formatHandler = "@number,integer";
          } else if (strRecordId == "user") {
            formatHandler = "@unescape";
          } else if (strRecordId == "uploaded") {
            formatHandler = "@datetime,medium";
          }
          column.setFormatHandler(formatHandler);
          break;
      }

      objMatrix.repaint();
    },

    _onOnlineFeedMenuExecute: function(strRecordId) {
      console.log(strRecordId);
    },

    reloadOnlineLibraries: function(objMatrix) {
      objMatrix.resetCacheData();
      objMatrix.repaint();
    },

    _onOnlineListExecute: function(objMatrix, strRecordId) {
      var ui = this.getPalette().getUIObject();
      var record = objMatrix.getRecord(strRecordId);

      ui.setOnlineDetail(record);
    }
  });

})(this);
