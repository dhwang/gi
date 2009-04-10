/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.ide.TextEditor");

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _type _openNewTab _setTabName

jsx3.Class.defineClass("jsx3.ide.CacheEditor", jsx3.ide.TextEditor, null, function(CacheEditor, CacheEditor_prototype) {
  
  CacheEditor_prototype.init = function() {
		this.jsxsuper();
		this._mode = 'readwrite';
	};

	/* Not Implemented 	
	CacheEditor_prototype.create = function(objTabbedPane, strType) {
	};
	*/
	
	CacheEditor_prototype.open = function(objTabbedPane, strCacheId, objServer) {
    this._type = 'xml';
		
		var objTab = objTabbedPane.loadAndCache("components/containers/tab_xmleditor.xml", false);
		var cache = objServer.getCache();
		
		objTab.getTextArea().setValue(cache.getDocument(strCacheId, false).getXML());
		
    /* @jsxobf-clobber */
		this._cacheid = strCacheId;
		this._tab = objTab;
		this._server = objServer;
		
		this._openNewTab(objTabbedPane);

		jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_DID_OPEN, target:this});
		this.activate();
	};
	
	CacheEditor_prototype.loadDocument = function(objDoc) {
		this.setMode('readwrite');
		this.getTab().setButtonState('btnViewRW');
		this.getTab().getTextArea().setValue(objDoc.getXML(), true);
	};
	
	CacheEditor_prototype.revert = function() {
		var cache = this._server.getCache();
		var textarea = this._tab.getTextArea();
		textarea.setValue(cache.getDocument(this._cacheid));
		this.setDirty(false);
	};

	CacheEditor_prototype.activate = function() {
	};

	CacheEditor_prototype.save = function() {
		var objXML = new jsx3.xml.Document();
		objXML.loadXML(this._tab.getTextArea().getValue());
		
		var error = objXML.getError();
		if (error.code != "0") {
			jsx3.ERROR.doLog("IDED22", "The cache document count not be saved because of the following XML parsing error: <b>" + error.description + "</b>. Please fix the error or revert to the last saved version before continuing.");
			return false;
		}
		
		if (objXML != null) {
			//TO DO: if a system doc, persist this
			this._server.getCache().setDocument(this._tab.getText(), objXML);
			this.setDirty(false);
			return true;
		}
		
		return false;
	};

	CacheEditor_prototype.saveAs = function(objFile) {
		var objXML = new jsx3.xml.Document();
		objXML.loadXML(this._tab.getTextArea().getValue());
		
		var error = objXML.getError();
		if (error.code != "0") {
			jsx3.ERROR.doLog("IDED23", "The cache document count not be saved to disk because of the following XML parsing error: <br/><br/><b>" + error.description + "</b><br/><br/> Please fix the error or revert to the last saved version before continuing.");
			return false;
		}
		
		if (objXML != null)
      return jsx3.ide.writeUserXmlFile(objFile, objXML);

		return false;
	};

	CacheEditor_prototype.getServer = function() {
		return this._server;
	};

	CacheEditor_prototype.getFileType = function() {
		var objXML = new jsx3.xml.Document();
		objXML.loadXML(this._tab.getTextArea().getValue());
		
		if (! objXML.hasError()) {
			var type = jsx3.ide.getDocumentType(objXML);
			return type == "xsl" ? jsx3.ide.TYPE_XSL : jsx3.ide.TYPE_XML;
		} else {
			return null; 
		}
	};
	
	CacheEditor_prototype.getCacheId = function() {
		return this._cacheid;
	};

	CacheEditor_prototype.getTabName = function() {
		return this._cacheid;
	};

	CacheEditor_prototype.supportsReload = function() {
		return false;
	};
	
});

jsx3.ide.CacheEditor.prototype.setMode = jsx3.ide.TextEditor.prototype.setMode;
