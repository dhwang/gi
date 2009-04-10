/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * the files to open by default when first loading a project
 */
jsx3.ide.DEFAULT_PROJECT_FILES = ["js/logic.js", "components/appCanvas.xml"];
jsx3.ide.CLEARED_PROJECT = -1;

/** GET ACTIVE PROJECT *********************************************/
jsx3.ide.getActiveProject = function() {
	if (jsx3.ide._active_project == jsx3.ide.CLEARED_PROJECT)
		return null;

	// try cached value
	if (jsx3.ide._active_project)
		return jsx3.ide._active_project;
	
	// try URL value
	var project = jsx3.app.Browser.getLocation().getQueryParam('jsxproject');
	
	// try last opened project from settings
	if (! project) {
		var settings = jsx3.ide.getIDESettings();
    if (settings.get("prefs", "builder", "openlastproject") !== false)
      project = settings.get('lastProject');
	}
	
	if (project) {
    if (jsx3.util.strEndsWith(project, "/")) project = project.substring(0, project.length - 1);
    jsx3.ide._active_project = project;
  }

  return jsx3.ide._active_project;
};

jsx3.ide.clearActiveProject = function() {
	jsx3.ide._active_project = jsx3.ide.CLEARED_PROJECT;
};

jsx3.ide.getActiveProjectDirectory = function() {
	var project = jsx3.ide.SERVER;
	return project ? project.getDirectory() : null;
};

jsx3.ide.getCurrentDirectory = function() {
	if (jsx3.ide._CURDIR != null)
		return jsx3.ide._CURDIR;
	else
		return jsx3.ide.getActiveProjectDirectory();
};

jsx3.ide.setCurrentDirectory = function(objFile) {
  /* @jsxobf-clobber */
	jsx3.ide._CURDIR = objFile;
};

jsx3.ide.getProjectSettings = function(bRW) {
	return bRW ?
			new jsx3.ide.Preferences(jsx3.app.Settings.DOMAIN_PROJECT, jsx3.ide.SERVER) :
			jsx3.ide.SERVER.getSettings();
};

jsx3.ide.addToRecentProjects = function(strPath) {
	var settings = jsx3.ide.getIDESettings();
	var recent = settings.get('recentProjects');
	if (recent == null) recent = [];
	for (var i = 0; i < recent.length; i++) {
		if (recent[i] == strPath) {
			recent.splice(i, 1);
			break;
		}
	}
	
	recent.unshift(strPath);
	if (recent.length > jsx3.ide.RECENT_PROJECT_MAX) recent.pop();
	
	settings.set('recentProjects', recent);
};

jsx3.ide.getProjectDirectory = function() {
  return new jsx3.io.File(jsx3.ide.getCurrentUserHome().toURI().resolve(jsx3.APP_DIR_NAME));
//  return this.getSystemRelativeFile(jsx3.APP_DIR_NAME);
};

jsx3.ide.isFileToIgnore = function(objFile) {
  return objFile.getName().indexOf(".") == 0;
};

jsx3.ide.getInstalledProjects = function() {
	var projects = [];
	var home = jsx3.ide.getSystemDirFile();
	var dirs = jsx3.ide.getProjectDirectories();
	
	for (var i = 0; i < dirs.length; i++) {
		var files = dirs[i].listFiles();
		for (var j = 0; j < files.length; j++) {
			var file = files[j];
      if (jsx3.ide.isFileToIgnore(file)) continue;

			if (file.isDirectory()) {
				var configFile = new jsx3.io.File(file, "config.xml");
				if (configFile.isFile()) {
					projects.push(home.relativePathTo(file));
				}
			}
		}
	}
	
	return projects;
};

jsx3.ide.getRecentProjects = function() {
	var settings = jsx3.ide.getIDESettings();
	var recent = settings.get('recentProjects');
	return recent != null ? recent : [];
};


