/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/** DO SCRIPTLET OPEN ***********************************************/
jsx3.ide.doScriptletOpen = function() {
	var d = jsx3.IDE.getRootBlock().loadAndCache('components/scriptlet/scriptlet.xml');
  d.onFocus();
};


/** DO SCRIPTLET EXECUTE ****************************************************/
jsx3.ide.doScriptletExecute = function(objDialog) {
	var scriptletInput = objDialog.getDescendantOfName('jsx_txt_scriptlet_input');
	var scriptlet = scriptletInput.getValue();
	var resultArea = objDialog.getDescendantOfName('jsx_txt_scriptlet_output');
	
	var result = "undefined";
	try {
		result = jsx3.eval(scriptlet);
	} catch (e) {
    e = jsx3.NativeError.wrap(e);
    result = e.printStackTrace();
    jsx3.ide.LOG.error(e.toString(), e);
  } finally {
		var sResult = null;
		if (typeof(result) == "object" && result == null)
			sResult = "null";
		else if (result == null || typeof(result) == "undefined")
			sResult = "undefined";
		else 
			sResult = result.toString();
		
		resultArea.setValue(sResult);
		jsx3.ide.storeScriptlet(objDialog, scriptlet);
	}
};



/** DO SCRIPTLET STEP THROUGH ****************************************************/
jsx3.ide.doScriptletStepThrough = function(objDialog) {
	var scriptletInput = objDialog.getDescendantOfName('jsx_txt_scriptlet_input');
	var scriptlet = scriptletInput.getValue();
	jsx3.ide.storeScriptlet(objDialog, scriptlet);

	//call the debugger
  jsx3.require("jsx3.ide.Debugger");
  if (jsx3.ide.debug)
    jsx3.ide.debug(scriptlet);
  else
    throw new jsx3.Exception("The JS debugger is not defined. It is probably not supported on this platform.");
};



/** DO SCRIPTLET HISTORY ****************************************************/
jsx3.ide.doScriptletHistory = function(objDialog, strHistoryId) {
	var menu = objDialog.getDescendantOfName('jsx_tbb_history');
	var record = menu.getRecord(strHistoryId);
	var scriptletInput = objDialog.getDescendantOfName('jsx_txt_scriptlet_input');
	scriptletInput.setValue(record.script);
};



/** STORE SCRIPTLET ****************************************************/
jsx3.ide.storeScriptlet = function(objDialog, strScriptlet) {
	if (! strScriptlet.match(/\S/)) return;
	
	var menu = objDialog.getDescendantOfName('jsx_tbb_history');
	var maxSize = 10; // TODO: = System.getDefault('scriptletHistorySize');

	var xml = menu.getXML();
	var root = xml.getRootNode();
	var children = root.getChildNodes();

	var lastScript = children.get(0);
	
	if (lastScript != null && lastScript.getAttribute('script') == strScriptlet) {
		// skip insert
	} else {
		var oldestScript = null;
		if (children.size() >= maxSize) {
      oldestScript = root.getLastChild();
      root.removeChild(oldestScript);
    }
    
    var record = root.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
    
    record.setAttribute("jsxid", oldestScript != null ? 
				oldestScript.getAttribute('jsxid') : children.size());
		record.setAttribute("jsxtext", jsx3.util.strTruncate(strScriptlet, 60, null, 2/3));
		record.setAttribute("script", strScriptlet);
		if (record.getAttribute("jsxtext").length < strScriptlet.length)
			record.setAttribute("jsxtip", strScriptlet);
		
		root.insertBefore(record, root.getFirstChild());
    
    menu.clearCachedContent();
  }
};
