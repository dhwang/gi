/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */


/*
 * % openConsoleWindow()  --alias for the JavaScript method, window.open
 */
jsx3.ide.openConsoleWindow = function(strURL, strPopupName, intWidth, intHeight, yesnoScrollbar,
    yesnoMenuBar, yesnoStatus, yesnoLocation, yesnoToolbar, intLeft, intTop) {

  if (this.CONSOLES == null) this.CONSOLES = {};

  if (strPopupName) {
    try {
      var console = this.CONSOLES[strPopupName];
      if (console && ! console.closed) {
        // timeout because closing a menu focuses the GI app again
        window.setTimeout(function(){console.focus();},10);
        return;
      }
    } catch (e) {}
  }

  var strScrollbar = yesnoScrollbar ? "scrollbars=" + yesnoScrollbar + "," : "";
  var strMenuBar = yesnoMenuBar ? "menubar=" + yesnoMenuBar + "," : "";
  var strStatus = yesnoStatus ? "status=" + yesnoStatus + "," : "";
  var strLocation = yesnoLocation ? "location=" + yesnoLocation + "," : "";
  var strToolbar = yesnoToolbar ? "toolbar=" + yesnoToolbar + "," : "";
  var strWidth = intWidth ? "width=" + intWidth + "," : "";
  var strHeight = intHeight ? "height=" + intHeight + "," : "";
  var strLeft = intLeft ? "left=" + intLeft + "," : "";
  var strTop = intTop ? "top=" + intTop + "," : "";

  this.CONSOLES[strPopupName] = window.open(strURL, strPopupName, "directories=no,resizable=yes," +
      strScrollbar +  strMenuBar + strStatus + strLocation + strToolbar + strWidth + strHeight + strLeft + strTop);
  window.setTimeout(function(){jsx3.ide.CONSOLES[strPopupName].focus();},10);
  return this.CONSOLES[strPopupName];
};


/** DO OPEN TOOL ***********************************/
jsx3.ide.doOpenTool = function(TOOLID,strJSXId) {
  //have lookup hash of all tools so we can update or override via standard addins interface
  //for now, assume the url is the unique toolid
  var objJSX = null;
  if (strJSXId == null || jsx3.IDE.getJSXByName(strJSXId) == null) {
    objJSX = jsx3.IDE.getRootBlock().load(TOOLID);
    objJSX.focus();
    return objJSX;
  } else if (strJSXId != null && (objJSX = jsx3.IDE.getJSXByName(strJSXId)) != null) {
    objJSX.focus();
    window.setTimeout(function() { objJSX.beep(); },250);

    return objJSX;
  }
};

jsx3.ide.doOpenApiHelp = function(bAsWindow) {
  var settings = jsx3.ide.getIDESettings();

  if (bAsWindow == null) {
    bAsWindow = settings.get("apihelp", "aswindow");
    if (bAsWindow == null) bAsWindow = false;
  } else {
    settings.set("apihelp", "aswindow", bAsWindow);
  }

  jsx3.ide.LOG.debug("doOpenApiHelp window:" + bAsWindow);
  
  var w = jsx3.IDE.getAppWindow("api_help");
  var success = false;
  if (bAsWindow) {
    if (w == null) {
      w = jsx3.IDE.loadAppWindow('components/apihelp/as_window.xml');
      w.subscribe(jsx3.gui.Window.DID_OPEN, jsx3.ide.apiHelpWindowDidOpen);
      w.subscribe(jsx3.gui.Window.WILL_CLOSE, jsx3.ide.saveApiHelpWindowState);
      w.subscribe(jsx3.gui.Window.DID_FOCUS, jsx3.ide.saveApiHelpWindowState);
    }
    if (w.isOpen())
      w.focus();
    else
      w.open();

    success = w.isOpen();
  }

  if (! success) {
    var dialog = jsx3.IDE.getRootBlock().getChild('jsx_ide_api_dialog');
    jsx3.ide.LOG.debug("switching to dialog: " + dialog);

    if (dialog == null) {
      jsx3.ide.LOG.debug("doOpenApiHelp loading dialog component");
      dialog = jsx3.IDE.getRootBlock().loadAndCache('components/apihelp/as_dialog.xml');
    }
    
    if (dialog.getHelpBlock() == null) {
      if (w != null && w.getHelpBlock() != null) {
        jsx3.ide.LOG.debug("doOpenApiHelp adopting API help content");
        dialog.getHelpBlockParent().adoptChild(w.getHelpBlock());
      } else {
        jsx3.ide.LOG.debug("doOpenApiHelp loading API help content component");
        window.setTimeout(function(){
          dialog.getHelpBlockParent().load('components/apihelp/apihelp.xml');}, 0);
      }
    }

    if (w != null && w.isOpen())
      w.close();

    window.setTimeout(function(){ dialog.focus(); }, 0);
  }
};

