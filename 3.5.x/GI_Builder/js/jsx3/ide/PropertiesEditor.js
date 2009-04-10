/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.ide.Editor");

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _openNewTab _setTabName getUntitledPath getTabPath getMatrix loadMatrixData getMatrixData

jsx3.Class.defineClass("jsx3.ide.PropertiesEditor", jsx3.ide.Editor, null, function(PropertiesEditor, PropertiesEditor_prototype) {
  
  PropertiesEditor_prototype.init = function() {
		this.jsxsuper();
		this._mode = 'grid';
	};

  PropertiesEditor_prototype.getUntitledPath = function() {
    return "templates/untitled_jss.xml";
  };

  PropertiesEditor_prototype.getTabPath = function() {
    return "components/containers/tab_dynpropeditor.xml";
  };
	
  PropertiesEditor_prototype.getMatrix = function() {
    return this.getTab().getDescendantOfName("jsxdynpropeditor");
  };

  PropertiesEditor_prototype.loadMatrixData = function(objXML) {
    var objMatrix = this.getMatrix();
    objMatrix.getServer().getCache().setDocument(objMatrix.getXMLId(), objXML);
  };

  PropertiesEditor_prototype.resetMatrixData = function() {
    var doc = new jsx3.xml.Document().load(this._url);
    this.loadMatrixData(doc);
  };

  PropertiesEditor_prototype.getMatrixData = function() {
    return this.getMatrix().getXML();
  };

  PropertiesEditor_prototype.create = function(objTabbedPane, strType) {
		var file = jsx3.ide.getBuilderRelativeFile(this.getUntitledPath());
		this._unsaved = true;
		this.open(objTabbedPane, file);
	};

	PropertiesEditor_prototype.open = function(objTabbedPane, objFile, strType) {
		this._tab = objTabbedPane.loadAndCache(this.getTabPath(), false);
		this._url = jsx3.ide.relativePathTo(objFile);

    var doc = new jsx3.xml.Document().load(this._url);
    this.loadMatrixData(doc);
		this._openNewTab(objTabbedPane);

		jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_DID_OPEN, target:this});
		this.activate();
	};
	
	PropertiesEditor_prototype.revert = function() {
		this.resetMatrixData();
		this.getMatrix().repaintData();
		
		var objView = this.getActiveView();
		if (objView && typeof(objView.onShowMe) == 'function')
			objView.onShowMe();

		this.setDirty(false);
	};

	PropertiesEditor_prototype.activate = function() {
	};

	PropertiesEditor_prototype.save = function() {
		var objFile = this.getOpenFile();
		if (objFile) {
      var objXML = jsx3.ide.makeXmlPretty(this.getMatrixData(), true);
			if (jsx3.ide.writeUserXmlFile(objFile, objXML)) {
				this.setDirty(false);
				return true;
			}
		} else {
			jsx3.ERROR.doLog("IDED11", "can't save file to blank url");
		}
		
		return false;
	};

	PropertiesEditor_prototype.saveAs = function(objFile) {
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

	PropertiesEditor.MODE_TO_NAME = {
		grid: {name: 'jsxtab_xmleditor_maintab'},
		source: {name:'jss_xmlwr', uri:'components/containers/jss-xmlrw.xml'},
		sourcefmt: {name:'jss_asxml', uri:'components/containers/jss-xmlro.xml'}
	};
	
	PropertiesEditor_prototype.setMode = function(strMode) {
		var objView = this.getActiveView();

		if (objView && objView.getName() == PropertiesEditor.MODE_TO_NAME['source'].name && objView.isDirty()) {
			if (! this._cascadeExpertChanges())
				return false;
		}

		var contentBlock = this.getTab().getDescendantOfName('swap_pane');
		
		var descriptor = PropertiesEditor.MODE_TO_NAME[strMode];
		if (descriptor == null) return false;
		
		var toActivate = contentBlock.getChild(descriptor.name);
		
		if (!toActivate) {
			toActivate = contentBlock.loadAndCache(descriptor.uri);
		}

    toActivate.doShow();
				
		this._mode = strMode;
		return true;
	};
	
  /** @private @jsxobf-clobber */
	PropertiesEditor_prototype._cascadeExpertChanges = function() {
		var objView = this.getActiveView();
		var doc = new jsx3.xml.Document().loadXML(objView.getXMLSource());

		//the XML is structurally valid
		if (! doc.hasError()) {
      this.loadMatrixData(doc);
			this.getMatrix().repaintData();
		} else {
			jsx3.IDE.alert("Alert", "Changes made to the XML source caused the following XML parsing error: <br/><br/><b>" +
          doc.getError() + "</b><br/><br/> Please fix the error or revert to the last saved version before continuing.",
          null, null, {width: 400, height: 225});
			return false;
		}
		
		return true;
	};

	PropertiesEditor_prototype.getActiveView = function() {
		var objTab = this.getTab();
		var contentBlock = objTab.getDescendantOfName('swap_pane');
		return contentBlock.getChild(contentBlock.getSelectedIndex());
	};

	PropertiesEditor_prototype.getFileType = function() {
		return "jss";
	};
	
	PropertiesEditor_prototype.supportsReload = function() {
		return true;
	};
	
});
