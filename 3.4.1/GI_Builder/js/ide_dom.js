/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.ROOT_DOM_NODE_ID = "_jsxdomroot";

jsx3.ide.onDomChangeSleep = function() {
  jsx3.sleep(jsx3.ide.onDomChange, "jsx3.ide.onDomChange");
};

/** ON DOM CHANGE ****************************************************/
jsx3.ide.onDomChange = function(bNoEvent) {
  //build out the dom tree to reflect the hierarchy of this component
  var objTree = jsx3.IDE.getJSXByName("jsxdom");
  if (objTree != null && jsx3.ide.ComponentEditor && jsx3.ide.getActiveEditor() instanceof jsx3.ide.ComponentEditor) {
    var selectedIds = objTree.getValue();
    objTree.setDynamicProperty("jsxbgcolor","@Solid Light");
    objTree.clearXmlData();

    //configure specifically if the root item exists (not a new, untitled component)
    var server = jsx3.ide.getActiveServer();
    if (server != null) {
      var objRoot = server.getBodyBlock();
      if (objRoot)
        jsx3.ide.buildTree(objTree,objRoot);
    }

    objTree.setValue(selectedIds);
    var newValues = objTree.getValue();

    if (! jsx3.util.List.wrap(selectedIds).equals(jsx3.util.List.wrap(newValues)))
      jsx3.ide.triggerDomTreeSelect(objTree, newValues);

    for (var i = 0; i < newValues.length; i++)
      objTree.revealRecord(newValues[i]);

    objTree.repaint();
  }
};

/** @private @jsxobf-clobber */
jsx3.ide.triggerDomTreeSelect = function(objTree, strRecordIds) {
  objTree.setValue(strRecordIds);
  objTree.getAncestorOfName('jsx_ide_props_dom').onSelect(objTree);
};

/** DO DOM CLICK ****************************************************/
jsx3.ide.doDomClick = function(objEvent) {
  //called by ctrl+click event within the stage/dev area
  var objJSX = jsx3.html.getJSXParent(objEvent.srcElement());
  if (jsx3.gui.isMouseEventModKey(objEvent) && objJSX) {
    //select the nearest JSX ancestor in the VIEW that would contain the element ctrl-clicked by the user
    var objTree = jsx3.IDE.getJSXByName("jsxdom");

    if (objTree) {
      jsx3.ide.triggerDomTreeSelect(objTree, [objJSX.getId()]);
      //traverse up the parent hierarchy in the tree to open each subsequent 'folder', so the selected item is shown in the DOM browser tree
      jsx3.ide.revealItemInDom(objJSX, objTree);
      jsx3.ide.showFocusRectangle(null, null, true);
    }
  }
};

jsx3.ide.revealItemInDom = function(objJSX, objTree) {
//  jsx3.log("revealItemInDom " + objJSX.getName());
  if (objTree == null)
    objTree = jsx3.IDE.getJSXByName("jsxdom");

  var objBody = objJSX.getServer().getBodyBlock();
  var objNode = objJSX;
  while ((objNode = objNode.getParent()) != null && objNode != objBody)
    objNode._jsxideopen = true;

  objTree.revealRecord(objJSX.getId(), objTree.getParent());
};


/** DO DOM TOGGLE **************************************************/
jsx3.ide.doDomToggle = function(strJSXId,bOpen) {
  var objJSX = jsx3.GO(strJSXId);
  //sets flag on jsx gui object denoting its open/close state as shown in the IDE's DOM Browser Palette. This property is ephemeral (i.e., "_jsx...") and is not serialized with the object
  if (objJSX) {
    if (bOpen) {
      objJSX._jsxideopen = true;
    } else {
      delete objJSX._jsxideopen;
    }
  }
};



/** GET DOM IMAGE ****************************************************/
jsx3.ide.getDomImage = function(objJSX) {
  //first, determine if this node has a reference to an originating prototype; this will force the use of a different icon (use check for now)
  var PERSIST = objJSX.getPersistence();
  var PERSISTURL = objJSX.getPersistenceUrl();
  if(PERSISTURL == null) PERSISTURL = objJSX.getMetaValue("url");

  if (PERSIST == jsx3.app.Model.PERSISTREF) {
    return "images/icon_71.gif";
  } else if(PERSIST == jsx3.app.Model.PERSISTREFASYNC) {
    return "images/icon_69.gif";
  } else if (objJSX.jsxannotation) {
    return "images/icon_89a.gif";
  } else {
    return "images/icon_89.gif";
  }
};


jsx3.ide.checkDomAnnotationChange = function(e) {
  if (e.prop == 'jsxannotation')
    jsx3.ide.onDomChangeSleep();
};

jsx3.ide.domSpyGlass = function(objTree, strRecordId) {
  var objJSX = jsx3.GO(strRecordId);
  if (!(objJSX && objJSX.jsxannotation)) return null;

  return '<span style="width:200px;">' + objJSX.jsxannotation + "</span>";
};

/** GET DOM TEXT ****************************************************/
jsx3.ide.getDomText = function(objJSX) {
  //first, determine if this node has a reference to an originating prototype; this will force the use of a different icon (use check for now)
  var persistence = objJSX.getPersistence();

  if (persistence == jsx3.app.Model.PERSISTREF || persistence == jsx3.app.Model.PERSISTREFASYNC) {
    var path = new jsx3.net.URI(objJSX.getPersistenceUrl()).getPath();
    if (path)
      return objJSX.getName() + " : " + path.substring(path.lastIndexOf("/") + 1);
    else
      return objJSX.getName();
  } else {
    return objJSX.jsxname;
  }
};



/** BUILD TREE ****************************************************/
jsx3.ide.buildTree = function(objTree,objJSX,strParentId,bNoEmbed) {
  //italics will denote any item that isn't permanant to the serialization file
  //gray will denote an ephemeral state
  //blue/green will ref outside files
  //save icon will mean the component is aware of its original source

  //create record object (will become a record node in the CDF)
  var o = {};

  //is this a null object? (is this a new component?)
  if(strParentId == null) {
    var editor = jsx3.ide.getActiveEditor();
    //THIS IS A NEW AND EMPTY TREE WITH NO INFORMATION; JUST SHOW 'UNTITLED' TO THE USER
    o.jsxid = jsx3.ide.ROOT_DOM_NODE_ID;
    o.jsxtext = editor.getTabName();
    o.jsximg = "images/icon_46.gif";
    o.jsxopen = "1";
    var bFirst = true;
  } else {
    var bFirst = false;
    // determine the persistence (if this is the root element, show it as embedded, because it is essentially "embedded" as a child of the file on-disk)
    var intPersist = objJSX.getPersistence();

    //build out the style
    var strStyle = "";
    if (intPersist == jsx3.app.Model.PERSISTNONE || bNoEmbed) {
      strStyle = "font-style:italic;color:#c8c8c8;";
    } else if(intPersist == jsx3.app.Model.PERSISTREF) {
      //ref
      strStyle = "font-style:italic;color:blue;";
    } else if(intPersist == jsx3.app.Model.PERSISTREFASYNC) {
      //ref-async
      strStyle += "font-style:italic;color:green;";
    }

    //assume the tree should stay open by default
    o.jsxid = objJSX.getId();
    if (objJSX._jsxideopen || (typeof(objJSX._jsxideopen) == "undefined" && strParentId == jsx3.ide.ROOT_DOM_NODE_ID))
      o.jsxopen = "1";
    o.jsximg = jsx3.ide.getDomImage(objJSX);
    o.jsxtext = jsx3.ide.getDomText(objJSX);
    o.jsxstyle = strStyle;
  }

  //insert; recurse to populate descendants
  objTree.insertRecord(o,strParentId,false);
  if (intPersist == null || intPersist == jsx3.app.Model.PERSISTNONE || intPersist == jsx3.app.Model.PERSISTEMBED) {
    var objKids = objJSX.getChildren();
    var maxLen = objKids.length;

    for (var i=0;i<maxLen;i++)
      jsx3.ide.buildTree(objTree, objKids[i], o.jsxid, (strParentId != null &&
          (intPersist == jsx3.app.Model.PERSISTNONE || bNoEmbed)));
  }
};