jsx3.ide.apiHelpWindowDidOpen = function(objEvent) {
  jsx3.ide.LOG.debug("apiHelpWindowDidOpen " + objEvent.target.getName());

  var w = objEvent.target;
  if (w.getHelpBlock() == null) {
    var dialog = jsx3.IDE.getRootBlock().getChild('jsx_ide_api_dialog');
    if (dialog != null && dialog.getHelpBlock() != null) {
      jsx3.ide.LOG.debug("apiHelpWindowDidOpen adopting");
      w.getHelpBlockParent().adoptChild(dialog.getHelpBlock());
    } else {
      jsx3.ide.LOG.debug("apiHelpWindowDidOpen loading");
      w.getHelpBlockParent().load('components/apihelp/apihelp.xml');
    }

    if (dialog)
      dialog.getParent().removeChild(dialog);
  }

  var settings = jsx3.ide.getIDESettings();
  var windowPos = settings.get('apihelp', 'wposition');
  if (windowPos && windowPos.left) {
    w.moveTo(windowPos.left, windowPos.top);
    w.setWidth(windowPos.width);
    w.setHeight(windowPos.height);
    w.constrainToScreen();
  }
};

jsx3.ide.saveApiHelpWindowState = function(objEvent) {
  var w = objEvent.target;
  if (w.isOpen()) {
    var settings = jsx3.ide.getIDESettings();
    var windowPos = {left: w.getOffsetLeft(), top: w.getOffsetTop(),  width: w.getWidth(), height: w.getHeight()};
    settings.set('apihelp', 'wposition', windowPos);
  }
};

jsx3.ide.openAboutDialog = function() {
  var dialog = jsx3.IDE.getJSXByName("jsx_about_dialog");
  if (dialog == null) {
    dialog = jsx3.IDE.getRootBlock().load('components/about/about.xml');
    window.setTimeout(function(){ dialog.focus(); }, 0);
  } else {
    dialog.focus();
  }
};


