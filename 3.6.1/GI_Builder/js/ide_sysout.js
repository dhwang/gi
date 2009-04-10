/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * ? toggleSystemOut() -- corresponds to selecting system out from the palettes menu, toggles the system out through the various states (similar to recycle bin).
 */
jsx3.ide.toggleSystemOut = function() {
  try {
    var current = jsx3.ide.getSystemOutLocation();
    var out = jsx3.ide.getSystemOut();
    
    if (current == 'closed') {
      var settings = jsx3.ide.getIDESettings();
      var location = settings.set('systemout', 'closed', false);
      jsx3.ide.systemOutStartup(true);
    } else if (current == 'window') {
      // BUG: will only unminimize minimized windows (won't bring them to the front)
      var w = jsx3.IDE.getAppWindow('system_out');
      if (w != null && w.isOpen())
        w.focus();
    } else if (current == 'float') {
      if (out.isFront())
        out.doToggleState(jsx3.gui.Dialog.MINIMIZED);
      else
        out.focus();
    } else if (current == 'bottom') {
      var splitter = out.getAncestorOfType(jsx3.gui.Splitter);
      if (splitter && (parseInt(splitter.getSubcontainer1Pct()) > 95))
        splitter.setSubcontainer1Pct(splitter.jsxdefault1pct, true);
      else
        splitter.setSubcontainer1Pct("100%", true);
    }
  } catch (e) {
    window.alert(e.message);
  }
};

/**
 * ? setSystemOutLocation() -- set the system out to appear in one of the supported locations, ['bottom','float','window']
 */
jsx3.ide.setSystemOutLocation = function(strLocation) {
  var current = jsx3.ide.getSystemOutLocation();
  
  var out = jsx3.ide.getSystemOut();
  if (strLocation == current) return;
  
  var bRemove = false;
  if (strLocation == "window") {
    jsx3.ide.openSystemOutWindow();
  } else if (strLocation == "float") {
    var parent = jsx3.IDE.getRootBlock();
    /* @jsxobf-clobber */
    jsx3.ide.SYSTEMOUT = parent.loadAndCache('components/systemout/as_dialog.xml');
    out.getBlock().transfer(jsx3.ide.SYSTEMOUT.getBlock());
    jsx3.ide.restoreSystemOutFloatState(jsx3.ide.SYSTEMOUT);
    bRemove = true;
  } else if (strLocation == "bottom") {
    jsx3.ide.openSystemOutBottom(out);
    bRemove = true;
  }

  var settings = jsx3.ide.getIDESettings();
  settings.set('systemout', 'location', strLocation);
  
  if (bRemove)
    jsx3.ide.destroySystemOut(current, out);
};

jsx3.ide.destroySystemOut = function(strLocation, out) {
  jsx3.ide.LOG.debug("destroySystemOut " + strLocation + " " + (out ? out.getId() : out));
  
  if (strLocation == "window") {
    var w = jsx3.IDE.getAppWindow('system_out');
    if (w != null && w.isOpen())
      w.close();
  } else if (strLocation == "bottom") {
      jsx3.ide.closeSystemOutBottom(out);
  } else if (strLocation == "float") {
    // timeout so that menu doesn't get disembodied
    jsx3.sleep(function(){out.getParent().removeChild(out);});
  }
};

jsx3.ide.getSystemOutLocation = function() {
  var out = jsx3.ide.getSystemOut();
  if (out != null) {
    return out.getName();
  }
  return "closed";
};

/**
 * ? systemOutStartup() -- on startup place the system out where it was previously
 */
jsx3.ide.systemOutStartup = function(bRestart) {
  var settings = jsx3.ide.getIDESettings();
  var location = settings.get('systemout', 'location');
  
  if (bRestart || ! settings.get('systemout', 'closed')) {
    if (location == "window") {
      jsx3.ide.openSystemOutWindow();
    } else if (location == "float") {
      var parent = jsx3.IDE.getRootBlock();
      jsx3.ide.SYSTEMOUT = parent.loadAndCache('components/systemout/as_dialog.xml');
      jsx3.ide.restoreSystemOutFloatState(jsx3.ide.SYSTEMOUT, settings);
      jsx3.ide.SYSTEMOUT.focus();
    } else {
      jsx3.ide.openSystemOutBottom();
    }
    
    jsx3.ide.copyFromMemoryToOut();
  }
};

jsx3.ide.openSystemOutWindow = function() {
  var w = jsx3.IDE.getAppWindow("system_out");
  if (w == null) {
    w = jsx3.IDE.loadAppWindow("components/systemout/as_window.xml");
    w.subscribe(jsx3.gui.Window.DID_OPEN, jsx3.ide.systemOutDidOpen);
    w.subscribe(jsx3.gui.Window.WILL_CLOSE, jsx3.ide.systemOutWillClose);
    w.subscribe(jsx3.gui.Window.DID_FOCUS, jsx3.ide.systemOutDidFocus);
  }
  
  if (! w.isOpen())
    w.open();
  
  return w;
};

