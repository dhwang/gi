/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.TYPE_COMPONENT = "component";
jsx3.ide.TYPE_JAVASCRIPT = "script";
jsx3.ide.TYPE_XML = "xml";
jsx3.ide.TYPE_XSL = "xsl";
jsx3.ide.TYPE_CSS = "css";
jsx3.ide.TYPE_DYNAPROPS = "jss";
jsx3.ide.TYPE_DYNAPROPS_LOCAL = "ljss";
jsx3.ide.TYPE_SERVICE = "services";


/** UPDATE RESOURCES ***************************************************/
jsx3.ide.updateResources = function() {
  var objTree = jsx3.IDE.getJSXByName("jsxresources");
  if (objTree != null) {
    //repopulates the resources tree
    jsx3.IDE.getCache().clearById("jsxresources_xml");

    objTree.setDynamicProperty("jsxbgcolor","@Solid Light");
    var objXML = objTree.getXML();

    //get the settings file for the active project we've got loaded in builder
    var objSettings = jsx3.ide.getProjectSettings();
    var includes = objSettings.get('includes');
    var indexToDelete = [];
    var initialComponentUrl = jsx3.ide.fixPath(objSettings.get('objectseturl'));

    //iterate to populate
    for (var i=0; includes && i < includes.length; i++) {
      var include = includes[i];
      var strType = include.type;

      var o = {};
      o.jsxtip = jsx3.net.URI.decode(include.src);
      o.jsxid = include.id;
      o.load = (include.onLoad || include.load) ? 1 : 0;

      if (strType == jsx3.ide.TYPE_COMPONENT) {
        o.jsxclass = jsx3.net.URI.decode(include.src) == jsx3.net.URI.decode(initialComponentUrl) ?
            "jsx3ide_resource_initial" : "jsx3ide_resource_noninitial";
      } else {
        o.jsxclass = (o.load == jsx3.lang.ClassLoader.LOAD_ALWAYS) ?
            "jsx3ide_resource_autoload" : "jsx3ide_resource_noload";
      }

      o.jsxtext = o.jsxtip.substring(o.jsxtip.lastIndexOf("/")+1);
      o.sorton = o.jsxtext;
      o.jsximg = "components/resourcefiles/images/" + strType + ".gif";
      o.isResource = jsx3.Boolean.TRUE;
      o.supportsLoad = jsx3.ide.resourceTypeSupportsLoad(strType) ? 1 : null;

      if (strType == jsx3.ide.TYPE_DYNAPROPS_LOCAL) strType = jsx3.ide.TYPE_DYNAPROPS;
      var folderRecord = objTree.getRecord("jsx"+strType);
      if (folderRecord == null) {
        folderRecord = objTree.getRecord("jsxother");
        o.jsximg = "components/resourcefiles/images/other.gif";
      }

      objTree.insertRecord(o, folderRecord.jsxid, false);
    }

    //repaint the tree
    objTree.repaint();

    if (indexToDelete.length > 0) {
      jsx3.IDE.confirm(
        null,
        "The configuration file for this project contains " + indexToDelete.length + " corrupted resource" + (indexToDelete.length != 1 ? "s" : "") + ". Fix configuration file?",
        function(d) {d.doClose(); jsx3.ide.removeIncludesByIndex(indexToDelete); },
        null,
        "Fix",
        "Cancel"
      );
    }

    jsx3.ide.QUEUE.addJob(function(){jsx3.ide.fileScanResources(objTree, includes);}, 1);
  }
};

jsx3.ide.removeIncludesByIndex = function(arrIndex) {
  var objSettings = jsx3.ide.getProjectSettings(true);
  var includes = objSettings.get('includes');

  for (var i = arrIndex.length - 1; i >= 0; i--) {
    includes.splice(arrIndex[i], 1);
  }

  objSettings.set('includes', includes);
  objSettings.save();
};

