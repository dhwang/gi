/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.ide.Editor");

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _type _openNewTab _setTabName

jsx3.Class.defineClass("jsx3.ide.TextEditor", jsx3.ide.Editor, null, function(TextEditor, TextEditor_prototype) {
  
  TextEditor_prototype.init = function() {
		this.jsxsuper();
		this._mode = 'readwrite';
	};
	
	TextEditor_prototype.create = function(objTabbedPane, strType) {
		var extension = jsx3.ide.Editor.EXTENSION_MAP[strType.toLowerCase()];
		if (extension == null) extension = strType.toLowerCase();
		
		var file = jsx3.ide.getBuilderRelativeFile("templates/untitled." + extension);
		this._unsaved = true;
		this.open(objTabbedPane, file);
		this._type = strType;
	};

	TextEditor_prototype.save = function() {
		var objFile = this.getOpenFile();
		if (objFile) {
      var strContent = this._tab.getTextArea().getValue();

      if (this.isXML()) {
        var objXML = new jsx3.xml.Document();
        objXML.loadXML(strContent);

        if (!objXML.hasError()) {
          if (jsx3.ide.writeUserXmlFile(objFile, objXML)) {
            this.revert();
            this.setDirty(false);
            return true;
          } else {
            return false;
          }
        } else {
          jsx3.ide.LOG.error("Cannot save text editor as XML because it is not valid XML: " +
              objXML.getError());
        }
      }

      if (jsx3.ide.writeUserFile(objFile, strContent)) {
        this.setDirty(false);
        return true;
      }
    } else {
			jsx3.ide.LOG.error("Cannot save file to blank url.");
		}
		
		return false;
	};

	TextEditor_prototype.saveAs = function(objFile) {
		var oldUrl = this._url;
		this._url = jsx3.ide.relativePathTo(objFile);
		
		if (this.save()) {
			this._unsaved = false;
			this._setTabName();
			jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_SAVED_AS});
			return true;
		} else {
			this._url = oldUrl;
			return false;
		}
	};

	TextEditor_prototype.open = function(objTabbedPane, objFile, strType) {
    this._type = strType != null ? strType : objFile.getExtension();

    var bXML = this.isXML();
    var objTab = null;
		if (bXML)
			objTab = objTabbedPane.loadAndCache("components/containers/tab_xmleditor.xml", false);
		else
			objTab = objTabbedPane.loadAndCache("components/containers/tab_texteditor.xml", false);

		var strURL = jsx3.ide.relativePathTo(objFile);

    var bSuccess = false;
    if (objFile.isFile()) {
      if (bXML) {
        var d = new jsx3.xml.Document();
        d.load(objFile.toURI());
        if (! d.hasError()) {
          objTab.getTextArea().setValue(d.toString());
          bSuccess = true;
        } else {
          var strText = objFile.read();
          objTab.getTextArea().setValue(strText);

          // ignore errors caused by empty documents
          if (strText.match(/\S/))
            jsx3.ide.LOG.warn("Error parsing XML document: " + d.getError());
        }
      } else {
        objTab.getTextArea().setValue(objFile.read());
      }
    }

    this._url = strURL;
		this._tab = objTab;
		this._openNewTab(objTabbedPane);

		jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_DID_OPEN, target:this});
		this.activate();
	};

  TextEditor_prototype.isXML = function() {
    return this._type == "xml" || this._type == "xsl";
  };

  TextEditor_prototype.revert = function() {
		var objTab = this.getTab();
		var objFile = this.getOpenFile();

    var bSuccess = false;
    if (this.isXML()) {
      var d = new jsx3.xml.Document();
      d.load(objFile.toURI());
      if (! d.hasError()) {
        objTab.getTextArea().setValue(d.toString());
        bSuccess = true;
      } else {
        jsx3.ide.LOG.warn("Error parsing XML document: " + d.getError());
      }
    }

    if (!bSuccess) {
      objTab.getTextArea().setValue(objFile.read());
    }

    this.setDirty(false);
	};

	TextEditor_prototype.activate = function() {
	};

	TextEditor_prototype.getFileType = function() {
		return this._type;
	};
	
	TextEditor_prototype.getEditorText = function() {
		var tab = this.getTab();
		if (tab) return tab.getTextArea().getValue();
	};
	
	TextEditor_prototype.setMode = function(strMode) {
		if (!this.isXML()) return false;
		
		var swapPane = this.getTab().getDescendantOfName('swap_pane');
		
		if (strMode == 'readwrite') {
			var pane = swapPane.getChild('jsxtab_xmleditor_maintab');
			pane.doShow();
		} else if (strMode == 'readonly') {
			var xmlSource = this.getTab().getXMLSource();
			var doc = new jsx3.xml.Document();
			doc.loadXML(xmlSource);
			
			var error = doc.getError();
			if (error.code == "0") {
				var pane = swapPane.getChild('jsxtab_xmleditor_readonly');
				if (! pane) {
					pane = swapPane.loadAndCache('components/containers/text-xmlro.xml');
				}
        pane.doShow();
				pane.setSourceDocument(doc);
			} else {
				jsx3.IDE.alert("Alert", "The XML source is not a valid XML document. The following XML parsing error occurred: <br/><br/><b>" + error.description + "</b><br/><br/> Please fix the error before entering formatted markup view.", null, null, {width: 400, height: 225});
				return false;
			}
		}
		
		this._mode = strMode;
		return true;
	};
	
	TextEditor_prototype.supportsReload = function() {
		return jsx3.ide.resourceTypeSupportsLoad(this._type);
	};
	
});
