/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-global-rename-pattern  _jsx(\w+) _jsx$1
// @jsxobf-clobber-shared  _addClassPathOf


//declare the ide controller (will manage the main logic to orchestrate all modules/components within the IDE)
if (jsx3.ide == null) jsx3.ide = {};
// make the jsx3.ide package an event dispatcher so that we can register for certain events before jsx3.IDE is created
jsx3.util.EventDispatcher.jsxclass.mixin(jsx3.ide);

jsx3.ide.QUEUE = new jsx3.util.ExecQueue();
jsx3.ide.RECENT_PROJECT_MAX = 10;
jsx3.ide.RECENT_FILES_MAX = 15;
jsx3.ide.LOG = jsx3.util.Logger.getLogger('jsx3.ide');

/*
 * single entry point on IDE startup
 */
jsx3.ide.onStartUp = function() {
  
  if (jsx3.Class.forName('jsx3.io.File') == null || ! jsx3.io.File.isLoaded()) {
    jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty("jsxerr_filenotloaded"), 
            function() {window.location.reload();}, "Reload Browser", {width:400, height:155});
    return;
  }

  var queue = jsx3.ide.QUEUE;
  queue.addJob(function(q) { jsx3.ide.systemOutStartup(); });
  queue.addJob(function(q) {
    jsx3.IDE.subscribe(jsx3.app.Server.HELP, jsx3.ide.onContextHelp);
    jsx3.IDE.getRootBlock().setHelpId("ide");
  });

  if (! jsx3.ide.verifyUserHome()) {
    queue.addJob(function(q) { jsx3.ide.showLicenseAgreement(); });
    queue.addJob(function(q) { jsx3.ide.showNewUserHomeDialog(); });
  } else if (jsx3.STARTUP_EVENT && jsx3.STARTUP_EVENT.ctrlKey() && jsx3.STARTUP_EVENT.altKey()) {
		jsx3.ide.clearActiveProject();
    queue.addJob(function(q) { jsx3.ide.showWelcomeDialog(); });
    queue.addJob(function(q) { jsx3.ide.publish({subject: jsx3.ide.events.STARTUP}); });
    queue.addJob(function(q) { jsx3.IDE.publish({subject: jsx3.ide.events.STARTUP}); });
	} else {
    jsx3.ide.onStartUp2();
  }
};

/* @jsxobf-clobber */
jsx3.ide.onStartUp2 = function() {
  //determine the project we'll be editing
  var myProject = jsx3.ide.getActiveProject();
  var queue = jsx3.ide.QUEUE;
  var settings = jsx3.ide.getIDESettings();

  if (myProject === true || myProject == "" || (myProject && ! jsx3.ide.checkProjectExists(myProject, true)))
    myProject = null;

  if (myProject) {
    //a project has been specified
    jsx3.gui.Event.subscribe(jsx3.gui.Event.BEFOREUNLOAD, jsx3.ide.onBeforeShutdown);

    queue.addJob(function(q) { jsx3.ide.SERVER = new jsx3.ide.Server(myProject); });
    queue.addJob(function(q) { jsx3.ide.checkProjectJsxVersion(); });
    queue.addJob(function(q) { jsx3.ide.addinStartup(); });
    queue.addJob(function(q) { jsx3.ide.loadBuilderProject(jsx3.ide.SERVER.getRelPath()); });
    queue.addJob(function(q) { jsx3.ide.openPalettesOnStartup(); });
    queue.addJob(function(q) { jsx3.ide.setUpEventListeners(); });
    queue.addJob(function(q) { jsx3.ide.constructPropertyTypeIndex(); });

    var bShowWelcome = settings.get('prefs', 'builder', 'welcome_v', jsx3.getVersion());
    if ((bShowWelcome || bShowWelcome == null) && !jsx3.app.Browser.getLocation().getQueryParam("jsxnowelc"))
      queue.addJob(function(q){ jsx3.ide.showWelcomeDialog(); });

    // skip opening previous files if control key held down (may require restarting browser)
    if (jsx3.STARTUP_EVENT == null || ! jsx3.STARTUP_EVENT.ctrlKey())
      queue.addJob(function(q){ jsx3.ide.openPreviouslyOpenFiles(); });
    else
      // otherwise clear out the saved files
      queue.addJob(function(q){ jsx3.ide.syncPreviouslyOpenFiles(null,[]); });
  } else {
    // handle case when no known project; show dialog that will give choice to open (ref any projects in the jsxapppath dir) or create new
    queue.addJob(function(q){ jsx3.ide.showWelcomeDialog(); });
  }
	
  queue.addJob(function(q) {
    jsx3.ide.publish({subject: jsx3.ide.events.STARTUP});
    jsx3.IDE.publish({subject: jsx3.ide.events.STARTUP});
  });
  
  queue.addJob(function(q) { jsx3.ide.newVersionCheck(); });
};