jsx3.ide.systemOutDidOpen = function(objEvent) {
  jsx3.ide.LOG.debug("systemOutDidOpen " + objEvent.target.getName());
  var w = objEvent.target;
  var oldOut = jsx3.ide.getSystemOut();

  var newOut = w.getRootBlock();
  if (oldOut != null) {
    oldOut.getBlock().transfer(newOut.getBlock());
    jsx3.ide.destroySystemOut(jsx3.ide.getSystemOutLocation(), oldOut);
  } else {
    newOut.getBlock().clear();
  }
  
  jsx3.ide.restoreSystemOutWindowState(w);
  w.focus();
  
  jsx3.ide.SYSTEMOUT = newOut;
};

jsx3.ide.systemOutWillClose = function(objEvent) {
  jsx3.ide.saveSystemOutWindowState(objEvent.target);
  
  // clear out the pointer to system out, only if this window was closed and not replaced with another system out
  if (jsx3.ide.getSystemOutLocation() == "window")
    jsx3.ide.SYSTEMOUT = null;
};

jsx3.ide.systemOutDidFocus = function(objEvent) {
  jsx3.ide.saveSystemOutWindowState(objEvent.target);
};

/**
 * ? dumpSystemOutLog() -- 
 */
jsx3.ide.dumpSystemOutLog = function() {
  var log = jsx3.ERROR.getLog();
  var out = jsx3.ide.getSystemOut();
  if (out) {
//    out.initWith("", 0);
    for (var i = 0; i < log.length; i++)
      out.onError({error: log[i], dump: true});
  }
};

/**
 * ? getSystemOut() -- get a handle to the system out server
 */
jsx3.ide.getSystemOut = function() {
  var out = null;
  try {
    out = jsx3.ide.SYSTEMOUT;
    if (out != null && out.getName() == "window") {
      var w = jsx3.IDE.getAppWindow("system_out");
      if (w == null || !w.isOpen())
        out = jsx3.ide.SYSTEMOUT = null;
    }
  } catch (e) {
    out = jsx3.ide.SYSTEMOUT = null;
  }
  return out;
};

jsx3.ide.clearSystemOut = function() {
  var out = jsx3.ide.getSystemOut();
  if (out != null)
    out.getBlock().clear();
};

jsx3.ide.closeSystemOut = function(bSettingsOnly) {
  if (!bSettingsOnly) {
    var out = jsx3.ide.getSystemOut();
    var current = jsx3.ide.getSystemOutLocation();
  
    if (current == "window")
      jsx3.sleep(function(){
        var w = jsx3.IDE.getAppWindow('system_out');
        if (w != null && w.isOpen())
          w.close();
      });
    else if (current == "bottom")
      jsx3.ide.closeSystemOutBottom(out);
    else
      jsx3.sleep(function(){out.getParent().removeChild(out);});
  
    jsx3.ide.SYSTEMOUT = null;
  }
  
  var settings = jsx3.ide.getIDESettings();
  settings.set('systemout', 'closed', true);
};

jsx3.ide.openSystemOutBottom = function(out) {
  var parent = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q5');
  jsx3.ide.SYSTEMOUT = parent.loadAndCache('components/systemout/as_pane.xml');
  
  if (out) {
    out.getBlock();
    jsx3.ide.SYSTEMOUT.getBlock();
    out.getBlock().transfer(jsx3.ide.SYSTEMOUT.getBlock());
  }

  var splitter = parent.getAncestorOfType(jsx3.gui.Splitter);
  if (splitter && (parseInt(splitter.getSubcontainer1Pct()) > 95))
    splitter.setSubcontainer1Pct(splitter.jsxdefault1pct, true);
};

jsx3.ide.copyFromMemoryToOut = function() {
  var manager = jsx3.util.Logger.Manager.getManager();
  var memoryHandler = manager.getHandler("memory");
  var ideHandler = manager.getHandler("ide");
  if (memoryHandler && ideHandler) {
    var records = memoryHandler.getRecords();
    for (var i = 0; i < records.length; i++) {
      ideHandler.handle(records[i]);
    }
  };
};

jsx3.ide.closeSystemOutBottom = function(objOut) {
  var splitter = objOut.getAncestorOfType(jsx3.gui.Splitter);
  if (splitter)
    splitter.setSubcontainer1Pct('100%', true);
  
  jsx3.sleep(function(){objOut.getParent().removeChild(objOut);});
};

jsx3.ide.saveSystemOutFloatState = function(objDialog) {
  var settings = jsx3.ide.getIDESettings();
  var dialogPos = {left: objDialog.getLeft(), top: objDialog.getTop(), width: objDialog.getWidth(), height: objDialog.getHeight()};
  settings.set('systemout', 'dialog', dialogPos);
};