//////////////////////// LOGIC USED to manage the DOM ////////////////////////



/** IS DESCENDANT *********************************************/
jsx3.ide.isDescendant = function(child,parent) {
  //called by ondomdrop; makes sure a child doesn't adopt a parent (causes infinite loop and is likewise stupid)
  var fn = function(x) {return x == parent;};
  return (child.findAncestor(fn, false) != null);
};


/** ON DOM DROP *********************************************/
jsx3.ide.onDomDrop = function(strJSXSourceId, strParentRecordId, strRecordIds, objDomTree,
                              bCtrl, bInsertBefore, bStageDrop, bConfirm) {
  //get JavaScript object representation of the record that was just dropped
  var bSuccess = false;
  var objCurParent = jsx3.GO(strJSXSourceId);
  if (objCurParent == null || ! objCurParent.instanceOf(jsx3.xml.CDF)) return;

  //get handle to DOM object that will be the parent for either the adoption or deserialization event
  var objJSXParent = jsx3.GO(strParentRecordId);
  if (objJSXParent == null) objJSXParent = jsx3.ide.getActiveServer().getBodyBlock();

  //make sure that the object receiving the drop has the correct persistence profile (referenced includes can't accept drop events)
  if (strParentRecordId == strJSXSourceId) {
    //happens when a tree in the stage implements a drop listener; stops adoption errors
  } else if (objJSXParent.getPersistence() == jsx3.app.Model.PERSISTREF || objJSXParent.getPersistence() == jsx3.app.Model.PERSISTREFASYNC) {
    jsx3.ERROR.doLog("ide1","The drop could not be processed, because the receiving element is a referenced component and is uneditable within the current context.");
  } else {
    var bChildOfRoot = objJSXParent == objJSXParent.getServer().getBodyBlock();

    if (!bConfirm && bChildOfRoot && objJSXParent.getChildren().length > 0) {
      jsx3.IDE.confirm(null, "Saving multiple root objects is not supported. Would you like to create a root block and " +
          "add the current root object and this object as its children?",
          function(d) {
            d.doClose();
            var server = objJSXParent.getServer();
            jsx3.ide.createNewRootBlock(server);
            jsx3.ide.onDomDrop(strJSXSourceId, server.getBodyBlock().getChild(0).getId(),
                strRecordIds, objDomTree, bCtrl, bInsertBefore, bStageDrop);
          }, null, null, null, 1,
          function(d) {
            d.doClose();
            jsx3.ide.onDomDrop(strJSXSourceId, strParentRecordId, strRecordIds, objDomTree, bCtrl,
                bInsertBefore, bStageDrop, true);
          }, "Ignore");
      return false;
    }

    if (objCurParent == objDomTree) {
      for (var i = 0; i < strRecordIds.length; i++) {
        var strRecordId = strRecordIds[i];
        if (strParentRecordId == strRecordId) continue;

        var objChild = jsx3.GO(strRecordId);
        // no error as this commonly happens just ignore when a node is dropped on itself
        if (jsx3.ide.isDescendant(objJSXParent, objChild)) continue;

        // need to set the other editor dirty as well
        if (objChild.getServer() != objJSXParent.getServer()) {
          var otherEditor = jsx3.ide.getEditorForJSX(objChild);
          if (objChild.getPersistence() != jsx3.app.Model.PERSISTNONE)
            otherEditor.setDirty(true);
        }

        // if destination is as a root node, then change persistence to embed
        if (bChildOfRoot && objChild.getPersistence() != jsx3.app.Model.PERSISTEMBED)
          objChild.setPersistence(jsx3.app.Model.PERSISTEMBED);

        var result = bInsertBefore ?
                     objJSXParent.getParent().insertBefore(objChild, objJSXParent, true) :
                     objJSXParent.adoptChild(objChild, true);
        if (result !== false) {
          if (bStageDrop)
            jsx3.ide.moveNewComponentToProperPlace(objChild);
          bSuccess = true;
        }
      }
    } else if (objCurParent.getName() == "ide_component_libs_tree") {
      var objRecord = objCurParent.getRecord(strRecordIds[0]);

      //get the path for this object
      var myPath = objRecord.path;
      var objResolver = jsx3.net.URIResolver.getResolver(myPath);

      // do not allow ref persistence if this is a parent of ROOT
      // user dragged from the component prototype libraries; check the drag type, so we get the persistence correct
      var persist = jsx3.app.Model.PERSISTEMBED;

      if (bCtrl && !bChildOfRoot) {
        persist = jsx3.app.Model.PERSISTREF;
      } else {
        if (objResolver != jsx3.net.URIResolver.DEFAULT) {
          myPath = jsx3.ide.SERVER.relativizeURI(jsx3.net.URIResolver.DEFAULT.resolveURI(myPath), true);
        }
      }

      var objChild = null;
      if (bInsertBefore) {
        objChild = objJSXParent.getParent().load(myPath, false);
        objJSXParent.getParent().insertBefore(objChild, objJSXParent, true);
      } else {
        objChild = objJSXParent.load(myPath);
      }

      //no error check, just call 'load' for now; persist per the drop (ctrl or not); the user can use a bound context menu to modify this relationship
      jsx3.ide.changePersistenceTo(objChild, persist);

      if (objChild !== false) {
        if (bStageDrop)
          jsx3.ide.moveNewComponentToProperPlace(objChild);

        bSuccess = true;
        jsx3.ide.maybeSelectNewDom([objChild], objDomTree);
      }
    }

    // call on-change event to clear drag mask
    jsx3.EventHelp.reset();

    if (bSuccess)
      jsx3.ide.getActiveEditor().setDirty(true);
  }

  //return false; this stops the CDF controller from doing a true transfer, which would acutally remove the prototype from its source tree
  return false;
};

/* @jsxobf-clobber */
jsx3.ide.createNewRootBlock = function(objServer) {
  // force multiple children into a single root block
  var bodyBlock = objServer.getBodyBlock();
  var rootNodes = bodyBlock.getChildren().concat();

  var root = new jsx3.gui.Block("root", null, null, "100%", "100%");
  root.setRelativePosition(jsx3.gui.Block.RELATIVE);
  bodyBlock.setChild(root);
  root.setPersistence(jsx3.app.Model.PERSISTEMBED);

  for (var i = 0; i < rootNodes.length; i++) {
    var rootNode = rootNodes[i];
    if (rootNode.getPersistence() == jsx3.app.Model.PERSISTNONE)
      rootNode.setPersistence(jsx3.app.Model.PERSISTEMBED);
    root.adoptChild(rootNode);
  }

  bodyBlock.paintChild(root);
};

/* @jsxobf-clobber */
jsx3.ide.changePersistenceTo = function(arrObj, intPersist) {
  if (arrObj instanceof Array) {
    for (var i = 0; i < arrObj.length; i++) {
      arrObj[i].setPersistence(intPersist);
//      arrObj[i].setMetaValue("url", strURL);
    }
  } else if (arrObj != null) {
    arrObj.setPersistence(intPersist);
//    arrObj.setMetaValue("url", strURL);
  }
  return arrObj;
};

/**
 * When a component is dropped on the stage, we may want to post-process where it is actually allowed to be dropped.
 */
jsx3.ide.moveNewComponentToProperPlace = function(objJSX) {
  // move dialogs dropped on stage to JSXBODY
  if (objJSX instanceof jsx3.gui.Dialog) {
    var block = objJSX.findAncestor(function(x){ return x.getClass().equals(jsx3.gui.Block.jsxclass); });
    if (objJSX.getParent() != block) {
      block.adoptChild(objJSX);
      var body = objJSX.getServer().getBodyBlock();
      if (block == body) {
        objJSX.setPersistence(jsx3.app.Model.PERSISTNONE);
      }
    }
  }
};