jsx3.ide.fileScanResources = function(objTree, arrIncludes) {
  for (var i = 0; arrIncludes && i < arrIncludes.length; i++) {
    var include = arrIncludes[i];
    var exists = jsx3.ide.getSystemRelativeFile(jsx3.ide.SERVER.resolveURI(include.src)).isFile();
    var record = objTree.getRecord(include.id);

    if (record == null) continue;

    if (exists && record.missing) {
      objTree.insertRecordProperty(record.jsxid, "missing", "0", false);
      objTree.insertRecordProperty(record.jsxid, "jsxclass",
          record.jsxclass.replace(/\s*jsx3ide_resource_missing/, ""));
    } else if (!exists && !record.missing) {
      objTree.insertRecordProperty(record.jsxid, "missing", "1", false);
      objTree.insertRecordProperty(record.jsxid, "jsxclass",
          record.jsxclass + " jsx3ide_resource_missing");
    }
  }
};


jsx3.ide.doToggleAutoload = function(objTree, strRecordId) {
  var record = objTree.getRecord(strRecordId);
  var bAutoload = record.onload == 1 || record.load == jsx3.lang.ClassLoader.LOAD_ALWAYS;
  jsx3.ide.setResourceProps(strRecordId, null, null, null,
      bAutoload ? jsx3.lang.ClassLoader.LOAD_AUTO : jsx3.lang.ClassLoader.LOAD_ALWAYS);
};


jsx3.ide.doDereference = function(objTree, strRecordIds, bConfirmClose, bConfirmed) {
  if (!(strRecordIds instanceof Array)) strRecordIds = [strRecordIds];

  var objFiles = [];
  for (var i = 0; i < strRecordIds.length; i++)
    objFiles[i] = jsx3.ide.getFileForResource(strRecordIds[i]);

  // check that we are confirmed if needed
  var settings = jsx3.ide.getIDESettings();
  if (settings.get('prefs', 'builder', 'dereferencewarn') && !bConfirmed) {
    var fileNames = [];
    for (var i = 0; i < objFiles.length; i++)
      fileNames[i] = objFiles[i].getName();

    jsx3.IDE.confirm(
      "Confirm Dereference",
      objFiles.length == 1 ? "Dereference the file <b>" + fileNames[0] + "</b> from the current project?" :
          "Dereference these files from the current project? <b>" + fileNames.join(", ") + "</b>.",
      function(d) {d.doClose(); jsx3.ide.doDereference(objTree, strRecordIds, bConfirmClose, true);},
      null,
      "Dereference",
      "Cancel"
    );
    return;
  }

  var editor = null;
  for (var i = 0; i < objFiles.length && editor == null; i++)
    editor = jsx3.ide.getEditorForFile(objFiles[i]);

  if (editor && !bConfirmClose) {
    jsx3.ide.close(editor.getTab(), false,
        function() {jsx3.ide.doDereference(objTree, strRecordIds, false, bConfirmed);});
    return;
  }

  var objSettings = jsx3.ide.getProjectSettings(true);
  var includes = objSettings.get('includes');

  // not the most efficient algorithm
  for (var i = 0; i < includes.length; i++) {
    var include = includes[i];
    if (jsx3.util.arrIndexOf(strRecordIds, include.id) >= 0) {
      includes.splice(i, 1);
      objTree.deleteRecord(include.id);
      i--;
    }
  }

  objSettings.set('includes', includes);
  objSettings.save();

  for (var i = 0; i < objFiles.length && editor == null; i++) {
    editor = jsx3.ide.getEditorForFile(objFiles[i]);
    if (editor != null)
      editor.close();
  }
};

jsx3.ide.doShowResourceProps = function(objTree, strRecordId) {
  var root = jsx3.IDE.getRootBlock();
  var dialog = root.load('components/resourcefiles/resource-settings.xml', false);

  var prefs = jsx3.ide.getIDESettings();
  var dims = prefs.get("resource-settings", "dims");
  if (dims instanceof Array)
    dialog.setDimensions(dims);

  root.paintChild(dialog);

  dialog.setResourceId(strRecordId);
  dialog.doInit();
  dialog.focus();
};

