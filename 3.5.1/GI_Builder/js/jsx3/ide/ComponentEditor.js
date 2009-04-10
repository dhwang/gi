/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.ide.Editor");

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _openNewTab _setTabName

jsx3.Class.defineClass("jsx3.ide.ComponentEditor", jsx3.ide.Editor, null, function(ComponentEditor, ComponentEditor_prototype) {
	
  var Model = jsx3.app.Model;
  
  ComponentEditor_prototype.init = function() {
		this.jsxsuper();
		this._server = null;
		this._mode = 'component';
	};

	ComponentEditor_prototype.close = function() {
		jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_WILL_CLOSE, target:this});

		if (this._server) {
			this._server.destroy();
			delete this._server;
		}
		
		this.jsxsuper();
	};

	ComponentEditor_prototype.create = function(objTabbedPane, strType) {
		var file = jsx3.ide.getBuilderRelativeFile("templates/untitled.jsx");
		this._unsaved = true;
    
    this._pop(objTabbedPane, file);
    this._loadServer();
    this._server.getBodyBlock().removeChildren();
	};

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._pop = function(objTabbedPane, objFile, strType) {
  	this._tab = objTabbedPane.loadAndCache("components/containers/tab_component.xml", false);
		this._url = jsx3.ide.relativePathTo(objFile);
    /* @jsxobf-clobber */
    this._compurl = jsx3.ide.SERVER.getBaseDirectory().relativePathTo(objFile);
		this._openNewTab(objTabbedPane);
  };
  
  ComponentEditor_prototype.open = function(objTabbedPane, objFile, strType) {
    if (this._tab == null) {
      this._pop(objTabbedPane, objFile, strType);
      // Use the exec queue so that the IDE can pause and control this.
      var me = this;
      jsx3.ide.QUEUE.addJob(function() { me._loadServer(); }, 0);
    } else {
      this._loadServer();
    }
  };
  
  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._loadServer = function() {
    var container = this._tab.getDescendantOfName('jsxtab_componenteditor_main').getRendered();
    var server = new jsx3.ide.ServerView(jsx3.ide.SERVER, container, this._compurl);
    this._server = server;

    // reset the namespace reference using the server ALIAS provided by the controller
    // this must be called before server.load() so that the onAfterDeserialize block has access to the server namespace
    server.activateView();

    server.load();

    // force multiple children into a single root block
    var rootNodes = server.getBodyBlock().getChildren();
    if (rootNodes.length > 1) {
      rootNodes = rootNodes.concat();
      var root = new jsx3.gui.Block("root", null, null, "100%", "100%");
      root.setRelativePosition(jsx3.gui.Block.RELATIVE);
      server.getBodyBlock().setChild(root);
      root.setPersistence(Model.PERSISTEMBED);
      for (var i = 0; i < rootNodes.length; i++) {
        var rootNode = rootNodes[i];
        if (rootNode.getPersistence() == Model.PERSISTNONE)
          rootNode.setPersistence(Model.PERSISTEMBED);
        root.adoptChild(rootNode);
      }
      this.setDirty(true);
      
      jsx3.IDE.alert("Component Modified", "General Interface&#8482; Builder does not support multiple root objects. " + 
          "The root objects of this component file have been moved under a single root block. Save the component file " + 
          "to accept these changes.");
    }
    
    //subscribe this editor to the cache and dom controllers for the server, so notified appropriately
    server.getDOM().subscribe(jsx3.app.DOM.EVENT_CHANGE, jsx3.ide.onDomChangeSleep);
    server.getCache().subscribe(jsx3.app.Cache.CHANGE, jsx3.ide.updateCacheSleep);
    
    try {
      server.paint();
    } finally {
      // wrap in finally so that exception in paint method doesn't prevent palettes from activating
      jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_DID_OPEN, target:this});
      this._activateOrDeactivate();
      jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_STATS, target:this, stats:server.getStats()});
    }
  };

	ComponentEditor_prototype.activate = function() {
		var server = this.getServer();
    if (! server) return;
		
    // reset the namespace reference using the server ALIAS provided by the controller
		server.activateView();
		this.onShowComponentMode();
    
    // dispatch event
    if (ComponentEditor.MODE_TO_NAME[this._mode].palettes)
      jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_DID_ACTIVATE, target:this});
	};

  ComponentEditor_prototype.deactivate = function() {
    if (this._server)
      this._server.deactivateView();

    // TODO: need to figure out how to call this method
    if (ComponentEditor.MODE_TO_NAME[this._mode].palettes)
  		jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_DID_DEACTIVATE, target:this});
	};

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._readFromJSX = function(objJSX) {
		//reads the profile properties of the JSX GUI object, '@obj', and returns as a hash
		var objP = {};
		objP.icon = objJSX.getMetaValue('icon');
		objP.name = objJSX.getMetaValue('name');
		objP.description = objJSX.getMetaValue('description');
		objP.onafter = objJSX.getMetaValue('onafter');
		objP.onbefore = objJSX.getMetaValue('onbefore');
		objP.unicode = objJSX.getMetaValue('unicode');
		return objP;
	};

	ComponentEditor_prototype.preSaveCheck = function(fctCallback) {
		// check for illegal async children
		if (this._checkIllegalAsync(this.getServer().getBodyBlock())) {
			jsx3.IDE.confirm(null, "One or more objects in the component file <b>" + this.getTabName() + "</b> that are referenced asynchronously cannot be referenced asynchronously. Select Continue to reference these objects synchronously and save the component file.", 
			function(d) { d.doClose(); fctCallback(); }, 
			null, "Continue", "Cancel", 1, null, null, {width:300, height:150});
			return true;
		}
		return false;
	};
	
  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._checkIllegalAsync = function(objJSX) {
		var children = objJSX.getChildren();
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.getPersistence() == Model.PERSISTREFASYNC && i < children.length - 1)
				return true;
			if (this._checkIllegalAsync(child))
				return true;
		}
		return false;
	};
	
	ComponentEditor_prototype.save = function() {
		var didSave = false;
		var isExpert = false;
		
		//if the user is in expert view, try to commit their changes before continuing (is their XML even valid?)
		var objView = this.getActiveView();
		if (objView && objView.getName() == ComponentEditor.MODE_TO_NAME['source'].name) {
			isExpert = true;
			if (objView.isDirty()) {
				if (!this._cascadeExpertChanges()) return false;
			}
		}

		//is there an active file to save?
		var objFile = this.getOpenFile();
		if (objFile) {
			var objBody = this.getServer().getBodyBlock();
			var objTab = this.getTab();
      var firstChild = objBody.getChild(0);
      
      // save component profile
      var profileProps = {};
      var profileTab = objTab.getDescendantOfName(ComponentEditor.MODE_TO_NAME['profile'].name, false, false);
			if (profileTab != null && profileTab._inited) {
        profileProps = profileTab.getProfileProperties();
			} else if (firstChild != null) {
        //profile tab isn't open (or the save action is called from the read/write 'expert' editor), but the first child of the body exists, so read from it
        profileProps = this._readFromJSX(firstChild);
			}

      var objXML = null;
			if (firstChild != null) {
				//call handler function to save the contents of the active editor (the active JSXBODY)
				objXML = firstChild.toXMLDoc(profileProps);
			} else {
        profileProps.children = true;
        objXML = objBody.toXMLDoc(profileProps);
      }

      objXML = jsx3.ide.makeXmlPretty(objXML, true);
      if (jsx3.ide.writeUserXmlFile(objFile, objXML)) {
				this.setDirty(false);
				didSave = true;
        
        if (objBody.getChildren().length > 1)
          jsx3.ide.LOG.warn("Saved component with " + objBody.getChildren().length + " root objects. Only the first object was saved.");
      }
			
			if (didSave && isExpert)
				objView.onShowMe();
		} else {
			jsx3.ERROR.doLog("IDED12", "can't save file to blank url");
		}
		
		if (didSave)
			jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_SAVED});
		
		return didSave;
	};

	ComponentEditor_prototype.saveAs = function(objFile) {
		var oldUrl = this._url;
		this._url = jsx3.ide.relativePathTo(objFile);
		
		if (this.save()) {
      this._compurl = jsx3.ide.SERVER.getBaseDirectory().relativePathTo(objFile);
      
      this._unsaved = false;
			this._setTabName();
			jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_RESET});
			jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_SAVED_AS});
			return true;
		} else {
			this._url = oldUrl;
			return false;
		}
	};

	ComponentEditor_prototype.revert = function() {
		//get handle to editor tab and the HTML element (@container) that will contain the Server's on-screeen VIEW
		var objTab = this.getTab();
		var container = objTab.getDescendantOfName('jsxtab_componenteditor_main').getRendered();

		jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_WILL_REVERT, target:this});

		//cleanup old server needed (dereference); create new server
		this.getServer().destroy();
		var server = this._server = new jsx3.ide.ServerView(jsx3.ide.SERVER, container, this._compurl);

    // reset the namespace reference using the server ALIAS provided by the controller
    // this must be called before server.load() so that the onAfterDeserialize block has access to the server namespace
    // this may be undone at the end of this method if this editor is not the active editor
    server.activateView();

    server.load();
    server.paint();
    
    //subscribe this editor to the cache and dom controllers for the server, so notified appropriately
		server.getDOM().subscribe(jsx3.app.DOM.EVENT_CHANGE,jsx3.ide.onDomChangeSleep);
		server.getCache().subscribe(jsx3.app.Cache.CHANGE, jsx3.ide.updateCacheSleep);

		// revert component profile
		var profileTab = objTab.getDescendantOfName(
				ComponentEditor.MODE_TO_NAME['profile'].name, false, false);
		if (profileTab != null) {
			var firstChild = server.getRootObjects()[0];
			if (firstChild)
				profileTab.fillFromJSX(firstChild);
			else
				profileTab.clear();
		}
				
		this.setDirty(false);
		
		// revert the active view
		var objView = this.getActiveView();
		if (objView && typeof(objView.onShowMe) == 'function')
			objView.onShowMe();

		//publish that editor is reset and available to listen, update, etc
		jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_RESET, target:this});

		//fire dom and cache change-events to provide initialized state for the dom/cache palettes
		server.getDOM().onChange(jsx3.app.DOM.TYPEADD, server.getRootBlock().getId(), server.getBodyBlock().getId());

    this._activateOrDeactivate();
    jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_STATS, target:this, stats:server.getStats()});
  };

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._activateOrDeactivate = function() {
    var server = this._server;
    var activeEditor = jsx3.ide.getActiveEditor();

    if (this == activeEditor) {
      this.activate();
    } else {
      var activeServer = activeEditor.getServer();
      if (activeServer instanceof ComponentEditor)
        activeServer.activateView();
      else
        server.deactivateView();
    }
  };

  ComponentEditor_prototype.getServer = function() {
		return this._server;
	};

	ComponentEditor_prototype.getFileType = function() {
		return jsx3.ide.TYPE_COMPONENT;
	};
	
	ComponentEditor_prototype.setMode = function(strMode) {
		// check for deactivating xml expert view
		var objView = this.getActiveView();

		if (objView && objView.getName() == ComponentEditor.MODE_TO_NAME['source'].name && objView.isDirty()) {
			if (! this._cascadeExpertChanges())
				return false;
		}
		
		// change mode
		
		var objTab = this.getTab();
		var contentBlock = objTab.getDescendantOfName('swap_pane');

		var descriptor = ComponentEditor.MODE_TO_NAME[strMode];
		var toActivate = contentBlock.getChild(descriptor.name);

		if (!toActivate) {
			toActivate = contentBlock.loadAndCache(descriptor.uri);
		}

    toActivate.doShow();

    var bPalettePre = ComponentEditor.MODE_TO_NAME[this._mode].palettes;
    var bPalettePost = descriptor.palettes;
    if (bPalettePre != bPalettePost) {
      var subject = bPalettePost ? jsx3.ide.events.COMPONENT_EDITOR_DID_ACTIVATE : 
          jsx3.ide.events.COMPONENT_EDITOR_DID_DEACTIVATE;
      jsx3.IDE.publish({subject:subject, target:this});
    }
		
    this._mode = strMode;
		return true;
	};
	
  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._cascadeExpertChanges = function() {
		//get the XML the user has been manually editing; load to check its structural validity
		var objView = this.getActiveView();
		var doc = new jsx3.xml.Document();
		doc.loadXML(objView.getXMLSource());

		//set success/error flags
		var success = false;
		var error = doc.getError();

		//the XML is structurally valid
		if (error.code == "0") {
			error = null;
			
			var server = this.getServer();
			var parent = server.getBodyBlock();
			var oldChild = parent.getChildren();
			var oldLength = oldChild.length;
			var newChild = null;
			
			try {
				//deserialize the new content
        var children = parent.loadXML(doc, false);
        if (children instanceof Array) {
          for (var i = 0; i < children.length; i++)
            children[i].setPersistence(Model.PERSISTEMBED);
        } else {
          children.setPersistence(Model.PERSISTEMBED);
        }

				//remove the existing content (decrement to preserve index integrity)
				for (var i = oldLength-1; i >= 0; i--) {
					parent.removeChild(oldChild[i]);
				}
			
				// set profile to dirty
				var contentBlock = this.getTab().getDescendantOfName('swap_pane');
				var profileTab = contentBlock.getChild(ComponentEditor.MODE_TO_NAME['profile'].name);
				if (profileTab != null)
					profileTab._inited = false;
				
				success = true;
			} catch (e) {
				//set reference to error object
				error = e;

				//remove any new children that may have been deserialized (perhaps it failed after adding a few children)
        var newLength;
        if ((newLength = parent.getChildren().length) > oldLength) {
					for (var i = newLength-1; i >= oldLength; i--) {
						parent.removeChild(parent.getChild(i));
					}
				}
			}
      
      parent.repaint();
    }
			
		if (!success) {
			jsx3.IDE.alert("Alert", "Changes made to the XML source caused the following XML parsing error: <br/><br/><b>" + error.description + "</b><br/><br/> Please fix the error or revert to the last saved version before continuing.", null, null, {width: 400, height: 225});
			return false;
		}
		
		return error == null;
	};
	
	ComponentEditor_prototype.getActiveView = function() {
		var objTab = this.getTab();
		var contentBlock = objTab ? objTab.getDescendantOfName('swap_pane') : null;
		return contentBlock ? contentBlock.getChild(contentBlock.getSelectedIndex()) : null;
	};
	
	ComponentEditor_prototype.supportsReload = function() {
		return true;
	};

  ComponentEditor_prototype.onShowComponentMode = function() {
    // HACK: if the component is reloaded while the component view is hidden, the box profile may show dimensions {0,0}
    var s = this.getServer();
    var root = s.getRootBlock().getRendered();
    if (root && (root.offsetWidth == 0 || root.offsetHeight == 0))
      s.onResizeParent();
  };

  ComponentEditor.MODE_TO_NAME = {
		component: {name:'jsxtab_componenteditor_maintab', palettes:true},
		source: {name:'component_xmlwr', uri:'components/containers/component-xmlrw.xml', palettes:false},
		sourcefmt: {name:'component_asxml', uri:'components/containers/component-xmlro.xml', palettes:false},
		html: {name:'component_ashtml', uri:'components/containers/component-html.xml', palettes:false},
		profile: {name:'component_profile', uri:'components/containers/component-profile.xml', palettes:false}
	};

  ComponentEditor_prototype.refreshStats = function() {
    // create a div to put the dummy server in
    var testDiv = document.createElement("div");
    testDiv.style.display = "none";
    document.getElementsByTagName("body")[0].appendChild(testDiv);

    // serialize the current content
    var objBody = this.getServer().getBodyBlock();
    var firstChild = objBody.getChild(0);

    var profileProps = {};
    if (firstChild) {
      profileProps = this._readFromJSX(firstChild);
    } else {
      profileProps.children = true;
    }

    var objXML = (firstChild || objBody).toXMLDoc(profileProps);
    objXML = jsx3.ide.makeXmlPretty(objXML, true);

    // create a dummy server view
    var server = new jsx3.ide.ServerView(jsx3.ide.SERVER, testDiv, objXML);
    server.load();
    server.paint();

    jsx3.IDE.publish({subject:jsx3.ide.events.COMPONENT_EDITOR_STATS, target:this, stats:server.getStats()});
    testDiv.parentNode.removeChild(testDiv);
    server.destroy();
  };
	
});
