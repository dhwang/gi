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

  ce.WELCOME = 'welcome';
  ce.LOADING = 'loading';
  ce.COMPONENT = 'component';

  ce.setView = function(viewType, title) {
    var titleStr, view;
    var header = ce.getJSXByName('paneContentHeader');
    var container = ce.getJSXByName('paneContentContainer');

    var lytContent = ce.getJSXByName('lytContent');

    var children = container.getChildren();
    for (var i=0, child; child=children[i]; i++) {
      child.setDisplay(
        child.jsxname.indexOf(viewType) == 0 ?
          jsx3.gui.Block.DISPLAYBLOCK :
          jsx3.gui.Block.DISPLAYNONE
      );
    }
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

    header.setText(titleStr);
    lytContent.repaint();
  };

  ce.componentSelect = function(tree, componentId) {
    var component = ce.getJSXByName('demo_' + componentId);
    if(component){
      ce.viewComponent(componentId, component);
      return;
    }

    this.setView(ce.LOADING);

    var objCache = this.getCache();
    var rsURL = this.resolveURI('components/demos/' + componentId + '.xml');

    var doc = objCache.getDocument(componentId);

    if (!doc) {
      var loadFunc = function(objEvent) {
        var Document = jsx3.xml.Document;
        var doc = objCache.getDocument(objEvent.id);
        var strEvtType = objEvent.response;
        var strId = objEvent.id;

        objCache.unsubscribe('load.' + componentId, loadFunc);

        if (strEvtType == Document.ON_RESPONSE) {
          ce.componentLoaded(componentId, doc);
        } else if (strEvtType == Document.ON_TIMEOUT) {
          ce.componentTimeout(componentId, doc);
        } else if (strEvtType == Document.ON_ERROR) {
          ce.componentError(componentId, doc.getAttribute('error'));
        }
      };

      objCache.subscribe('load.' + componentId, loadFunc);
      doc = objCache.getOrOpenAsync(rsURL, componentId);
    } else {
      ce.componentLoaded(componentId, doc);
    }
  };

  ce.componentLoaded = function(componentId, objXML) {
    var demoView = ce.getJSXByName('componentDemoView');
    demoView.loadXML(objXML, true);

    var objCache = this.getCache();
    var propDoc = objCache.getDocument(componentId + '_properties');

    var properties = objXML.selectSingleNode('//t:serialization/properties', 'xmlns:t="urn:tibco.com/v3.0"');

    if (properties && !propDoc) {
      propDoc = new jsx3.xml.CDF.Document.newDocument();
      var iter = properties.selectNodeIterator('//properties/data/record');
      while (iter.hasNext()) {
        var record = iter.next().cloneNode(true);
        for (var i = record.selectNodeIterator("//enum"); i.hasNext(); ) {
          var objNode = i.next();
          var value = objNode.getAttribute('jsxid');
          if (objNode.getAttribute("eval") !== "0")
              value = jsx3.eval(value);
          objNode.setAttribute('jsxvalue', value);
        }
        propDoc.appendChild(record);
      }
      objXML.removeChild(properties);
      objCache.setDocument(componentId + '_properties', propDoc);
    }

    ce.viewComponent(componentId);
  };

  ce.componentTimeout = function(componentId) {
    ce.showError("Request timed out", "Timeout");
  };

  ce.componentError = function(componentId, error) {
    ce.showError(error, "Error");
  };

  ce._updatePropertyNode = function(objNode, component) {
    var getter = objNode.getAttribute("getter");
    var propName = objNode.getAttribute("jsxprop") || objNode.getAttribute("jsxid");
    var target = objNode.getAttribute("jsxtarget");
    target = target ? component.getDescendantOfName(target) : _targetComponent;
    var dynVal = target.getDynamicProperty(propName);

    var stepVal = null;
    if (getter) {
      if (/^[_a-zA-Z]\w*$/.test(getter)) {
        stepVal = target[getter]();
      } else {
        stepVal = target.eval(getter);
      }
    } else if (target[propName] != null) {
      stepVal = target[propName];
    }

    objNode.setAttribute('value', stepVal);
    objNode.setAttribute('jsxdynamic', dynVal);
  };

  var _selectedComponent = null, _targetComponent = null;
  ce.viewComponent = function(componentId, component) {
    if (_selectedComponent) {
      _selectedComponent.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    }

    var component = component || ce.getJSXByName('demo_' + componentId);
    _targetComponent = component.getDescendantOfName('target');

    var propDoc = this.getCache().getDocument(componentId + '_properties');

    var propEditor = ce.getJSXByName('propertiesMatrix');
    var propEditorPane = ce.getJSXByName('propertiesMatrixPane');
    var propEditorCont = ce.getJSXByName('propertiesMatrixContainer');
    if (propDoc) {
      var count = 0;
      for (var i=propDoc.selectNodeIterator('//record'); i.hasNext(); ) {
        count++;
        ce._updatePropertyNode(i.next(), component);
      }
      propEditor.setSourceXML(propDoc);
      // set the container block to the same height as the number of rows
      // time the height of each row
      propEditorCont.setHeight(count * 20);
      propEditorPane.setDisplay(jsx3.gui.Block.DISPLAYBLOCK);
      propEditorPane.repaint();
    } else {
      propEditorPane.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    }

    var tree = ce.getJSXByName('treeExplorer');
    var compName = ce.getJSXByName('panePropertiesName');

    var record = tree.getRecord(componentId);
    var rNode = tree.getRecordNode(record.jsxid);
    var pNode = rNode.getParent();

    var name = pNode.getAttribute("jsxtext");

    this.setView(ce.COMPONENT, name + " &raquo; " + record.jsxtext);
    compName.setText(name, true);
    component.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);

    _selectedComponent = component;

    this._updateSource();
  };

  var _sourceOpen = false;
  ce.viewSource = function(button) {
    this._updateSource(true);
    var layout = ce.getJSXByName('lytProperties');
    layout.setRows("*,0", true);
    layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,50%", true);
    _sourceOpen = true;
  };

  ce.unViewSource = function() {
    var layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,0", true);
    layout = ce.getJSXByName('lytProperties');
    layout.setRows("*,25", true);
    _sourceOpen = false;
  };

  ce._updateSource = function(force) {
    if (!_sourceOpen && !force) return;
    this.getCache().setDocument('source_xml', _targetComponent.toXMLDoc());
  };


  ce.onMouseOverSource = function(buttonNode) {
    // This is hooked up in the properties of the view source components
    buttonNode.style.backgroundColor = '#aaaafe';
  };
  ce.onMouseOutSource = function(buttonNode) {
    // This is hooked up in the properties of the view source components
    buttonNode.style.backgroundColor = '#9898a5';
  };

  ce.onBeforePropertyEdit = function(objGrid, objColumn, strRecordId) {
    if (objColumn != objGrid.getChild(1)) return false;

    var objRecord = objGrid.getRecordNode(strRecordId);
    var maskId = objRecord.getAttribute("jsxmask");
    if (!maskId) return false;

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

  ce.onAfterPropertyEdit = function(objGrid, strRecordId, strValue) {
    //called when the edit mask is about to be committed (jsxafteredit)
    var propRecord = objGrid.getRecord(strRecordId);

    if (typeof(strValue) == "string")
      strValue = jsx3.util.strTrim(strValue);

    return ce._editObjectProperty(propRecord, propRecord.jsxprop||strRecordId, strValue);
  };

  ce.onPropertyMenuExecute = function(objMenu, strRecordId) {
    //called when a menu item is selected; get its id; two are standard; all others are lookups
    var oPE = ce.getJSXByName('propertiesMatrix');
    var recordId = objMenu.getContextRecordId();
    var objRecord = oPE.getRecordNode(recordId);
    var strPropName = objRecord.getAttribute('jsxprop')||recordId;
    var target = objRecord.getAttribute('jsxtarget');
    target = target ? _selectedComponent.getDescendantOfName(target) : _targetComponent;
    var strLookupId;

    if (strRecordId == "jsxdpclear") {
      target.setDynamicProperty(strPropName);
      this._editObjectProperty(oPE.getRecord(recordId), strPropName, null);
    }

    this._updatePropertyNode(objRecord, _selectedComponent);

    oPE.redrawRecord(recordId, jsx3.xml.CDF.UPDATE, oPE.getChild("propertiesValueColumn"));
  };

  ce._editObjectProperty = function(propRecord, propName, strValue) {
    var strCheck = strValue != null ? strValue.toString() : "";

    if (propRecord.disallow) {
      var regex = propRecord.disallow.indexOf('/') == 0 ?
          jsx3.eval(propRecord.disallow) : new RegExp(propRecord.disallow);
      if (strCheck.match(regex)) {
        ce.showError("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + propName + " is invalid, must not match " + regex, "Input Error");
        return false;
      }
    }

    if (propRecord.validate) {
      var regex = propRecord.validate.indexOf('/') == 0 ?
          jsx3.eval(propRecord.validate) : new RegExp(propRecord.validate);
      if (! strCheck.match(regex)) {
        ce.showError("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + propName + " is invalid, must match " + regex, "Validation Error");
        return false;
      }
    }

    // eval the new text if needed
    if (propRecord["eval"] == "1") {
      try {
        strValue = this.eval(strValue);
      } catch (e) {
        ce.showError("error evaluating expression '" +
            (strValue != null ? jsx3.util.strEscapeHTML(strValue) : null) + "': " + jsx3.NativeError.wrap(e));
        return false;
      }
    }

    // check for special on edit script
    var changeScript = propRecord["jsxexecute"];
    var target = propRecord["jsxtarget"];
    target = target ? _selectedComponent.getDescendantOfName(target) : _targetComponent;

    if (changeScript != null) {
      // script context
      try {
        this.eval(changeScript, {vntValue:strValue, objJSX:target});
      } catch (e) {
        ce.showError("error evaluating expression '" + changeScript + "': " + jsx3.NativeError.wrap(e));
        return false;
      }
    } else {
      target[propName] = strValue;
      target.repaint();
    }

    this._updateSource();

    return true;
  };

  ce.makeSpy = function(objGrid, strRecordId) {
    var node = objGrid.getRecordNode(strRecordId);
    if (node == null) return null;

    var desc = node.getAttribute("jsxtip");
    var getter = node.getAttribute("docgetter");
    if (getter && getter.indexOf("(") < 0)
      getter += "()";
    var setter = node.getAttribute("docsetter");
    if (setter && setter.indexOf("(") < 0)
      setter += "()";
    var deflt = node.getAttribute("docdefault");

    var dep = node.getAttribute("deprecated");

    var strHTML = "";
    strHTML += "<span class='jsx3ide_propsspy'>";

    strHTML += "<div class='name" + (dep ? " deprecated" : "") + "'>" + node.getAttribute("jsxtext") + "</div>";

    if (dep)
      strHTML += "<div class='desc dep'><span class='title'>Deprecated.</span> " + (dep != "1" ? dep : "") + "</div>";

    strHTML += "<div class='desc'>" + (desc || "<i>No description provided.</i>") + "</div>";
    if (deflt)
      strHTML += "<div class='deflt'><span class='title'>Default Value:</span> " + deflt + "</div>";
    if (getter)
      strHTML += "<div class='method'><span class='title'>Getter:</span> " + getter + "</div>";
    if (setter)
      strHTML += "<div class='method'><span class='title'>Setter:</span> " + setter + "</div>";
    if (! node.getAttribute("docnoprop"))
      strHTML += "<div class='prop'><span class='title'>Property:</span> " + node.getAttribute("jsxid") + "</div>";

    strHTML += "</span>";
    return strHTML;
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

    if (_searchBlank && _selectedComponent) {
      var selectedId = _selectedComponent.jsxname.slice(5);

      // deselect the old selected component if there is one
      var oldSelected = xmlDoc.selectSingleNode('//record[@jsxselected="1"]');
      if (oldSelected) {
        oldSelected.setAttribute('jsxselected', '0');
      }

      // select the currently selected component
      var toSelect = xmlDoc.selectSingleNode('//record[@jsxid="' + selectedId + '"]');
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
});