jsx3.ide.saveSystemOutWindowState = function(objWindow) {
  var pos = null;
  
  if (arguments.length >= 4)    
    pos = {left: arguments[0], top: arguments[1], width: arguments[2], height: arguments[3]};
  else if (objWindow.isOpen())
    pos = {
      left: objWindow.getOffsetLeft(), 
      top: objWindow.getOffsetTop(), 
      width: objWindow.getWidth(), 
      height: objWindow.getHeight()
    };
  
  if (pos) {
    var settings = jsx3.ide.getIDESettings();
    settings.set('systemout', 'window', pos);
  }
};

jsx3.ide.restoreSystemOutFloatState = function(objDialog, settings) {
  if (settings == null)
    settings = jsx3.ide.getIDESettings();
  
  var pos = settings.get('systemout', 'dialog');
  if (pos && pos.left) {
    objDialog.setDimensions(pos.left, pos.top, pos.width, pos.height, true);
    objDialog.constrainPosition();
  }
};

jsx3.ide.restoreSystemOutWindowState = function(objWindow, settings) {
  if (settings == null)
    settings = jsx3.ide.getIDESettings();
  
  var pos = settings.get('systemout', 'window');
  if (pos && pos.left) {
    objWindow.moveTo(pos.left, pos.top);
    objWindow.setWidth(pos.width);
    objWindow.setHeight(pos.height);
    objWindow.constrainToScreen();
  }
};


jsx3.ide.scrollDownToDomChild = function(objJSX, strChildId) {
  var objGUI = objJSX.getRendered();
  if (objGUI) {
    for (var i = 0; i < objGUI.childNodes.length; i++) {
      var child = objGUI.childNodes[i];
      if (child.id == strChildId) {
        objGUI.scrollTop = child.offsetTop;
        break;
      }
    }
  }
};

jsx3.ide.scrollDownToLastDomChild = function(objJSX) {
  var objGUI = objJSX.getRendered();
  if (objGUI) {
    var lastChild = objGUI.lastChild;
    if (lastChild)
      objGUI.scrollTop = lastChild.offsetTop;
  }
};

jsx3.ide.updateLoggerMenu = function(objMenu) {
  var handler = jsx3.util.Logger.Manager.getManager().getHandler('ide');
  if (handler != null)
    objMenu.selectItem(handler.getLevel(), true);
};

jsx3.ide.updateLoggerLevelOnMenu = function(intLevel) {
  var handler = jsx3.util.Logger.Manager.getManager().getHandler('ide');
  if (handler != null) handler.setLevel(intLevel);
};

jsx3.Class.defineClass('jsx3.ide.SystemLogHandler', jsx3.util.Logger.FormatHandler, null, function(SystemLogHandler, SystemLogHandler_prototype) {

  SystemLogHandler_prototype._bufferSize = 1000;

  SystemLogHandler_prototype.init = function(strName) {
    this.jsxsuper(strName);
    /* @jsxobf-clobber */
    this._bufferSize = null;
    /* @jsxobf-clobber */
    this._beeplevel = jsx3.util.Logger.OFF;
    
    jsx3.ide.registerSound("beep", jsx3.IDE.resolveURI("sounds/beep4.wav"));
  };
  
  SystemLogHandler_prototype.handle = function(objRecord) {
    // find system out
    var out = jsx3.ide.getSystemOut();
    if (out == null)
      return;

    var block = out.getBlock();
    if (block == null)
      return;

    var output = jsx3.util.strEscapeHTML(this.format(objRecord));
    
    if (this._bufferSize) {
      var maxSize = this._bufferSize - 1;
      if (block.getSize() > maxSize)
        out.shift(block.getSize() - maxSize);
    }
    
    block.log(output, objRecord.getLevel());
    
    if (objRecord.getLevel() <= this._beeplevel)
      jsx3.ide.playSound("beep");
  };
  
  SystemLogHandler_prototype.getBufferSize = function() {
    return this._bufferSize;
  };
  
  SystemLogHandler_prototype.setBufferSize = function(intBufferSize) {
    if (jsx3.util.numIsNaN(intBufferSize))
      this._bufferSize = 0;
    else
      this._bufferSize = Math.max(0, intBufferSize);
  };
  
  SystemLogHandler_prototype.getBeepLevel = function() {
    return this._beeplevel;
  };
  
  SystemLogHandler_prototype.setBeepLevel = function(intLevel) {
    this._beeplevel = intLevel;
  };
  
});

jsx3.util.Logger.Handler.registerHandlerClass(jsx3.ide.SystemLogHandler.jsxclass);

// disable jsx3.app.Monitor handlers
if (jsx3.app.Monitor)
  jsx3.app.Monitor.ideDidLoad();
