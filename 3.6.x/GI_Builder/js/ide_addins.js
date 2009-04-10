/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * The IDE's version of an Add-in.
 */
jsx3.Class.defineClass("jsx3.ide.AddIn", jsx3.app.AddIn, null, function(AddIn, AddIn_prototype) {
  
  AddIn_prototype.init = function(strKey) {
    if (strKey.indexOf("ide:") == 0) {
      var strPath = "GI_Builder/addins/" + strKey.substring(4) + "/";
      /* @jsxobf-clobber-shared */
      this._key = strKey;
      /* @jsxobf-clobber-shared */
      this._path = strPath;
      /* @jsxobf-clobber-shared */
      this._uri = new jsx3.net.URI(strPath);
      /* @jsxobf-clobber-shared */
      this._uriabs = jsx3.app.Browser.getLocation().resolve(this._uri);
    } else {
      this.jsxsuper(strKey);
    }
  };
    
});

/* @jsxobf-clobber */
jsx3.ide.getBuilderAddins = function() {
  var addins = [];

  var ideFolder = jsx3.ide.getBuilderRelativeFile("addins/");
  if (ideFolder.isDirectory()) {
    var folders = ideFolder.listFiles();
    for (var i = 0; i < folders.length; i++) {
      var addinDir = folders[i];
      if (jsx3.ide.isFileToIgnore(addinDir)) continue;

      if (jsx3.ide.isAddinDirectory(addinDir))
        addins.push(new jsx3.ide.AddIn("ide:" + addinDir.getName()));
    }
  }
  
  return addins;  
};

jsx3.ide.getJsxAddins = function() {
  var addins = [];
  
  var jsxFolder = jsx3.ide.getSystemRelativeFile(jsx3.ADDINSPATH);	
	if (jsxFolder.isDirectory()) {
    var folders = jsxFolder.listFiles();
		for (var i = 0; i < folders.length; i++) {
      var addinDir = folders[i];
      if (jsx3.ide.isFileToIgnore(addinDir)) continue;

      if (jsx3.ide.isAddinDirectory(addinDir))
        addins.push(new jsx3.ide.AddIn(addinDir.getName()));
	  }
  }

  var userFolder = jsx3.ide.getHomeRelativeFile("addins");	
	if (userFolder.isDirectory()) {
    var folders = userFolder.listFiles();
		for (var i = 0; i < folders.length; i++) {
      var addinDir = folders[i];
      if (jsx3.ide.isFileToIgnore(addinDir)) continue;

      if (jsx3.ide.isAddinDirectory(addinDir))
        addins.push(new jsx3.ide.AddIn("user:" + addinDir.getName()));
	  }
  }
  
  return addins;
};

/* @jsxobf-clobber */
jsx3.ide.isAddinDirectory = function(objFile) {
  if (objFile.isDirectory()) {
    var configFile = new jsx3.io.File(objFile, jsx3.CONFIG_FILE);
    if (configFile.isFile()) return true;
  }
  return false;
};

jsx3.ide.loadBuilderAndProjectAddins = function(objProject, fctCallback) {
  var addins = jsx3.ide.getBuilderAddins();
  var addinKeys = objProject.getSettings().get("addins");
  if (addinKeys)
    for (var i = 0; i < addinKeys.length; i++) 
      addins.push(new jsx3.ide.AddIn(addinKeys[i]));
  
  var jobs = [];
  for (var i = 0; i < addins.length; i++) {
    if (jsx3.util.compareVersions(addins[i].getJsxVersion(), jsx3.System.getVersion()) <= 0) {
      var job = jsx3.CLASS_LOADER.loadAddin(addins[i]);
      if (job) jobs.push(job);
    } else {
      jsx3.ide.LOG.error("Addin " + addins[i] + " requires JSX version " +
          addins[i].getJsxVersion() + " or greater.");
    }
  }

  var graph = null;
  for (var i = 0; i < jobs.length && graph == null; i++)
    graph = jobs[i].graph();

  if (graph) {
    graph.addJob(new jsx3.util.Job("jsx3.ide.addins", fctCallback), jobs);
  } else {
    fctCallback();
  }
};

jsx3.ide.checkProjectAddins = function() {
  var addins = jsx3.ide.SERVER.getSettings().get("addins");
  var notLoaded = [];
  if (addins)
    for (var i = 0; i < addins.length; i++)
      if (jsx3.System.getAddin([addins[i]]) == null)
        notLoaded.push(addins[i]);
  
  if (notLoaded.length > 0) {
    jsx3.IDE.alert("Add-ins Not Loaded", 
        "The current project requires the following add-ins that are not installed: <b>" + 
          notLoaded.join("</b>, <b>") + "</b>.",
        function(d){ d.doClose(); jsx3.ide.QUEUE.start(); });
    jsx3.ide.QUEUE.pause();
  }
};