/** ON TP DROP *******************************************/
jsx3.ide.onTPDrop = function(objEvent, bCtrl) {
  //called when mouseup occurs on the tabbed pane edit region; processes potential drop action by checking if this is a system drag/drop (dragtype will be JSX_GENERIC)
  if (jsx3.EventHelp.DRAGTYPE == "JSX_GENERIC") {
    var editor = jsx3.ide.getActiveEditor();
    if (editor != null && jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor) {
      var bodyBlock = editor.getServer().getBodyBlock();
      var objTarget = jsx3.html.getJSXParent(objEvent.srcElement());

      if (objTarget && objTarget.findAncestor(function(x) { return x == bodyBlock; }, true) != null) {
        var strJSXSourceId = jsx3.EventHelp.JSXID.getId();
        var strParentRecordId = objTarget.getId();
        var strRecordIds = jsx3.EventHelp.getDragIds();
        jsx3.ide.onDomDrop(strJSXSourceId, strParentRecordId, strRecordIds, jsx3.IDE.getJSXByName("jsxdom"),
            bCtrl, false, true);
      }
    }
  }

  return false;
};



/** DO CLONE *********************************************/
jsx3.ide.doClone = function(strRecordId) {
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId);
  var clones = new Array(objJSX.length);
  for (var i = 0; i < objJSX.length; i++) {
    //clone the object and bind a ref to the source url in case user wants
    var objClone = objJSX[i].doClone(objJSX[i].getPersistence(), objJSX[i].getPersistenceUrl());

    if (objJSX[i].getMetaValue("url") != null)
      objClone.setMetaValue("url", objJSX[i].getMetaValue("url"));

    //set dirty
    if (objClone.getPersistence() != jsx3.app.Model.PERSISTNONE)
      jsx3.ide.getActiveEditor().setDirty(true);

    clones[i] = objClone;
  }

  //return handle to newly cloned item
  jsx3.ide.maybeSelectNewDom(clones);

  return clones;
};



/** DO REPAINT *********************************************/
jsx3.ide.doRepaint = function(strRecordId) {
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId, true);
  for (var i = 0; i < objJSX.length; i++) {
    objJSX[i].repaint(); // TODO: optimize for ancestor/descendants
  }
};


jsx3.ide.doFetchDataAndRepaint = function(strRecordId) {
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId, true);
  for (var i = 0; i < objJSX.length; i++) {
    objJSX[i].resetCacheData();
    objJSX[i].repaint();
  }
};


jsx3.ide.getForIdOrSelected = function(strRecordId, bIncludeBody) {
  if (strRecordId == jsx3.ide.ROOT_DOM_NODE_ID) {
    if (bIncludeBody)
      return [jsx3.ide.getActiveServer().getBodyBlock()];
  } else if (strRecordId instanceof Array) {
    var obj = [];
    for (var i = 0; i < strRecordId.length; i++) {
      if (strRecordId[i] == jsx3.ide.ROOT_DOM_NODE_ID) {
        if (bIncludeBody)
          obj.push(jsx3.ide.getActiveServer().getBodyBlock());
      } else {
        var o = jsx3.GO(strRecordId[i]);
        if (o) obj.push(o);
      }
    }
    return obj;
  } else if (strRecordId) {
    var obj = jsx3.GO(strRecordId);
    if (obj) return [obj];
  } else {
    return jsx3.ide.getSelected(bIncludeBody);
  }
  return [];
};

/** GET SELECTED *********************************************/
jsx3.ide.getSelected = function(bIncludeBody) {
  //don't ref the context menu; ref the selectedid for jsxdom
  var dom = jsx3.IDE.getJSXByName("jsxdom");
  if (dom != null) {
    var selectedIds = dom.getValue();
    var objs = [];

    for (var i = 0; i < selectedIds.length; i++) {
      if (selectedIds[i] == jsx3.ide.ROOT_DOM_NODE_ID) {
        if (bIncludeBody)
          objs.push(jsx3.ide.getActiveServer().getBodyBlock());
      } else {
        objs.push(jsx3.GO(selectedIds[i]));
      }
    }

    return objs;
  }

  return [];
};


/** DO PERSIST *********************************************/
jsx3.ide.doPersist = function(strRecordId, PERSIST) {
  //called when user chooses the given menu item to change the persistence for the given GUI object
  //get handle to selected element
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId);
  for (var i = 0; i < objJSX.length; i++) {
    //set the persistence to the given constant
    var prevPersist = objJSX[i].getPersistence();
    objJSX[i].setPersistence(PERSIST);
  }

  if (objJSX.length > 0) {
    //call on-change event for the dom to reflect the new persistence
    jsx3.ide.onDomChangeSleep();

    jsx3.ide.getActiveEditor().setDirty(true);
  }
};



/** CONFIG DOM MENU *********************************************/
jsx3.ide.configDomMenu = function(objMenu, strJSXIds) {
  //when user right-clicks on an element in the DOM tree to show the context menu, enable/disable menu items based upon the profile of the GUI item that was clicked
  var objJSXs = jsx3.ide.getForIdOrSelected(strJSXIds, true);
  if (objJSXs.length == 0) return false;

  var records = jsx3.util.List.wrap(objMenu.getXML().selectNodes('//record').toArray());

  // enable all items by default
  for (var i = records.iterator(); i.hasNext(); ) {
    var record = i.next();
    var id = record.getAttribute('jsxid');
    objMenu.enableItem(id, true);
  }

  var persist = null;

  for (var j = 0; j < objJSXs.length; j++) {
    var objJSX = objJSXs[j];
    var strJSXId = strJSXIds[j];

    var myPersist = objJSX.getPersistence();
    persist = persist == null || persist == myPersist ? myPersist : -1;

    //user right-clicked, but not on an element; assume they want to act upon the selected element in the DOM tree
    var bRef = myPersist == jsx3.app.Model.PERSISTREF || objJSX.getPersistence() == jsx3.app.Model.PERSISTREFASYNC;

    for (var i = records.iterator(); i.hasNext(); ) {
      var record = i.next();
      var id = record.getAttribute('jsxid');

      var bDisable =
          (strJSXId == jsx3.ide.ROOT_DOM_NODE_ID && record.getAttribute('noroot') == "1") ||
          (bRef && record.getAttribute('noref') == "1") ||
          (!bRef && record.getAttribute('refonly') == "1") ||
          (!objJSX.instanceOf(jsx3.xml.Cacheable) && record.getAttribute('blockx') == "1") ||
          (j == 0 && objJSXs.length > 1 && record.getAttribute('single') == "1");

      if (bDisable) {
        objMenu.enableItem(id, false);
        i.remove();
      }
    }
  }

  //check the menu item to show the current persistence for this GUI object
  if (persist != -1)
    objMenu.selectItem("persist" + persist);

  return true;
};


/** DO DOM EXECUTE *****************************************/
jsx3.ide.doDomExecute = function(strId) {
  //determine if the item being executed upon is a referenced file that can be edited; if a component onf the filesystem, open for edit
  var objJSX = jsx3.GO(strId);
  if (objJSX != null) {
    var myURL = objJSX.getMetaValue("url");
    if (myURL) {
      var persist = objJSX.getPersistence();
      if (persist == jsx3.app.Model.PERSISTREF || persist == jsx3.app.Model.PERSISTREFASYNC)
        jsx3.ide.doOpenUrlForEdit(jsx3.ide.SERVER.resolveURI(myURL));
    }
  }
};

////////////////////////// RECYCLING-RELATED FUNCTIONS ///////////////////////////////

jsx3.ide.doToggleRecycleBin = function() {
  var root = jsx3.IDE.getRootBlock();
  var dialog = root.getChild('jsx_ide_recycling_bin');
  var settings = jsx3.ide.getIDESettings();

  if (dialog == null) {
    dialog = root.load('components/dom/recycling.xml', false);
    var dialogDim = settings.get('recyclebin');
    if (dialogDim)
      dialog.setDimensions(dialogDim.left, dialogDim.top, dialogDim.width, dialogDim.height);
    root.paintChild(dialog);
    dialog.focus();
  } else {
    if (dialog.isFront())
      dialog.doClose();
    else
      dialog.focus();
  }
};

