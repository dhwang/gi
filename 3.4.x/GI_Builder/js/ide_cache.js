/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.getServerId = function(objServer) {
	return objServer.getRootBlock().getId();
};

jsx3.ide.getServerForId = function(strServerId) {
	var objRoot = jsx3.GO(strServerId);
	if (objRoot)
		return objRoot.getServer();
	return null;
};

/** CONFIG CACHE MENU *********************************************/
jsx3.ide.configCacheMenu = function(objTree, objMenu) {
  var arrVal = objTree.getValue();
  var bMulti = arrVal.length > 1;

  for (var i = objMenu.getXML().selectNodeIterator("/data/record"); i.hasNext(); ) {
    var record = i.next();
  	objMenu.enableItem(record.getAttribute('jsxid'), !(bMulti && record.getAttribute("single") == "1"));
	}
};


jsx3.ide.getCacheDocByTreeId = function(objTree, strRecordId) {
	var objRecord = objTree.getRecord(strRecordId);

  if (objRecord) {
		var objServer = jsx3.ide.getServerForId(objRecord.serverId) || jsx3.ide.SERVER;
    if (objServer)
			return objServer.getCache().getDocument(objRecord.jsxid);
	}
	return null;
};

jsx3.ide.doOpenCacheDocument = function(objTree, strRecordId) {
  return jsx3.ide.doOpenCacheEditor(jsx3.ide.SERVER, strRecordId);
};

/** EDIT SELECTED CACHE DOC **********************************/
jsx3.ide.editSelectedCacheDoc = function(objTree, strRecordId) {
	if (objTree == null)
		objTree = jsx3.IDE.getJSXByName("jsxcache");
	if (strRecordId == null)
		strRecordId = objTree.getValue();
  if (!(strRecordId instanceof Array))
    strRecordId = [strRecordId];
  
  var editors = [];
  for (var i = 0; i < strRecordId.length; i++) {
    var e = jsx3.ide.doOpenCacheDocument(objTree, strRecordId[i]);
    if (e)
      editors.push(e);
  }
  return editors;
};

jsx3.ide.viewSelectedCacheDoc = function(objTree, strRecordId) {
	var editors = jsx3.ide.editSelectedCacheDoc(objTree, strRecordId);
	
	if (editors) {
    for (var i = 0; i < editors.length; i++) {
      editors[i].setMode('readonly');
      editors[i].getTab().setButtonState('btnViewRO');
    }
  }
};

/** DELETE SELECTED CACHE DOC **********************************/
jsx3.ide.deleteCacheDocument = function(strDocIds, bConfirmed) {
	var objTree = jsx3.IDE.getJSXByName("jsxcache");
	if (strDocIds == null)
		strDocIds = objTree.getValue();
	
  
  if (strDocIds.length > 0) {
    var strDocId = strDocIds[0];
		
		var objEditor = jsx3.ide.getEditorForCacheId(jsx3.ide.SERVER, strDocId);
		if (!bConfirmed && objEditor && objEditor.isDirty()) {
			jsx3.IDE.confirm(
				"Confirm Delete",
				"You have made unsaved changes to the cache document <b>" + strDocId + "</b>. Procede with delete?",
				function(d) {d.doClose(); jsx3.ide.deleteCacheDocument(strDocIds, true);},
				null,
				"Delete",
				"Cancel"
			);
			return;
		}
		
		// check that we are confirmed if necessary
		var settings = jsx3.ide.getIDESettings();
		if (settings.get('prefs', 'builder', 'cachewarn') && !bConfirmed) {
			jsx3.IDE.confirm(
				"Confirm Delete",
				"Delete the cache document <b>" + strDocId + "</b>?",
				function(d) {d.doClose(); jsx3.ide.deleteCacheDocument(strDocIds, true);},
				null,
				"Delete",
				"Cancel"
			);
			return;
		}

		if (objEditor != null)
			objEditor.close();
		jsx3.ide.SERVER.getCache().clearById(strDocId);
    
    strDocIds.shift();
    jsx3.ide.deleteCacheDocument(strDocIds, false);
		
    jsx3.ide.updateCache();
	}
};