/* @jsxobf-clobber */
jsx3.ide.addinStartup = function() {
  /* @jsxobf-clobber */
  jsx3.ide.ADDINS_LOADING_ALERT = jsx3.IDE.alert("Loading Addins", "Loading addins, please wait.",
      null, false, {nonModal:true});

  jsx3.ide.QUEUE.pause();

  jsx3.sleep(function() {
    jsx3.ide.loadBuilderAndProjectAddins(jsx3.ide.SERVER);

    if (jsx3.CLASS_LOADER.isActive()) {
      jsx3.CLASS_LOADER.subscribe("done", jsx3.ide, function() {
        jsx3.CLASS_LOADER.unsubscribe("done", jsx3.ide);
        jsx3.ide.ADDINS_LOADING_ALERT.doClose();
        jsx3.ide.QUEUE.start();
      });
    } else {
      jsx3.ide.ADDINS_LOADING_ALERT.doClose();
      jsx3.ide.QUEUE.start();
    }
  });
};

jsx3.ide.getIDESettings = function() {
  if (jsx3.ide._SETTINGS == null) {
    /* @jsxobf-clobber */
    jsx3.ide._SETTINGS = new jsx3.ide.Preferences(jsx3.ide.Preferences.DOMAIN_IDE);
  }
  return jsx3.ide._SETTINGS;
};

jsx3.ide.loadBuilderProject = function(strProjectId) {
  // set title of Builder window for open project
  var windowDoc = jsx3.IDE.getRootDocument();
  var projSettings = jsx3.ide.SERVER.getSettings();
  var projName = projSettings.get("caption") || jsx3.ide.SERVER.getEnv("namespace") ||
      jsx3.ide.SERVER.getRelPath();
  windowDoc.title = projName + " - " + windowDoc.title;
  
  var settings = jsx3.ide.getIDESettings();
  settings.set('lastProject', strProjectId);
  jsx3.ide.addToRecentProjects(strProjectId);
  jsx3.ide.loadProjectResources(strProjectId);
  jsx3.ide.checkProjectAddins();
};

jsx3.ide.loadProjectResources = function(strProjectId) {
  jsx3.CLASS_LOADER._addClassPathOf(jsx3.ide.SERVER);

  var settings = jsx3.ide.SERVER.getSettings();
	var includes = settings.get('includes');
	for (var i = 0; i < includes.length; i++) {
		var include = includes[i];
		if (jsx3.CLASS_LOADER.passesLoad(include.onLoad || include.load)) {
			if (include.type == 'css' || include.type == 'script') {
				jsx3.IDE.loadInclude(jsx3.ide.SERVER.resolveURI(include.src), include.id, include.type);
      } else {
        try {
          jsx3.ide.SERVER.loadInclude(jsx3.ide.SERVER.resolveURI(include.src), include.id, include.type);
        } catch (e) {
          jsx3.ide.LOG.warn("There was an error loading resource " + include.src + ": " + jsx3.NativeError.wrap(e));
        }
      }
    }
	}
};

jsx3.ide.onBeforeShutdown = function(objEvent) {
	jsx3.ide.persistSplittersOnShutdown();
	var settings = jsx3.ide.getIDESettings();
	settings.save();

	jsx3.IDE.publish({subject: jsx3.ide.events.BEFORE_SHUTDOWN});
	
	if (jsx3.ide.isAnyEditorDirty())
		objEvent.returnValue = "WARNING: You have unsaved changes in your project. Click on Cancel to go back to General Interface(TM) Builder to save your changes.";
	else
		objEvent.returnValue = "Unloading the current page will close General Interface(TM) Builder and end your session.";
};

jsx3.ide.onShutdown = function(objEvent) {
  jsx3.IDE.publish({subject: jsx3.ide.events.SHUTDOWN});
};

