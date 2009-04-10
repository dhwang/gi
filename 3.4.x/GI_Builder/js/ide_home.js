/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.DEFAULT_USER_HOME = "TibcoGI";
jsx3.ide.HOME_TEMPLATE_DIR = "GI_User";

/**
 * @return {boolean}
 */
jsx3.ide.verifyUserHome = function() {
  var file = jsx3.ide.getCurrentUserHome();
  if (file != null) {
    if (! jsx3.ide.isValidUserHome(file)) {
      jsx3.ide.LOG.error("When running in Internet Explorer, your workspace must be on the same drive as the General Interface(TM) installation.");
      return false;
    }

    // set JSX environment variable according to user directory location
    jsx3.setEnv("jsxhomepath", jsx3.ide.getSystemDirFile().toURI().relativize(file.toURI()));
    // make sure that all major directories exist
    jsx3.ide.createUserHome(file);
    
    return true;
  } else {
    return false;
  }
};

/** @private @jsxobf-clobber */
jsx3.ide.isValidUserHome = function(file) {
  if (jsx3.CLASS_LOADER.IE) {
    var dir1 = jsx3.ide.getSystemDirFile().getAbsolutePath();
    var dir2 = file.getAbsolutePath();
    var index1 = dir1.indexOf(":");
    var index2 = dir1.indexOf(":");
    if (index1 >= 0 && index2 >= 0) {
      var drive1 = dir1.substring(dir1.lastIndexOf("/", index1), index1).toUpperCase();
      var drive2 = dir2.substring(dir2.lastIndexOf("/", index2), index2).toUpperCase();
      return drive1 == drive2;
    } else {
      return index1 < 0 && index2 < 0;
    }
  }
  return true;
};

/**
 *
 */
jsx3.ide.showNewUserHomeDialog = function() {
  var dialog = jsx3.IDE.getJSXByName("jsx_ide_newhome");
  if (dialog == null) {
    dialog = jsx3.IDE.getRootBlock().load("components/project/newhome.xml");
  }
  dialog.focus();
};

jsx3.ide.onSelectNewUserHome = function(objDir, objAlerter) {
  var currentHome = new jsx3.io.File(jsx3.ide.getCurrentUserHome(true));

  if (! objDir.equals(currentHome) || ! objDir.isDirectory()) {
    if (objDir.exists() && !objDir.isDirectory()) {
      objAlerter.alert(null, "File " + objDir + " already exists and is not a directory.");
      return false;
    }

    if (! jsx3.ide.isValidUserHome(objDir)) {
      objAlerter.alert(null, "When running in Internet Explorer, your workspace must be on the same drive as the General Interface(TM) installation.");
      return false;
    }

    try {
      objDir.mkdirs();
      jsx3.ide.createUserHome(objDir);
    } catch (e) {
      e = jsx3.NativeError.wrap(e);
      objAlerter.alert(null, "Error creating workspace: " + e);
      jsx3.ide.LOG.error("Error creating user directory " + objDir + ".", e);
      return false;
    }

    jsx3.ide.setCurrentUserHome(objDir);
  }

  return true;
};

/**
 * @param objDir {jsx3.io.File}
 */