jsx3.ide.setResourceProps = function(strId, strNewId, strSrc, strType, intLoad) {
  if (strNewId == null) strNewId = strId;

  var objSettings = jsx3.ide.getProjectSettings(true);
  var includes = objSettings.get('includes');

  var oldInclude = null, newInclude = null;

  for (var i = 0; i < includes.length; i++) {
    var include = includes[i];

    if (include.id == strId)
      oldInclude = include;
    else if (include.id == strNewId)
      newInclude = include;
  }

  if (newInclude != null) {
    jsx3.ide.LOG.warn("Cannot change resource ID to an ID that is already in use: " + strNewId);
    return;
  }

  if (oldInclude != null) {
    if (strSrc != null && oldInclude.src != strSrc && jsx3.ide.getResourceBySrc(strSrc) != null) {
      jsx3.ide.LOG.warn("Cannot change resource path to a path that is already in use: " + strSrc);
      return;
    }

    if (strNewId != null)
      oldInclude.id = strNewId;
    if (strSrc != null)
      oldInclude.src = strSrc;
    if (strType != null)
      oldInclude.type = strType;
    if (intLoad != null)
      oldInclude.load = intLoad;

    objSettings.set('includes', includes);
    objSettings.save();

    jsx3.IDE.publish({subject:jsx3.ide.events.RESOURCE_SETTINGS_DID_CHANGE,
        oldId:strId, resource:oldInclude});
  } else {
    jsx3.ide.LOG.error("Cannot find resource with ID: " + strId);
  }
};

jsx3.ide.addResourceToProject = function(objFile, strType, bAutoLoad) {
  var objSettings = jsx3.ide.getProjectSettings(true);
  var path = jsx3.net.URI.decode(jsx3.ide.SERVER.getBaseDirectory().relativePathTo(objFile));
  var insert = jsx3.util.List.wrap(objSettings.get('includes')).filter(function(x) { return x.src == path; }).size() == 0;

  if (insert) {
    jsx3.ide.LOG.debug("Adding resource to project: " + path);
  
    var includes = objSettings.get('includes');
    if (!includes) includes = [];
    
    // ensure unique new id (could be improved!)
    var newId = objFile.getName().replace(/\./g,"_");
    while (jsx3.ide.getResourceById(newId) != null)
      newId += "_";

    var include = {
      id: newId,
      type: strType,
      load: bAutoLoad ? 1 : 0,
      src: path
    };
    includes.push(include);
    objSettings.set('includes', includes);
    objSettings.save();

    // update menu accordingly
    jsx3.ide.updateResources();
  }
};

jsx3.ide.getResourceBySrc = function(strUri) {
  var objFile = jsx3.ide.getSystemRelativeFile(strUri);
  return jsx3.ide.getResourceByFile(objFile);
};

jsx3.ide.getResourceByFile = function(objFile) {
  var objSettings = jsx3.ide.getProjectSettings(true);
  var includes = objSettings.get("includes");

  var path = jsx3.ide.getSystemDirFile().toURI().relativize(objFile.toURI());
  for (var i = 0; i < includes.length; i++) {
    var inc = includes[i];
    var iPath = jsx3.ide.SERVER.resolveURI(inc.src);
    if (path.equals(iPath))
      return inc;
  }

  return null;
};

jsx3.ide.getResourceById = function(strResourceId) {
  var objSettings = jsx3.ide.getProjectSettings();
  return jsx3.util.List.wrap(objSettings.get('includes')).filter(function(x) { return x.id == strResourceId; }).get(0);
};

jsx3.ide.getFileForResource = function(strResourceId) {
  var resource = jsx3.ide.getResourceById(strResourceId);

  if (resource != null)
    return jsx3.ide.getSystemRelativeFile(jsx3.ide.SERVER.resolveURI(resource.src));

  return null;
};

jsx3.ide.doOpenUrlForEdit = function(strUrl, strType) {
  var objFile = jsx3.ide.getSystemRelativeFile(strUrl);
  jsx3.ide.doOpenForEdit(objFile, strType);
};

/** DO OPEN FOR EDIT ****************************************************/
jsx3.ide.doOpenForEdit = function(objFile, strType, bNew) {
  var editor = jsx3.ide.getEditorForFile(objFile);
  //check if given component is already open (only one instance at a time in the editor)
  if (editor != null) {
    editor.reveal();
    //this item is already being edited; just click the tab to activate
  } else {
    if (strType == null)
      strType = jsx3.ide.getFileType(objFile);
    jsx3.ide.doOpenEditor(objFile, strType);
    jsx3.ide.addToRecentFiles(objFile);
  }

  if (bNew !== false)
    jsx3.ide.addResourceToProject(objFile, strType, false);
};