jsx3.ide.openPreviouslyOpenFiles = function() {
	var objFiles = jsx3.ide.getPreviouslyOpenFiles();
	if (objFiles == null)
		objFiles = jsx3.ide.getDefaultOpenFiles();
	
	if (objFiles.length == 0) return;
	
  var alert = jsx3.IDE.alert(
		"Opening Project",
		"Opening component files for project " + jsx3.ide.SERVER.getRelPath() + " ...",
		jsx3.ide.cancelPreviouslyOpenFiles,
		"Cancel"
	);
	
  jsx3.ide.QUEUE.pause();
  jsx3.ide.QUEUE.addJob(function(q){ alert.doClose(); }, 0);

  /* break stack after each file load ... */
  for (var i = 0; i < objFiles.length; i++) {
    jsx3.ide.QUEUE.addJob(
      jsx3.makeCallback(function(file, args) {
        jsx3.ide.doOpenForEdit(file, null, false);
      }, null, objFiles[i]), i);
  }

  jsx3.ide.QUEUE.start();
};

jsx3.ide.cancelPreviouslyOpenFiles = function(d) {
  jsx3.ide.QUEUE.pause();
  d.doClose();
  jsx3.ide.closeAll(function() {
    jsx3.ide.QUEUE.init();
    jsx3.ide.QUEUE.start();
    jsx3.ide.QUEUE.addJob(jsx3.ide.updateResources);
  });
};

jsx3.ide.getSystemDirectory = function() {
	// cache result since it never changes
	if (jsx3.ide._SYSTEM_DIR == null) {
		// returns directory containing JSX, ide, and all application source directories
    var brwLoc = jsx3.app.Browser.getLocation();
    if (brwLoc.getScheme() != "file")
      jsx3.ide.LOG.fatal("May not run IDE from non-file URL: " + brwLoc.getHost());

    var path = brwLoc.getPath();
    var dirURI = jsx3.net.URI.fromParts(null, null, null, brwLoc.getPort(),
        path.substring(0, path.lastIndexOf("/") + 1), null, null);
    /* @jsxobf-clobber */
    jsx3.ide._SYSTEM_DIRURI = dirURI;
    jsx3.ide._SYSTEM_DIR = jsx3.net.URI.decode(dirURI.toString());
	}
	return jsx3.ide._SYSTEM_DIR;
};

jsx3.ide.getSystemDirFile = function() {
	// cache result since it never changes
	if (jsx3.ide._SYSTEM_DIRFILE == null) {
		jsx3.ide._SYSTEM_DIRFILE = new jsx3.io.File(jsx3.ide.getSystemDirectory());
	}
	return jsx3.ide._SYSTEM_DIRFILE;
};

jsx3.ide.getSystemRelativeFile = function(strURI) {
  return new jsx3.io.File(this.getSystemDirFile().toURI().resolve(strURI));
};

jsx3.ide.getBuilderRelativeFile = function(strURI) {
  return new jsx3.io.File(this.getSystemDirFile().toURI().resolve(jsx3.IDE.resolveURI(strURI)));
};

jsx3.ide.getSystemDirURI = function() {
	// cache result since it never changes
	if (jsx3.ide._SYSTEM_DIRURI == null)
		jsx3.ide.getSystemDirectory();
	return jsx3.ide._SYSTEM_DIRURI;
};

jsx3.ide.fixPath = function(strPath) {
	//creates a relative path with unix-style forward slash separator
	if (strPath == null) return null;

	var sysPath = jsx3.ide.getSystemDirectory();
	strPath = jsx3.net.URI.decode(strPath.replace(/\\/g,"/"));

	return strPath.indexOf(sysPath) == 0 ? strPath.substring(sysPath.length) : strPath;
};

jsx3.ide.relativePathTo = function(objFile) {
	return jsx3.ide.getSystemDirFile().relativePathTo(objFile);
};

jsx3.ide.handleCallback = function(fctCallback) {
	// can be string or function
	if (fctCallback)
		window.setTimeout(fctCallback, 1);
};

jsx3.ide.open = function() {
  jsx3.require("jsx3.io.FileDialog");
  
  //open dialog if necessary
  var dialog = jsx3.IDE.getJSXByName("jsxdialog");
  if (dialog == null)
		dialog = jsx3.io.FileDialog.deserialize(jsx3.IDE.getRootBlock(),"jsxdialog");
	
	//bind callback and show
	dialog.onExecute = function(objFiles) {
		for (var i = 0; i < objFiles.length; i++) {
			jsx3.ide.doOpenForEdit(objFiles[i]); 
		}
		
		if (objFiles.length > 0)
			jsx3.ide.setCurrentDirectory(objFiles[0].getParentFile());
	};
	dialog.openForOpen(jsx3.ide.getCurrentDirectory(), jsx3.ide.getCurrentUserHome(), jsx3.io.FileDialog.CHOOSE_FILES);
};

