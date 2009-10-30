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
            formatHandler = "@date,medium";
          }
          column.setFormatHandler(formatHandler);
          break;
      }

      objMatrix.resetCacheData();
      objMatrix.repaint();
    },

    _onOnlineFeedMenuExecute: function(strRecordId) {
      //console.log(strRecordId);
    },

    _onOnlineListExecute: function(objPalette, objMatrix, strRecordId) {
      var record = objMatrix.getRecord(strRecordId);
      objPalette.setOnlineDetail(record);
    },

    _onOnlineDetailDownload: function(objDetailId) {
      var id = objDetailId.getText();
      var protoDir = jsx3.ide.getHomeRelativeFile('prototypes'),
          Document = jsx3.xml.Document;
          self = this;

      var doAsync = function(objEvent) {
        var objXML = objEvent.target;
        var strEvtType = objEvent.subject;
        var objFile = objXML._objFile;

        delete objXML._prototypeId;
        objXML.unsubscribe("*", doAsync);

        if (strEvtType == Document.ON_RESPONSE) {
          objXML = jsx3.ide.ComponentEditor.prototype.formatXML(objXML);
          jsx3.ide.writeUserXmlFile(objFile, objXML);
        } else if (strEvtType == Document.ON_TIMEOUT) {
          jsx3.ide.LOG.error("The component download timed out");
        } else if (strEvtType == Document.ON_ERROR) {
          jsx3.ide.LOG.error("The component download encountered an error");
        }
      };
      jsx3.ide.getPlugIn("jsx3.io.browser").saveFile(jsx3.IDE.getRootBlock(), {
          name:"jsx_ide_file_dialog", modal:true,
          folder: protoDir, baseFolder: protoDir,
          onChoose: function(objFile) {
            var doc = new Document();
            doc.setAsync(true);

            doc.subscribe('*', doAsync);
            doc._objFile = objFile;
            doc.load(self._prototypeRootUri + id + '.' + 'component');
          }
      });
    },

    _prototypeRootUri: "http://localhost:8080/Prototype/",

    _buildXMLURL: function() {
      var objSearchBox = jsx3.IDE.getJSXByName("jsx_ide_online_search"),
          objFilterMenu = jsx3.IDE.getJSXByName("jsx_ide_online_filter_menu"),
          strSearch = objSearchBox && objSearchBox.getValue(),
          hasFilter = (this._currentFilter != "all"),
          uri = this._prototypeRootUri,
          parts = [];
      if (strSearch && strSearch.length) {
        parts.push("(" + strSearch.split(" ").join("* AND ") + "*)");
      }
      if (hasFilter) {
        if (parts.length) {
          parts.push('AND');
        }
        parts.push('featured:true');
      }
      uri += parts.length ? "?fulltext('" + parts.join(' ') + "')" : '';
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
      }, 500);
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