jsx3.ide.getFileType = function(objFile) {
  //determine based on extension
  var ext = objFile.getExtension();

  if (ext == 'css') return jsx3.ide.TYPE_CSS;
  if (ext == 'js') return jsx3.ide.TYPE_JAVASCRIPT;
  if (ext == 'jss') return jsx3.ide.TYPE_DYNAPROPS;

  var objXML = new jsx3.xml.Document();
  objXML.load(objFile.toURI());
  if (! objXML.hasError()) {
    var strValue = objXML.getRootNode().getNamespaceURI();

    if (strValue == jsx3.app.Model.CURRENT_VERSION || strValue == jsx3.app.Model.CIF_VERSION)
      return jsx3.ide.TYPE_COMPONENT;

    //support both legacy and new formats
    if (objXML.selectSingleNode("/data/record[@jsxid='jsxwsdlroot']") || objXML.selectSingleNode("/data[@jsxnamespace='jsx3.ide.mapper.Mapper']") || objXML.selectSingleNode("/data[@jsxnamespace='jsx3.xml.Mapper']") )
      return jsx3.ide.TYPE_SERVICE;

    strValue = objXML.getRootNode().getAttribute("jsxns");
    if (strValue == "urn:tibco.com/v3.0/dynamicproperties/1")
      return jsx3.ide.TYPE_DYNAPROPS;

    if (objXML.getAttribute("jsxnamespace") == "propsbundle")
      return jsx3.ide.TYPE_DYNAPROPS_LOCAL;

    var strNSURI = objXML.getRootNode().getNamespaceURI();
    if (strNSURI == "http://www.w3.org/1999/XSL/Transform"
        || strNSURI == "http://www.w3.org/TR/WD-xsl")
      return jsx3.ide.TYPE_XSL;
    else
      return jsx3.ide.TYPE_XML;
  }

  return ext;
};

jsx3.ide.doReloadResource = function(strResourceIds) {
  if (!(strResourceIds instanceof Array)) strResourceIds = [strResourceIds];
  var objResources = [];
  for (var i = 0; i < strResourceIds.length; i++)
    objResources[i] = jsx3.ide.getResourceById(strResourceIds[i]);

  jsx3.ide.doReloadResourceObj(objResources);
};

jsx3.ide.doReloadResourceObj = function(objResources, bConfirmed) {
  if (!(objResources instanceof Array)) objResources = [objResources];

  var needConfirm = false;
  if (!bConfirmed) {
    for (var i = 0; i < objResources.length && !needConfirm; i++) {
      needConfirm = objResources[i].type == jsx3.ide.TYPE_CSS;
    }
  }

  if (needConfirm) {
    jsx3.IDE.confirm(
      "Confirm Reload",
      "Reloading a CSS file can be very slow. Reload?", function(d){
        d.doClose();
        jsx3.ide.doReloadResourceObj(objResources, true);},
      null, "Reload", "Cancel");
    return;
  }

  var bJss = false;
  for (var i = 0; i < objResources.length; i++) {
    var objResource = objResources[i];
    jsx3.ide.SERVER.loadInclude(
        jsx3.ide.SERVER.resolveURI(objResource.src), objResource.id, objResource.type, true);

    bJss = bJss || (objResource.type == jsx3.ide.TYPE_DYNAPROPS || objResource.type == jsx3.ide.TYPE_DYNAPROPS_LOCAL);
  }

  // reconstruct JSS index for Properties editor context menu
  if (bJss) jsx3.ide.constructPropertyTypeIndex();
};

jsx3.ide.resourceTypeSupportsLoad = function(strType) {
  return strType == jsx3.ide.TYPE_JAVASCRIPT ||
      strType == jsx3.ide.TYPE_CSS ||
      strType == jsx3.ide.TYPE_DYNAPROPS ||
      strType == jsx3.ide.TYPE_DYNAPROPS_LOCAL ||
      strType == jsx3.ide.TYPE_XML ||
      strType == jsx3.ide.TYPE_XSL;
};

jsx3.ide.configureResourceMenu = function(objMenu, objTree, strRecordId) {
  var record = objTree.getRecord(strRecordId);
  objMenu.enableItem('reload', record && record.supportsLoad == 1);
  objMenu.enableItem('autoload', record && record.supportsLoad == 1);
  objMenu.selectItem('autoload', record && (record.onload == 1 || record.load == jsx3.lang.ClassLoader.LOAD_ALWAYS));
};