jsx3.ide.doSaveRecycleBinState = function(dialog) {
  var settings = jsx3.ide.getIDESettings();
  var dialogPos = {left: dialog.getLeft(), top: dialog.getTop(), width: dialog.getWidth(), height: dialog.getHeight()};
  settings.set('recyclebin', dialogPos);
};

jsx3.ide.fillRecycleBinTree = function(objTree) {
  var bin = jsx3.ide.getRecycleBin();

  var strValue = objTree.getValue();
  objTree.clearXmlData();

  var rootRecord = {
    jsxid: '_jsxbin',
    jsxtext: 'Recycle Bin',
    jsxopen: '1',
    jsximg: 'images/icon_42.gif',
    jsxunselectable: '1'
  };
  objTree.insertRecord(rootRecord, null, false);

  if (bin != null) {
    var children = bin.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      var text = null, img = null;
      if (child._jsxisfolder) {
        var parent = jsx3.GO(child._jsxformerparentid);
        var count = child.getChildren().length;
        text = ((count == 1) ? "1 Descendant" : count + " Descendants") + " of ";
        text += parent != null ? (parent.getName() + " : " + parent.getClass().getName()) : child._jsxformerparentid;
        img = "images/icon_7.gif";
      } else {
        text = child.getName() + " : " + child.getClass().getName();
        img = "images/icon_46.gif";
      }

      var record = {
        jsxid: child.getId(),
        jsxtext: text,
        jsximg: img,
        mayrestore: '1',
        isfolder: child._jsxisfolder ? 1 : null
      };
      objTree.insertRecord(record, '_jsxbin', false);
      jsx3.ide.fillRecycleBinTreeRecurse(objTree, record.jsxid, child);
    }
  }

  objTree.setValue(strValue);
  objTree.repaint();
  return bin != null;
};

jsx3.ide.fillRecycleBinTreeRecurse = function(objTree, parentId, objJSX) {
  var children = objJSX.getChildren();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var record = {
      jsxid: child.getId(),
      jsxtext: child.getName() + " : " + child.getClass().getName(),
      jsximg: "images/icon_89.gif",
      jsxunselectable: '1'
    };
    objTree.insertRecord(record, parentId, false);
    jsx3.ide.fillRecycleBinTreeRecurse(objTree, record.jsxid, child);
  }
};

jsx3.ide.getRecycleBin = function(objServer) {
  if (objServer == null) {
    objServer = jsx3.ide.getActiveServer();
    if (objServer == null) return null;
  }

  // dumpster (recycling bins for each server) is child of invisible root
  if (jsx3.ide._TRASH == null) {
    var invisible = jsx3.IDE.getInvisibleRoot();
    jsx3.ide._TRASH = new jsx3.gui.Block("recycling",null,null,0,0);
    invisible.setChild(jsx3.ide._TRASH);
  }

  // specific bin for server is child of dumpster
  var serverKey = objServer.getEnv('COMPONENTURL');
  var bin = jsx3.ide._TRASH.getChild(serverKey);
  if (bin == null) {
    bin = new jsx3.gui.Block(serverKey, null, null, 0, 0);
    jsx3.ide._TRASH.setChild(bin);
  }

  return bin;
};

jsx3.ide.COLLECTION_PREFIX = "COLLECTION_";

/** DO RECYCLE *******************************/
/*
 * ? doRecycle()      --called when user clicks the menu item to 'recycle' the JSX object corresponding to the currently-selected IDE dom tree
 * @ strId (OPTIONAL)     --(String) id of item to recycle if not the current item in the recycle bin
 * ! returns        --(null)
 */
jsx3.ide.doRecycle = function(strId, bConfirmed) {
//  jsx3.ide.LOG.warn("doRecycle ids:" + strId);
  // make sure valid object to delete
  var objJSX = jsx3.ide.getForIdOrSelected(strId);
//  jsx3.ide.LOG.warn("doRecycle obj:" + objJSX);
  if (objJSX.length == 0) return;

  // check that we are confirmed if necessary
  var settings = jsx3.ide.getIDESettings();
  if (settings.get('prefs', 'builder', 'domdeletewarn') && !bConfirmed) {
    var names = new Array(objJSX.length);
    for (var i = 0; i < objJSX.length; i++)
      names[i] = objJSX[i].getName();

    jsx3.IDE.confirm(
      "Confirm Recycle",
      "Recycle object(s): <b>" + names.join(", ") + "</b>?",
      function(d) {d.doClose(); jsx3.ide.doRecycle(strId, true);},
      null,
      "Recycle",
      "Cancel"
    );
    return;
  }

  //get handle to the recycle bin
  var objBin = jsx3.ide.getRecycleBin();

  // Select the previous sibling of the single object to delete, or the parent if no other sibling available
  if (objJSX.length == 1) {
    var objJSXParent = objJSX[0].getParent();
    var intIndex = objJSX[0].getChildIndex();
    jsx3.ide.setDomValue([objJSXParent.getChild(intIndex - 1) || objJSXParent.getChild(intIndex + 1) ||  objJSXParent]);
  } else {
    jsx3.ide.setDomValue(null);
  }

  var objEditor = jsx3.ide.getEditorForJSX(objJSX[0]);

  //TO DO: track active element in the DOM; find old parent for selection
  //get handle to parent container and select it, since its child is about to be removed
  for (var i = 0; i < objJSX.length; i++) {
    var objJSXParent = objJSX[i].getParent();
    var intIndex = objJSX[i].getChildIndex();

    //bind ref to parent id, so this item can be restored
    objJSX[i]._jsxformerparentid = objJSXParent.getId();

    //remove the selected item from the JSX DOM; repaint parent object
    objBin.adoptChild(objJSX[i], false, true);
  }

  jsx3.IDE.publish({subject: jsx3.ide.events.OBJECT_WAS_RECYCLED, editor:objEditor, objects: objJSX});
};

jsx3.ide.doRecycleRestore = function(objTree) {
  var strId = objTree.getValue();
  var bin = jsx3.ide.getRecycleBin();

  var objJSX = bin.findDescendants(function(x) {return x.getId() == strId;}, false, false, true);

  if (objJSX) {
    var parent = jsx3.GO(objJSX._jsxformerparentid);
    var parentInBinTop = false, parentInBin = false;

    // look for parent in the recycling bin
    if (parent == null) {
      parent = bin.findDescendants(function(x) {return x.getId() == objJSX._jsxformerparentid;}, false, false, true);

      if (parent == null) {
        parent = bin.findDescendants(function(x) {return x.getId() == objJSX._jsxformerparentid;});
        parentInBin = parent != null;
      } else {
        parentInBinTop = true;
      }
    }

    if (parent != null) {
      parentInBin = parent.getAncestorOfName(jsx3.ide.getRecycleBin().getName()) != null;

      if (objJSX._jsxisfolder) {
        parent.adoptChildrenFrom(objJSX, !parentInBin, true);
        bin.removeChild(objJSX);
      } else {
        parent.adoptChild(objJSX, !parentInBin, true);
      }

      jsx3.IDE.publish({subject: jsx3.ide.events.OBJECT_WAS_UNRECYCLED, object: objJSX});

      if (parentInBinTop) {
        jsx3.IDE.confirm(
          "Restore Parent",
          "The parent of the restored object(s) is a top-level object in the recycle bin. Restore the parent as well?",
          function(d) { objTree.setValue(parent.getId()); jsx3.ide.doRecycleRestore(objTree);  d.doClose(); },
          null,
          "Restore",
          "Don't Restore", 1
        );
      } else if (parentInBin) {
        var parentToRestore = parent;
        while (parentToRestore.getParent() != bin)
          parentToRestore = parentToRestore.getParent();

        jsx3.IDE.confirm(
          "Restore Ancestor",
          "The parent of the restored object(s) is a nested object in the recycle bin. Restore the top-level ancestor as well?",
          function(d) { objTree.setValue(parentToRestore.getId()); jsx3.ide.doRecycleRestore(objTree); d.doClose(); },
          null,
          "Restore",
          "Don't Restore", 1
        );
      }
    } else {
      // can't find the parent so just restore to the root
      parent = jsx3.ide.getActiveServer().getBodyBlock();

      if (objJSX._jsxisfolder) {
        parent.adoptChildrenFrom(objJSX, true, true);
        bin.removeChild(objJSX);
      } else {
        parent.adoptChild(objJSX, true, true);
      }

      jsx3.IDE.publish({subject: jsx3.ide.events.OBJECT_WAS_UNRECYCLED, object: objJSX});
      jsx3.ide.LOG.info("Object(s) restored from recycling bin to component root because the previous parent was not found.");
    }
  } else {
    jsx3.IDE.alert(null, "Could not find recycled object with id '" + strId + "'");
  }
};


