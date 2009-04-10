/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * called by dispatcher; notified of any published event to the jsx3.ide.events.OBJECT_ATTRIBUTE_DID_CHANGE subject; for now makes current editor 'dirty'
 * @param objEvent the event as routed by the dispatcher; can be inspected for more information, including:
 *					  prop (the name of the model event constant such as 'jsxexecute'); target (the JSX instance whose event was just updated)
 */
jsx3.ide.onJsxXslParameterChange = function(objEvent) {
  var editor = jsx3.ide.getActiveEditor(); 
  if (editor != null) {
    var objJSXs = objEvent.targets;
    for (var i = 0; i < objJSXs.length; i++) {
      if (objJSXs[i].getPersistence() != jsx3.app.Model.PERSISTNONE) {
        editor.setDirty(true);
        break;
      }
    }
  }
};

/**
 * ? onXslParameterEdit()		--called by the edit mask for the grid being edited after user has dismissed the mask, but before edits are committed;
 *					  called because the grid has this handler listed as its 'jsxafteredit' binding
 * @ objGrid (REQUIRED) 		--([object]) object reference to the jsx3.gui.Grid instance being edited
 * @ strRecordId (REQUIRED) 		--(String) name of the attribute being updated (i.e., 'jsxexecute')
 * @ objMask (REQUIRED) 		--([object]) object reference to the given mask that was just dismissed; in this case a menu or a textbox
 * ! returns				--(null/false) if false, the edit will not be committed
 */
jsx3.ide.onXslParameterEdit = function(strRecordId, strValue, objGrid) {
  if (objGrid)
    objGrid.getRecordNode(strRecordId).removeAttribute("jsxmulti");

  //called when the edit mask is about to be committed (jsxafteredit)
  var objJSXs = jsx3.ide.getSelected();
  strValue = jsx3.util.strTrim(strValue);

  for (var i = 0; i < objJSXs.length; i++) {
    if (objJSXs[i].instanceOf(jsx3.xml.Cacheable)) {
      objJSXs[i].setXSLParam(strRecordId, strValue);
      objJSXs[i].repaint();
    }
  }

  jsx3.IDE.publish({subject:jsx3.ide.events.OBJECT_PARAMETER_DID_CHANGE, targets:objJSXs, prop:strRecordId, edit:true});
  return {strNEWVALUE:strValue};
};

jsx3.ide.onXslParameterAdd = function(strName, strValue) {
  jsx3.ide.onXslParameterEdit(strName, strValue);
  jsx3.ide.onXslParameterChange();
};

/**
 * ? onXslParameterMenuExecute()		--called by the MENU edit mask for the grid being edited;
 *					  called because the menu has a bound 'jsxexecute' event that references this handler
 * @ strRecordId (REQUIRED) 		--(String) jsxid value for the CDF record representing the menu item just clicked
 * @ objRecord (OPTIONAL) 		--([object]) NOT IMPLEMENTED (place holder for extension): reference to the CDF record node representing the menu item just clicked
 * ! returns				--(null)
 */
jsx3.ide.onXslParameterDelete = function(strPropName) {
  //called when a menu item is selected for the menu mask
  if (strPropName == null || typeof(strPropName) != "string") {
    var attsEditor = jsx3.IDE.getJSXByName("jsxxslparams");
    strPropName = attsEditor.getValue();
  }

  if (strPropName) {
    var objJSXs = jsx3.ide.getSelected();

    for (var i = 0; i < objJSXs.length; i++) {
      if (objJSXs[i].instanceOf(jsx3.xml.Cacheable)) {
        objJSXs[i].removeXSLParam(strPropName);
        objJSXs[i].repaint();
      }
    }

    jsx3.IDE.publish({subject:jsx3.ide.events.OBJECT_PARAMETER_DID_CHANGE, targets:objJSXs, prop:strPropName});
  }
};

jsx3.ide.onXslParameterChangeSleep = function() {
  jsx3.sleep(jsx3.ide.onXslParameterChange, "jsx3.ide.onXslParameterChange");
};

/**
 * ? onXslParameterChange()		--called by multiple functions to update the model event editor with a list of events appropriate to the selected item in the DOM;
 *					  called directly and by the event dispatcher (e.g., jsx3.ide.events.SELECTED_DOM_DID_CHANGE)
 * ! returns				--(null)
 */
