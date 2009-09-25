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
    this.setView(ce.LOADING);

    var self = this;
    setTimeout(function(){
      self.componentLoaded(componentId);
    }, 1000);
  };

  ce.componentLoaded = function(componentId) {
      var tree = ce.getJSXByName('treeExplorer');
      var compName = ce.getJSXByName('panePropertiesName');

      var record = tree.getRecord(componentId);
      var rNode = tree.getRecordNode(componentId);
      var pNode = rNode.getParent();

      var name = pNode.getAttribute("jsxtext");

      this.setView(ce.COMPONENT, name + " &raquo; " + record.jsxtext);
      compName.setText(name, true);
  };

  ce.viewSource = function(button) {
    button.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    var layout = ce.getJSXByName('componentViewLayout');
    layout.setRows("*,50%", true);
  };

  ce.unViewSource = function() {
    var layout = ce.getJSXByName('componentViewLayout');
    var button = ce.getJSXByName('viewSourceShowButton');
    layout.setRows("*,0", true);
    button.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
  };

  ce.onMouseOverSource = function(button) {
    console.log('blah');
  };
  ce.onMouseOutSource = function(button) {
    console.log('blah');
  };
});