/** EMPTY RECYCLE BIN *******************************/
jsx3.ide.emptyRecycleBin = function(objServer, bConfirmed) {
  if (bConfirmed) {
    var bin = jsx3.ide.getRecycleBin(objServer);
    bin.getParent().removeChild(bin);
    jsx3.IDE.publish({subject: jsx3.ide.events.RECYCLE_BIN_WAS_EMPTIED});
  } else {
    jsx3.IDE.confirm(
      "Confirm",
      "Are you sure you want to empty the recycle bin. Deleted items cannot be recovered.",
      function(d){ jsx3.ide.emptyRecycleBin(objServer, true); d.doClose(); },
      null, "Empty", "Cancel", 2
    );
  }
};



//////// LOGIC FOR THE FOCUS RECTANGLE  ////////////////////////////////////

/** GLOBALS ************************************************/
/* @jsxobf-clobber */
jsx3.ide._FOCUS = {};
/* @jsxobf-clobber */
jsx3.ide._FOCUS.NORTH = "NN";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.SOUTH = "SS";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.EAST = "EE";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.WEST = "WW";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.CENTER = "MM";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.NUDGE = "nudge";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.COLOR_DRAG = "#000000";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.COLOR_OFF = "#1E90FF";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.COLOR_REL = "#FF901E";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.COLOR_BLUR = "#999999";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.BOXSIZEX = 2;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.BOXSIZEY = 2;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.DRAGW = 3;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.DRAGH = 6;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.MOVEW = 4;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.KEYCODE_TO_DIRECTION = {37: 'W', 38: 'N', 39: 'E', 40: 'S'};

/* @jsxobf-clobber */
jsx3.ide._FOCUS.flag = 0;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.type = "S";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.offsetX = "0";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.offsetY = "0";
/* @jsxobf-clobber */
jsx3.ide._FOCUS.abs = null;
/* @jsxobf-clobber */
jsx3.ide._FOCUS.position = null;

jsx3.ide.toggleFocusRectangle = function(bEvent) {
  var settings = jsx3.ide.getIDESettings();
  var bShow = settings.get('prefs', 'dom', 'showFocus');
  jsx3.ide.showFocusRectangle(!bShow, bEvent, true);
};

/** SHOW FOCUS RECTANGLE ************************************************/
jsx3.ide.showFocusRectangle = function(bShow, bEvent, bDoFocus) {
  var FOCUS = jsx3.ide._FOCUS;

  //destroy any existing focus rectangle
  var objHW = jsx3.gui.Heavyweight.GO("jsxfocusrectangle");
  if (objHW) objHW.destroy();

  var settings = jsx3.ide.getIDESettings();

  if (typeof(bShow) != "boolean") {
    bShow = settings.get('prefs', 'dom', 'showFocus');
  } else {
    bDoFocus = true;
    settings.set('prefs', 'dom', 'showFocus', bShow);
  }

  if (bEvent)
    jsx3.IDE.publish({subject: jsx3.ide.events.FOCUS_RECTANGLE_TOGGLED});

  var editor = jsx3.ide.getActiveEditor();
  if (editor == null ||
      !(jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor && editor.getMode() == 'component')) return;

  var objJSX = jsx3.ide.getSelected();

  if (! bShow || objJSX.length == 0) return;

  //get the root parent container (this is the base object from which we well position the rectangle
  var objOwner = jsx3.IDE.getJSXByName("jsx_tpan_component");
  var objMyRoot = jsx3.ide.getActiveTab().getDescendantOfName("jsxtab_componenteditor_main").getRendered();

  var objRules = null, x1 = Number.POSITIVE_INFINITY, x2 = Number.NEGATIVE_INFINITY;
  var y1 = x1, y2 = x2;
  for (var i = 0; i < objJSX.length; i++) {
    if (!objJSX[i]) continue;

    var r = objJSX[i].getMaskProperties();
    if (objRules == null) {
      objRules = jsx3.clone(r);
    } else {
      var dims = [FOCUS.NORTH, FOCUS.SOUTH, FOCUS.EAST, FOCUS.WEST, FOCUS.CENTER];
      for (var j = 0; j < dims.length; j++)
        objRules[dims[j]] = objRules[dims[j]] && r[dims[j]];
    }

    var abs = objJSX[i].getAbsolutePosition(objMyRoot);
    x1 = Math.min(x1, abs.L);
    y1 = Math.min(y1, abs.T);
    x2 = Math.max(x2, abs.L + abs.W);
    y2 = Math.max(y2, abs.T + abs.H);
  }

  if (objRules == null) return;

  //get absolutes for the item we'll be showing; get position using the chosen root as the origin (the parent of the editor tabbed pane)
  FOCUS.abs = {L:x1, T:y1, W:x2-x1, H:y2-y1};

  var bSingle = objJSX.length == 1;
  // if the item is relatively positioned, use red as the color to denote the difference
  var c1 = (objRules[FOCUS.CENTER]) ? FOCUS.COLOR_OFF : FOCUS.COLOR_REL;

  var pN = bSingle && objRules[FOCUS.NORTH] && objRules[FOCUS.CENTER] ? FOCUS.NORTH : "";
  var pS = bSingle && objRules[FOCUS.SOUTH] ? FOCUS.SOUTH : "";
  var pE = bSingle && objRules[FOCUS.EAST] ? FOCUS.EAST : "";
  var pW = bSingle && objRules[FOCUS.WEST] && objRules[FOCUS.CENTER] ? FOCUS.WEST : "";
  var pM = objRules[FOCUS.CENTER] ? FOCUS.CENTER : "";

  var halfW = Math.round((FOCUS.abs.W - FOCUS.DRAGH) / 2);
  var halfH = Math.round((FOCUS.abs.H - FOCUS.DRAGH) / 2);

  // account for border width in Fx, strict
  var boxW = FOCUS.abs.W, boxH = FOCUS.abs.H;
  if (jsx3.html.getMode() != jsx3.html.MODE_IE_QUIRKS) {
    boxW -= 2; boxH -= 2;
  }

  //generate anchor points and box
  var showFocusRectangle = "showFocusRectangle";
  var doFocusBlur = "doFocusBlur";
  var doFocusDown = "doFocusDown";
  var doFocusFocus = "doFocusFocus";
  var doFocusKeyDown = "doFocusKeyDown";
  var strHTML = '<span tabindex="1" id="jsxfocusrectangle_span" style="position:absolute;width:100%;height:100%;left:2px;top:2px;" onmousedown="jsx3.ide.' +
      doFocusDown + '(event);" ondblclick="jsx3.ide.' + showFocusRectangle + '(false, true);" onkeydown="jsx3.ide.' + doFocusKeyDown +
      '(event, this);" onfocus="jsx3.ide.' + doFocusFocus + '(this);" onblur="jsx3.ide.' +
      doFocusBlur + '(this);">';

  strHTML += '<span id="_ide_NN"' + (pN ? ' jsxon="1"' : "") + ' jsxpoint="' + pN + '" unselectable="on" style="overflow:hidden;cursor:' + (pN ? 'N-resize' : 'normal') + ';position:absolute;background-color:' + (pN ? FOCUS.COLOR_BLUR : c1) + ';left:' + halfW + 'px;top:-1px;width:' + FOCUS.DRAGH + 'px;height:' + FOCUS.DRAGW + 'px;">&#160;</span>';
  strHTML += '<span id="_ide_WW"' + (pW ? ' jsxon="1"' : "") + ' jsxpoint="' + pW + '" unselectable="on" style="overflow:hidden;cursor:' + (pW ? 'W-resize' : 'normal') + ';position:absolute;background-color:' + (pW ? FOCUS.COLOR_BLUR : c1) + ';left:-1px;top:' + halfH + 'px;width:' + FOCUS.DRAGW + 'px;height:' + FOCUS.DRAGH + 'px;">&#160;</span>';
  strHTML += '<span id="_ide_EE"' + (pE ? ' jsxon="1"' : "") + ' jsxpoint="' + pE + '" unselectable="on" style="overflow:hidden;cursor:' + (pE ? 'W-resize' : 'normal') + ';position:absolute;background-color:' + (pE ? FOCUS.COLOR_BLUR : c1) + ';left:' + (FOCUS.abs.W - 2) + 'px;top:' + halfH + 'px;width:' + FOCUS.DRAGW + 'px;height:' + FOCUS.DRAGH + 'px;">&#160;</span>';
  strHTML += '<span id="_ide_SS"' + (pS ? ' jsxon="1"' : "") + ' jsxpoint="' + pS + '" unselectable="on" style="overflow:hidden;cursor:' + (pS ? 'N-resize' : 'normal') + ';position:absolute;background-color:' + (pS ? FOCUS.COLOR_BLUR : c1) + ';left:' + halfW + 'px;top:' + (FOCUS.abs.H - 2) + 'px;width:' + FOCUS.DRAGH + 'px;height:' + FOCUS.DRAGW + 'px;">&#160;</span>';

  strHTML += '<span id="_ide_BB" unselectable="on" style="position:absolute;left:0px;top:0px;width:' + boxW + 'px;height:' + boxH + 'px;border:solid 1px ' + c1 + ';z-index:-1;font-size:4px;"></span>';
  strHTML += '<span id="_ide_MM"' + (pM ? ' jsxon="1"' : "") + ' jsxpoint="MM" unselectable="on" style="overflow:hidden;cursor:' + (pM ? 'move' : 'normal') + ';position:absolute;background-color:' + (pM ? FOCUS.COLOR_BLUR : c1) + ';left:' + Math.round((FOCUS.abs.W - FOCUS.MOVEW) / 2) + 'px;top:' + Math.round((FOCUS.abs.H - FOCUS.MOVEW) / 2) + 'px;width:' + FOCUS.MOVEW + 'px;height:' + FOCUS.MOVEW + 'px;">&#160;</span>';

  strHTML += '</span>';

  var offsetRoot = jsx3.ide.SERVER.getRootBlock();

  //create and configure a Heavyweight (HW) instance to contain the rectangle
  objHW = new jsx3.gui.Heavyweight("jsxfocusrectangle", objOwner);
  objHW.setDomParent(objMyRoot);
  objHW.setHTML(strHTML);
//    objHW.setZIndex(1);
  objHW.setWidth(FOCUS.abs.W);
  objHW.setHeight(FOCUS.abs.H);
  objHW.addXRule(offsetRoot, "W", "W", FOCUS.abs.L-2);
  objHW.addYRule(offsetRoot, "N", "N", FOCUS.abs.T-2);
  objHW.show();

  window.setTimeout(function(){
    var fr = objMyRoot.ownerDocument.getElementById('jsxfocusrectangle_span');
    if (bDoFocus && fr && fr.clientHeight > 0) {
      fr.focus();
      objMyRoot.scrollTop = objMyRoot.scrollLeft = 0; // HACK: IE scroll issue
    }
  }, 1);
};

