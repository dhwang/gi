/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.openPalettesOnStartup = function() {
	var menu = jsx3.IDE.getJSXByName('jsxmenu_palettes');
  if (menu != null) {
    // load each palette
    var objXML = menu.getXML();
    var n = 0;
    for (var i = objXML.selectNodeIterator('//record[@ideurl]'); i.hasNext(); ) {
      var id = i.next().getAttribute("jsxid");
      var job = jsx3.makeCallback(function(jsxid) {
        jsx3.ide.doSelectPalette(menu, jsxid, true);
      }, null, id);
      jsx3.ide.QUEUE.addJob(job, n++);
		}
  }
};

jsx3.ide.doSelectPalette = function(objMenu, strRecordId, bStartUp) {
	var objNode = objMenu.getRecordNode(strRecordId);
	var strName = objNode.getAttribute('idename');
	var settings = jsx3.ide.getIDESettings();
	
  // if this is startup, then don't open a palette that is closed (otherwise a toggle action occurs)
  if (bStartUp && settings.get('palettes', strName, 'closed'))
		return;
	
	if (strName) {
    // see if palette is existing
    var objContent = jsx3.IDE.getJSXByName(strName);
		
		if (objContent != null) {
			var objContainer = objContent.findAncestor(jsx3.ide.findPaletteContainer, true);
			
      // toggle existing palette:  existing -> focused -> closed
      if (objContainer.isFront()) {
				jsx3.ide.doMovePalette(objContent, 'close');
			} else {
				objContainer.focus();
			}
		} else {
      // open a closed palette
      var strUrl = objNode.getAttribute('ideurl');
			settings.set('palettes', strName, 'closed', false);
			
      // read stored preferences for location and size of new palette
      var palettePrefs = settings.get('palettes', strName);
			
			var isDialog = false, quadrant = null;
			if (palettePrefs) {
				if (palettePrefs['float'] != null) isDialog = palettePrefs['float'];
				if (palettePrefs.quadrant != null) quadrant = palettePrefs.quadrant;
			}
			
			if (quadrant == null) {
        if (!bStartUp || objNode.getAttribute('idedefaultclosed') != "1")
  				quadrant = objNode.getAttribute('idedefault');
      }
			
      if (! isDialog) {
        // creating a Stack palette
        var stackGroup = jsx3.IDE.getJSXByName('jsx_ide_quadrant_' + quadrant);
				if (stackGroup != null) {
          // load the Stack and its content, don't insertHTML is this is startup since repaint() will happen
          var stack = stackGroup.loadAndCache('components/palettes/stack.xml');//, !bStartUp);
					var content = stack.load(strUrl, false);//, !bStartUp);
				  stack.paintChild(content);
          
          // set the title of the stack from an invisible component in the content
          var titleBlock = content.getDescendantOfName('jsx_ide_palette_title');
          // the titles are dynamic properties and may not be initialized on startup
          titleBlock.applyDynamicProperties();
          stack.setText(titleBlock.getText(), true);//!bStartUp);
				
          if (! bStartUp) {
            stack.focus(); // focus the stack
            jsx3.ide.rebalancePaletteDocks(stackGroup.getName()); // show/collapse stack groups as necessary
          }
        }
			} else {
        // creating a Dialog palette
        var dialog = jsx3.IDE.getRootBlock().loadAndCache('components/palettes/dialog.xml', false);
				var content = dialog.load(strUrl, false);
        
        // set the title of the dialog from an invisible component in the content
        var titleBlock = content.getDescendantOfName('jsx_ide_palette_title');
        titleBlock.applyDynamicProperties();
        dialog.getCaptionBar().setText(titleBlock.getText());
				
        // restore the position and size of the dialog if available from settings
        var dialogDim = palettePrefs.dialog;
				if (dialogDim)
					dialog.setDimensions(dialogDim.left, dialogDim.top, dialogDim.width, dialogDim.height);
				
        jsx3.IDE.getRootBlock().paintChild(dialog);
        dialog.focus();
			}
		}
	}
};