/** RUN PROJECT ***************************************/
jsx3.ide.runProject = function(bHTTP, bConfirmed) {
  var httpBase = null, httpHome = null;

  if (bHTTP) {
    httpBase = jsx3.ide.getIDESettings().get("http", "base");
    if (! httpBase) {
      jsx3.IDE.confirm("Local HTTP Server Not Configured", 
          "The local HTTP server is not configured. You must configure an HTTP server in IDE Settings : Paths before running this project from a local HTTP server.",
          function (d) {
            d.doClose();
            jsx3.ide.doOpenSettings(2);
          }, null, "Configure", "Cancel", 2);
      return;
    }
    httpHome = jsx3.ide.getIDESettings().get("http", "home");
  }
  
  if (! bConfirmed && jsx3.ide.isAnyEditorDirty()) {
    jsx3.IDE.confirm(
      "Save Before Running?", 
      "There are unsaved changes to your project that will not be reflected in the running project. Save these changes before running project?", 
      function(d){ d.doClose(); jsx3.ide.saveAll(function() { jsx3.ide.runProject(bHTTP, true); }); }, 
      null, "Save and Run", "Cancel", 3,
      function(d){ d.doClose(); jsx3.ide.runProject(bHTTP, true); },
      "Run Without Saving", {width:350}
    );
  } else {
    jsx3.sleep(function() { jsx3.ide.runProjectSleep(httpBase, httpHome); });
  }
};

/* @jsxobf-clobber */
jsx3.ide.runProjectSleep = function(httpBase, httpHome) {
  var xhtml = jsx3.util.strEndsWith(jsx3.app.Browser.getLocation().getPath(), ".xhtml");
  var shell = "shell" + (xhtml ? ".xhtml" : ".html");
  var projPath = jsx3.ide.getSystemDirFile().toURI().relativize(jsx3.ide.getActiveProjectDirectory().toURI()).toString();

  // adjust the project path if the WS Home setting was set in the IDE
  if (! jsx3.util.strEmpty(httpHome)) {
    var start = projPath.indexOf(jsx3.APP_DIR_NAME);
    if (start >= 0)
      projPath = httpHome + "/" + projPath.substring(start);
  }

  var uri = jsx3.net.URI.fromParts(null, null, null, null, shell, "jsxapppath=" + projPath, null);

  if (httpBase)
    uri = new jsx3.net.URI(httpBase).resolve(uri);

  var w = window.open(uri.toString());
  if (w)
    w.focus();
  else
    jsx3.ide.LOG.error("The application did not run properly. Check that no popup blockers are running.");
};



/** NEW PROJECT **********************************/
jsx3.ide.newProject = function() {
  var d = jsx3.IDE.getRootBlock().load("components/project/newproject.xml");
  d.doOnFocus();
};



/** OPEN PROJECT **********************************/
jsx3.ide.openProject = function() {
  jsx3.require("jsx3.io.FileDialog");
  var dialog = jsx3.io.FileDialog.deserialize(jsx3.IDE.getRootBlock());
	dialog.onExecute = function(dir) {
		var path = jsx3.ide.relativePathTo(dir);
		jsx3.ide.doOpenProject(path, false, true);
	};
	dialog.openForOpen(jsx3.ide.getProjectDirectory().getAbsolutePath(), null, jsx3.io.FileDialog.CHOOSE_FOLDER);
};


