/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 *
 */
jsx3.Class.defineClass("jsx3.ide.PrefsController", null, [jsx3.util.EventDispatcher], function(PrefsController, PrefsController_prototype) {

  /** @private @jsxobf-clobber */
  PrefsController._COMPONENT_PATH = "components/preferences/controller.xml";

  PrefsController.UNLOAD = "unload";
  PrefsController.SWITCH = "switch";
  PrefsController.SAVE = "save";

  PrefsController_prototype.init = function() {
    /* @jsxobf-clobber */
    this._panes = [];
    /* @jsxobf-clobber */
    this._parent = null;
    /* @jsxobf-clobber */
    this._root = null;
    /* @jsxobf-clobber */
    this._current = null;
    /* @jsxobf-clobber */
    this._collapse = false;
  };

  PrefsController_prototype.getCollapse = function() {
    return this._collapse;
  };

  PrefsController_prototype.setCollapse = function(bCollapse) {
    this._collapse = bCollapse;
  };

  /**
   * Adds a prefs pane to this controller. This method may be called either before or after <code>renderIn()</code>
   * has been called.
   * @param objPane {jsx3.ide.PrefsPane} the pane to add.
   */
  PrefsController_prototype.addPane = function(objPane) {
    this._panes.push(objPane);
    if (this._parent != null)
      this._addPaneToView(objPane);

    objPane.subscribe(jsx3.ide.PrefsPane.SAVED, this, "_onPaneSaved");
    objPane.subscribe(jsx3.ide.PrefsPane.DIRTIED, this, "_onPaneDirtied");
  };

  /**
   * Loads this controller into the view.
   * @param objParent {jsx3.gui.Model} the parent to load this controller into.
   */
  PrefsController_prototype.renderIn = function(objParent, intPaneToShow) {
    this._parent = objParent;
    this._root = this._parent.load(PrefsController._COMPONENT_PATH, false);
    this._root.setController(this);

    if (this.getCollapse() && this._panes.length < 2) {
      this._root.setCols("0,*");
      this._root.getChild(1).setBorder("");
    }

    for (var i = 0; i < this._panes.length; i++)
      this._addPaneToView(this._panes[i]);

    this._parent.paintChild(this._root);
    
    if (this._panes.length > 0) {
      jsx3.sleep(function() {
        if (this._root.getParent() != null)
          this.showPane(intPaneToShow || Number(0)); 
      }, null, this);
    }
  };

  /**
   * @return {boolean} <code>true</code> if the parent container can be safely destroyed.
   */
  PrefsController_prototype.unload = function(bForce) {
    if (! bForce && this._current != null && this._current.isDirty()) {
      var alerter = this._root.getAncestorOfType(jsx3.gui.Dialog) || this._root.getServer();
      var me = this;
      alerter.confirm(
          "Save Changes",
          "Save changes made to " + me._current.getTitle() + " before closing?",
          function(d){ d.doClose(); me._current.save(function() {me.unload();}); },
          null, "Save", "Cancel", 1,
          function(d){ d.doClose(); me.unload(true); },
          "Don't Save"
      );
      return false;
    }

    this._parent.removeChild(this._root);
    this.publish({subject:PrefsController.UNLOAD});
    return true;
  };

  /** @private */
  PrefsController_prototype._onApply = function() {
    this._current.save();
  };

  /** @private */
  PrefsController_prototype._onSave = function() {
    var me = this;
    this._current.save(function() {me.unload();});
  };

  /** @private @jsxobf-clobber */
  PrefsController_prototype._onPaneSaved = function(objEvent) {
    var objPane = objEvent.target;
    if (this._current == objPane)
      this._root.setButtonsEnabled(false);
    this.publish({subject:PrefsController.SAVE, pane:objPane});
  };

  /** @private @jsxobf-clobber */
  PrefsController_prototype._onPaneDirtied = function(objEvent) {
    var objPane = objEvent.target;
    if (this._current == objPane)
      this._root.setButtonsEnabled(objEvent.dirty);
  };

  /**
   * Displays a prefs pane in the edit area. Unloads the current prefs pane if necessary. If the current prefs
   * pane is dirty, the user will be prompted to save or discard changes before the prefs pane is switched.
   * @param objPane {jsx3.ide.PrefsPane|int} the pane to switch to.
   * @param bForce {boolean} if <code>true</code>, the current pane is unloaded without saving changes.
   * @return {boolean} <code>true</code> if the switch happened without user interaction.
   */
  PrefsController_prototype.showPane = function(objPane, bForce) {
    if (typeof(objPane) == "number")
      objPane = this._panes[objPane];

    if (objPane == null) throw new jsx3.IllegalArgumentException("objPane", arguments[0]);

    if (bForce || this._onBeforeSwitch(objPane)) {
      var prevPane = this._current;
      var contentPane = this._root.getContentPane();
      contentPane.removeChildren();

      this._current = objPane;
      objPane.renderPaneIn(contentPane);
      this._root.setButtonsEnabled(false);

      this.publish({subject:PrefsController.SWITCH, from:prevPane, to:objPane});

      if (prevPane != null)
        this._getListBlockForPane(prevPane).setBackgroundColor("", true);
      this._getListBlockForPane(objPane).setBackgroundColor("#FFFF99", true);

      var firstResponder = objPane.getFirstResponder();
      if (firstResponder != null)
        firstResponder.focus();

      return true;
    }
    return false;
  };

  /** @private @jsxobf-clobber */
  PrefsController_prototype._getListBlockForPane = function(objPane) {
    return this._root.getListPane().getDescendantOfName("block" + objPane.getTitle(), false, true);
  };

  /** @private @jsxobf-clobber */
  PrefsController_prototype._addPaneToView = function(objPane) {
    var listPane = this._root.getListPane();

    var block = new jsx3.gui.Block("block" + objPane.getTitle(), 0, 0, "100%", 60);
    block.setTagName("div");
    block.setBackground("background-image:url(" + this._root.getUriResolver().resolveURI(objPane.getImage()) + ");background-repeat:no-repeat;background-position:center 8px;");
    block.setOverflow(jsx3.gui.Block.OVERFLOWHIDDEN);
    block.setTextAlign(jsx3.gui.Block.ALIGNCENTER);
    block.setTip(objPane.getDescription());
    block.setPadding("0 0 0 0");
    block.setCursor("pointer");
    block.setEvent("1;", jsx3.gui.Interactive.JSXCLICK);
    block.subscribe(jsx3.gui.Interactive.JSXCLICK, this, function() { this.showPane(objPane); });
    listPane.setChild(block);

    var image = new jsx3.gui.Block("prefsImage", 0, 0, 95, 60);
    image.setTagName("div");
    image.setPadding("40 0 0 0");
    image.setText('<div style="position:relative;width:95px;text-align:center;">' + objPane.getTitle() + '</div>');
    image.setTextAlign(jsx3.gui.Block.ALIGNCENTER);
    block.setChild(image);

    listPane.paintChild(block);
  };

  /**
   * Called when a change of prefs pane is requested.
   * @param objPane {jsx3.ide.PrefsPane} the pane to switch to.
   * @return {boolean} <code>true</code> is the switch may procede.
   * @private
   * @jsxobf-clobber 
   */
  PrefsController_prototype._onBeforeSwitch = function(objPane) {
    if (this._current != null) {
      if (this._current == objPane) return false;
      if (this._current.isDirty()) {
        var alerter = this._root.getAncestorOfType(jsx3.gui.Dialog) || this._root.getServer();
        var me = this;
        alerter.confirm(
            "Save Changes",
            "Save changes made to " + me._current.getTitle() + " before switching?",
            function(d){ d.doClose(); me._current.save(function() {me.showPane(objPane);}); },
            null, "Save", "Cancel", 1,
            function(d){ d.doClose(); me.showPane(objPane, true); },
            "Don't Save"
        );
        return false;
      }
    }
    return true;
  };

});

