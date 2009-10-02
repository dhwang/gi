/* place JavaScript code here */
jsx3.Package.definePackage("tibco.ce", function(ce){
  ce.init = function(){
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

    var component = ce.getJSXByName('demo_' + componentId);
    var target = component.getDescendantOfName('target');

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
        var recordNode = i.next();
        var propName = recordNode.getAttribute('jsxid');
        var getter = recordNode.getAttribute("getter");
        var stepDynVal = _targetComponent.getDynamicProperty(propName);

        var stepVal = null;
        if (getter) {
          if (/^[_a-zA-Z]\w*$/.test(getter)) {
            stepVal = _targetComponent[getter]();
          } else {
            stepVal = _targetComponent.eval(getter);
          }
        } else if (_targetComponent[propName] != null) {
          stepVal = _targetComponent[propName];
        }

        recordNode.setAttribute('value', stepVal);
        recordNode.setAttribute('jsxdynamic', stepDynVal);
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
  };

  ce.viewSource = function(button) {
    var componentId = _selectedComponent.jsxname.slice(5);
    var doc = ce.getCache().getDocument(componentId);

    var sourceBlock = ce.getJSXByName('sourceBlock');
    sourceBlock.setText('<pre>' + doc.getXML().replace(/</g, '&lt;') + '</pre>', true);

    var layout = ce.getJSXByName('lytProperties');
    layout.setRows("*,0", true);
    layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,50%", true);
  };

  ce.unViewSource = function() {
    var layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,0", true);
    layout = ce.getJSXByName('lytProperties');
    layout.setRows("*,25", true);
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

    var strCheck = strValue != null ? strValue.toString() : "";

    if (propRecord.disallow) {
      var regex = propRecord.disallow.indexOf('/') == 0 ?
          jsx3.eval(propRecord.disallow) : new RegExp(propRecord.disallow);
      if (strCheck.match(regex)) {
        ce.showError("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strRecordId + " is invalid, must not match " + regex, "Input Error");
        return false;
      }
    }

    if (propRecord.validate) {
      var regex = propRecord.validate.indexOf('/') == 0 ?
          jsx3.eval(propRecord.validate) : new RegExp(propRecord.validate);
      if (! strCheck.match(regex)) {
        ce.showError("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strRecordId + " is invalid, must match " + regex, "Validation Error");
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

    if (changeScript != null) {
      // script context
      try {
        this.eval(changeScript, {vntValue:strValue, objJSX:_targetComponent});
      } catch (e) {
        ce.showError("error evaluating expression '" + changeScript + "': " + jsx3.NativeError.wrap(e));
        return false;
      }
    } else {
      _targetComponent[strRecordId] = strValue;
      _targetComponent.repaint();
    }

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
  }
});
