/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _editor

jsx3.ide.getActiveServer = function() {
  var editor = jsx3.ide.getActiveEditor();
  return editor ? editor.getServer() : null;
};

jsx3.ide.getActiveTab = function() {
  //returns the active tab (the one with edit focus in the IDE)
  var oTP = jsx3.IDE.getJSXByName("jsx_tpan_component");
  return oTP.getChild(oTP.getSelectedIndex());
};

jsx3.ide.getActiveEditor = function() {
  var tab = jsx3.ide.getActiveTab();
  return tab != null ? tab._editor : null;
};

jsx3.ide.getEditorForTab = function(objTab) {
  return objTab._editor;
};

jsx3.ide.getEditorForJSX = function(objJSX) {
  var server = objJSX.getServer();
  var editors = jsx3.ide.getAllEditors();
  for (var i = 0; i < editors.length; i++) {
    var editor = editors[i];
    if (server == editor.getServer())
      return editor;
  }
  return null;
};

jsx3.ide.setActiveEditorDirty = function(objEvent) {
  jsx3.ide.getActiveEditor().setDirty(true);
};

jsx3.ide.setEditorDirtyForRecycle = function(objEvent) {
  if (objEvent.editor.isDirty()) return;
  
  var jsx = objEvent.objects;

  var bDirty = false;
  for (var i = 0; i < jsx.length && !bDirty; i++)
    bDirty = jsx[i].getPersistence() != jsx3.app.Model.PERSISTNONE;

  if (bDirty)
    objEvent.editor.setDirty(true);
};

jsx3.ide.setTabReadWrite = function(objTab) {
  var editor = jsx3.ide.getEditorForTab(objTab);
  if (editor)
    editor.setReadOnly(false);
};

jsx3.ide.getEditorForFile = function(objFile) {
  var editors = jsx3.ide.getAllEditors();
  for (var i = 0; i < editors.length; i++) {
    if (objFile.equals(editors[i].getOpenFile()))
      return editors[i];
  }
  return null;
};

jsx3.ide.getAllEditors = function() {
  var editors = [];
  var objTabbedPane = jsx3.IDE.getJSXByName("jsx_tpan_component");
  var tabs = objTabbedPane.getChildren();
  for (var i = 0; i < tabs.length; i++) {
    editors[i] = tabs[i]._editor;
  }
  return editors;
};

jsx3.ide.doNewEditor = function(strType) {
  jsx3.require("jsx3.ide.Editor");

  var objTabbedPane = jsx3.IDE.getJSXByName("jsx_tpan_component");
  return jsx3.ide.Editor.create(objTabbedPane, strType);
};

jsx3.ide.doOpenEditor = function(objFile, strType) {
  if (strType == null)
    strType = jsx3.ide.getFileType(objFile);

  jsx3.require("jsx3.ide.Editor");
  var objTabbedPane = jsx3.IDE.getJSXByName("jsx_tpan_component");
  return jsx3.ide.Editor.open(objTabbedPane, objFile, strType);
};

jsx3.ide.doOpenCacheEditor = function(objServer, strCacheId) {
  var alreadyOpen = jsx3.ide.getEditorForCacheId(objServer, strCacheId);
  if (alreadyOpen != null) {
    alreadyOpen.reveal();

    if (alreadyOpen.isDirty()) {
      jsx3.IDE.confirm(
        "Confirm Revert",
        "Revert cache document <b>" + alreadyOpen.getTabName() + "</b> to the last saved version?",
        function(d) {
          d.doClose();
          alreadyOpen.loadDocument(objServer.getCache().getDocument(strCacheId, false));
          alreadyOpen.setDirty(false); },
        null,
        "Revert",
        "Cancel",
        1
      );
      return;
    } else {
      alreadyOpen.loadDocument(objServer.getCache().getDocument(strCacheId, false));
      alreadyOpen.setDirty(false);
    }

    return alreadyOpen;
  } else {
    jsx3.require("jsx3.ide.CacheEditor");
    var objTabbedPane = jsx3.IDE.getJSXByName("jsx_tpan_component");
    var editor = new jsx3.ide.CacheEditor();
    editor.open(objTabbedPane, strCacheId, objServer);
    return editor;
  }
};