/**
 */
jsx3.Class.defineClass("jsx3.ide.PrefsPane", null, [jsx3.util.EventDispatcher], function(PrefsPane, PrefsPane_prototype) {

  PrefsPane.PROTOTYPES_DIR = "prototypes/";

  PrefsPane.SAVED = "save";
  PrefsPane.DIRTIED = "dirtied";

  PrefsPane.getPane = function(objJSX) {
    while (objJSX != null) {
      if (objJSX._pane != null) return objJSX._pane;
      objJSX = objJSX.getParent();
    }
    return null;
  };

  PrefsPane_prototype.init = function(strPath) {
    /* @jsxobf-clobber */
    this._xml = (new jsx3.xml.Document()).load(strPath);

    if (this._xml.hasError())
      throw new jsx3.Exception("Error loading preferences pane component " + strPath + ": " +
          this._xml.getError());

    /* @jsxobf-clobber */
    this._path = strPath;
    /* @jsxobf-clobber */
    this._dirty = false;
    /* @jsxobf-clobber */
    this._props = {};
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype.getTitle = function() {
    this._xml.setSelectionNamespaces("xmlns:jsx1='" + jsx3.app.Model.CURRENT_VERSION + "'");
    return this._xml.selectSingleNode("/jsx1:serialization/jsx1:name").getValue();
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype.getDescription = function() {
    this._xml.setSelectionNamespaces("xmlns:jsx1='" + jsx3.app.Model.CURRENT_VERSION + "'");
    return this._xml.selectSingleNode("/jsx1:serialization/jsx1:description").getValue();
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype.getImage = function() {
    this._xml.setSelectionNamespaces("xmlns:jsx1='" + jsx3.app.Model.CURRENT_VERSION + "'");
    return this._xml.selectSingleNode("/jsx1:serialization/jsx1:icon").getValue();
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype.getComponentPath = function() {
    return this._path;
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype.renderPaneIn = function(objParent) {
    this._root = objParent.loadXML(this._xml, false);
    /* @jsxobf-clobber */
    this._root._pane = this;
    this._dirty = false;
    this._root.loadPrefs();
    objParent.paintChild(this._root);
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype.getGUIRoot = function() {
    return this._root;
  };

  PrefsPane_prototype.getFirstResponder = function() {
    if (this._root.getFirstResponder)
      return this._root.getFirstResponder();
    return null;
  };

  PrefsPane_prototype.setDirty = function(bDirty) {
    if (this._dirty != bDirty)
      this.publish({subject:PrefsPane.DIRTIED, dirty:bDirty});
    this._dirty = bDirty;
  };

  PrefsPane_prototype.isDirty = function() {
    return this._dirty;
  };

  PrefsPane_prototype.save = function(fctDone) {
    var saveRet = this._root.savePrefs();
    if (saveRet) {
      this._dirty = false;
      this.publish({subject:PrefsPane.SAVED});

      if (typeof(saveRet) == "object") {
        var alerter = this._root.getAncestorOfType(jsx3.gui.Dialog) || this._root.getServer();
        alerter.alert(
            saveRet.title,
            saveRet.message,
            function(d){ d.doClose(); if (fctDone != null) fctDone(); }
        );
      } else {
        if (fctDone) fctDone();
      }
    }
  };

  PrefsPane_prototype.getProperty = function(strId) {
    return this._props[strId];
  };

  PrefsPane_prototype.setProperty = function(strId, objValue) {
    this._props[strId] = objValue;
  };

});