jsx3.ide.doOpenResource = function(strResourceId) {
  jsx3.ide.doOpenResources([strResourceId]);
};

jsx3.ide.doOpenResources = function(strResourceIds) {
  var notFound = [];
  for (var i = 0; i < strResourceIds.length; i++) {
    var objFile = jsx3.ide.getFileForResource(strResourceIds[i]);
  	if (objFile != null && objFile.isFile()) 
	  	jsx3.ide.doOpenForEdit(objFile, null, false);
    else
      notFound.push(strResourceIds[i]);
  }
  if (notFound.length > 0) {
    var message = (notFound.length == 1) ?
        "The file for resource <code>" + notFound[0] + "</code> was not found. Right-click the file in the Project Files palette, select Edit Profile, and confirm that the resource URI corresponds to a file on disk." :
        "The files for resources {<code>" + notFound.join(", ") + "</code>} were not found. Right-click each file in the Project Files palette, select Edit Profile, and confirm that its resource URI corresponds to a file on disk.";
    jsx3.IDE.alert("File" + (notFound.length == 1 ? "" : "s") + " Not Found", message);
  }
};

jsx3.ide.doActivateResource = function(objTab) {
	var editor = jsx3.ide.getEditorForTab(objTab);
	if (editor != null) editor.activate();
};

jsx3.ide.doDeactivateResource = function(objTab) {
	var editor = jsx3.ide.getEditorForTab(objTab);
	if (editor != null) editor.deactivate();
};

jsx3.ide.saveAndReload = function(objTab) {
	var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	// a GUI component will actually be reverted since it doesn't support the idea of reload
	if (editor != null && jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor)
		jsx3.ide.save(objTab, function() {jsx3.ide.revert(objTab, true);});
	// all others are saved and then reloaded
	else
		jsx3.ide.save(objTab, function() {jsx3.ide.reload(objTab, true);});
};

jsx3.ide.saveAll = function(fctOnDone, intStartAt) {
	var editors = jsx3.ide.getAllEditors();
	if (intStartAt == null) 
		intStartAt = 0;

  if (intStartAt < editors.length) {
		var editor = editors[intStartAt];
		jsx3.ide.save(editor.getTab(), function(){jsx3.ide.saveAll(fctOnDone, intStartAt+1);});
		return;
	}
  
  if (fctOnDone) fctOnDone();
};

jsx3.ide.save = function(objTab, fctOnDone, bChecked) {
  var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	if (editor == null) return;
	
	if (editor.isUnsaved()) {
		jsx3.ide.saveAs(objTab, fctOnDone);
	} else {
		if (!bChecked && editor.preSaveCheck(function(){jsx3.ide.save(objTab, fctOnDone, true);})) {
			;
		} else if (editor.save()) {
			jsx3.ide.handleCallback(fctOnDone);
		} else {
			var objFile = editor.getOpenFile();
			var strPath = objFile != null ? jsx3.ide.getActiveProjectDirectory().relativePathTo(objFile) : editor.getTabName();
			jsx3.IDE.alert(
				"Save Failed",
        "The file <b>" + jsx3.ide.fixPath(jsx3.net.URI.decode(strPath)) +
          "</b> was not saved because of an error. Check that you have permission to write to the file, that it is " +
          "not locked, and that the path is valid for this operating system.<br/><br/>" +
          "Consult the System Log for a more detailed error report.",
				null, null, {width: 300, height: 175}
			);
		}
	}
};

jsx3.ide.saveAndClose = function(objTab, fctOnDone) {
	var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	
	if (editor != null) {
		jsx3.ide.save(objTab, function() {editor.close(); jsx3.ide.handleCallback(fctOnDone);});
	}
};

