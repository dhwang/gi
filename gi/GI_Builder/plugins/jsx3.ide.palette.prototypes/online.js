(function(plugIn){

  jsx3.$O(plugIn).extend({
    _emptyStar: plugIn.resolveURI('images/emptyStar.png'),
    _halfStar: plugIn.resolveURI('images/halfStar.png'),
    _fullStar: plugIn.resolveURI('images/fullStar.png'),

    _currentFilter: "all",

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
      for (var i=0; i<5; i++) {
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

      objMatrix.resetCacheData();
      objMatrix.repaint();
    },

    _onOnlineFeedMenuExecute: function(strRecordId) {
      console.log(strRecordId);
    },

    _onOnlineListExecute: function(objPalette, objMatrix, strRecordId) {
      var record = objMatrix.getRecord(strRecordId);
      console.log(record);
      objPalette.setOnlineDetail(record);
    },

    _buildXMLURL: function() {
      var objSearchBox = jsx3.IDE.getJSXByName("jsx_ide_online_search"),
          objFilterMenu = jsx3.IDE.getJSXByName("jsx_ide_online_filter_menu"),
          strSearch = objSearchBox && objSearchBox.getValue(),
          hasFilter = (this._currentFilter != "all"),
          baseUri = "http://localhost:8080/Prototype/",
          uri = baseUri,
          parts = [];
      if (hasFilter) {
        parts.push('featured=true');
      }
      if (strSearch && strSearch.length) {
        parts.push("fulltext('" + strSearch + "')");
      }
      uri += parts.length ? '?' + parts.join('&') : '';
      jsx3.log("Matrix XML URL: " + uri);
      return uri;
    },

    _onSearch: function(objSearchBox, objMatrix, strValue) {
      var self = this,
          doSearch = function(matrix) {
            self._reloadList(matrix);
          };
      if (this._searchTO != null) {
        window.clearTimeout(this._searchTO);
        this._searchTO = null;
      }
      this._searchTO = window.setTimeout(function() {
        doSearch(objMatrix);
        this._searchTO = null;
      }, 200);
    },

    _clearSearch: function(objSearchBox, objMatrix) {
      objSearchBox.setValue("");
      this._reloadList(objMatrix);
    },

    _reloadList: function(objMatrix) {
      jsx3.log("Reloading matrix");
      objMatrix.setXMLURL(this._buildXMLURL());
      objMatrix.resetCacheData();
      objMatrix.repaint();
    },

    getLicenseAgreement: function() {
      // Gets the saved credentials from the
      // user's settings
      var s = jsx3.ide.getIDESettings();
      var id = this.getId();

      return s.get(id, 'license_accepted');
    },

    agreeToLicense: function() {
      var s = jsx3.ide.getIDESettings();
      var id = this.getId();

      s.set(id, 'license_accepted', true);
    }
  });

})(this);