jsx3.ide.doMovePalette = function(objMenu, strMoveTo) {
	var objContainer = objMenu.findAncestor(jsx3.ide.findPaletteContainer, true);

	// persist new settings
	var settings = jsx3.ide.getIDESettings();
	var objContent = objContainer.getFirstChildOfType(jsx3.gui.Block, true);
	
	if (strMoveTo == "float") {
		settings.set('palettes', objContent.getName(), 'float', true);
		
		if (objContainer instanceof jsx3.gui.Stack)
			jsx3.ide.swapStackToDialog(objContainer, settings.get('palettes', objContent.getName(), 'dialog'));
    
  } else if (strMoveTo == "close") {
		settings.set('palettes', objContent.getName(), 'closed', true);
		
    // timeout necessary because the menu which may invoke this operation is a child of what is being removed
    window.setTimeout(function(){
			var parent = objContainer.getParent();
			parent.removeChild(objContainer);
			if (objContainer instanceof jsx3.gui.Stack)
				jsx3.ide.rebalancePaletteDocks(parent.getName());
		;}, 1);
    
  } else if (strMoveTo.indexOf('q') == 0) {
		settings.set('palettes', objContent.getName(), 'float', false);
		settings.set('palettes', objContent.getName(), 'quadrant', strMoveTo);
		
		var stackGroup = jsx3.IDE.getJSXByName('jsx_ide_quadrant_' + strMoveTo);
		if (stackGroup != null) {
			if (objContainer instanceof jsx3.gui.Stack) {
				if (stackGroup != objContainer.getParent()) {
          // timeout for menu close
          window.setTimeout(function(){
						var oldParent = objContainer.getParent();
						stackGroup.adoptChild(objContainer, true);
						objContainer.focus();
						jsx3.ide.rebalancePaletteDocks(oldParent.getName());
						jsx3.ide.rebalancePaletteDocks(stackGroup.getName());
					}, 1);
				}
			} else {
				jsx3.ide.swapDialogToStack(objContainer, stackGroup);
			}
		}
	} else {
		// not supported
	}
};

jsx3.ide.swapStackToDialog = function(objStack, objDim) {
	var dialog = jsx3.IDE.getRootBlock().loadAndCache('components/palettes/dialog.xml', false);
	dialog.getCaptionBar().setText(objStack.getText());

  if (objDim != null)
    dialog.setDimensions(objDim.left, objDim.top, objDim.width, objDim.height);
  
  var content = objStack.getFirstChildOfType(jsx3.gui.Block, true);
	dialog.adoptChild(content, false);

  jsx3.IDE.getRootBlock().paintChild(dialog);
  dialog.focus();

  jsx3.sleep(function(){
		var parent = objStack.getParent(); 
		parent.removeChild(objStack);
		jsx3.ide.rebalancePaletteDocks(parent.getName());
	});
};

jsx3.ide.swapDialogToStack = function(objDialog, objStackGroup) {
  objDialog.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
  var stack = objStackGroup.loadAndCache('components/palettes/stack.xml', false);
  jsx3.sleep(function() {
    stack.setText(objDialog.getCaptionBar().getText());
    var content = objDialog.getFirstChildOfType(jsx3.gui.Block, true);
    stack.adoptChild(content, false);
    objStackGroup.paintChild(stack);
  });
  jsx3.sleep(function() { stack.focus(); });
  jsx3.sleep(function() {
		var parent = objDialog.getParent(); 
		parent.removeChild(objDialog);
		jsx3.ide.rebalancePaletteDocks(objStackGroup.getName());
	});
};

jsx3.ide.rebalancePaletteDocks = function(strAffectedQuadrant) {
	var ch1 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q1').getChildren().length;
	var ch2 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q2').getChildren().length;
	var ch3 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q3').getChildren().length;
	var ch4 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q4').getChildren().length;
	var ch5 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q5').getChildren().length;
	
	if (strAffectedQuadrant == 'jsx_ide_quadrant_q1') {
		this.rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter3'), jsx3.IDE.getJSXByName('jsx_ide_splitter2'),
				ch1, ch2, '0%', '100%', '0%', '20%');
	} else if (strAffectedQuadrant == 'jsx_ide_quadrant_q2') {
		this.rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter3'), jsx3.IDE.getJSXByName('jsx_ide_splitter2'),
				ch2, ch1, '100%', '0%', '0%', '20%');
	} else if (strAffectedQuadrant == 'jsx_ide_quadrant_q3') {
		this.rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter5'), jsx3.IDE.getJSXByName('jsx_ide_splitter4'),
				ch3, ch4, '0%', '100%', '100%', '75%');
	} else if (strAffectedQuadrant == 'jsx_ide_quadrant_q4') {
		this.rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter5'), jsx3.IDE.getJSXByName('jsx_ide_splitter4'),
				ch4, ch3, '100%', '0%', '100%', '75%');
	} else {
		// close any unneeded splitters after startup
		if (ch1 == 0) {
			jsx3.IDE.getJSXByName('jsx_ide_splitter3').setSubcontainer1Pct('0%',true);
			if (ch2 == 0) {
				jsx3.IDE.getJSXByName('jsx_ide_splitter2').setSubcontainer1Pct('0%',true);
			}
		} else if (ch2 == 0) {
			jsx3.IDE.getJSXByName('jsx_ide_splitter3').setSubcontainer1Pct('100%',true);			
		}
		if (ch3 == 0) {
			jsx3.IDE.getJSXByName('jsx_ide_splitter5').setSubcontainer1Pct('0%',true);
			if (ch4 == 0) {
				jsx3.IDE.getJSXByName('jsx_ide_splitter4').setSubcontainer1Pct('100%',true);
			}
		} else if (ch4 == 0) {
			jsx3.IDE.getJSXByName('jsx_ide_splitter5').setSubcontainer1Pct('100%',true);
		}
	}
};