jsx3.ide.saveAs = function(objTab, fctOnDone) {
	var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	if (editor == null) return;
	
  jsx3.require("jsx3.io.FileDialog");
  var dialog = jsx3.io.FileDialog.deserialize(jsx3.IDE.getRootBlock(), "jsx_ide_file_dialog", true);
	// bind execute event and call 'save'
	dialog.onExecute = function(objFile, bChecked) {
    var existingEditor = jsx3.ide.getEditorForFile(objFile);
    if (!bChecked && editor.preSaveCheck(function(){dialog.onExecute(objFile, true);})) {
			;
		} else if (existingEditor != null) {
      jsx3.ide.close(existingEditor.getTab(), false, function(){dialog.onExecute(objFile, true);});
    } else if (editor.saveAs(objFile)) {
			var type = editor.getFileType();
			if (type == null) type = jsx3.ide.getFileType(objFile);
			jsx3.ide.addResourceToProject(objFile, type);
			jsx3.ide.setCurrentDirectory(objFile.getParentFile());
			jsx3.ide.handleCallback(fctOnDone);
		} else {
			jsx3.IDE.alert(
				"Save Failed",
				"The file <b>" + jsx3.net.URI.decode(jsx3.ide.getActiveProjectDirectory().relativePathTo(objFile)) +
          "</b> was not saved because of an error. Check that you have permission to write to the file, that it is " +
          "not locked, and that the path is valid for this operating system.<br/><br/>" +
          "Consult the System Log for a more detailed error report.",
				null, null, {width: 300, height: 175}
			);
		}
	};

	dialog.openForSave(jsx3.ide.getCurrentDirectory(), jsx3.ide.getCurrentUserHome());
};

jsx3.ide.close = function(objTab, bConfirmed, fctOnDone) {
	var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	if (editor == null) return;
	
	if (!editor.isDirty() || bConfirmed) {
		editor.close();
		jsx3.ide.handleCallback(fctOnDone);
	} else {
		jsx3.IDE.confirm(
			"Confirm Close", 
			"Save file " + editor.getTabName() + " before closing? Otherwise changes will be lost.", 
			function(d){ d.doClose(); jsx3.ide.saveAndClose(objTab, fctOnDone);}, 
			null, "Save", "Cancel", 1,
			function(d){ d.doClose(); editor.close(); jsx3.ide.handleCallback(fctOnDone);},
			"Don't Save"
		);
	}
};

jsx3.ide.closeAll = function(fctOnDone) {
	var editors = jsx3.ide.getAllEditors();
	for (var i = 0; i < editors.length; i++) {
		var editor = editors[i];
		if (editor.isDirty()) {
			jsx3.ide.doActivateResource(editor.getTab());
			jsx3.ide.close(editor.getTab(), false, function() {jsx3.ide.closeAll(fctOnDone);});
			return;
		} else {
			editor.close();
		}
	}
	jsx3.ide.handleCallback(fctOnDone);
};

jsx3.ide.revert = function(objTab, bConfirmed) {
	var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	if (editor == null) return;

	if (bConfirmed) {
		editor.revert();
	} else {
		jsx3.IDE.confirm(
			"Confirm Revert", 
			"Are you sure you want to revert the file <b>" + editor.getTabName() + "</b> to its last saved state? All changes will be lost.",
			function(d){d.doClose(); jsx3.ide.revert(objTab, true);}, 
			null, "Revert", "Cancel", 2);
	}
};

jsx3.ide.revertAll = function(bConfirmed) {
	if (bConfirmed) {
		var editors = jsx3.ide.getAllEditors();
		for (var i = 0; i < editors.length; i++) {
			editors[i].revert();
		}
	} else {
		jsx3.IDE.confirm(
			"Confirm Revert All", 
			"Are you sure you want to revert each open file to its last saved state? All changes will be lost.", function(d){d.doClose(); jsx3.ide.revertAll(true);},
			null, "Revert All", "Cancel", 2);
	}
};

jsx3.ide.reload = function(objTab) {
  var editor = objTab != null ? jsx3.ide.getEditorForTab(objTab) : jsx3.ide.getActiveEditor();
	if (editor) {
		var objFile = editor.getOpenFile();
		var resource = jsx3.ide.getResourceByFile(objFile);
		if (resource) {
      // BUG: reloading JavaScript seems to cause problems without a delay?
      if (resource.type == jsx3.ide.TYPE_JAVASCRIPT)
        window.setTimeout(function(){jsx3.ide.doReloadResourceObj(resource);}, 100);
      else
        jsx3.ide.doReloadResourceObj(resource);
		} else {
      jsx3.ide.LOG.error("Could not reload resource " + objFile + " because no resource was found with that path. " +
          "Make sure that the config.xml file is updated to the 3.2+ format.");
    }
	}
};