jsx3.ide.doFocusKeyDown = function(e, objFocusGUI) {
  var objEvent = jsx3.gui.Event.wrap(e);
  var keyCode = objEvent.keyCode();
  var direction = jsx3.ide._FOCUS.KEYCODE_TO_DIRECTION[keyCode];
  if (direction != null) {
    jsx3.ide.doFocusNudge(objEvent, direction);
    objEvent.cancelAll();
  } else if (objEvent.ctrlKey() && !objEvent.shiftKey() && !objEvent.altKey() && !objEvent.metaKey()) {
    if (keyCode == jsx3.gui.Event.KEY_BACKSPACE || keyCode == jsx3.gui.Event.KEY_DELETE)
      jsx3.ide.doRecycle();
  }
};

jsx3.ide.doFocusFocus = function(objFocusGUI) {
//  jsx3.ide.LOG.info("FOCUS focus " + objFocusGUI.childNodes.length);
  var children = objFocusGUI.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.getAttribute("jsxon") == "1")
      child.style.backgroundColor = jsx3.ide._FOCUS.COLOR_DRAG;
  }

  // HACK: IE scroll issue
  objFocusGUI.parentNode.parentNode.scrollTop = objFocusGUI.parentNode.parentNode.scrollLeft = 0;
};

jsx3.ide.doFocusBlur = function(objFocusGUI) {
  var children = objFocusGUI.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.getAttribute("jsxon") == "1")
      child.style.backgroundColor = jsx3.ide._FOCUS.COLOR_BLUR;
  }
};

/** DO FOCUS DOWN ************************************************/
jsx3.ide.doFocusDown = function(e) {
  var FOCUS = jsx3.ide._FOCUS;

//  jsx3.ide.LOG.info("FOCUS down");
  var objEvent = jsx3.gui.Event.wrap(e);
  var objFocusGUI = objEvent.srcElement();

  var fr = objFocusGUI.ownerDocument.getElementById('jsxfocusrectangle_span');
  if (fr) {
    fr.focus();
    fr.parentNode.parentNode.scrollTop = fr.parentNode.parentNode.scrollLeft = 0; // HACK: IE scroll issue
  }

  //get handle to affected object
  var objJSX = jsx3.ide.getSelected();
  var myPoint = objFocusGUI.getAttribute("jsxpoint");

  //allow user to mouse down; do a re-check to see if any rules have changed for this object since the focus rectangle was first painted
  if (myPoint /*&& objJSX.getMaskProperties()[myPoint]*/ ||
      (myPoint == FOCUS.CENTER && objEvent.ctrlKey())) {
    // set default dimensions for the focus rectangle box; if these are changed when the user mouses up, it means they edited the box
    FOCUS.position = {L:0, T:0, W:FOCUS.abs.W, H:FOCUS.abs.H};

    //this is a hotspot on the rectangle; persist the anchor being affected
    FOCUS.type = myPoint;

    //set flag, so doFocusMove() knows to listen for mousemove event ('1' means a resize/reposition)
    FOCUS.flag = 1;
    var snap = jsx3.ide.getSnapTo();

    //save offset (used during moves for more efficient calculations)
    if (myPoint == FOCUS.CENTER) {
      //set the start to a multiple of the snap, so it aligns to the grid
      FOCUS.offsetX = jsx3.util.numRound(Number(FOCUS.abs.L), snap) - FOCUS.abs.L;
      FOCUS.offsetY = jsx3.util.numRound(Number(FOCUS.abs.T), snap) - FOCUS.abs.T;

      //if user holds control key down, this is a clone event
      if (jsx3.gui.isMouseEventModKey(objEvent)) {
        objFocusGUI.parentNode.childNodes[4].style.borderStyle = "dashed";
        //this is a clone ('2' means a clone event)
        FOCUS.flag = 2;
      }
    } else {
      FOCUS.offsetX = jsx3.util.numRound(Number(FOCUS.abs.W), snap) - FOCUS.abs.W;
      FOCUS.offsetY = jsx3.util.numRound(Number(FOCUS.abs.H), snap) - FOCUS.abs.H;
    }

    FOCUS.boxStartW = FOCUS.abs.W;
    FOCUS.boxStartH = FOCUS.abs.H;
    FOCUS.eventStartX = objEvent.getScreenX();
    FOCUS.eventStartY = objEvent.getScreenY();

    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEMOVE, jsx3.ide.doFocusMove);
    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEUP, jsx3.ide.doFocusUp);
  } else {
    //jsx3.out('a',objJSX.getMaskProperties()[myPoint]);
  }
};