jsx3.ide.createUserHome = function(objDir) {
  var templateDir = jsx3.ide.getBuilderRelativeFile(jsx3.ide.HOME_TEMPLATE_DIR);
  if (templateDir.isDirectory()) {
    if (templateDir.equals(objDir) || objDir.isDescendantOf(templateDir))
      throw new jsx3.Exception("Illegal workspace: " + objDir);

    var subItems = templateDir.listFiles();
    var bCreateApps = false;
    
    for (var i = 0; i < subItems.length; i++) {
      var source = subItems[i];
      if (jsx3.ide.isFileToIgnore(source)) continue;

      var dest = new jsx3.io.File(objDir, source.getName());
      if (! dest.exists()) {
        jsx3.ide.LOG.debug("Creating " + dest + ".");
        source.copyTo(dest);
        dest.setReadOnly(false, true);
        if (source.getName() == "JSXAPPS") bCreateApps = true;
      } else {
        jsx3.ide.LOG.debug("Skipping " + dest + ".");
      }
    }

    // specifically create and modify the launcher.html and launcher_ide.html files.
    var files = ["JSXAPPS/launcher.html", "JSXAPPS/launcher_ide.html"];
    var shellPath = jsx3.ide.getSystemRelativeFile("shell.html").toURI();
    var builderPath = jsx3.ide.getSystemRelativeFile("GI_Builder.html").toURI();
    for (var i = 0; i < files.length; i++) {
      var path = files[i];
      var source = new jsx3.io.File(templateDir, path);
      var dest = new jsx3.io.File(objDir, path);
      
      var contents = source.read();
      if (contents) {
        contents = contents.replace(/@SHELLPATH@/g, shellPath).replace(/@BUILDERPATH@/g, builderPath);
      }
      jsx3.ide.writeBuilderFile(dest, contents);
    }
    
    // copy launch.html and launch_in_ide.html files into each create project dir
    if (bCreateApps) {
      var configs = (new jsx3.io.File(objDir, "JSXAPPS")).find(function(x) { 
        if (! jsx3.ide.isFileToIgnore(x)) {
          if (x.isDirectory())
            return jsx3.io.File.FIND_RECURSE;
          else if (x.getName() == "config.xml")
            return jsx3.io.File.FIND_INCLUDE;
        }
      }, true);
      var toCopy = [jsx3.ide.getSystemRelativeFile("GI_Builder/components/project/projecttemplate/launch.html"),
        jsx3.ide.getSystemRelativeFile("GI_Builder/components/project/projecttemplate/launch_in_ide.html")];
      for (var i = 0; i < configs.length; i++) {
        var dir = configs[i].getParentFile();
        for (var j = 0; j < toCopy.length; j++) {
          var source = toCopy[j];
          source.copyTo(new jsx3.io.File(dir, source.getName()));
        }
      }
    }
  } else {
    throw new jsx3.Exception("GI_USER template directory not found: " + templateDir);
  }
};

jsx3.ide.getHomeRelativeFile = function(strURI) {
  return new jsx3.io.File(this.getCurrentUserHome().toURI().resolve(strURI));
};

/**
 * @return {jsx3.io.File}
 */
jsx3.ide.getCurrentUserHome = function(bCheckMem) {
  if (bCheckMem) {
    var prefs = new jsx3.ide.Preferences(jsx3.ide.Preferences.DOMAIN_USER);
    var path = prefs.get("GI_USER", jsx3.ide.getSystemDirURI().toString());
    if (path) return path;
  }

  if (typeof(jsx3.ide._CURRENT_USER_HOME) == "undefined") {
    // can 
    var home = jsx3.app.Browser.getLocation().getQueryParam('jsxhome');
    if (home) {
      var homeDir = jsx3.ide.getSystemRelativeFile(home);
      if (homeDir.isDirectory()) {
        jsx3.ide._CURRENT_USER_HOME = homeDir;
        return homeDir;
      }
    }
    
    var prefs = new jsx3.ide.Preferences(jsx3.ide.Preferences.DOMAIN_USER);
    var giDir = jsx3.ide.getSystemDirURI().toString();
    
    var path = prefs.get("GI_USER", giDir);
    if (path) {
      var file = new jsx3.io.File(path);
      if (file.isDirectory())
        jsx3.ide._CURRENT_USER_HOME = file;
    }
    
    if (typeof(jsx3.ide._CURRENT_USER_HOME) == "undefined")
      /* @jsxobf-clobber */
      jsx3.ide._CURRENT_USER_HOME = null;
  }
  return jsx3.ide._CURRENT_USER_HOME;
};

jsx3.ide.setCurrentUserHome = function(objDir) {
  var prefs = new jsx3.ide.Preferences(jsx3.ide.Preferences.DOMAIN_USER);
  var giDir = jsx3.ide.getSystemDirURI().toString();
  
  prefs.set("GI_USER", giDir, objDir.getAbsolutePath());
  prefs.save();
};
