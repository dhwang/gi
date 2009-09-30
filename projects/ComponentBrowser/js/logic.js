/* place JavaScript code here */
jsx3.Package.definePackage("tibco.ce", function(ce){
  ce.init = function(){
    this.setView(ce.WELCOME);
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

  ce.componentSelect = function(componentId) {
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

    ce.viewComponent(componentId);
  };

  ce.componentTimeout = function(componentId, objXML) {
    console.log("TIMEOUT");
  };

  ce.componentError = function(componentId, objXML) {
    console.log("ERROR");
  };

  var _selectedComponent = null;
  ce.viewComponent = function(componentId, component) {
    if (_selectedComponent) {
      _selectedComponent.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    }

    var component = component || ce.getJSXByName('demo_' + componentId);

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
});
