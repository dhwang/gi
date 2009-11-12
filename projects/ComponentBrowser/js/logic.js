/* place JavaScript code here */
jsx3.Package.definePackage("tibco.ce", function(ce){
  ce.init = function(){
    var doc = new jsx3.xml.Document().loadXML('<data/>');
    this.getCache().setDocument('source_xml', doc);
    this.setView(ce.WELCOME);
  };

  var _LOG = jsx3.util.Logger.getLogger("tibco.ce");
  ce.getLog = function() {
    return _LOG;
  };

  ce.WELCOME = 0;
  ce.LOADING = 1;
  ce.COMPONENT = 2;

  ce.setView = function(viewType, title) {
    var titleStr, view;
    var header = ce.getJSXByName('paneContentHeader');
    var container = ce.getJSXByName('paneContentContainer');
    var lytContent = ce.getJSXByName('lytContent');

    switch (viewType) {
      case ce.WELCOME:
        titleStr = 'Welcome';
        break;
      case ce.LOADING:
        titleStr = 'Loading Component';
        break;
      case ce.COMPONENT:
        titleStr = title;
        break;
    }

    header.setText(titleStr, true);
    var selectedIdx = container.getSelectedIndex();

    if (viewType != selectedIdx) {
      container.setSelectedIndex(viewType, true);
    }
  };

  var Document = jsx3.xml.Document;
  ce._onAsyncDone = function(objEvent) {
    var objXML = objEvent.target;
    var strEvtType = objEvent.subject;
    var componentId = objXML._componentId;

    delete objXML._componentId;
    objXML.unsubscribe("*", this);

    if (strEvtType == Document.ON_RESPONSE) {
      ce.componentLoaded(componentId, objXML);
    } else if (strEvtType == Document.ON_TIMEOUT) {
      ce.componentTimeout(componentId, objXML);
    } else if (strEvtType == Document.ON_ERROR) {
      ce.componentError(componentId, objXML.getError().toString());
    }
  };

  ce.componentSelect = function(tree, componentId) {
    this.setView(ce.LOADING);

    var rsURL = this.resolveURI('components/demos/' + componentId + '.xml');

    var doc = new Document();
    doc.setAsync(true);

    doc.subscribe('*', this, '_onAsyncDone');
    doc._componentId = componentId;
    doc.load(rsURL, 60000);
  };

  var _selectedComponentId = null;
  ce.componentLoaded = function(componentId, objXML) {
    var container = ce.getJSXByName('componentViewContainer');
    var root = container.getDescendantOfName('root');
    if (root) {
      container.removeChild(root);
    }

    container.loadXML(objXML, true);

    root = container.getDescendantOfName('root');
    var desc = root.getDescendantOfName('desc');
    if (desc) {
      desc.setText(root.getMetaValue('description'), true);
    }
    var name = root.getDescendantOfName('name');
    if (name) {
      name.setText(root.getMetaValue('name'), true);
    }


    var tree = ce.getJSXByName('treeExplorer');

    var record = tree.getRecord(componentId);
    var rNode = tree.getRecordNode(record.jsxid);

    var name = record.jsxtext;
    if (!record.jsximg) {
      name = rNode.getParent().getAttribute('jsxtext');
    }

    this.getCache().setDocument('source_xml', objXML);

    _selectedComponentId = componentId;
    this.setView(ce.COMPONENT, ce._getComponentTitle(rNode, record.jsxtext));
  };

  ce.componentTimeout = function(componentId) {
    ce.showError("Request timed out", "Timeout");
  };

  ce.componentError = function(componentId, error) {
    ce.showError(error, "Error");
  };

  ce._getComponentTitle = function(compNode, strName) {
    var compParent = compNode.getParent();

    var strName = compParent.getAttribute('jsxtext') + " &raquo; " + strName;

    if (compParent.getAttribute('jsximg') != "jsx:/images/tree/folder.gif") {
      strName = ce._getComponentTitle(compParent, strName);
    }

    return strName;
  };

  ce.viewSource = function(button) {
    button.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    var layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,50%", true);
  };

  ce.unViewSource = function(button) {
    var layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,0", true);
    button.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
  };

  ce.onCopySource = function (viewSource) {
  };

  ce.onDownloadFile = function (viewSource) {
  };

  ce.onMouseOverSource = function(buttonNode) {
    // This is hooked up in the properties of the view source components
    buttonNode.style.backgroundColor = '#aaaafe';
  };
  ce.onMouseOutSource = function(buttonNode) {
    // This is hooked up in the properties of the view source components
    buttonNode.style.backgroundColor = '#9898a5';
  };

  ce.getErrorDialog = function() {
    var name = "dlgErrors",
        body = this.getServer().getBodyBlock(),
        dialog = body.getChild(name);
    if (!dialog) {
      dialog =  body.load("components/" + name + ".xml");
      dialog.setName(name);
    }
    return dialog;
  };
  ce.showError = function(message, type) {
    var dialog = ce.getErrorDialog();
    dialog.focus();
    if (type) {
      var et = ce.getJSXByName("errorType");
      if (et) {
        et.setText(type, true);
      }
    }
    if (message) {
      var msg = ce.getJSXByName("paneErrorText");
      if (msg) {
        msg.setText(message);
      }
    }
  };
  ce.closeError = function(button) {
    var dialog = ce.getErrorDialog();
    dialog.doClose();
  };

  ce.openColorPickerMask = function(objMask) {
    objMask.suspendEditSession();

    var dlg = ce.getJSXByName('dlgColorPicker');
    dlg.getDescendantOfName("colorPicker").setValue(objMask.getMaskValue());
    dlg.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    dlg._jsxmask = objMask;

    dlg.focus();
  };
  ce._colorPickerMaskChoose = function(objEvent, picker) {
    var objMask = picker._jsxmask;

    var intRGB = picker.getDescendantOfName("colorPicker").getRGB();
    var hex = "#" + (0x1000000 + intRGB).toString(16).substring(1).toUpperCase();
    objMask.setMaskValue(hex);
    picker.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    objMask.getDescendantOfName("btnCP").focus();

    objMask.resumeEditSession();
    objMask.commitEditMask(objEvent, true);
  };

  ce._colorPickerMaskCancel = function(objEvent, picker) {
    var objMask = picker._jsxmask;
    picker.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    objMask.getDescendantOfName("btnCP").focus();
    objMask.resumeEditSession();
  };

  ce.onColorPick = function(intRGB, strSkip) {
    var hsb = jsx3.gui.ColorPicker.RGBtoHSB(intRGB),
        picker = ce.getJSXByName('dlgColorPicker');
    var getDesc = function(n){
      return picker.getDescendantOfName(n);
    };
    if (strSkip != "hsbH") getDesc('hsbH').setValue(Math.round(hsb[0] * 100));
    if (strSkip != "hsbS") getDesc('hsbS').setValue(Math.round(hsb[1] * 100));
    if (strSkip != "hsbB") getDesc('hsbB').setValue(Math.round(hsb[2] * 100));
    if (strSkip != "rgbR") getDesc('rgbR').setValue((intRGB & 0xFF0000) >> 16);
    if (strSkip != "rgbG") getDesc('rgbG').setValue((intRGB & 0x00FF00) >> 8);
    if (strSkip != "rgbB") getDesc('rgbB').setValue((intRGB & 0x0000FF) >> 0);
    var hex = "#" + (0x1000000 + intRGB).toString(16).substring(1).toUpperCase();
    if (strSkip != "rgbHex") getDesc('rgbHex').setValue(hex);
    getDesc('preview').setBackgroundColor(hex, true);
  };

  ce._onAxisPicker = function(strMode) {
    var intAxis = null;
    switch (strMode) {
      case "h": intAxis = jsx3.gui.ColorPicker.HUE; break;
      case "s": intAxis = jsx3.gui.ColorPicker.SATURATION; break;
      case "b": intAxis = jsx3.gui.ColorPicker.BRIGHTNESS; break;
    }

    var colorPicker = ce.getJSXByName('colorPicker');
    if (intAxis != null) {
      colorPicker.setAxis(intAxis);
      colorPicker.repaint();
    }
  };

  ce._onPreviewClick = function() {
    var colorPicker = ce.getJSXByName('colorPicker');
    var intRGB = colorPicker.getRGB();
    var hex = "#" + (0x1000000 + intRGB).toString(16).substring(1).toUpperCase();
    jsx3.html.copy(hex);
  };

  ce._onTextChange = function(objText, strValue) {
    if (objText.getName() == "rgbHex") {
      strValue = strValue.replace(/[^a-fA-F0-9]/g, "");
      strValue = parseInt("0x" + strValue);
      var colorPicker = ce.getJSXByName('colorPicker');
      colorPicker.setRGB(strValue);
      this.onColorPick(colorPicker.getRGB(), objText.getName());
    } else {
      var val = Math.max(objText.cpmin, Math.min(objText.cpmax, parseInt(strValue)));
      if (isNaN(val)) val = 0;
      this._updateOneAxis(objText.cpindex, objText.getName().indexOf("hsb") == 0, val, objText.getName());
    }
  };

  ce._onTextWheel = function(objText, objEvent) {
    var val = Math.round(Math.max(objText.cpmin, Math.min(objText.cpmax, parseInt(objText.getValue()) + objEvent.getWheelDelta())));
    if (isNaN(val)) val = 0;
    objText.setValue(val);
    this._updateOneAxis(objText.cpindex, objText.getName().indexOf("hsb") == 0, val, objText.getName());
    objEvent.cancelBubble();
  };

  ce._onTextKeyDown = function(objText, objEvent) {
    if (objEvent.downArrow() || objEvent.upArrow()) {
      var val = Math.max(objText.cpmin, Math.min(objText.cpmax, parseInt(objText.getValue()) + (objEvent.upArrow() ? 1 : -1)));
      if (isNaN(val)) val = 0;
      objText.setValue(val);
      this._updateOneAxis(objText.cpindex, objText.getName().indexOf("hsb") == 0, val, objText.getName());
      objEvent.cancelAll();
    }
  };

  ce._updateOneAxis = function(intIndex, bHSB, intValue, strSkip) {
    var colorPicker = ce.getJSXByName('colorPicker');
    if (bHSB) {
      var hsb = jsx3.gui.ColorPicker.RGBtoHSB(colorPicker.getRGB());
      hsb[intIndex] = intValue/100;
      colorPicker.setHSB(hsb[0], hsb[1], hsb[2]);
      this.onColorPick(colorPicker.getRGB(), strSkip);
    } else {
      var rgb = colorPicker.getRGB();
      rgb = [(rgb & 0xFF0000) >> 16, (rgb & 0xFF00) >> 8, (rgb & 0xFF) >> 0];
      rgb[intIndex] = intValue;
      colorPicker.setRGB((rgb[0] << 16) + (rgb[1] << 8) + rgb[2]);
      this.onColorPick(colorPicker.getRGB(), strSkip);
    }
  };

  ce._findMatches = function(children, strSearch) {
    var results = new jsx3.util.List([]);

    while (children.hasNext()) {
      var child = children.next();
      if (child.getAttribute('jsxtext').toLowerCase().indexOf(strSearch) > -1) {
        var childClone = child.cloneNode(true);
        childClone.setAttribute('jsxopen', '1');
        results.add(childClone);
      } else {
        var childIter = child.getChildIterator();
        if (childIter.hasNext()) {
          var childResults = ce._findMatches(childIter, strSearch);
          var iter = childResults.iterator();
          if (iter.hasNext()) {
            var childClone = child.cloneNode(false);
            childClone.setAttribute('jsxopen', '1');
            do {
              var c = iter.next();
              childClone.appendChild(c.cloneNode(true));
            } while (iter.hasNext());
            results.add(childClone);
          }
        }
      }
    }

    return results;
  };

  var _searchBlank = true;
  ce.onSearch = function(searchbox) {
    var text = jsx3.util.strTrim(searchbox.getValue());
    var tree = this.getJSXByName('treeExplorer');

    var xmlDoc = this.getCache().getDocument('components_xml');

    if (_searchBlank && _selectedComponentId) {
      // deselect the old selected component if there is one
      var oldSelected = xmlDoc.selectSingleNode('//record[@jsxselected="1"]');
      if (oldSelected) {
        oldSelected.setAttribute('jsxselected', '0');
      }

      // select the currently selected component
      var toSelect = xmlDoc.selectSingleNode('//record[@jsxid="' + _selectedComponentId + '"]');
      toSelect.setAttribute('jsxselected', '1');

      // open the currently selected demo's parent nodes
      var toOpen = toSelect.getParent();
      while (toOpen.getAttribute('jsxid') != 'jsxrootnode') {
        toOpen.setAttribute('jsxopen', '1');
        toOpen = toOpen.getParent();
      }

      tree.setXMLId('components_xml');
      tree.repaint();
      return;
    }

    var searchDoc = this.getCache().getDocument('search_results_xml');

    if (!searchDoc) {
      searchDoc = (new jsx3.xml.Document()).loadXML('<data jsxid="jsxroot"><record jsxid="jsxrootnode" jsxtext="rootnode" jsxunselectable="1" jsxopen="1"/></data>');
      this.getCache().setDocument('search_results_xml', searchDoc);
    }

    var searchRoot = searchDoc.selectSingleNode('//record[@jsxid="jsxrootnode"]');
    searchRoot.removeChildren();

    var categories = xmlDoc.selectNodeIterator('/data/record/record');
    var searchString = text.toLowerCase();

    while (categories.hasNext()) {
      var category = categories.next();
      var results = ce._findMatches(category.getChildIterator(), searchString);

      if (results.size()) {
        var categoryIter = results.iterator();
        var categoryClone = category.cloneNode(false);
        categoryClone.setAttribute('jsxopen', '1');
        do {
          categoryClone.appendChild(categoryIter.next().cloneNode(true));
        } while (categoryIter.hasNext());
        searchRoot.appendChild(categoryClone);
      }
    }

    tree.setXMLId('search_results_xml');
    tree.repaint();
  };

  ce.onSearchFocus = function (searchbox) {
    var text = jsx3.util.strTrim(searchbox.getValue());
    if (text == "Search") {
      searchbox.setValue("");
    }
    this.onSearchIncChange(searchbox, searchbox.getValue());
    searchbox.setColor('#000000', true);
  };

  ce.onSearchBlur = function (searchbox) {
    var text = jsx3.util.strTrim(searchbox.getValue());
    if (text == "") {
      searchbox.setColor('#b8b8c5', true).setValue("Search");
    }
    this.onSearchIncChange(searchbox, text);
  };

  ce.onSearchClear = function(searchbox) {
    searchbox.setValue("").focus();
    this.onSearch(searchbox);
    this.onSearchIncChange(searchbox, "");
  };

  ce.onSearchIncChange = function(searchbox, value) {
    var clear = this.getJSXByName('search_clear');
    if (value.length) {
      _searchBlank = false;
      if (clear.getDisplay() != jsx3.gui.Block.DISPLAYBLOCK) {
        clear.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
      }
    } else {
      _searchBlank = true;
      clear.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    }
  };

  ce.onComponentViewChanged = function(container, button){
    var contDim = container.getParent().getClientDimensions();
    var btnDim = button.getDimensions();
    button.setDimensions(
      contDim.parentwidth - btnDim[2],
      contDim.parentheight - btnDim[3],
      null,
      null,
      true
    );
  };
});