jsx3.ide.doTextEditorKeyDown = function(objEvent, objTextBox, objTab) {
  var objTextBoxGUI = objTextBox.getRendered();
  
  //processes key down events for the text editor in the IDE; forces 'dirty' state so user knows it needs to be saved
  if (objEvent.ctrlKey() && objEvent.spaceKey() && !objEvent.shiftKey() && !objEvent.altKey()) {
    // determine which context menu should be displayed 
    var strMenuId = null;
    if (objTab == null) {
      strMenuId = "jsxmenu_typeaheadscript";
    } else {
      var objEditor = jsx3.ide.getEditorForTab(objTab);
      if ((jsx3.ide.TextEditor && objEditor instanceof jsx3.ide.TextEditor) ||
          (jsx3.ide.CacheEditor && objEditor instanceof jsx3.ide.CacheEditor)) {
        var type = objEditor.getFileType();
        strMenuId = "jsxmenu_typeahead" + type;
      }
    }
    
    var objMenu = jsx3.IDE.getJSXByName(strMenuId);

    // this typeahead menu is loaded lazily since it's so large
    if (strMenuId == "jsxmenu_typeaheadscript" && objMenu == null) {
      var f = jsx3.ide.getBuilderRelativeFile("language/eng/typeahead_script.xml");
      if (f.isFile()) {
        var objParent = jsx3.IDE.getJSXByName("jsxmenu_typeaheadcss").getParent();
        objMenu = objParent.load("components/containers/menu-typeahead-script.xml");
      } else {
        jsx3.ide.LOG.warn("The JavaScript editor type-ahead menu is disabled because the data file does not exist.");
      }
    }

    if (objMenu) {
      objTextBoxGUI._jsxsel = jsx3.html.getSelection(objTextBoxGUI);
      
      // cancel the keys and show the context menu
      objEvent.cancelBubble();
      objEvent.cancelReturn();
      objMenu.showContextMenu(objEvent, objTextBox, null,
          {L: objTextBoxGUI._jsxsel.getOffsetLeft(), T:objTextBoxGUI._jsxsel.getOffsetTop()});
//      objMenu.subscribe(jsx3.gui.Interactive.HIDE, jsx3.ide.onTypeAheadClosed);
    }
  } else if (objTab != null) {
    var editor = jsx3.ide.getEditorForTab(objTab);
    if (! editor.isDirty()) {
      var preText = editor.getEditorText();
      // wait until the event bubbles up and maybe changes the text in the field
      window.setTimeout(function(){
        if (editor.isOpen() && preText != editor.getEditorText()) 
          editor.setDirty(true);
      }, 0);
    }
  }
};

jsx3.ide.onTypeAheadClosed = function(objEvent) {
  var objMenu = objEvent.target;
//  objMenu.unsubscribe(jsx3.gui.Interactive.HIDE, jsx3.ide.onTypeAheadClosed);
  jsx3.ide.doInsertCode(null, objMenu.getContextParent());
};

jsx3.ide.doInsertCode = function(objRecord, objJSXText, TYPE) {
  var objTextBoxGUI = objJSXText.getRendered();
  var caretPos = objTextBoxGUI._jsxsel;

  if (caretPos != null) {
    objTextBoxGUI._jsxsel = null;

    // new JS typeahead syntax
    var strCode = objRecord ? objRecord.getAttribute("syntax") : null;
    // older XML, etc syntax
    if (strCode == null) {
      var syntaxNode = objRecord.selectSingleNode("syntax");
      if (syntaxNode) strCode = syntaxNode.getValue();
    }
    
    if (strCode != null) {
      var selText = caretPos.getText();
      caretPos.setText(selText.charAt(selText.length - 1) == ' ' ? strCode + ' ' : strCode);

      var objTab = objJSXText.getAncestorOfType(jsx3.gui.Tab);
      if (objTab) {
        objTab = objTab.getAncestorOfType(jsx3.gui.Tab);
        if (objTab) {
          var objEditor = jsx3.ide.getEditorForTab(objTab);
          if (objEditor) objEditor.setDirty(true);
        }
      }
    }

    caretPos.insertCaret("end");
  }
};

jsx3.ide.onComponentTabOver = function(strJSXTabId) {
  //if user is dragging a valid CDF record, auto-click this tab
  if (jsx3.EventHelp.isDragging()) {
    var objTab = jsx3.IDE.getJSXById(strJSXTabId);
    if (objTab.FILEURL != "JSXUNTITLED") objTab.doShow();
  }
};

