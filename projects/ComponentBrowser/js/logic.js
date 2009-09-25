/* place JavaScript code here */
jsx3.Package.definePackage("tibco.ce", function(ce){
  ce.init = function(){
    this.setView(ce.WELCOME);
  };

  ce.WELCOME = 0;
  ce.LOADING = 1;
  ce.COMPONENT = 2;

  var current_view = null;
  ce.setView = function(viewType, title) {
    var titleStr, view;
    var header = ce.getJSXByName('paneContentHeader');
    var lytContent = ce.getJSXByName('lytContent');

    switch (viewType) {
      case ce.WELCOME:
        titleStr = 'Welcome';
        view = ce.getJSXByName('welcomeView');
        break;
      case ce.LOADING:
        titleStr = 'Loading Component';
        view = ce.getJSXByName('loadingView');
        break;
      case ce.COMPONENT:
        titleStr = title;
        view = ce.getJSXByName('componentViewLayout');
        break;
    }

    if (current_view) {
      current_view.setDisplay(jsx3.gui.Block.DISPLAYNONE);
    }
    view.setDisplay(jsx3.gui.Block.DISPLAYBLOCK);
    current_view = view;

    header.setText(titleStr);
    lytContent.repaint();
  };

  ce.componentSelect = function(componentId) {
    this.setView(ce.LOADING);

    var self = this;
    setTimeout(function(){
      var tree = ce.getJSXByName('treeExplorer');

      var record = tree.getRecord(componentId);
      var rNode = tree.getRecordNode(componentId);
      var pNode = rNode.getParent();

      self.setView(ce.COMPONENT, pNode.getAttribute("jsxtext") + " &raquo; " + record.jsxtext);
    }, 1000);
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
