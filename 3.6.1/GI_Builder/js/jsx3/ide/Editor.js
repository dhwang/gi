/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _editor _openNewTab _setTabName

jsx3.Class.defineClass("jsx3.ide.Editor", null, null, function(Editor, Editor_prototype) {

  /** @private @jsxobf-clobber */
  Editor.TYPE_MAP = {
    jsx: "jsx3.ide.ComponentEditor",
    component: "jsx3.ide.ComponentEditor", // need to condense these into one type!
    jss: "jsx3.ide.PropertiesEditor",
    ljss: "jsx3.ide.PropsBundleEditor",
//    cache: "jsx3.ide.CacheEditor",
    _default: "jsx3.ide.TextEditor"
  };

  Editor.EXTENSION_MAP = {
    script: "js"
  };

  Editor.registerEditorClass = function(strType, strClass) {
    Editor.TYPE_MAP[strType] = strClass;
  };

  Editor.create = function(objTabbedPane, strType) {
    var editorType = Editor.TYPE_MAP[strType.toLowerCase()];
    if (editorType == null) editorType = Editor.TYPE_MAP['_default'];

    jsx3.require(editorType);
    var objClass = jsx3.Class.forName(editorType);
    var editor = objClass.newInstance();
    editor.create(objTabbedPane, strType);

    return editor;
  };

  Editor.open = function(objTabbedPane, objFile, strType) {
    var editorType = Editor.TYPE_MAP[strType];
    if (editorType == null) editorType = Editor.TYPE_MAP['_default'];

    jsx3.require(editorType);
    var editorClass = jsx3.Class.forName(editorType);
    var editor = editorClass.newInstance();
    editor.open(objTabbedPane, objFile, strType);

    return editor;
  };

  Editor_prototype.init = function() {
    this._tab = null;
    this._url = null;
    this._dirty = false;
    this._unsaved = false;
  };

  Editor_prototype.create = jsx3.Method.newAbstract("objTabbedPane", "strType");

  Editor_prototype.open = jsx3.Method.newAbstract("objTabbedPane", "objFile");

  Editor_prototype.activate = jsx3.Method.newAbstract("objTabbedPane", "objFile");

  Editor_prototype.deactivate = function(objTabbedPane, objFile) {
//    jsx3.ERROR.doLog("IDED01", "subclass of jsx3.ide.Editor must implement deactivate()");
  };

  Editor_prototype.preSaveCheck = function(fctCallback) {
    return false; // return false for no interrupt
  };

  Editor_prototype.save = jsx3.Method.newAbstract();

  Editor_prototype.saveAs = jsx3.Method.newAbstract("objFile");

  Editor_prototype.revert = jsx3.Method.newAbstract();

  Editor_prototype.close = function() {
    if(this._tab) {
      var objTabbedPane = this._tab.getParent();
      objTabbedPane.removeChild(this._tab);
      if(!objTabbedPane.getChildren().length) objTabbedPane.repaint();
      delete this._tab._editor; // remove circular reference :-)
      this._tab = null;
    }
    delete this._server;
    jsx3.IDE.publish({subject:jsx3.ide.events.EDITOR_DID_CLOSE, target:this});
  };

  Editor_prototype.getTab = function() {
    return this._tab;
  };

  Editor_prototype.getMode = function() {
    return this._mode;
  };

  Editor_prototype.isOpen = function() {
    return this._tab != null;
  };

  Editor_prototype.isDirty = function() {
    return this._dirty;
  };

  Editor_prototype.setDirty = function(bDirty) {
    if (this._dirty != bDirty) {
      /* @jsxobf-clobber */
      this._dirty = bDirty;
      var tab = this.getTab();
      if (tab) tab.setColor(bDirty ? "red" : "", true);
    }
  };

  Editor_prototype.isReadOnly = function() {
    var file = this.getOpenFile();
    return file != null && file.isReadOnly() && !this.isUnsaved();
  };

  Editor_prototype.setReadOnly = function(bReadOnly) {
    var file = this.getOpenFile();
    if (file != null) {
      file.setReadOnly(bReadOnly);
      this._setTabName();
    }
  };

  Editor_prototype.isUnsaved = function() {
    return this._unsaved;
  };

  Editor_prototype.getOpenFile = function() {
    if (this._url != null)
      return jsx3.ide.getSystemRelativeFile(this._url);
    else
      return null;
  };

  Editor_prototype.reveal = function() {
    this._tab.doShow();
  };

  Editor_prototype.getFileType = function() {
    return null;
  };

  Editor_prototype.supportsReload = function() {
    return false;
  };

  Editor_prototype._openNewTab = function(objTabbedPane) {
    objTabbedPane.paintChild(this._tab);
    this._tab.doShow();
    this._setTabName();
    this._tab._editor = this; // circular reference :-(
//    this.reveal();
  };

  Editor_prototype.getTabName = function() {
    if (this.isUnsaved()) return "[untitled]";

    var cleanURL = jsx3.net.URI.decode(this._url.toString());
    return cleanURL.substring(cleanURL.lastIndexOf("/") + 1);
  };

  Editor_prototype.getServer = function() {
    return null;
  };

  Editor_prototype._setTabName = function() {
    var setTabReadWrite = 'setTabReadWrite'; // obfuscation
    var getTab = 'jsx3.IDE.getJSXById(\'' + this._tab.getId() + '\')';
    var readonly = "";
    if (this.isReadOnly()) {
      readonly = '<span style="width:12px;height:11px;padding:1px 0px 0px 4px;position:relative;overflow:hidden;"' +
          ' alt="double-click to unlock" ondblclick="jsx3.ide.' + setTabReadWrite + '(' + getTab + ');">' +
          '<img src="' + jsx3.IDE.resolveURI("images/icon_91.gif") + '" width="8" height="10"/></span>';
    }
    this._tab.setText(this.getTabName() + readonly, true);
  };
});