/** DO FOCUS MOVE ************************************************/
jsx3.ide.doFocusMove = function(e) {
//  jsx3.log("FOCUS move " + jsx3.ide._FOCUS.flag);
  if (jsx3.ide._FOCUS.flag > 0) {
    var objEvent = e.event;
    var objFocusGUI = objEvent.srcElement().ownerDocument.getElementById('jsxfocusrectangle_span');
    var snap = jsx3.ide.getSnapTo();
    var moveX = jsx3.util.numRound((objEvent.getScreenX() - jsx3.ide._FOCUS.eventStartX - jsx3.ide._FOCUS.offsetX), snap) + jsx3.ide._FOCUS.offsetX;
    var moveY = jsx3.util.numRound((objEvent.getScreenY() - jsx3.ide._FOCUS.eventStartY - jsx3.ide._FOCUS.offsetY), snap) + jsx3.ide._FOCUS.offsetY;

    jsx3.ide.adjustSize(objFocusGUI, moveX, moveY);
  }
};

jsx3.ide.doFocusNudge = function(objEvent, strDirection) {
  // focus rectangle must be visible
  var objHW = jsx3.gui.Heavyweight.GO("jsxfocusrectangle");
  if (objHW == null) return;

  var objJSXs = jsx3.ide.getSelected();

  var x = 0, y = 0;
  switch (strDirection) {
    case "W": x = -1; break;
    case "N": y = -1; break;
    case "E": x =  1; break;
    case "S": y =  1; break;
  }

  if (objEvent.shiftKey()) {
    x *= 10;
    y *= 10;
  }

  var bPos = false;

  for (var i = 0; i < objJSXs.length; i++) {
    var objJSX = objJSXs[i];

    // must be allowed to drag from center
    var objRules = objJSX.getMaskProperties();
    if (! objRules[jsx3.ide._FOCUS.CENTER]) continue;

    if (x) {
      var left = objJSX.getLeft();
      objJSX.setLeft((left != null ? left : 0) + x, true);
      bPos = true;
    }

    if (y) {
      var top = objJSX.getTop();
      objJSX.setTop((top != null ? top : 0) + y, true);
      bPos = true;
    }
  }

  // when width/height are adjust, redisplay the focus rectangle
  if (bPos) {
    jsx3.ide.showFocusRectangle(null, null, true);
    jsx3.IDE.publish({subject:jsx3.ide.events.FOCUS_RECTANGLE_MOVED, target:objJSX});
  }
};

jsx3.ide.updateFocusOnModeChange = function(e) {
  var objHW = jsx3.gui.Heavyweight.GO("jsxfocusrectangle");
  var mode = e.mode;

  if (mode == "component")
    jsx3.ide.showFocusRectangle(null, false);
  else if (objHW)
    objHW.destroy();
};

/** DO FOCUS UP ************************************************/
jsx3.ide.doFocusUp = function(e, objFocusGUI) {
//  jsx3.log("FOCUS up " + jsx3.ide._FOCUS.flag)

  jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEMOVE, jsx3.ide.doFocusMove);
  jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEUP, jsx3.ide.doFocusUp);

  if (jsx3.ide._FOCUS.flag > 0) {
    //initialize variables; release capture
    var bSize = false, bPos = false;

    //get handle to GUI object being edited via the rectangle
    var objJSXs = jsx3.ide.getSelected();

    //if the flag is 2, this is a clone
    if (jsx3.ide._FOCUS.flag == 2) {
      //call IDE's doClone method (this will clone AND update dirty state)
      objJSXs = jsx3.ide.doClone();
      //reset selection to the cloned item
      jsx3.ide.setDomValue(objJSXs);
    } else {
      if (jsx3.ide._FOCUS.abs.W != jsx3.ide._FOCUS.position.W) {
        objJSXs[0].setWidth(jsx3.ide._FOCUS.position.W, true);
        bSize = true;
      }

      if (jsx3.ide._FOCUS.abs.H != jsx3.ide._FOCUS.position.H) {
        objJSXs[0].setHeight(jsx3.ide._FOCUS.position.H, true);
        bSize = true;
      }
    }

    for (var i = 0; i < objJSXs.length; i++) {
      var objJSX = objJSXs[i];

      if (jsx3.ide._FOCUS.position.L != 0) {
        var left = objJSX.getLeft();
        objJSX.setLeft((left != null ? left : 0) + jsx3.ide._FOCUS.position.L - jsx3.ide._FOCUS.BOXSIZEX, true);
        bPos = true;
      }

      if(jsx3.ide._FOCUS.position.T != 0) {
        var top = objJSX.getTop();
        objJSX.setTop((top != null ? top : 0) + jsx3.ide._FOCUS.position.T - jsx3.ide._FOCUS.BOXSIZEY, true);
        bPos = true;
      }
    }

    // when width/height are adjust, redisplay the focus rectangle
    if (bPos) jsx3.ide.showFocusRectangle(null, null, true);

    //an edit ocurred; make item dirty
    if (bSize || bPos)
      jsx3.IDE.publish({subject:jsx3.ide.events.FOCUS_RECTANGLE_MOVED, targets:objJSXs});

    //reset the flag back to its null state
    jsx3.ide._FOCUS.flag = 0;
  }
};


/** ADJUST SIZE ************************************************/
jsx3.ide.adjustSize = function(objFocusGUI, moveX, moveY) {
  var type = jsx3.ide._FOCUS.type;

  if (type == jsx3.ide._FOCUS.CENTER || type == jsx3.ide._FOCUS.NUDGE) {
    objFocusGUI.style.left = jsx3.ide._FOCUS.position.L = moveX + jsx3.ide._FOCUS.BOXSIZEX;
    objFocusGUI.style.top = jsx3.ide._FOCUS.position.T = moveY + jsx3.ide._FOCUS.BOXSIZEY;
  } else {
    var newWidth = null, newHeight = null;

    var dimBoxAdj = (jsx3.html.getMode() != jsx3.html.MODE_IE_QUIRKS) ? -2 : 0;

    if (type == jsx3.ide._FOCUS.WEST || type == jsx3.ide._FOCUS.NORTH) {
      newWidth = Math.max(1, jsx3.ide._FOCUS.boxStartW - moveX);
      newHeight = Math.max(1, jsx3.ide._FOCUS.boxStartH - moveY);

      if (type == jsx3.ide._FOCUS.WEST)
        objFocusGUI.style.left = jsx3.ide._FOCUS.position.L = moveX + jsx3.ide._FOCUS.BOXSIZEX;
      if (type == jsx3.ide._FOCUS.NORTH)
        objFocusGUI.style.top = jsx3.ide._FOCUS.position.T = moveY + jsx3.ide._FOCUS.BOXSIZEX;
    } else {
      newWidth = Math.max(1, jsx3.ide._FOCUS.boxStartW + moveX);
      newHeight = Math.max(1, jsx3.ide._FOCUS.boxStartH + moveY);
    }

    if (type == jsx3.ide._FOCUS.EAST || type == jsx3.ide._FOCUS.WEST) {
      //udpate UI
      var halfW = Math.round((newWidth - jsx3.ide._FOCUS.DRAGH) / 2);
      objFocusGUI.childNodes[2].style.left = newWidth - jsx3.ide._FOCUS.BOXSIZEX;
      objFocusGUI.childNodes[4].style.width = newWidth + dimBoxAdj;
      objFocusGUI.childNodes[0].style.left = halfW;
      objFocusGUI.childNodes[3].style.left = halfW;
      objFocusGUI.childNodes[5].style.left = Math.round((newWidth - jsx3.ide._FOCUS.MOVEW) / 2);
      //update model
      jsx3.ide._FOCUS.position.W = newWidth;
    } else if (type == jsx3.ide._FOCUS.SOUTH || type == jsx3.ide._FOCUS.NORTH) {
      //update UI
      var halfH = Math.round((newHeight - jsx3.ide._FOCUS.DRAGH) / 2);
      objFocusGUI.childNodes[3].style.top = newHeight - jsx3.ide._FOCUS.BOXSIZEY;
      objFocusGUI.childNodes[4].style.height = newHeight + dimBoxAdj;
      objFocusGUI.childNodes[1].style.top = halfH;
      objFocusGUI.childNodes[2].style.top = halfH;
      objFocusGUI.childNodes[5].style.top = Math.round((newHeight - jsx3.ide._FOCUS.MOVEW) / 2);
      //update model
      jsx3.ide._FOCUS.position.H = newHeight;
    }
  }
};