jsx3.ide.scriptTypeAheadSpy = function(objMenu, strRecordId) {
  // UGH: it's too difficult to get this spy to work in Fx
  if (! jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
    return false;
  
  var objNode = objMenu.getRecordNode(strRecordId);
  var type = objNode.getAttribute("type");

  if (type) {
    var jsxidfk = objNode.getAttribute("jsxidfk");
    if (jsxidfk == null)
      jsxidfk = objNode.getAttribute("oldid");

    var src = null;
    while (objNode != null && src == null) {
      src = objNode.getAttribute('src');
      objNode = objNode.getParent();
    }

    if (src != null) {
      var blockX = jsx3.IDE.getJSXByName("jsxblockx_typeaheadscriptspy");
      var strURL = src;
      if (blockX.getXMLURL() != strURL) {
        blockX.setXMLURL(strURL);
        blockX.getServer().getCache().clearById(blockX.getXMLId());
      }

      var objMemberNode = blockX.getXML().selectSingleNode("//record[@jsxid='"+jsxidfk+"']");

      if (objMemberNode) {
        blockX.setXSLParam("membertype", type);
        blockX.setXSLParam("memberid", jsxidfk);
        return blockX.repaint();
      }
    }
  }
  return false;
};

jsx3.ide.updateToolsMenu = function(objMenu) {
  var xml = objMenu.getXML();
  var bProjectOpen = jsx3.ide.SERVER != null;
  var bHome = jsx3.ide.getCurrentUserHome() != null;

  if (! bProjectOpen) {
    for (var i = objMenu.getXML().selectNodeIterator("//record[@project='1']"); i.hasNext(); )
      objMenu.enableItem(i.next().getAttribute('jsxid'), false);
  }
  if (! bHome) {
    for (var i = objMenu.getXML().selectNodeIterator("//record[@home='1']"); i.hasNext(); )
      objMenu.enableItem(i.next().getAttribute('jsxid'), false);
  }
};

jsx3.ide.onApiHelpMenu = function(objMenu) {
  var settings = jsx3.ide.getIDESettings();
  var apisets = settings.get('apihelp', 'settings');

  if (apisets) {
    for (var i = objMenu.getXML().selectNodeIterator("/data/record"); i.hasNext(); ) {
      var id = i.next().getAttribute('jsxid');
      if (apisets[id] != null)
        objMenu.selectItem(id, apisets[id]);
    }
  }
};

jsx3.ide.onApiHelpSettingsSet = function(objMenu, strRecordId) {
  var enabled = objMenu.isItemSelected(strRecordId);
  var settings = jsx3.ide.getIDESettings();
  settings.set("apihelp", "settings", strRecordId, !enabled);

  var parent = objMenu;
  while (parent != null && parent.getHelpBlock == null)
    parent = parent.getParent();

  if (parent != null)
    parent.getHelpBlock().onSettingsChange(strRecordId, !enabled);
};

jsx3.ide.openFindReplace = function() {
  var objDialog = jsx3.IDE.getJSXByName("jsxfindreplace");
  if (objDialog == null) {
    objDialog = jsx3.IDE.getRootBlock().load("components/findreplace/findreplace.xml");
    objDialog.onActivate();
  } else {
    if (objDialog.isFront()) {
      objDialog.findNext();
    } else {
      objDialog.focus();
      objDialog.onActivate();
    }
  }
};

/* @jsxobf-clobber */
jsx3.ide._SOUNDS = {};

jsx3.ide.registerSound = function(strName, strURI) {
  jsx3.require("jsx3.gui.Sound");
  if (this._SOUNDS[strName] == null) {
    this._SOUNDS[strName] = new jsx3.gui.Sound("idesound_" + strName, strURI);
  }
};

jsx3.ide.playSound = function(strName, intVolume) {
  var sound = this._SOUNDS[strName];
  if (sound) {
    sound.setVolume(intVolume != null ? intVolume : 100);

    if (sound.getParent() == null) {
      var body = jsx3.IDE.getBodyBlock();
      body.setChild(sound);
      body.paintChild(sound);
      window.setTimeout(function(){ sound.play(); }, 0); // timeout seems to work in IE, not Fx
    } else {
      sound.play();
    }
  }
};

jsx3.ide.configureHelpMenu = function(objMenu) {
  for (var i = objMenu.getXML().selectNodeIterator("//record[@oniffile]"); i.hasNext(); ) {
    var r = i.next();
    var file = jsx3.ide.getBuilderRelativeFile(r.getAttribute("oniffile"));
    if (file.exists()) {
      r.removeAttribute("jsxdisabled");
      r.removeAttribute("oniffile");
    }
  }

  objMenu.setEvent(null, jsx3.gui.Interactive.MENU); // just do once
};

jsx3.ide.onContextHelp = function(objEvent) {
//  jsx3.ide.LOG.info("onContextHelp " + objEvent.helpid);

  var xml = new jsx3.xml.CDF.Document().load("jsx:///../doc/html/ctx/context.xml");
  if (! xml.hasError()) {
    var rec = xml.getRecord(objEvent.helpid);
    if (! rec) {
      if (! w) jsx3.ide.LOG.warn("No context help entry for " + objEvent.helpid + ". Falling back to ide.");
      rec = xml.getRecord("ide");
    }

    if (rec) {
      var path = rec.jsxtext;
      var w = window.open(path, "jsxidectxhelp");
      if (! w) jsx3.ide.LOG.warn("A pop-up blocker may have prevented context help from opening.");
    }
  } else {
    jsx3.ide.LOG.info(xml.getError());
    jsx3.IDE.alert("Documentation Not Installed",
        "You have invoked the context help system but the documentation that this depends on is not installed. " +
        "Please <a href='http://power.tibco.com/gi/builderlink/power/' target='_blank'>download the General Interface&#8482; documentation</a> and make sure that it is installed in the doc/ directory.");
  }
};