/**
 * ? getEditorForCacheId() -- get an open cache editor that has specific cache id. BUG: note that there may be id collisions between servers and this will prevent the opening of two cache documents with the same id even if they are not the same document.
 */
jsx3.ide.getEditorForCacheId = function(objServer, strCacheId) {
  var e = jsx3.ide.getAllEditors();
  for (var i = 0; i < e.length; i++) {
    var editor = e[i];
    if (jsx3.ide.CacheEditor && editor instanceof jsx3.ide.CacheEditor && editor.getServer() == objServer &&
        editor.getCacheId() == strCacheId)
      return editor;
  }
  return null;
};

jsx3.ide.setEditorMode = function(strMode) {
  var changed = false;
  var editor = jsx3.ide.getActiveEditor();

  if (editor != null) {
    changed = editor.setMode(strMode);
    if (changed !== false)
      jsx3.IDE.publish({subject: jsx3.ide.events.EDITOR_MODE_CHANGED, mode: strMode});
  }

  return changed;
};

jsx3.ide.onShowComponentProfile = function(objTab) {
  if (! objTab._inited) {
    var editor = jsx3.ide.getActiveEditor();
    if (editor) {
      //the profile for the component is contained by the first child of JSXBODY
      var firstChild = editor.getServer().getRootObjects()[0];
      if (firstChild) {
        objTab.fillFromJSX(firstChild);
        objTab._inited = true;
      }
    }
  }
};

jsx3.ide.isAnyEditorDirty = function() {
  var editors = jsx3.ide.getAllEditors();
  for (var i = 0; i < editors.length; i++) {
    if (editors[i].isDirty())
      return true;
  }
  return false;
};

jsx3.ide.onComponentTabMenu = function(objMenu, objEditor) {
  if (objEditor == null) return false;

  for (var i = objMenu.getXML().selectNodeIterator('//record'); i.hasNext(); ) {
    var node = i.next();
    if (node.getAttribute('reload') == "1")
      objMenu.enableItem(node.getAttribute('jsxid'), objEditor.supportsReload());

    // check for text specific to type of editor
    var editorText = objEditor ? node.getAttribute(objEditor.getClass().getName().replace(/^.*\./, "")) : null;
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
};

jsx3.ide.COMPONENT_EDITOR_STATS_SPY = '<span style="white-space:nowrap;">Component File Size / Time to Load / DOM Node Count / Time to Paint / HTML Size</span>';

jsx3.ide._CES_MF = new jsx3.util.MessageFormat('{0} KB <span style="color:#666666;">/</span> {2} s <span style="color:#666666;">/</span> {1,number,integer} <span style="color:#666666;">/</span> {3} s <span style="color:#666666;">/</span> {4} KB');
jsx3.ide._CES_NF1 = new jsx3.util.NumberFormat("0.0");
jsx3.ide._CES_NF2 = new jsx3.util.NumberFormat("0");

jsx3.ide.updateComponentStats = function(objEvent) {
  var pane = objEvent.target.getTab().getDescendantOfName("compeditorstats");
  var stats = objEvent.stats;

  var size = stats.size / 1024;
  size = (size < 9.5 ? jsx3.ide._CES_NF1 : jsx3.ide._CES_NF2).format(size);
  var objcount = stats.objcount;
  var load = stats.unmarshal / 1000;
  load = (load < 9.5 && load > 0.05 ? jsx3.ide._CES_NF1 : jsx3.ide._CES_NF2).format(load);
  var paint = stats.paint / 1000;
  paint = (paint < 9.5 && paint > 0.05 ? jsx3.ide._CES_NF1 : jsx3.ide._CES_NF2).format(paint);
  var html = stats.html / 1024;
  html = (html < 9.5 ? jsx3.ide._CES_NF1 : jsx3.ide._CES_NF2).format(html);

  pane.setText(jsx3.ide._CES_MF.format(size, objcount, load, paint, html), true);
};

jsx3.ide.refreshComponentStats = function() {
  var editor = jsx3.ide.getActiveEditor();
  if (editor.refreshStats) editor.refreshStats();
};
