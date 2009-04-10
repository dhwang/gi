/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */




/** ON JSX ATTRIBUTES CHANGE *****************************************/
  /*
   * ? onJsxAttributesChange()		--called by dispatcher; notified of any published event to the jsx3.ide.events.OBJECT_ATTRIBUTE_DID_CHANGE subject; for now makes current editor 'dirty'
   * @ objEvent (REQUIRED) 		--([object]) the event as routed by the dispatcher; can be inspected for more information, including: 
   *					  prop (the name of the model event constant such as 'jsxexecute'); target (the JSX instance whose event was just updated)
   * ! returns				--(null)
   */
jsx3.ide.onJsxAttributesChange = function(objEvent) {
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



/** ON ATTRIBUTE EDIT *****************************************/
  /*
   * ? onAttributeEdit()		--called by the edit mask for the grid being edited after user has dismissed the mask, but before edits are committed;
   *					  called because the grid has this handler listed as its 'jsxafteredit' binding
   * @ objGrid (REQUIRED) 		--([object]) object reference to the jsx3.gui.Grid instance being edited
   * @ strRecordId (REQUIRED) 		--(String) name of the attribute being updated (i.e., 'jsxexecute')
   * @ objMask (REQUIRED) 		--([object]) object reference to the given mask that was just dismissed; in this case a menu or a textbox
   * ! returns				--(null/false) if false, the edit will not be committed
   */
jsx3.ide.onAttributeEdit = function(strRecordId, strValue, objGrid) {
  if (objGrid)
    objGrid.getRecordNode(strRecordId).removeAttribute("jsxmulti");

  //called when the edit mask is about to be committed (jsxafteredit)
  var objJSXs = jsx3.ide.getSelected();
  for (var i = 0; i < objJSXs.length; i++) {
    strValue = jsx3.util.strTrim(strValue);

    objJSXs[i].setAttribute(strRecordId, strValue);
    objJSXs[i].repaint();
  }

  jsx3.IDE.publish({subject:jsx3.ide.events.OBJECT_ATTRIBUTE_DID_CHANGE, targets:objJSXs, prop:strRecordId});
  return {strNEWVALUE:strValue};
};

jsx3.ide.onAttributeAdd = function(strRecordId, strValue) {
  jsx3.ide.onAttributeEdit(strRecordId, strValue);
  jsx3.ide.onAttributeChange();
};

/** ON ATTRIBUTE MENU EXECUTE *****************************************/
  /*
   * ? onAttributeMenuExecute()		--called by the MENU edit mask for the grid being edited;
   *					  called because the menu has a bound 'jsxexecute' event that references this handler
   * @ strRecordId (REQUIRED) 		--(String) jsxid value for the CDF record representing the menu item just clicked
   * @ objRecord (OPTIONAL) 		--([object]) NOT IMPLEMENTED (place holder for extension): reference to the CDF record node representing the menu item just clicked
   * ! returns				--(null)
   */
jsx3.ide.onAttributeDelete = function(strPropName) {
  //called when a menu item is selected for the menu mask
  if (strPropName == null || typeof(strPropName) != "string") {
    var attsEditor = jsx3.IDE.getJSXByName("jsxattributes");
    strPropName = attsEditor.getValue();
  }

  if (strPropName) {
    var objJSXs = jsx3.ide.getSelected();
    for (var i = 0; i < objJSXs.length; i++) {
      objJSXs[i].removeAttribute(strPropName);
      objJSXs[i].repaint();
    }
    jsx3.IDE.publish({subject:jsx3.ide.events.OBJECT_ATTRIBUTE_DID_CHANGE, targets:objJSXs, prop:strPropName});
    jsx3.ide.onAttributeChange();
  }
};

jsx3.ide.onAttributeChangeSleep = function() {
  jsx3.sleep(jsx3.ide.onAttributeChange, "jsx3.ide.onAttributeChange");
};

/** ON ATTRIBUTE CHANGE *****************************************/
  /*
   * ? onAttributeChange()		--called by multiple functions to update the model event editor with a list of events appropriate to the selected item in the DOM;
   *					  called directly and by the event dispatcher (e.g., jsx3.ide.events.SELECTED_DOM_DID_CHANGE)
   * ! returns				--(null)
   */
jsx3.ide.onAttributeChange = function() {
  //get the selected GUI element in the DOM browser and the attributes editor grid
  var attsEditor = jsx3.IDE.getJSXByName("jsxattributes");
  var bSuccess = false;

  if (attsEditor) {
    var objJSXs = jsx3.ide.getSelected();

    if (objJSXs.length > 0) {
      //reset the xml for the attributes editor
      attsEditor.clearXmlData();

      var same = {}, multi = {};

      for (var i = 0; i < objJSXs.length; i++) {
        var objAtts = objJSXs[i].getAttributes();
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
      bSuccess = true;
    }
  }

  //deactivate/activate based on given scenario
  if (attsEditor && bSuccess) {
    jsx3.IDE.getJSXByName("jsx_ide_attributes_contentblock").doActivate();
  } else if(attsEditor) {
    jsx3.IDE.getJSXByName("jsx_ide_attributes_contentblock").doDeactivate();
  }
};