/** DO NEW PROJECT **********************************/
jsx3.ide.doNewProject = function(objDialog, strName, bConfirmed) {
	if (!(strName && strName.match(/\S/))) {
		objDialog.beep();
		return;
	}
	
	var projectsFolder = jsx3.ide.getProjectDirectory();
	var newFolder = new jsx3.io.File(projectsFolder, strName);
	
	if (newFolder.exists()) {
		jsx3.IDE.alert(null, "The project folder already exists. Please choose another project name.");
		return false;
	} else if (! newFolder.isDescendantOf(projectsFolder)) {
		jsx3.IDE.alert(null, "<b>" + strName + "</b> is an illegal project name. Please choose another project name.");
		return false;
	}

  var bProjectOpen = jsx3.ide.SERVER != null;
  
  // close down existing project
	if (!bConfirmed && bProjectOpen) {
		jsx3.ide.closeDownProject(
			function() { jsx3.ide.doNewProject(objDialog, strName, true); }
		);
		return;
	}
	
	var templateFolder = jsx3.ide.getBuilderRelativeFile('components/project/projecttemplate');
			
	if (! templateFolder.isDirectory()) {
		jsx3.ERROR.doLog('ideprj1', 'template folder does not exist: ' + templateFolder, 1);
		return false;
	}
	
	// copy template folder to new project folder
  newFolder.mkdirs();
  templateFolder.copyTo(newFolder);
	
	// find all included files
	var projFiles = newFolder.find( function(f){ 
    if (! jsx3.ide.isFileToIgnore(f)) {
      if (f.isFile()) 
        return jsx3.io.File.FIND_INCLUDE;
      else if (f.isDirectory())
        return jsx3.io.File.FIND_RECURSE;
    }
  }, true);
		
	// customize files
	var strNameSpace = strName.replace(/\//g, ".").replace(/[^A-Za-z0-9\.]/g, "");
	for (var i = 0; i < projFiles.length; i++) {
		var pFile = projFiles[i];
		pFile.setReadOnly(false);
		var contents = pFile.read();
		if (contents) {
			contents = contents.replace(/@name@/g, strName);
			contents = contents.replace(/@namespace@/g, strNameSpace);
      jsx3.ide.writeUserFile(pFile, contents);
		}
	}

	objDialog.doClose();
  var relUrl = this.getCurrentUserHome().toURI().relativize(newFolder.toURI());
	jsx3.ide.doOpenProject(relUrl.toString(), false, true);
	// execution shouldn't go beyond this point

	return true;
};


jsx3.ide.doOpenProject = function(strPath, bNewWindow, bConfirmed) {
	if (! jsx3.ide.checkProjectExists(strPath, true))
		return false;
	
  var bProjectOpen = jsx3.ide.SERVER != null;
  
  if (bConfirmed || !bProjectOpen) {
		var qLength = window.location.search.length;
    var loc = jsx3.app.Browser.getLocation();
    var uri = jsx3.net.URI.fromParts(loc.getScheme(), loc.getUserInfo(), loc.getHost(), loc.getPort(), loc.getPath(), 
        "jsxproject=" + strPath, null);
				
		if (bNewWindow) {
			var w = window.open(uri.toString());
      if (! w)
        jsx3.ide.LOG.error("The project " + strPath + " did not open properly. Check that no pop-up blockers are running.");
    } else {
			// if user vetos location change an error will be thrown
			try {
        window.location.href = uri.toString();
			} catch (e) {
        jsx3.ide.LOG.warn("The opening of project " + strPath + " was cancelled. " + jsx3.NativeError.wrap(e));
      }
		}
	} else {
		// closing all on shutdown should not mess up previously opened files
		jsx3.ide.closeDownProject(
			function() { jsx3.ide.doOpenProject(strPath, bNewWindow, true); }
		);
	}
};


jsx3.ide.closeDownProject = function(fctAfterwards) {
	var backup = jsx3.ide.getPreviouslyOpenFiles() || [];
	jsx3.ide.closeAll(function(){ 
		jsx3.ide.syncPreviouslyOpenFiles(null, backup);
		fctAfterwards();
	});
};


jsx3.ide.checkProjectExists = function(strPath, bAlert) {
	var configFile = jsx3.ide.getHomeRelativeFile(strPath + jsx3.app.Settings.PATH_PROJECT);
	if (! configFile.isFile()) {
		if (bAlert) {
		  jsx3.IDE.alert(null, 
          "Could not open project <b>" + strPath + "</b> because the configuration file could not be found.",
          function(d){ d.doClose(); jsx3.ide.QUEUE.start(); });
      jsx3.ide.QUEUE.pause();
    }
    return false;
	}
	return true;
};


jsx3.ide.addToRecentFiles = function(objFile) {
	var settings = jsx3.ide.getIDESettings();
	var project = jsx3.ide.SERVER;
  var strPath = project.getBaseDirectory().relativePathTo(objFile);
	if (project == null) return;
	
	var recent = settings.get('projects', project.getRelPath(), 'recentFiles');
	if (recent == null) recent = [];
	for (var i = 0; i < recent.length; i++) {
		if (recent[i] == strPath) {
			recent.splice(i, 1);
			break;
		}
	}
	
	recent.unshift(strPath);
	if (recent.length > jsx3.ide.RECENT_FILES_MAX) recent.pop();
	
	settings.set('projects', project.getRelPath(), 'recentFiles', recent);
};

jsx3.ide.getRecentFiles = function() {
	var settings = jsx3.ide.getIDESettings();
	var project = jsx3.ide.SERVER;
	var recent = settings.get('projects', project.getRelPath(), 'recentFiles');
	return recent != null ? recent : [];
};

/** SHOW DEPLOYMENT OPTIONS ********************************/
jsx3.ide.showDeploymentOptions = function() {
  //only one instance of the dialog allowed
	var objDlg = jsx3.IDE.getJSXByName("jsx_deployment");
  if (objDlg == null) {
	//load the deployment options dialog
  	objDlg = jsx3.ide.doOpenTool("components/deployment/settings.xml");
  } else {
		objDlg.focus();
	}
};


jsx3.ide.showLaunchUtility = function() {
	var dialog = jsx3.IDE.getJSXByName('jsx_ide_launchutility');
	if (dialog == null)
		dialog = jsx3.IDE.getRootBlock().load('components/deployment/launchutil.xml');
	dialog.focus();
};


jsx3.ide.syncPreviouslyOpenFiles = function(objEvent, objFiles) {
	var objSettings = jsx3.ide.getIDESettings();
	var project = jsx3.ide.SERVER;
	var openFiles = [];
	
	if (objFiles instanceof Array) {
		for (var i = 0; i < objFiles.length; i++) {
			openFiles.push(project.getBaseDirectory().relativePathTo(objFiles[i]));
		}
	} else {
		var editors = jsx3.ide.getAllEditors();
		for (var i = 0; i < editors.length; i++) {
			if (! editors[i].isUnsaved()) {
				var file = editors[i].getOpenFile();
				// not all editors will correspond to an actual file on the file system
				if (file != null)
					openFiles.push(project.getBaseDirectory().relativePathTo(file));
			}
		}
	}

	objSettings.set('projects', project.getRelPath(), 'openFiles', openFiles);
};


/**
 * ? getPreviouslyOpenFiles() -- may return null to signify no previous setting
 */
jsx3.ide.getPreviouslyOpenFiles = function() {
	var objSettings = jsx3.ide.getIDESettings();
	var project = jsx3.ide.SERVER;
	var paths = objSettings.get('projects', project.getRelPath(), 'openFiles');
	if (paths != null) {
		var openFiles = [];
		for (var i = 0; i < paths.length; i++) {
			var objFile = jsx3.ide.getSystemRelativeFile(project.resolveURI(paths[i]));
			if (objFile.isFile())
				openFiles.push(objFile);
		}
		return openFiles;
	}
	return null;
};

jsx3.ide.getDefaultOpenFiles = function() {
	var project = jsx3.ide.SERVER;
	var files = [];
	
	for (var i = 0; i < jsx3.ide.DEFAULT_PROJECT_FILES.length; i++) {
		var path = jsx3.ide.DEFAULT_PROJECT_FILES[i];
		var objFile = jsx3.ide.getSystemRelativeFile(project.resolveURI(path));
		if (objFile.isFile())
			files.push(objFile);
	}
	
	return files;
};

jsx3.ide.createLaunchPage = function(objFile, bXHTML) {
	var jsFile = jsx3.ide.getSystemRelativeFile('JSX/js/JSX30.js');
	var template = jsx3.ide.getBuilderRelativeFile('components/deployment/launch_page_template.' + (bXHTML ? 'xhtml' : 'html'));
	var content = template.read();
  var apppath = objFile.toURI().relativize(jsx3.ide.getActiveProjectDirectory().toURI());
  if (apppath == "") apppath = ".";
  
  content = content.replace(/@JSPATH@/g, objFile.relativePathTo(jsFile));
	content = content.replace(/@APPPATH@/g, apppath);

	jsx3.ide.writeUserFile(objFile, content);
};

jsx3.ide.showWelcomeDialog = function() {
  var dialog = jsx3.IDE.getJSXByName("ide_welcome");
  if (! dialog)
    dialog = jsx3.IDE.getRootBlock().load('components/welcome/welcome.xml');
  dialog.focus();
};

jsx3.ide.populateProjectMenu = function(objMenu, strMenuId) {
  if (strMenuId == null) {
    var bProjectOpen = jsx3.ide.SERVER != null;
    var bHome = jsx3.ide.getCurrentUserHome() != null;
            
    if (! bProjectOpen) {
      var i = objMenu.getXML().selectNodeIterator("//record[@project='1']");
      while (i.hasNext())
        objMenu.enableItem(i.next().getAttribute('jsxid'), false);
    }
    if (! bHome) {
      var i = objMenu.getXML().selectNodeIterator("//record[@home='1']");
      while (i.hasNext())
        objMenu.enableItem(i.next().getAttribute('jsxid'), false);        
    }
    
  } else if (strMenuId == 'userproj') {
    var dir = jsx3.ide.getProjectDirectory();
    this.populateUserProjects(objMenu, strMenuId, dir.getAbsolutePath());
	} else if (strMenuId.indexOf('userproj:') == 0) {
    this.populateUserProjects(objMenu, strMenuId, objMenu.getRecordNode(strMenuId).getAttribute('abspath'));
	} else if (strMenuId == 'recentproj') {
		var projects = jsx3.ide.getRecentProjects();
		var objNode = jsx3.ide.prepareFilledMenu(objMenu, strMenuId, projects.length);

    var doOpenProject = "doOpenProject"; // obfuscator
    for (var i = 0; i < projects.length; i++) {
			var path = jsx3.ide.fixPath(projects[i]);
			var record = {jsxid: "recent:" + path, jsxtext: path, 
					jsxexecute: "jsx3.ide." + doOpenProject + "(objRECORD.getAttribute('jsxtext'));"};
			objMenu.insertRecord(record, strMenuId, false);
		}
	} 
};

jsx3.ide.populateUserProjects = function(objMenu, strRecordId, strAbsPath) {
  var dir = new jsx3.io.File(strAbsPath);
  
  // clear existing children
  var objNode = objMenu.getRecordNode(strRecordId);
  if (objNode)
    objNode.removeChildren();
  
  var children = 0;
  if (dir.isDirectory()) {
    var files = dir.listFiles();
    var doOpenProject = "doOpenProject"; // obfuscator
    
    for (var j = 0; j < files.length; j++) {
			var file = files[j];
      if (jsx3.ide.isFileToIgnore(file)) continue;

			if (file.isDirectory()) {
        children++;
        
        var configFile = new jsx3.io.File(file, "config.xml");
        var path = jsx3.ide.getCurrentUserHome().toURI().relativize(file.toURI()).toString();
        
        if (configFile.isFile()) {
          var record = {jsxid: "user:" + path, jsxtext: file.getName(), relpath: path,
              jsxexecute: "jsx3.ide." + doOpenProject + "(objRECORD.getAttribute('relpath'));"};
          objMenu.insertRecord(record, strRecordId, false);
        } else {
          var id = "userproj:" + path;
          var record = {jsxid: id, jsxtext: file.getName(), abspath: file.getAbsolutePath()};
          objMenu.insertRecord(record, strRecordId, false);
          objMenu.insertRecord({}, id, false); // insert empty child so we can see it's a nested menu item
        }
			}
    }
  }
  
  // create one empty child if no other children
  if (children == 0)
    objMenu.insertRecord({}, strRecordId, false);
};

jsx3.ide.checkProjectJsxVersion = function() {
  var v = jsx3.ide.SERVER.getEnv("jsxversion");
  var cmp = jsx3.util.compareVersions(v, jsx3.ide.getProjectAuthorVersion());
  
  if (cmp < 0) {
    jsx3.IDE.confirm(null, "This project was created by an earlier version of General Interface&#8482; Builder." +
        " Once this project has been opened by this version of General Interface&#8482; Builder it may not be " +
        "compatible with prior versions. Continue?",
        function(d) { 
          d.doClose();
          jsx3.ide.upgradeProjectToCurrent();
          jsx3.ide.QUEUE.start(); },
        function(d) { 
          d.doClose(); 
          jsx3.ide.showWelcomeDialog(); 
          jsx3.ide.SERVER.destroy();
          jsx3.ide.SERVER = null; },
        "Continue", "Cancel");
    jsx3.ide.QUEUE.pause();
  } else {
    cmp = jsx3.util.compareVersions(v, jsx3.System.getVersion());

    if (cmp > 0) {
      jsx3.IDE.alert(null, "This project was created by a higher version of General Interface&#8482; Builder (" +
              v + ") and cannot be opened by this version (" + jsx3.System.getVersion() + ").",
          function(d) {
            d.doClose();
            jsx3.ide.showWelcomeDialog();
            jsx3.ide.SERVER.destroy();
            jsx3.ide.SERVER = null; });
      jsx3.ide.QUEUE.pause();
    }
  }
};

/** @private @jsxobf-clobber */
jsx3.ide.upgradeProjectToCurrent = function() {
  var objProj = jsx3.ide.SERVER;
  var settings = jsx3.ide.getProjectSettings(true);

  var jsxvers = settings.get("jsxversion");
  if (jsxvers < 3.2) {
    var includes = settings.get("includes");
    for (var i = 0; i < includes.length; i++) {
      var u = new jsx3.net.URI(includes[i].src);
      if (! u.isAbsolute()) {
        includes[i].src = objProj.relativizeURI(jsx3.resolveURI(u)).getPath().substring(1);
      }
    }
    settings.set("includes", includes);
  }

  settings.set("jsxversion", jsx3.ide.getProjectAuthorVersion());  
  settings.save();
  objProj.ENVIRONMENT.jsxversion = jsx3.ide.getProjectAuthorVersion();
};

/* @jsxobf-clobber */
jsx3.ide.getProjectAuthorVersion = function() {
  return "3.2"; // update as needed
};