jsx3.ide.onXslParameterChange = function(e) {
  if (e && e.edit === true) return;
  
  //get the selected GUI element in the DOM browser and the attributes editor grid
  var attsEditor = jsx3.IDE.getJSXByName("jsxxslparams");
  var bSuccess = false;

  if (attsEditor) {
    var objJSXs = jsx3.ide.getSelected();

    var arrCache = [];
    for (var i = 0; i < objJSXs.length; i++) {
      if (objJSXs[i].instanceOf(jsx3.xml.Cacheable))
        arrCache.push(objJSXs[i]);
    }

    if (arrCache.length > 0) {
      //reset the xml for the attributes editor
      attsEditor.clearXmlData();

      var same = {}, multi = {};

      for (var i = 0; i < arrCache.length; i++) {
        var objAtts = arrCache[i].getXSLParams();
        for (var p in objAtts) {
          var val = String(objAtts[p]);

          if (i == 0)
            same[p] = val;
          else if (typeof(same[p]) == "undefined")
            multi[p] = true;
          else if (same[p] !== val) {
            multi[p] = true;
            delete same[p];
          }
        }

        for (var p in same) {
          if (typeof(objAtts[p]) == "undefined") {
            multi[p] = true;
            delete same[p];
          }
        }
      }

      //get attributes for current DOM object and loop to create the xml to populate the editor grid
      for (var p in same)
        attsEditor.insertRecord({value:same[p], jsxid:p, jsxtext:p}, null, false);
      for (var p in multi)
        attsEditor.insertRecord({jsxid:p, jsxtext:p, jsxmulti:1}, null, false);

      //repaint the attributes grid to show the updated xml
      attsEditor.repaintData();

      // update the combo box
      var objCombo = jsx3.IDE.getJSXByName("jsxxslparam_name");
      if (objCombo) {
        var arrXML = new jsx3.util.List();
        for (var i = 0; i < arrCache.length; i++) {
          var templateDoc = jsx3.ide.getTemplateForObject("xsl", arrCache[i]);
          if (templateDoc && arrXML.indexOf(templateDoc) < 0)
            arrXML.add(templateDoc);
        }

        if (arrXML.size() == 1) {
          jsx3.IDE.getCache().setDocument(objCombo.getXMLId(), arrXML.get(0));
        } else {
          objCombo.clearXmlData();
        }
      }

      bSuccess = true;
    }

    if (bSuccess) {
      jsx3.IDE.getJSXByName("jsx_ide_xslparams_contentblock").doActivate();
    } else {
      jsx3.IDE.getJSXByName("jsx_ide_xslparams_contentblock").doDeactivate();
    }
  }
};

jsx3.ide.oneOrMoreCacheable = function(arrJSX) {
  var bOk = arrJSX.length > 0;
  for (var i = 0; i < arrJSX.length && bOk; i++) {
    if (! arrJSX[i].instanceOf(jsx3.xml.Cacheable))
      bOk = false;
  }
  return bOk;
};

/* Generic code for Properties, Model Events, & XSL Parameters */

/* @jsxobf-clobber */
jsx3.ide._TEMPLATE_TYPES = {
  prop:  { root: "components/properties", pathMethod: "getPropertiesPath", instanceOf: jsx3.gui.Painted },
  event: { root: "components/modelevents", pathMethod: "getModelEventsPath", instanceOf: jsx3.gui.Interactive },
  xsl:   { root: "components/xslparams", pathMethod: "getXslParamPath", instanceOf: jsx3.xml.Cacheable }
};

/**
 * @param strType {String} prop, event, or xsl.
 * @param objJSX {jsx3.lang.Object}
 * @return {jsx3.xml.Document}
 */
jsx3.ide.getTemplateForObject = function(strType, objJSX) {
  var struct = this._TEMPLATE_TYPES[strType];

  // lazily load the built-in catalog file
  if (! struct.inited) {
    this.loadTemplateCatalog(strType, struct.root + "/templates/catalog.xml");
    struct.inited = true;
  }

  var strPath = null;

  if (typeof(objJSX[struct.pathMethod]) == "function")
    strPath = objJSX[struct.pathMethod]();

  if (strPath == null) {
    var inheritance = objJSX.getClass().getInheritance();
    inheritance.unshift(objJSX.getClass());
    for (var i = 0; strPath == null && i < inheritance.length; i++)
      strPath = struct.registry[inheritance[i].getName()];
  }

  if (strPath) {
    var objXML = jsx3.IDE.getCache().getDocument(strPath);
    if (objXML == null) {
      objXML = new jsx3.xml.CDF.Document().load(strPath);
      jsx3.IDE.getCache().setDocument(strPath, objXML);
    }

    if (objXML.hasError()) {
      jsx3.ide.LOG.warn("Error loading " + strPath + ": " + objXML.getError());
    } else {
      return objXML;
    }
  }

  return null;
};

/**
 * @param strType {String} prop, event, or xsl.
 * @param strPath {String}
 * @param objResolver {jsx3.net.URIResolver}
 * @package  don't obfuscate
 */
jsx3.ide.loadTemplateCatalog = function(strType, strPath, objResolver) {
  var struct = this._TEMPLATE_TYPES[strType];
  if (objResolver == null) objResolver = jsx3.IDE;
  var doc = new jsx3.xml.Document().load(objResolver.resolveURI(strPath));
  for (var i = doc.selectNodeIterator("/data/record"); i.hasNext(); ) {
    var node = i.next();
    this.registerTemplateForClass(strType, node.getAttribute("jsxid"),
        objResolver.resolveURI(node.getAttribute("jsxtext")));
  }
};

/**
 * @param strType {String} prop, event, or xsl.
 * @param strClass {String} the fully-qualified class name.
 * @param strPath {String} the absolute (resolved) path to the template file.
 * @package  don't obfuscate
 */
jsx3.ide.registerTemplateForClass = function(strType, strClass, strPath) {
  var struct = this._TEMPLATE_TYPES[strType];
  if (struct.registry == null) struct.registry = {};
  struct.registry[strClass] = strPath;
};

