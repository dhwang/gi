var matrixTests = [
  /* Example of meta:{single:true} */
  {name:"Load classes", fct: function(objServer) {
    jsx3.require("jsx3.gui.Matrix");
  }, meta:{single:true}},

  /* Example of return gi.test.gipp.WAIT */
  {name:"Load component XML", fct: function(objServer) {
    var doc = new jsx3.xml.Document();
    doc.setAsync(true);
    doc.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
      objServer.getCache().setDocument("componentXml", objEvent.target);
      gi.test.gipp.completeTestCase("Load component XML");
    });
    doc.load(objServer.resolveURI("components/matrix.xml"));
    return gi.test.gipp.WAIT;
  }},

  {name:"Load component", fct: function(objServer) {
    var objXML = objServer.getCache().getDocument("componentXml");
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.loadXML(objXML, false);
  }},

  /* Example of return gi.test.gipp.SLEEP_LONG */
  {name:"Initial paint", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    pane.paintChild(matrix);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Repaint data", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.repaintData();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Reset XSL", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.resetXslCacheData();
    matrix.getXSL();
  }},

  {name:"Resize width", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    pane.setWidth(500, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Resize height", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    pane.setHeight(350, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Resize", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    pane.setWidth(300, false);
    pane.setHeight(300, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Add column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);

    var col = new jsx3.gui.Matrix.Column("newColumn");
    col.setPath("jsxid");
    col.setText("New column");
    matrix.setChild(col);
    matrix.paintChild(col);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Remove column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);

    var col = matrix.getChild("newColumn");
    matrix.removeChild(col);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Add 3 columns", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);

    for (var i = 0; i < 3; i++) {
      var col = new jsx3.gui.Matrix.Column("newColumn" + i);
      col.setPath("jsxid");
      col.setText("New column #" + i);
      matrix.setChild(col);
    }
    matrix.repaint();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Repaint data (5)", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.repaintData();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Repaint (5)", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.repaint();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Reset XSL (5)", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.resetXslCacheData();
    matrix.getXSL();
  }},

  {name:"Remove 3 columns", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);

    // introduced new removeChildren method param in 3.4 to help this use case
    if (matrix.removeChildren.jsxmethod.getArity() > 0) {
      matrix.removeChildren([2, 3, 4]);
    } else {
      for (var i = 0; i < 3; i++) {
        var col = matrix.getChild("newColumn" + i);
        matrix.removeChild(col);
      }
    }
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Hide column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.getChild(0).setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Show column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.getChild(0).setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Sort", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.setSortPath("jsxtext");
    matrix.doSort();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Set column width", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.getChild(0).setWidth(200, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  /* Example of meta:{unit:"x"} */
  {name:"Insert record", fct: function(objServer, intTime) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.insertRecord({jsxid:"new" + intTime, jsxtext:"Inserted Record #" + intTime}, "jsxroot", true);
  }, meta:{unit:"x"}},

  {name:"Insert before", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.insertRecordBefore({jsxid:"new2", jsxtext:"Inserted Record #2"}, "UK", true);
  }},

  {name:"Remove record", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.deleteRecord("UK", true);
  }},

  {name:"Reorder columns", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.insertBefore(matrix.getChild(1), matrix.getChild(0), true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {name:"Destroy", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    pane.removeChild(matrix);
  }}
];

for (var i = 0; i < matrixTests.length; i++) {
  var t = matrixTests[i];
  gi.test.gipp.addTestCase(t.name, t.fct, t.meta);
};
