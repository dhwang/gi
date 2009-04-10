/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.onJsxPropertyChange = function(objEvent) {
  //this funciton was registered at startup to listen to the subject: jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE
  var editor = jsx3.ide.getActiveEditor();

  if (editor != null) {
    for (var i = 0; i < objEvent.targets.length; i++) {
      if (objEvent.targets[i].getPersistence() != jsx3.app.Model.PERSISTNONE) {
        editor.setDirty(true);
        break;
      }
    }
  }

  //when this event is triggered via the lookup menu bound to the properties editor grid, a 'lookup' flag is passed, so the props editor is refreshed/repainted

  var objTree = jsx3.IDE.getJSXByName("jsxproperties");
  jsx3.ide.updatePropertyNode(objTree, objEvent.targets, objEvent.prop);

  //3.2 just redraw the cell using the cell valute template
  //objTree.redrawRecord(objEvent.prop, jsx3.xml.CDF.UPDATE);
  objTree.redrawCell(objEvent.prop,objTree.getChild("jsxproperties_value"));
};

jsx3.ide.onPropertyEdit = function(objGrid, strRecordId, strValue) {
  //called when the edit mask is about to be committed (jsxafteredit)
  var objTargets = jsx3.ide.getSelected();
  var propRecord = objGrid.getRecord(strRecordId);

  // Support for typing in the key of a dynamic property directly without using the context menu.
  if (typeof(jsx3.ide.SERVER.getDynamicProperty(strValue)) != "undefined") {
    jsx3.ide._setDynamicProperty(jsx3.IDE.getJSXByName("jsxproperties"), jsx3.ide.getSelected(),
        strRecordId, strValue);
  } else {
    if (typeof(strValue) == "string")
      strValue = jsx3.util.strTrim(strValue);

    jsx3.ide.editObjectProperty(propRecord, objTargets, strRecordId, strValue);
  }

  return false;
};