/** UPDATE CACHE ****************************************************/
jsx3.ide.updateCache = function() {
	//make sure the cache palette is loaded
	var objTree = jsx3.IDE.getJSXByName("jsxcache");
	if (objTree) {
    // remember the open nodes
    var openIdMap = {};
    for (var i = objTree.getXML().selectNodeIterator("//record[record]"); i.hasNext(); ) {
      var record = i.next();
      openIdMap[record.getAttribute("jsxid")] = record.getAttribute("jsxopen") == "1" ? "1" : "0";
    }
    
    // reset the XML used by the IDE to display the contents of the cache for the component being edited
		jsx3.IDE.getCache().clearById(objTree.getXMLId());
		objTree.getXML();
    
    // restore open state of hard-coded records
    for (var i = objTree.getXML().selectNodeIterator("//record"); i.hasNext(); ) {
      var record = i.next();
      if (openIdMap[record.getAttribute('jsxid')] != null)
        record.setAttribute("jsxopen", openIdMap[record.getAttribute('jsxid')]);
    }
    
    var activeEditor = jsx3.ide.getActiveEditor();
		var activeServer = activeEditor && jsx3.ide.ComponentEditor && activeEditor instanceof jsx3.ide.ComponentEditor ?
				activeEditor.getServer() : null;
		
    var serverCache = jsx3.ide.SERVER.getCache();
    var cacheKeys = serverCache.keys();
    var editors = jsx3.ide.getAllEditors();

    var nsRecord = {
      jsxid: "_server", 
      jsxtext: jsx3.ide.SERVER.getEnv("namespace"),
      jsximg: "images/icon_46.gif",
      jsxopen: openIdMap["_server"] != null ? openIdMap["_server"] : "1",
      jsxunselectable: "1"
    };
    objTree.insertRecord(nsRecord, "jsx30xmlcache", false);
    
    for (var i = 0; i < editors.length; i++) {
			var editor = editors[i];
      if (!(jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor) || editor.getServer() == null) continue;
      
      var view = editor.getServer();
      var cache = view.getCache();
      var serverId = jsx3.ide.getServerId(view);
      var bActive = view == activeServer;
				
      for (var j = 0; j < cacheKeys.length; j++) {
        var key = cacheKeys[j];
        if (cache.isMyDocument(key)) {
          var branchId = "jsx30xmlcache";
					
					// create folder node for document
					if (objTree.getRecordNode(serverId) == null) {						
						var serverRecord = {
              jsxid: serverId, 
              jsxtext: editor.getTabName(),
							jsxstyle: bActive ? "font-weight:bold;" : "",
							jsximg: "images/icon_46.gif",
							jsxopen: openIdMap[serverId] != null ? openIdMap[serverId] : "1",
							jsxunselectable: "1"
						};
						objTree.insertRecord(serverRecord, branchId, false);
					}
					
					var docRecord = {
						jsxid: key, jsxtext: key,
            serverId: serverId,
            jsxstyle: bActive ? "font-weight:bold;" : "",
						jsximg: (jsx3.ide.getDocumentType(cache.getDocument(key)) == "xsl") ?
								"images/icon_80.gif" : "images/icon_79.gif"
					};
          objTree.insertRecord(docRecord, serverId, false);
          
          cacheKeys.splice(j--, 1);
        }
			}
		}
    
    for (var j = 0; j < cacheKeys.length; j++) {
      var key = cacheKeys[j];

      var docRecord = {
        jsxid: key, jsxtext: key,
        jsximg: (jsx3.ide.getDocumentType(serverCache.getDocument(key)) == "xsl") ?
            "images/icon_80.gif" : "images/icon_79.gif"
      };
      objTree.insertRecord(docRecord, "_server", false);
    }

    //repaint the tree
		objTree.repaint();
	}
};

jsx3.ide.updateCacheForActive = function() {
	var objTree = jsx3.IDE.getJSXByName("jsxcache");
	
	if (objTree) {
		var activeEditor = jsx3.ide.getActiveEditor();
		var activeServer = activeEditor && jsx3.ide.ComponentEditor && activeEditor instanceof jsx3.ide.ComponentEditor 
				? activeEditor.getServer() : null;
		var activeServerId = activeServer ? jsx3.ide.getServerId(activeServer) : null;
		
    for (var i = objTree.getXML().selectNodeIterator("/data/record/record"); i.hasNext(); ) {
      var record = i.next();
      var style = (record.getAttribute("jsxid") == activeServerId) ? "font-weight:bold;" : "";
			record.setAttribute("jsxstyle", style);
      for (var j = record.getChildIterator(); j.hasNext(); )
        j.next().setAttribute("jsxstyle", style);
    }
		
		objTree.repaint();
	}
};

jsx3.ide.updateCacheIfCompEditor = function(objEvent) {
	if (jsx3.ide.ComponentEditor && objEvent.target instanceof jsx3.ide.ComponentEditor) 
		jsx3.ide.updateCache();
};

jsx3.ide.cleanUpOrphanedCacheEditors = function(objEvent) {
	var objEditor = objEvent.target;
	
	if (jsx3.ide.ComponentEditor && objEditor instanceof jsx3.ide.ComponentEditor && objEditor.getServer()) {
		var objServer = objEditor.getServer();
		var cacheKeys = objServer.getCache().keys();
		for (var i = 0; i < cacheKeys.length; i++) {
			var key = cacheKeys[i];
			var cacheEditor = jsx3.ide.getEditorForCacheId(objServer, key);
			
			if (cacheEditor != null) {
				if (cacheEditor.isDirty()) {
					// TODO: something friendlier?
					cacheEditor.close();
				} else {
					cacheEditor.close();
				}
			}
		}
	}
};
