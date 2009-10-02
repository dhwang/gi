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
          ce.componentError(componentId, doc);
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
      console.log(propDoc);
      objXML.removeChild(properties);
      objCache.setDocument(componentId + '_properties', propDoc);
    }

    ce.viewComponent(componentId);
  };

  ce.componentTimeout = function(componentId, objXML) {
    console.log("TIMEOUT");
  };

  ce.componentError = function(componentId, objXML) {
    console.log("ERROR");
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

    var objMask = objColumn.getChild(maskId) || objColumn.getChild("textbox");

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
        this.getLog().error("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strRecordId + " is invalid, must not match " + regex);
        return false;
      }
    }

    if (propRecord.validate) {
      var regex = propRecord.validate.indexOf('/') == 0 ?
          jsx3.eval(propRecord.validate) : new RegExp(propRecord.validate);
      if (! strCheck.match(regex)) {
        this.getLog().error("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strRecordId + " is invalid, must match " + regex);
        return false;
      }
    }

    // eval the new text if needed
    if (propRecord["eval"] == "1") {
      try {
        strValue = this.eval(strValue);
      } catch (e) {
        this.getLog().error("error evaluating expression '" +
            (strValue != null ? jsx3.util.strEscapeHTML(strValue) : null) + "': " + jsx3.NativeError.wrap(e));
        return false;
      }
    }

    // check for special on edit script
    var changeScript = propRecord["jsxexecute"];

    if (propRecord.validatehtml) {
      if (jsx3.util.strEndsWith(jsx3.app.Browser.getLocation().getPath(), ".xhtml")) {
        var doc = new jsx3.xml.Document().loadXML("<jsxtext>" + strValue + "</jsxtext>");
        if (doc.hasError()) {
          this.getLog().error("When working in XHTML mode, the " + propRecord.jsxid + " property must be well-formed XML. (" +
              doc.getError() + ")");
          return false;
        }
      }
    }

    if (changeScript != null) {
      // script context
      try {
        this.eval(changeScript, {vntValue:strValue, objJSX:_targetComponent});
      } catch (e) {
        this.getLog().error("error evaluating expression '" + changeScript + "': " + jsx3.NativeError.wrap(e));
        return false;
      }
    } else {
      _targetComponent[strRecordId] = strValue;
      _targetComponent.repaint();
    }

    return true;
  };
});