jsx3.ide.editObjectProperty = function(objRecord, arrObjects, strProp, strInput) {
  // check disallow and validate regex's
  // check clears (null) as though it was an empty string
  var strCheck = strInput != null ? strInput.toString() : "";

  if (objRecord.disallow) {
    var regex = objRecord.disallow.indexOf('/') == 0 ?
        jsx3.eval(objRecord.disallow) : new RegExp(objRecord.disallow);
    if (strCheck.match(regex)) {
      jsx3.ERROR.doLog("IDPR06", "input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strProp + " is invalid, must not match " + regex, 3, false);
      return false;
    }
  }

  if (objRecord.validate) {
    var regex = objRecord.validate.indexOf('/') == 0 ?
        jsx3.eval(objRecord.validate) : new RegExp(objRecord.validate);
    if (! strCheck.match(regex)) {
      jsx3.ERROR.doLog("IDPR07", "input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strProp + " is invalid, must match " + regex, 3, false);
      return false;
    }
  }

  // eval the new text if needed
  if (objRecord["eval"] == "1") {
    try {
      strInput = jsx3.IDE.eval(strInput);
    } catch (e) {
      jsx3.ERROR.doLog("IDPR01", "error evaluating expression '" +
          (strInput != null ? jsx3.util.strEscapeHTML(strInput) : null) + "': " + e.description, 3);
      return false;
    }
  }

  // check for special on edit script
  var changeScript = objRecord["jsxexecute"];

  for (var i = 0; i < arrObjects.length; i++) {
    var objInstance = arrObjects[i];

    if (changeScript != null) {
      // script context
      try {
        jsx3.IDE.eval(changeScript, {vntValue:strInput, objJSX:objInstance});
      } catch (e) {
        jsx3.ERROR.doLog("IDPR02", "error evaluating expression '" + changeScript + "': " + e.description, 3);
        return false;
      }
    } else {
      objInstance[strProp] = strInput;
      objInstance.repaint();
    }
  }

  jsx3.IDE.publish({subject:jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE,
      targets:arrObjects, prop:strProp});

  return true;
};

jsx3.ide.onPropertyBeforeEdit = function(objGrid, objColumn, strRecordId) {
  if (objColumn != objGrid.getChild(1)) return false;

  var objRecord = objGrid.getRecordNode(strRecordId);
  var maskId = objRecord.getAttribute("jsxmask");
  if (!maskId) return false;

  if (objRecord.getAttribute("uneditable") == "1") return false;
  if (objRecord.getAttribute("jsxdynamic") != null) return false;

  var objMask = objColumn.getChild(maskId) || objColumn.getChild("jsxtextbox");

  if (objMask instanceof jsx3.gui.Select) {
    objMask.clearXmlData();

    for (var i = objRecord.selectNodeIterator("enum"); i.hasNext(); ) {
      var enumNode = i.next();
      var value = enumNode.getAttribute('jsxvalue');
      var text = enumNode.getAttribute('jsxtext');
      objMask.insertRecord({jsxid:value, jsxtext:text});
    }

    objMask.redrawRecord(objMask.getValue()); // update the displayed text
  }
  return {objMASK:objMask};
};

jsx3.ide.onPropertyMenu = function(objMenu, strRecordId) {
  //remove xml and cached html for the dynprop menu
  jsx3.IDE.getCache().clearById("jsxmenu_properties_xml");
  objMenu.clearCachedContent();

  //get handles to objects (xml and jsx)
  var objRoot = objMenu.getXML().getRootNode();
  var objP = jsx3.IDE.getJSXByName("jsxproperties");

  //get all lookups that match the property we're editing
  var objXML = jsx3.IDE.getCache().getDocument("properties");
  var objRecord = objP.getRecordNode(strRecordId);

  if (objRecord.getAttribute("uneditable") == "1") return false;
//  if (objRecord.getAttribute("jsxdynamic") == "1") return false;
  if (objRecord.selectSingleNode("record") != null) return false; // ignore groups

  // support nullable="0"
  objMenu.enableItem('jsxdpclear', objRecord.getAttribute("nullable") !== "0");

  // the dynprops type will either be the jsxtype attribute of the props record, or default to the jsxid
  var type = objRecord.getAttribute("jsxtype");
  if (! type) type = strRecordId;

  // get all dynprops that match the property we're editing
  var list = jsx3.ide.getPropertyIdsForType(type);

  for (var i = 0; i < list.length; i++) {
    var record = objRoot.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
    record.setAttribute("jsxid", list[i]);
    record.setAttribute("jsxtext", list[i]);
    if (i == 0)
      record.setAttribute("jsxdivider", "1");
    objRoot.appendChild(record);
  }

  // enabled dynaprop item only if set
  var objJSX = jsx3.ide.getSelected();
  var enable = true;
  for (var i = 0; i < objJSX.length && enable; i++)
    enable = enable && objJSX[i].getDynamicProperty(strRecordId) != null;

  objMenu.enableItem('jsxdpconvert', enable);

  return true;
};

jsx3.ide.onPropertyMenuExecute = function(objMenu, strRecordId) {
  //called when a menu item is selected; get its id; two are standard; all others are lookups
  var objJSXs = jsx3.ide.getSelected();
  var oPE = jsx3.IDE.getJSXByName("jsxproperties");
  var strPropName = objMenu.getContextRecordId();
  var objRecord = oPE.getRecordNode(strPropName);
  var strLookupId;

  if (strRecordId == "jsxdpclear") {
    for (var i = 0; i < objJSXs.length; i++)
    //user wants to null the value; clear any lookup (dp) or embedded values
      objJSXs[i].setDynamicProperty(strPropName);
    jsx3.ide.editObjectProperty(oPE.getRecord(strPropName), objJSXs, strPropName, null);
  } else if (strRecordId == "jsxdpconvert") {
    //user wants to convert the dynprop (just remove the dynprop, the value's already there)
    for (var i = 0; i < objJSXs.length; i++)
      objJSXs[i].setDynamicProperty(strPropName);

    //update the properties editor
    jsx3.IDE.publish({subject:jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE,
        targets:objJSXs, prop:strPropName, lookup:true});
  } else if ((strLookupId = objRecord.getAttribute("lookupid")) != null) {
    //user chose a lookup/constant; clear any bound dynprop then set the value as embedded
    for (var i = 0; i < objJSXs.length; i++)
      objJSXs[i].setDynamicProperty(strLookupId);

    var newVal = objRecord.getAttribute("eval") === "0" ?
        strRecordId : jsx3.IDE.eval(strRecordId);

    jsx3.ide.editObjectProperty(oPE.getRecord(strPropName), objJSXs, strPropName, newVal);
  } else {
    //user wants to set a dynprop
    //TO DO: support contstants/lookups
    jsx3.ide._setDynamicProperty(oPE, objJSXs, strPropName, strRecordId);
  }

  jsx3.ide.updatePropertyNode(null, objJSXs, null, objRecord);

  oPE.redrawRecord(strPropName, jsx3.xml.CDF.UPDATE, oPE.getChild("jsxproperties_value"));
};

/* @jsxobf-clobber */
jsx3.ide._setDynamicProperty = function(objMatrix, objJSXs, strPropName, strKey) {
  for (var i = 0; i < objJSXs.length; i++)
    objJSXs[i].setDynamicProperty(strPropName, strKey);

  jsx3.ide.editObjectProperty(objMatrix.getRecord(strPropName), objJSXs, strPropName,
      objJSXs[0].getServer().getDynamicProperty(strKey));
};

jsx3.ide.onPropertiesChangeSleep = function() {
  jsx3.sleep(jsx3.ide.onPropertiesChange, "jsx3.ide.onPropertiesChange");
};

jsx3.ide.onPropertiesChange = function() {
  var propsPalette = jsx3.IDE.getJSXByName("jsxproperties");
  if (propsPalette == null) return;

  //get the selected GUI element in the DOM browser
  var arrJSX = jsx3.ide.getSelected();

  var success = false;

  if (arrJSX.length > 0) {
    var objXML = jsx3.ide.getMergedPropertiesDoc(arrJSX);
    if (objXML != null) {
      //update the cache document used by the properties editor grid to use the new, filled-out version just populated
      jsx3.IDE.getCache().setDocument(propsPalette.getXMLId(), objXML);
      success = true;
    }
  } else {
    jsx3.IDE.getCache().setDocument(propsPalette.getXMLId(), jsx3.xml.CDF.newDocument());
  }

  //3.2 addition to handle more-efficient repainting of matrix content when only the data changes, not the actual structures
  if (success) {
    propsPalette.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    propsPalette.repaintData();
  } else {
    propsPalette.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
  }
};

jsx3.ide.getMergedPropertiesDoc = function(arrJSX) {
  var setXML = new jsx3.util.List();
  var arrXML = new Array(arrJSX.length);

  for (var i = 0; i < arrJSX.length; i++) {
    if (! arrJSX[i]) return null;
    arrXML[i] = jsx3.ide.getClassPropertiesDoc(arrJSX[i]);
    if (! arrXML[i]) return null;

    if (setXML.indexOf(arrXML[i]) < 0)
      setXML.add(arrXML[i]);
  }

  var objNodes = null;

  if (setXML.size() == 1) {
    var objXML = arrXML[0];

    for (var i = objXML.selectNodeIterator("//record[not(@group)]"); i.hasNext(); )
      jsx3.ide.updatePropertyNode(null, arrJSX, null, i.next());

    return objXML;
  } else {
    for (var i = 0; i < arrJSX.length; i++) {
      var objJSX = arrJSX[i];
      var objXML = arrXML[i];

      if (i == 0) {
        objNodes = new jsx3.util.List(objXML.selectNodes("//record[not(@group)]").toArray());
      } else {
        for (var j = objNodes.iterator(); j.hasNext(); ) {
          var objNode = j.next();
          var strProp = objNode.getAttribute("jsxid");
          if (objXML.selectSingleNode("//record[not(@group) and @jsxid='" + strProp + "']") == null)
            j.remove();
        }
      }
    }

    // Create new document with the union of the nodes
    var objXML = new jsx3.xml.Document().loadXML('<data jsxid="jsxroot"/>');
    for (var j = objNodes.iterator(); j.hasNext(); )
      objXML.appendChild(j.next().cloneNode(true));

    objNodes = objXML.selectNodes("//record");
  }

  for (var i = objNodes.iterator(); i.hasNext(); )
    jsx3.ide.updatePropertyNode(null, arrJSX, null, i.next());

  return objXML;
};

jsx3.ide.updatePropertyNode = function(objTree, arrJSX, strPropName, objNode) {
  if (objNode == null)
    objNode = objTree.getRecordNode(strPropName);
  else if (strPropName == null)
    strPropName = objNode.getAttribute("jsxid");

  var strGetter = objNode.getAttribute("getter");
  strPropName = objNode.getAttribute("jsxid");

  if (! (arrJSX instanceof Array)) arrJSX = [arrJSX];

  var endVal = null, envDynVal = null, endMultiVal = null;
  for (var i = 0; i < arrJSX.length; i++) {
    var objJSX = arrJSX[i];
    var stepVal = null, stepDynVal = null;

    stepDynVal = objJSX.getDynamicProperty(strPropName);
    if (strGetter) {
      //check for null on getter
      stepVal = objJSX[strGetter]();
    } else if (objJSX[strPropName] != null) {
      stepVal = objJSX[strPropName];
    }

    if (i == 0) {
      endVal = stepVal;
      envDynVal = stepDynVal;
    } else {
      // TODO: more exact definition of equals
      if (endVal !== stepVal || envDynVal !== stepDynVal) {
        endMultiVal = 1;
        endVal = envDynVal = null;
        break;
      }
    }
  }

  objNode.setAttribute("value", endVal);
  objNode.setAttribute("jsxdynamic", envDynVal);
  objNode.setAttribute("jsxmulti", endMultiVal);
};

jsx3.ide.getClassPropertiesDoc = function(objJSX) {
  var cache = jsx3.IDE.getCache();
  var cachedDocId = "PROPERTIES_TEMPLATE_" + objJSX.getClass().getName();
  var cachedDoc = cache.getDocument(cachedDocId);
  if (cachedDoc != null)
    return cachedDoc/*.cloneDocument()*/;

  var objXML = jsx3.ide.getTemplateForObject("prop", objJSX);
  if (objXML == null) return null;
  var objPathURI = new jsx3.net.URI(objXML.getSourceURL());

  objXML.convertProperties(jsx3.IDE.getProperties());

  var objNodes = null;
  var times = 0;
  do {
    objNodes = objXML.selectNodes("//record[@include]");

    for (var i = objNodes.iterator(); i.hasNext(); ) {
      var objNode = i.next();
      var strURL = objNode.getAttribute("absinclude");
      if (strURL == null)
        strURL = objPathURI.resolve(objNode.getAttribute("include")).toString();

//      jsx3.out("getClassPropertiesDoc 1", strPath + " -> " + objNode.getAttribute("include") + " = " + strURL, null, false)
      var strMasterPath = objNode.getAttribute("path");
      var strGroup = objNode.getAttribute("group");
      var strChildren = objNode.getAttribute("children");

      var cacheId = "PROPERTIES_MASTER_" + strURL;
      var objMaster = cache.getDocument(cacheId);
      if (objMaster == null) {
        objMaster = cache.openDocument(strURL, cacheId);
        if (objMaster.hasError()) {
          jsx3.ide.LOG.error("Error parsing properties file '" + strURL +
              "' for class " + objJSX.getClass() + ": " + objMaster.getError());
          return null;
        }
      }

      if (! strMasterPath && strGroup)
        strMasterPath = "/data/record[@jsxid = '" + strGroup + "']" + (strChildren ? "/*" : "");

      if (! strMasterPath) strMasterPath = "/data/*";

      var firstReplacement = null;
      for (var j = objMaster.selectNodeIterator(strMasterPath); j.hasNext(); ) {
        var clone = j.next().cloneNode(true);
        // so that includes from includes resolve correctly
        jsx3.ide.fixPropsIncludeAttr(clone, strURL);

        if (firstReplacement == null) firstReplacement = clone;
        var result = objNode.getParent().insertBefore(clone, objNode);
        if (result.getNative() == null)
          jsx3.ide.LOG.error("insert failed");
      }

      // add children of removed node to the first replacement node
      if (firstReplacement != null) {
        for (var j = objNode.selectNodeIterator("./record"); j.hasNext(); ) {
          firstReplacement.appendChild(j.next());
        }
      }

      var result = objNode.getParent().removeChild(objNode);
      if (result.getNative() == null)
        jsx3.ide.LOG.error("remove failed");
    }
  } while (objNodes.size() > 0 && times++ < 6);

  // cache eval'ed values of enums
  for (var i = objXML.selectNodeIterator("//enum"); i.hasNext(); ) {
    var objNode = i.next();
    var value = objNode.getAttribute('jsxid');
    if (objNode.getAttribute("eval") !== "0")
        value = jsx3.eval(value);
    objNode.setAttribute('jsxvalue', value);
  }

  // open groups
  for (var i = objXML.selectNodeIterator("//record[record]"); i.hasNext(); ) {
    var objNode = i.next();
    objNode.setAttribute('jsxopen', '1');
    objNode.setAttribute('jsxunselectable', '1');
  }

  cache.setDocument(cachedDocId, objXML);
  return objXML;
};

jsx3.ide.fixPropsIncludeAttr = function(objNode, strURL) {
  var objPathURI = new jsx3.net.URI(strURL);
  var queue = jsx3.util.List.wrap([objNode]);

  while (queue.size() > 0) {
    var node = queue.removeAt(0);

    var includePath = node.getAttribute('include');
    if (includePath)
      node.setAttribute('absinclude', objPathURI.resolve(includePath).toString());

    queue.addAll(node.selectNodes("record"));
  }
};

/////////  LOGIC TO SUPPORT THE DYNAMIC PROPERTIES EDITOR /////////////////////////

jsx3.ide.onDPMenu = function() {

};

jsx3.ide.onDPMenuExecute = function(objGrid,strRecordId,objRecord,objMask) {
  //called when a menu item is selected; get its id; two are standard; all others are lookups
  var bReturn = true;
  var objGUI = objGrid.getDocument().getElementById(objGrid._jsxrowid);
  if(objGUI != null) {
    objGUI = objGUI.childNodes[objGrid._jsxcellindex];
    if(objGUI != null && strRecordId == "@jsxdpcancel") {
      bReturn = false;
    } else if(objGUI != null) {
      objGrid.updateCell();
    }

    //give focus back to the element that spawned this menu mask
    if(objGUI != null) {
      objGrid.doFocusItem(objGUI);
    }
  }
  jsx3.ide.setActiveEditorDirty();
  return bReturn;
};

jsx3.ide.toggleDPEval = function(strJSXId,objCheck) {
  //called when a checkbox is checked in the dp editor; sets the value in the CDF
  //is the checkbox checked?
  var bEval = objCheck.checked;

  //the CDF jsxid for the record being edited is always stored as an attribute of the row representing the CDF record (JSXDragId)
  var strId = objCheck.parentNode.parentNode.getAttribute("JSXDragId");

  //get the given dp grid being edited
  var objGrid = jsx3.IDE.getJSX(strJSXId);
  if(bEval && strId) {
    objGrid.insertRecordProperty(strId,"eval","1",false);
  } else {
    objGrid.deleteRecordProperty(strId,"eval",false);
  }
  jsx3.ide.setActiveEditorDirty();
};

jsx3.ide.removeDP = function(strRecordId, objMatrix) {
  objMatrix.deleteRecord(strRecordId, true);
  jsx3.ide.setActiveEditorDirty();
};

/**
 * {String<String>} lookup table from JSS jsxid to type
 * @private @jsxobf-clobber
 */
jsx3.ide.PROP_TYPE_INDEX = null;
/**
 * {String<Array<String>>} lookup table from type to array of jsxids
 * @private @jsxobf-clobber
 */
jsx3.ide.PROP_TYPE_GROUPS = null;

/**
 * Called once after a project loads in Builder. This method searches through all cache documents in the
 * JSX shared cache as well as the server cache for JSS documents. It then creates an index by the CDF attribute
 * <code>type</code> of all JSS properties. After this method has run once, calling
 * <code>jsx3.ide.getPropertyIdsForType()</code> returns an array of all the loaded JSS properties defined with
 * a particular type value.
 */
jsx3.ide.constructPropertyTypeIndex = function() {
  var index = (jsx3.ide.PROP_TYPE_INDEX = {});
  var caches = [jsx3.getSystemCache(), jsx3.getSharedCache(), jsx3.ide.SERVER.getCache()];

  for (var k = 0; k < caches.length; k++) {
    var cache = caches[k];
    var cacheKeys = cache.keys();

    for (var i = 0; i < cacheKeys.length; i++) {
      var doc = cache.getDocument(cacheKeys[i]);
      if (doc != null) {

        if (doc.hasError()) {
          jsx3.ide.LOG.warn("XML property file has error: " + doc.getSourceURL());
          continue;
        }

        var recordParent = doc;
        if (doc.getAttribute("jsxnamespace") == "propsbundle")
          recordParent = doc.selectSingleNode("//locale[not(@key)]");

        if (recordParent)
          for (var j = recordParent.getChildIterator(); j.hasNext(); ) {
            var child = j.next();
            if (child.getNodeName() == "record") {
              var type = child.getAttribute("type");
              if (type) {
                var id = child.getAttribute("jsxid");
                index[id] = type;
              }
            }
          }
      }
    }
  }
  
  var groups = (jsx3.ide.PROP_TYPE_GROUPS = {_empty:[]});
  for (var f in index) {
    var type = index[f];
    if (groups[type] == null) groups[type] = [];
    groups[type].push(f);
  }
};

/**
 * @return {Array<String>}
 */
jsx3.ide.getPropertyIdsForType = function(strType) {
  return jsx3.ide.PROP_TYPE_GROUPS[strType] || jsx3.ide.PROP_TYPE_GROUPS["_empty"];
};

jsx3.ide.onPropsSetText = function(objJSX, strText) {
  if (jsx3.util.strEndsWith(jsx3.app.Browser.getLocation().getPath(), ".xhtml")) {
    var doc = new jsx3.xml.Document().loadXML("<jsxtext>" + strText + "</jsxtext>");
    if (doc.hasError()) {
      jsx3.ide.LOG.error("When working in XHTML mode, the jsxtext property must be well-formed XML. (" +
          doc.getError() + ")");
      return false;
    }
  }

  objJSX.setText(strText, true);
  return true;
};

jsx3.ide.openColorPickerMask = function(objMask) {
  var picker = jsx3.IDE.getRootBlock().loadAndCache("components/colorpicker/colorpicker.xml", false);

  // make modal
  picker.setModal(jsx3.gui.Dialog.MODAL);

  // remove bar buttons
  var btns = picker.getDescendantsOfType(jsx3.gui.ToolbarButton);
  for (var i = 0; i < btns.length; i++) {
    var btn = btns[i];
    btn.getParent().removeChild(btn);
  }

  // adjust preview
  var preview = picker.getDescendantOfName("preview");
  preview.setHeight(preview.getHeight() - 24);

  // create cancel button
  var cancelBtn = new jsx3.gui.Button("cancelBtn", 0, 226, "100%", "Cancel");
  cancelBtn.setRelativePosition(0);
  cancelBtn.setKeyBinding("ctrl+.");
  preview.getParent().setChild(cancelBtn);

  var colorPickerMaskCancel = "colorPickerMaskCancel"; // obf
  cancelBtn.setEvent("jsx3.ide." + colorPickerMaskCancel + "(objEVENT, this.getAncestorOfName('" + picker.getName() + "'));",
      jsx3.gui.Interactive.EXECUTE);

  // create exec button
  var execBtn = new jsx3.gui.Button("execBtn", 0, 246, "100%", "Choose");
  execBtn.setRelativePosition(0);
  execBtn.setFontWeight(jsx3.gui.Block.FONTBOLD);
  execBtn.setKeyBinding("enter");
  preview.getParent().setChild(execBtn);

  var colorPickerMaskChoose = "colorPickerMaskChoose"; // obf
  execBtn.setEvent("jsx3.ide." + colorPickerMaskChoose + "(objEVENT, this.getAncestorOfName('" + picker.getName() + "'));",
      jsx3.gui.Interactive.EXECUTE);

  objMask.suspendEditSession();
  picker.getDescendantOfName("colorPicker").setValue(objMask.getMaskValue());
  picker.onColorPick(picker.getDescendantOfName("colorPicker").getRGB());
  picker.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
  picker._jsxmask = objMask;

  picker.getParent().paintChild(picker);

  picker.focus();
};

/* @jsxobf-clobber */
jsx3.ide.colorPickerMaskChoose = function(objEvent, picker) {
  var objMask = picker._jsxmask;

  var intRGB = picker.getDescendantOfName("colorPicker").getRGB();
  var hex = "#" + (0x1000000 + intRGB).toString(16).substring(1).toUpperCase();
  objMask.setMaskValue(hex);
  picker.doClose();
  objMask.getDescendantOfName("btnBrowse").focus();

  objMask.resumeEditSession();
  objMask.commitEditMask(objEvent, true);
};

/* @jsxobf-clobber */
jsx3.ide.colorPickerMaskCancel = function(objEvent, picker) {
  var objMask = picker._jsxmask;
  picker.doClose();
  objMask.getDescendantOfName("btnBrowse").focus();
  objMask.resumeEditSession();
};

jsx3.ide.openCdfMask = function(objMask) {
  //load the dialog mask (load it into the IDE namespace, but resolve the location of the component using the addin
  var columneditor = jsx3.IDE.getRootBlock().loadAndCache("components/columneditor/columneditor.xml", false);

  //load the CDF profile data into the editor
  var objEditor = columneditor.getDescendantsOfType(jsx3.gui.Matrix)[0];
  var strCDF = objMask.getMaskValue();
  var objCDF = new jsx3.xml.CDF.Document.newDocument();
  if(!jsx3.util.strEmpty(strCDF)) {
    objCDF.loadXML(strCDF);
    if(objCDF.hasError()) {
      jsx3.log("Error with cdf document. " + objCDF.getError().description);
      objCDF = new jsx3.xml.CDF.Document.newDocument();
    }
  }
  objEditor.getServer().getCache().setDocument(objEditor.getXMLId(),objCDF);

  // add events to OK and cancel buttons
  var execBtn = columneditor.getDescendantOfName("execBtn");
  var cdfMaskChoose = "cdfMaskChoose"; // obf
  execBtn.setEvent("jsx3.ide." + cdfMaskChoose + "(objEVENT, this.getAncestorOfName('" + columneditor.getName() + "'));",jsx3.gui.Interactive.EXECUTE);
  var cancelBtn = columneditor.getDescendantOfName("cancelBtn");
  var cdfMaskCancel = "cdfMaskCancel"; // obf
  cancelBtn.setEvent("jsx3.ide." + cdfMaskCancel + "(objEVENT, this.getAncestorOfName('" + columneditor.getName() + "'));",jsx3.gui.Interactive.EXECUTE);

  //add events to prioritize and deprioritize buttons
  var cdfPrioritizeRow = "cdfPrioritizeRow";
  var objBtnUp = columneditor.getDescendantOfName("ibUp");
  objBtnUp.setEvent("jsx3.ide." + cdfPrioritizeRow + "(this.getAncestorOfType(jsx3.gui.Matrix),this.emGetSession().recordId,true);",jsx3.gui.Interactive.EXECUTE);
  var objBtnDown = columneditor.getDescendantOfName("ibDown");
  objBtnDown.setEvent("jsx3.ide." + cdfPrioritizeRow + "(this.getAncestorOfType(jsx3.gui.Matrix),this.emGetSession().recordId,false);",jsx3.gui.Interactive.EXECUTE);

  //suspend edit session and paint/focus the dialog mask
  objMask.suspendEditSession();
  columneditor._jsxmask = objMask;
  columneditor.getParent().paintChild(columneditor);
  columneditor.focus();
};

/* @jsxobf-clobber */
jsx3.ide.cdfMaskChoose = function(objEvent, columneditor) {
  var objMask = columneditor._jsxmask;
  var objEditor = columneditor.getDescendantsOfType(jsx3.gui.Matrix)[0];
  var strValue = objEditor.getXML().getXML();
  objMask.setMaskValue(strValue);
  columneditor.doClose();
  objMask.getDescendantOfName("btnBrowse").focus();
  objMask.resumeEditSession();
  objMask.commitEditMask(objEvent, true);
};

/* @jsxobf-clobber */
jsx3.ide.cdfMaskCancel = function(objEvent, columneditor) {
  var objMask = columneditor._jsxmask;
  columneditor.doClose();
  objMask.getDescendantOfName("btnBrowse").focus();
  objMask.resumeEditSession();
};

/* @jsxobf-clobber */
jsx3.ide.cdfPrioritizeRow = function(objMtx,strCDFId,bUp) {
  //get the selected item and move up or down
  if (!strCDFId) return;
  var objNode = objMtx.getRecordNode(strCDFId);
  if (objNode) {
    var objParentNode = objNode.getParent();
    if(bUp) {
      var objPrev = objNode.getPreviousSibling();
      if(objPrev) {
        objParentNode.insertBefore(objNode, objPrev);
        objMtx.repaintData();
      }
    } else {
      var objNext = objNode.getNextSibling();
      if(objNext) {
        objParentNode.insertBefore(objNext, objNode);
        objMtx.repaintData();
      }
    }
  }
};