jsx3.ide.getDocumentType = function(objDocument) {
  if (objDocument.hasError()) return "xml";  
  //determines by the root namespace uri, whether or not the documet is xml or xsl
  var strNSURI = objDocument.getRootNode().getNamespaceURI();
  //TO DO: get all versions of XSL we support--if we miss one, no big deal, it will be opened as an xml doc
  return (strNSURI == "http://www.w3.org/1999/XSL/Transform" || strNSURI == "http://www.w3.org/TR/WD-xsl") ? "xsl" : "xml";
};

jsx3.ide.populateFileMenu = function(objMenu, strMenuId) {
	if (strMenuId == null) {
    var editor = jsx3.ide.getActiveEditor();
    
    var bProjectOpen = jsx3.ide.SERVER != null;
    var bEditorOpen = editor != null;
    
    for (var i = objMenu.getXML().selectNodeIterator("/data/record"); i.hasNext(); ) {
      var node = i.next();
      // enable/disable items according to whether a tab is open and whether a project is open
      var enabled = (bProjectOpen || node.getAttribute('project') != "1") && 
                    (bEditorOpen || node.getAttribute('editor') != "1");
      // check for requiring supportsReload
      if (enabled) {
        if (node.getAttribute('reload') == "1")
          enabled = editor != null && editor.supportsReload();
      }
      // check for eval tests
      if (enabled) {
        var script = node.getAttribute('script');
        if (script) {
          try {
            enabled = Boolean(jsx3.eval(script));
          } catch (e) { enabled = false; }
        }
      }
      objMenu.enableItem(node.getAttribute('jsxid'), enabled);
      
      // check for text specific to type of editor
      var editorText = bEditorOpen ? node.getAttribute(editor.getClass().getName().replace(/^.*\./, "")) : null;
      if (editorText) {
        // store default text
        if (node.getAttribute("_jsxtext") == null)
          node.setAttribute("_jsxtext", node.getAttribute("jsxtext"));
        // set custom text
        node.setAttribute("jsxtext", editorText);
      } else {
        var defaultText = node.getAttribute("_jsxtext");
        if (defaultText != null) {
          // restore default text
          node.setAttribute("jsxtext", defaultText);
          node.removeAttribute("_jsxtext");
        }
      }
    }

//		objMenu.repaint();
	} else if (strMenuId == 'openrecent') {
		var files = jsx3.ide.getRecentFiles();
		var objNode = jsx3.ide.prepareFilledMenu(objMenu, strMenuId, files.length);

    var doOpenUrlForEdit = "doOpenUrlForEdit";
    for (var i = 0; i < files.length; i++) {
			var path = jsx3.ide.fixPath(files[i]);
			var record = {jsxid: "recent:" + path, jsxtext: path, 
					jsxexecute: "jsx3.ide." + doOpenUrlForEdit + "(jsx3.ide.SERVER.resolveURI(objRECORD.getAttribute('jsxtext')));"};
			objMenu.insertRecord(record, strMenuId, false);
		}
	} else if (strMenuId == 'new') {
    var itemNode = objMenu.getXML().selectSingleNode("//record[@jsxid='new']");
    var bProjectOpen = jsx3.ide.SERVER != null;
    
    for (var i = itemNode.getChildIterator(); i.hasNext(); ) {
      var node = i.next();
      // enable/disable items according to whether a tab is open and whether a project is open
      var enabled = (bProjectOpen || node.getAttribute('project') != "1");
      objMenu.enableItem(node.getAttribute('jsxid'), enabled);
    }
  }
};

jsx3.ide.prepareFilledMenu = function(objMenu, strMenuId, intNumChildren) {
	var objNode = objMenu.getRecordNode(strMenuId);
	objNode.removeChildren();
	if (intNumChildren == 0)
		objMenu.insertRecord({}, strMenuId, false);
	return objNode;
};

// HANDLING PALETTE PLACEMENT

jsx3.ide.adjustSplittersOnStartup = function() {
	var settings = jsx3.ide.getIDESettings();

	for (var i = 5; i > 0; i--) {
		var splitter = jsx3.IDE.getJSXByName("jsx_ide_splitter" + i);
		var pct = settings.get('window', 'splitters', splitter.getName());
		if (pct != null)
			splitter.setSubcontainer1Pct(pct, true);
		else if (splitter.jsxdefault1pct != null)
			splitter.setSubcontainer1Pct(splitter.jsxdefault1pct, true);
	}
};

