/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// this file should only be loaded by the IDE

if (jsx3.ide.mapper == null) jsx3.ide.mapper = {};

jsx3.ide.mapper.configToolsMenu = function() {
	var toolMenu = jsx3.IDE.getJSXByName('jsxmenu_tools');
  
  var menuRecord = {
    jsxid: "jsxmapper",
    jsxtip: "Maps WSDL, Schema, and XML documents to application objects. Replaces the SOAP Mapping Utility.",
    jsximg: jsx3.ide.mapper.ADDIN.resolveURI("images/service.gif"),
    jsxtext: "XML Mapping Utility...",
    jsxexecute: "jsx3.ide.mapper.openUtility();"
  };
  
  if (toolMenu) {
    toolMenu.insertRecordBefore(menuRecord, "colorpicker", false);
	} else {
		jsx3.ide.LOG.error("Could not find tools menu.");
	}
  
  var fileMenu = jsx3.IDE.getJSXByName('jsxmenu_file');
  if (fileMenu) {
    menuRecord.jsxid = "newmappingrule";
    menuRecord.jsxtext = "Mapping Rule";
    menuRecord.project = "1";
    menuRecord.script = "jsx3.Service";
    menuRecord.config = "true";
    fileMenu.insertRecord(menuRecord, "new", false);
  } else {
    jsx3.ide.LOG.error("Could not find file menu.");
  }
};

jsx3.ide.mapper.configureNewMenu = function(objMenu) {
  var menuRecord = {
    jsxid: "newmappingrule",
    jsxtip: "Maps WSDL, Schema, and XML documents to application objects.",
    jsximg: jsx3.ide.mapper.ADDIN.resolveURI("images/service.gif"),
    jsxtext: "Mapping Rule",
    jsxexecute: "jsx3.ide.mapper.openUtility();"
  };
  
  objMenu.applyDynamicProperties();
  objMenu.insertRecord(menuRecord, "jsxroot", false);
};

jsx3.ide.mapper.registerEditor = function() {
  
  jsx3.require("jsx3.ide.Editor");
  
  jsx3.Class.defineClass("jsx3.ide.mapper.Editor", jsx3.ide.Editor, null, function(Editor, Editor_prototype) {
    
    Editor_prototype.open = function(objTabbedPane, objFile) {
      var objEditor = jsx3.IDE.getRootBlock().getChild("jsx_schema_dialog");
      if (objEditor == null)
        objEditor = jsx3.IDE.getRootBlock().load('components/Mapper.xml', true, jsx3.ide.mapper.ADDIN);
      
      if (objEditor && !objEditor.getDirty()) 
        this.doOpenServiceEditorDelay(objFile, objEditor);
    };

    Editor_prototype.doOpenServiceEditorDelay = function(objFile, objEditor) {
      //the editor loads asynchronously, composited from multiple objects; don't tell
      //the editor to load objFile until the mapper managed by the editor has been initialized
      //and is ready for commands
      if (objEditor.getMapper() != null && objEditor.getMapper().INITIALIZED) {
        objEditor.doNewRulesFile(objFile);
      } else {
        var me = this;
        window.setTimeout(function() { me.doOpenServiceEditorDelay(objFile, objEditor); }, 200);
      }
    };
    
  });
  
  jsx3.ide.Editor.registerEditorClass(jsx3.ide.TYPE_SERVICE, "jsx3.ide.mapper.Editor");
};

jsx3.ide.mapper.openUtility = function() {
    //have lookup hash of all tools so we can update or override via standard addins interface
    //for now, assume the url is the unique toolid
  var utility = jsx3.IDE.getRootBlock().getChild('jsx_schema_dialog');
  if (utility == null)
    utility = jsx3.IDE.getRootBlock().load('components/Mapper.xml', true, jsx3.ide.mapper.ADDIN);
  utility.focus();
};

jsx3.ide.mapper.configToolsMenu();
jsx3.ide.mapper.registerEditor();
