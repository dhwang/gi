var matrixTests = [
  /* Example of meta:{single:true} */
  {id:"Load classes", fct: function(objServer) {
    jsx3.require("jsx3.gui.Matrix");
  }, meta:{single:true}},

  /* Example of return gi.test.gipp.WAIT */
  {id:"load.component.xml", fct: function(objServer) {
    var job = this;
    var doc = new jsx3.xml.Document();
    doc.setAsync(true);
    doc.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
      objServer.getCache().setDocument("componentXml", objEvent.target);
      gi.test.gipp.completeTestCase(job.getId());
    });
    doc.load(objServer.resolveURI("components/matrix.xml"));
    return gi.test.gipp.WAIT;
  }, meta:{label:"Load component XML"}},

  {id:"Load component", fct: function(objServer) {
    var objXML = objServer.getCache().getDocument("componentXml");
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.loadXML(objXML, false);
  }},

  /* Example of return gi.test.gipp.SLEEP_LONG */
  {id:"Initial paint", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    pane.paintChild(matrix);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Repaint data", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    
    var t1 = new Date().getTime();
    matrix.repaintData();
    var catTime = new Date().getTime() - t1;
    gi.test.gipp.addCategory(this, "paint", catTime);
        
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Reset XSL", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.resetXslCacheData();
    matrix.getXSL();
  }},

  {id:"Resize width", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    pane.setWidth(500, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Resize height", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    pane.setHeight(350, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Resize", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    pane.setWidth(300, false);
    pane.setHeight(300, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Add column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);

    var col = new jsx3.gui.Matrix.Column("newColumn");
    col.setPath("jsxid");
    col.setText("New column");
    matrix.setChild(col);
    matrix.paintChild(col);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Remove column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);

    var col = matrix.getChild("newColumn");
    matrix.removeChild(col);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Add 3 columns", fct: function(objServer) {
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

  {id:"Repaint data (5)", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.repaintData();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Repaint (5)", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.repaint();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Reset XSL (5)", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.resetXslCacheData();
    matrix.getXSL();
  }},

  {id:"Remove 3 columns", fct: function(objServer) {
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

  {id:"Hide column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.getChild(0).setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Show column", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.getChild(0).setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Sort", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.setSortPath("jsxtext");
    matrix.doSort();
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Set column width", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.getChild(0).setWidth(200, true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  /* Example of meta:{unit:"x"} */
  {id:"Insert record", fct: function(objServer, intTime) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.insertRecord({jsxid:"new" + intTime, jsxtext:"Inserted Record #" + intTime}, "jsxroot", true);
  }, meta:{unit:"x"}},

  {id:"Insert before", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.insertRecordBefore({jsxid:"new2", jsxtext:"Inserted Record #2"}, "UK", true);
  }},

  {id:"Remove record", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.deleteRecord("UK", true);
  }},

  {id:"Reorder columns", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    matrix.insertBefore(matrix.getChild(1), matrix.getChild(0), true);
    return gi.test.gipp.SLEEP_LONG;
  }},

  {id:"Destroy", fct: function(objServer) {
    var pane = objServer.getJSXByName("matrixPane");
    var matrix = pane.getChild(0);
    pane.removeChild(matrix);
  }}
];

for (var i = 0; i < matrixTests.length; i++) {
  var t = matrixTests[i];
  gi.test.gipp.addTestCase(t.id, t.fct, t.meta);
};