jsx3.ide.persistSplittersOnShutdown = function() {
	var splitters = jsx3.IDE.getBodyBlock().findDescendants(
			function(x){ return x instanceof jsx3.gui.Splitter; }, false, true);
	var settings = jsx3.ide.getIDESettings();

	for (var i = 0; i < splitters.length; i++) {
		var splitter = splitters[i];
		var pct = settings.set('window', 'splitters', splitter.getName(), splitter.getSubcontainer1Pct());
	}
};

jsx3.ide.writeUserFile = function(objFile, strContent) {
  var settings = jsx3.ide.getIDESettings();
  var prefs = settings.get('prefs', 'builder');
  return objFile.write(strContent, prefs.outputcharset, prefs.outputlinesep, true);
};

jsx3.ide.writeUserXmlFile = function(objFile, objDoc) {
  var tmpFile = jsx3.io.File.createTempFile("gi-ide.xml");
  var settings = jsx3.ide.getIDESettings();
  var prefs = settings.get('prefs', 'builder');

  var encodeCharset = prefs.xmlencodeas ? prefs.xmloutputcharset : prefs.outputcharset;
  var ok = false;

  if (prefs.addcharset) {
    if (encodeCharset && tmpFile.write(this.makeXmlCloseTags(objDoc.serialize(true, encodeCharset)),
        encodeCharset, prefs.outputlinesep, false))
      ok = true;
    else
      ok = tmpFile.write(this.makeXmlCloseTags(objDoc.serialize()), null, prefs.outputlinesep, true);
  } else {
    ok = tmpFile.write(this.makeXmlCloseTags(objDoc.serialize()), encodeCharset, prefs.outputlinesep, true);
  }

  if (ok) {
    var doc = new jsx3.xml.Document().load(tmpFile.toURI());
    ok = ! doc.hasError();

    if (ok) {
      tmpFile.renameTo(objFile);
    } else {
      jsx3.ide.LOG.error("The XML file " + objFile + " was not saved because parsing the written file produced the following error: " + doc.getError());
      tmpFile.deleteFile();
    }
  }

  return ok;
};

jsx3.ide.writeBuilderFile = function(objFile, strContent) {
  return objFile.write(strContent, "utf-8", "unix", true, true);
};

jsx3.ide.writeBuilderXmlFile = function(objFile, objDoc) {
  if (objFile.write(this.makeXmlCloseTags(objDoc.serialize(true, "utf-8")), "utf-8", "unix", false, true))
    return true;
  else
    return objFile.write(this.makeXmlCloseTags(objDoc.serialize(true)), null, "unix", true);
};

/** @private @jsxobf-clobber */
jsx3.ide._PRETTY_TEMPLATE_URI = jsx3.IDE.resolveURI("xml/xmlpretty.xsl");

jsx3.ide.makeXmlPretty = function(objXML, bDoc) {
  var objTemplate = jsx3.getSystemCache().getOrOpenDocument(this._PRETTY_TEMPLATE_URI, null, jsx3.xml.XslDocument.jsxclass);
  var src = objTemplate.transform(objXML);
  return bDoc ? (new jsx3.xml.Document()).loadXML(src) : jsx3.ide.makeXmlCloseTags(src);
};

/** @private @jsxobf-clobber */
jsx3.ide._PRETTY_EMPTY_TAG_COLLAPSER = /<([\w\:]+)( [^<>]*)?(?!\/)><\/([\w\:]+)>/g;

/* @jsxobf-clobber */
jsx3.ide.makeXmlCloseTags = function(strXML) {
  if (jsx3.getXmlVersion() <= 3) {
    var tokens = strXML.split("<![CDATA[");
    for (var i = 0; i < tokens.length; i++) {
      if (i == 0) {
        tokens[i] = tokens[i].replace(jsx3.ide._PRETTY_EMPTY_TAG_COLLAPSER, jsx3.ide._makeXmlCloseTags);
      } else {
        var bits = tokens[i].split("]]>", 2);
        bits[1] = bits[1].replace(jsx3.ide._PRETTY_EMPTY_TAG_COLLAPSER, jsx3.ide._makeXmlCloseTags);
        tokens[i] = bits.join("]]>");
      }
    }
    return tokens.join("<![CDATA[");
  } else {
    return strXML;
  }
};

/* @jsxobf-clobber */
jsx3.ide._makeXmlCloseTags = function(m, _1, _2, _3) {
  if (_1 == _3) {
    return "<" + _1 + (_2 != null ? _2 : "") + "/>";
  } else {
    return m;
  }
};
