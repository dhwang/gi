(function(plugIn){

  jsx3.$O(plugIn).extend({
    _emptyStar: plugIn.resolveURI('images/emptyStar.png'),
    _halfStar: plugIn.resolveURI('images/halfStar.png'),
    _fullStar: plugIn.resolveURI('images/fullStar.png'),

    _currentFilter: "all",

    formatRating: function(element, cdfkey, matrix, column, rownumber, server) {
      var record = matrix.getRecord(cdfkey);
      var rating = Number(record.rating);

      var wholes = 0,
          fraction = 0;
      if (isNaN(rating)) {
        rating = 0;
      } else {
        wholes = Math.floor(rating);
        fraction = (rating - wholes);
      }

      var hasHalf = false;
      if (fraction >= .75) {
        wholes++;
      } else if (fraction > .25 && fraction < .75) {
        hasHalf = true;
      }

      var self = this;
      var getStar = function (num) {
        if (num < wholes) {
          return plugIn._fullStar._path;
        } else if (num == wholes && hasHalf) {
          return plugIn._halfStar._path;
        } else {
          return plugIn._emptyStar._path;
        }
      };

      element.innerHTML = "<img src='" + getStar(0) + "'/><img src='" + getStar(1) + "'/>" +
        "<img src='" + getStar(2) + "'/><img src='" + getStar(3) + "'/><img src='" + getStar(4) + "'/>";
    },

    _onOnlineFilterMenuExecute: function(objMenu, objMatrix, strRecordId) {
      objMenu.selectItem(strRecordId, true);
      var recordNode = objMenu.getRecordNode(strRecordId);
      var column = objMatrix.getChild('filterColumn');

      switch (strRecordId) {
        default:
        case "all":
          this._currentFilter = "all";
          objMatrix.setXMLURL(this._buildXMLURL());
          break;
        case "featured":
          this._currentFilter = "featured";
          objMatrix.setXMLURL(this._buildXMLURL());
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

    _buildXMLURL: function() {
      var objSearchBox = jsx3.IDE.getJSXByName("jsx_ide_online_search"),
          objFilterMenu = jsx3.IDE.getJSXByName("jsx_ide_online_filter_menu"),
          strSearch = objSearchBox && objSearchBox.getValue(),
          hasFilter = (this._currentFilter != "all"),
          baseUri = "http://localhost:8080/Prototype/",
          uri = baseUri;
      if (hasFilter) {
        if (strSearch && strSearch.length) {
          uri = baseUri + "?fulltext('" + strSearch + "')&featured=true";
        } else {
          uri = baseUri + "?featured=true";
        }
      } else if (strSearch && strSearch.length) {
        uri = baseUri + "?fulltext('" + strSearch + "')";
      }
      jsx3.log("Matrix XML URL: " + uri);
      return uri;
    },

    _onSearch: function(objSearchBox, objMatrix, strValue) {
      this._reloadList(objMatrix);
    },

    _clearSearch: function(objSearchBox, objMatrix) {
      objSearchBox.setValue("");
      this._reloadList(objMatrix);
    },

    _reloadList: function(objMatrix) {
      jsx3.log("Reloading matrix");
      objMatrix.setXMLURL(this._buildXMLURL());
      objMatrix.repaint();
    }
  });

})(this);