/** SNAP TO GRID **************************************/
jsx3.ide.toggleSnapToGrid = function(bSnap) {
  var settings = jsx3.ide.getIDESettings();
  settings.set('prefs', 'dom', 'snapTo', bSnap);
};

// returns integer 1 (for no snap), or greater than 1 for snap
jsx3.ide.getSnapTo = function() {
  var settings = jsx3.ide.getIDESettings();
  if (settings.get('prefs', 'dom', 'snapTo')) {
    var snap = settings.get('prefs', 'builder', 'snapto');
    return snap != null ? Math.max(1, snap) : 10;
  } else {
    return 1;
  }
};

////////////// LOGIC FOR SERIALIZING BRANCHES; IMPORTING A BRANCH; EXPORTING A STATIC HTML TEST PAGE ////////////////////////////////

/** EXPORT DOM BRANCH *************************************************/
//@ objJSX  --([object]) JSX object to export (serialize the MODEL) to the file system or save as HTML (VIEW)
//@ FORMAT  --(CONSTANT) the export type. one of the strings: MODEL or VIEW
jsx3.ide.exportDomBranch = function(objJSX,FORMAT) {
  //get content as html (VIEW)
  var strContent = (FORMAT == "MODEL") ? objJSX.toXMLDoc() : objJSX.paint();

  //shows the save dialog, so user can pick which component should default-load
  jsx3.require("jsx3.io.FileDialog");
  var dialog = jsx3.io.FileDialog.deserialize(jsx3.IDE.getRootBlock(),"jsxdialog");

  var success = true;

  //bind callback and show
  dialog.onExecute = function(objFile) {
    if (FORMAT == "MODEL") {
      var objXML = jsx3.ide.makeXmlPretty(strContent, true);
      if (! jsx3.ide.writeUserXmlFile(objFile, objXML)) {
        jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty('jsxerr_exportxml_writefail'));
        return;
      }
    } else {
      success = jsx3.ide.exportDomBranchHtml(objFile,strContent);
    }

    if (success)
      jsx3.ide.setCurrentDirectory(objFile.getParentFile());
  };

  dialog.openForSave(FORMAT == "MODEL" ? jsx3.ide.getCurrentDirectory() : jsx3.ide.getSystemDirectory(),
      FORMAT == "MODEL" ? jsx3.ide.getCurrentUserHome() : jsx3.ide.getSystemDirectory());
};


/** EXPORT DOM BRANCH HTML *************************************************/
jsx3.ide.exportDomBranchHtml = function(objFile,strContent) {
  if (objFile.isDescendantOf(jsx3.ide.getSystemDirFile(), 1)) {
    //saves the content, @strContent to an html file, wrapped with the necessary HTML to view as a static file
    var strHTML = '<html xmlns:v="urn:schemas-microsoft-com:vml"><head><link type="text/css" rel="stylesheet" href="JSX/css/JSX.css"/></head><body>';
    strHTML += strContent.replace(/onmouse[^=]*=/gi,"x=").replace(/on[dbl]?(click|scroll)=/gi,"x=").replace(/onkey[^=]*=/gi,"x=");
    strHTML += '</body></html>';

    if (jsx3.ide.writeUserFile(objFile, strHTML))
      return true;
    else
      jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty('jsxerr_exporthtml_writefail'));
  } else {
    jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty('jsxerr_exporthtml_directory'));
  }

  return false;
};


/** IMPORT DOM BRANCH *************************************************/
//@ objJSX  --([object]) JSX object that will become the parent for the selected serialized component
//@ PERSISTENCE --(CONSTANT) one of: jsx3.app.Model.PERSISTEMBED jsx3.app.Model.PERSISTREF jsx3.app.Model.PERSISTREFASYNC
jsx3.ide.importDomBranch = function(strJsxId, PERSISTENCE) {
  var objJSXs = jsx3.ide.getForIdOrSelected(strJsxId, true);
  if (objJSXs.length != 1) return;
  var objJSX = objJSXs[0];

  //shows the open dialog, so user can pick which component should default-load
  jsx3.require("jsx3.io.FileDialog");
  var dialog = jsx3.io.FileDialog.deserialize(jsx3.IDE.getRootBlock(),"jsxdialog");

  //bind callback and show
  dialog.onExecute = function(objFile) {
    jsx3.ide.setCurrentDirectory(objFile.getParentFile());
    //load the component
    var strRelativePath = jsx3.ide.SERVER.getEnv("apppathabs").relativize(objFile.toURI());

    var bRef = PERSISTENCE == jsx3.app.Model.PERSISTREFASYNC || PERSISTENCE == jsx3.app.Model.PERSISTREF;
    var objChild = jsx3.ide.changePersistenceTo(objJSX.load(strRelativePath, true, jsx3.ide.SERVER),
        bRef ? PERSISTENCE : jsx3.app.Model.PERSISTEMBED);

    if (objChild) {
//      //get the dom tree and open the parent (so newly-deserialized child content is visible)
//      objTree.toggleItem(objJSX.getId(),true);
      //select the new child just imported in the DOM tree
      jsx3.ide.maybeSelectNewDom([objChild]);

      //set dirty flag ( the file's been edited )
      jsx3.ide.getActiveEditor().setDirty(true);
    }
  };
  dialog.openForOpen(jsx3.ide.getCurrentDirectory(), jsx3.ide.getCurrentUserHome());
};


jsx3.ide.maybeSelectNewDom = function(objChilds, objTree) {
//  jsx3.log("maybeSelectNewDom " + objChild.getName());
  if (objTree == null) objTree = jsx3.IDE.getJSXByName("jsxdom");
  if (objTree == null)
    return;

  var settings = jsx3.ide.getIDESettings();

  if (settings.get('prefs', 'builder', 'domfocus')) {
    jsx3.ide.setDomValue(objChilds);
  }
};

jsx3.ide.setDomValue = function(objJSXs, objTree) {
  jsx3.sleep(function() { jsx3.ide._setDomValue(objJSXs, objTree); }, "jsx3.ide.setDomValue", null, true);
};

jsx3.ide._setDomValue = function(objJSXs, objTree) {
  if (objTree == null) objTree = jsx3.IDE.getJSXByName("jsxdom");

  if (objTree) {
    if (!objJSXs) objJSXs = [];
    var ids = [];
    for (var i = 0; i < objJSXs.length; i++)
      if (objJSXs[i]) ids[i] = objJSXs[i].getId();

    jsx3.ide.triggerDomTreeSelect(objTree, ids);

    for (var i = 0; i < objJSXs.length; i++)
      if (objJSXs[i]) jsx3.ide.revealItemInDom(objJSXs[i], objTree);
  }
};

jsx3.ide.domCopyNameToCB = function(strJSXId) {
  var objJSX = jsx3.ide.SERVER.getJSXById(strJSXId);
  jsx3.html.copy(objJSX != null ? objJSX.getName() : "");
};

jsx3.ide.domCopyGetterToCB = function(strJSXId) {
  var objJSX = jsx3.ide.SERVER.getJSXById(strJSXId);
  var ns = jsx3.ide.SERVER.getEnv("namespace");
  jsx3.html.copy(objJSX != null ? ns + '.getJSXByName("' + objJSX.getName() + '")': "");
};
