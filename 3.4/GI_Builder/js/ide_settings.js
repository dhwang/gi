/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/** DO OPEN SETTINGS **************************************/
jsx3.ide.doOpenSettings = function(intPane) {
	var settings = jsx3.IDE.getJSXByName('jsx_ide_settings');

	if (settings == null) {
		settings = jsx3.IDE.getRootBlock().load('components/preferences/preferences.xml');
    settings.openPrefs(intPane);
  } else {
    if (intPane != null)
      settings.showPrefs(intPane);    
  }

  settings.focus();
};


jsx3.ide.loadCustomHotKeys = function() {
  var prefs = jsx3.ide.getIDESettings().get("hotkeys") || {};

  var menuBar = jsx3.IDE.getJSXByName("jsxmenubar");
  var menus = menuBar.getChildren();

  for (var i = 0; i < menus.length; i++) {
    var menu = menus[i];
    if (!(menu instanceof jsx3.gui.Menu)) continue;

    menu.applyDynamicProperties();
    for (var j = menu.getXML().selectNodeIterator("//record[@config='true']"); j.hasNext(); ) {
      var record = j.next();
      var menuId = jsx3.ide.getMenuIdForHotKey(menu, record);
      if (prefs[menuId]) {
        record.setAttribute("jsxdefault", record.getAttribute("jsxkeycode") || "");
        record.setAttribute("jsxkeycode", prefs[menuId]);
//        jsx3.log("setting custom hot key of " + menuId + " to " + prefs[menuId]);
      }
    }
  }
};

jsx3.ide.getMenuIdForHotKey = function(objMenu, objRecord) {
  var stack = [];
  while (objRecord != null) {
    if (objRecord.getNodeName() == "record")
      stack.push(objRecord);
    objRecord = objRecord.getParent();
  }
  var id = objMenu.getName();
  for (var i = stack.length - 1; i >= 0; i--)
    id += ":" + stack[i].getAttribute("jsxid");
  return id;
};

jsx3.ide.getMenuItemForKey = function(objKey) {
  var strKey = objKey.getKey();

  var menuBar = jsx3.IDE.getJSXByName("jsxmenubar");
  var menus = menuBar.getChildren();
  for (var i = 0; i < menus.length; i++) {
    var menu = menus[i];
    if (!(menu instanceof jsx3.gui.Menu)) continue;

    for (var j = menu.getXML().selectNodeIterator("//record"); j.hasNext(); ) {
      var record = j.next();
      var keycode = record.getAttribute("jsxkeycode");
      if (keycode) {
        try {
          var hk = jsx3.gui.HotKey.valueOf(keycode);
          if (hk.getKey() == strKey)
            return jsx3.ide.getMenuPath(menu, record);
        } catch (e) {
          jsx3.ide.LOG.warn("Error parsing hot key '" + keycode + "'");
        }
      }
    }
  }
  return null;
};

jsx3.ide.getMenuPath = function(objMenu, objRecord) {
  var stack = [];
  while (objRecord != null) {
    if (objRecord.getNodeName() == "record")
      stack.push(objRecord);
    objRecord = objRecord.getParent();
  }
  var path = objMenu.getText();
  for (var i = stack.length - 1; i >= 0; i--)
    path += " : " + stack[i].getAttribute("jsxtext");
  return path;
};