jsx3.ide.rebalancePaletteDock2 = function(splitterHalf, splitterSide, child1, child2, 
		halfClosed, halfOpen, sideClosed, sideOpen) {
	if (child1 == 0) {
		splitterHalf.setSubcontainer1Pct(halfClosed,true);
		if (child2 == 0)
			splitterSide.setSubcontainer1Pct(sideClosed, true);
	} else if (child2 == 0) {
		splitterHalf.setSubcontainer1Pct(halfOpen,true);
	} else {
		var halfSplit = parseInt(splitterHalf.getSubcontainer1Pct());
		if (halfSplit < 5 || halfSplit > 95) 
			splitterHalf.setSubcontainer1Pct('50%', true);
	}
	
	var sideSplit = parseInt(splitterSide.getSubcontainer1Pct());
	var sideClosedInt = parseInt(sideClosed);
	if ((child1+child2) > 0 && ((sideClosedInt >= 50 && sideSplit > 95) 
			|| (sideClosedInt < 50 &&  sideSplit < 5)))
		splitterSide.setSubcontainer1Pct(sideOpen, true);
};

jsx3.ide.paletteDidMove = function(objDialog) {
	var settings = jsx3.ide.getIDESettings();
	var objContent = objDialog.getFirstChildOfType(jsx3.gui.Block, true);
	var dialogPos = {left: objDialog.getLeft(), top: objDialog.getTop(),
			width: objDialog.getWidth(), height: objDialog.getHeight()};
	settings.set('palettes', objContent.getName(), 'dialog', dialogPos);
};

jsx3.ide.splitterDidMove = function(objSplitter) {
//	var settings = jsx3.ide.getIDESettings();
//	settings.set('window', 'splitters', objSplitter.getName(), objSplitter.getSubcontainer1Pct());
};

jsx3.ide.findPaletteContainer = function(objGui) {
	return (objGui instanceof jsx3.gui.Dialog || objGui instanceof jsx3.gui.Stack);
};

jsx3.ide.updatePaletteMenu = function(objMenu) {
	var xml = objMenu.getXML();
  var bProjectOpen = jsx3.ide.SERVER != null;
  
  for (var i = xml.selectNodeIterator("/data/record"); i.hasNext(); ) {
		var node = i.next();
		var name = node.getAttribute('idename');
		if (name) {
			// special handling for system out, which really isn't a palette
			var active = false;
			if (name == "jsx_ide_systemout")
				active = jsx3.ide.getSystemOutLocation() != 'closed';
			else
				active = jsx3.IDE.getJSXByName(name) != null;
			
			objMenu.selectItem(node.getAttribute('jsxid'), active);
		}
    
    if (! bProjectOpen && node.getAttribute('project') == "1")
      objMenu.enableItem(node.getAttribute('jsxid'), false);
  }
};

jsx3.ide.toggleStageOnly = function(bShowPalettes) {
	var splitter1 = jsx3.IDE.getJSXByName('jsx_ide_splitter1');
	var splitter2 = jsx3.IDE.getJSXByName('jsx_ide_splitter2');
	var splitter4 = jsx3.IDE.getJSXByName('jsx_ide_splitter4');
	
	var pct1 = parseInt(splitter1.getSubcontainer1Pct());
	var pct2 = parseInt(splitter2.getSubcontainer1Pct());
	var pct4 = parseInt(splitter4.getSubcontainer1Pct());
	
	if (bShowPalettes == null)
		bShowPalettes = pct1 > 95 || pct2 < 5 || pct4 > 95;
	
	if (bShowPalettes) {
		if (pct1 > 95)
			splitter1.setSubcontainer1Pct(splitter1._jsxlastopen || splitter1.jsxdefault1pct, true);
		if (pct2 < 5)
			splitter2.setSubcontainer1Pct(splitter2._jsxlastopen || splitter2.jsxdefault1pct, true);
		if (pct4 > 95)
			splitter4.setSubcontainer1Pct(splitter4._jsxlastopen || splitter4.jsxdefault1pct, true);
	} else {
		splitter1._jsxlastopen = pct1 > 95 ? null : pct1;
		splitter2._jsxlastopen = pct2 < 5 ? null : pct2;
		splitter4._jsxlastopen = pct4 > 95 ? null : pct4;
		
		splitter1.setSubcontainer1Pct("100%", true);
		splitter2.setSubcontainer1Pct("0%", true);
		splitter4.setSubcontainer1Pct("100%", true);
	}
};
