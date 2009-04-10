var gipp = gi.test.gipp;

/* Example of meta:{single:true} */
gipp.addTestCase("Load classes", function(objServer) {
  jsx3.require("jsx3.gui.Matrix");
}, {single:true});

/* Example of return gi.test.gipp.WAIT */
gipp.addTestCase("load.component.xml", function(objServer) {
  var job = this;
  var doc = new jsx3.xml.Document();
  doc.setAsync(true);
  doc.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
    objServer.getCache().setDocument("componentXml", objEvent.target);
    gipp.completeTestCase(job.getId());
  });
  doc.load(objServer.resolveURI("components/matrix.xml"));
  return gipp.WAIT;
}, {label:"Load component XML"});

gipp.addTestCase("Load component", function(objServer) {
  var objXML = objServer.getCache().getDocument("componentXml");
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.loadXML(objXML, false);
});

/* Example of return gi.test.gipp.SLEEP_LONG */
gipp.addTestCase("Initial paint", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  pane.paintChild(matrix);
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Repaint data", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);

  var t1 = new Date().getTime();
  matrix.repaintData();
  var catTime = new Date().getTime() - t1;
  gipp.addCategory(this, "paint", catTime);

  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Reset XSL", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.resetXslCacheData();
  matrix.getXSL();
});

gipp.addTestCase("Resize width", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  pane.setWidth(500, true);
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Resize height", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  pane.setHeight(350, true);
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Resize", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  pane.setWidth(300, false);
  pane.setHeight(300, true);
  return gipp.SLEEP_LONG;
});

/* Example of getStats() with debug build. */
var tc = gipp.addTestCase("Add column", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);

  // have to do this to capture xsl timing statistics
  matrix.setPagingModel(0);

  var col = new jsx3.gui.Matrix.Column("newColumn");
  col.setPath("jsxid");
  col.setText("New column");
  matrix.setChild(col);
  matrix.paintChild(col);

  matrix.setPagingModel(1);

  return gipp.SLEEP;
});
tc.addSetUp(function() {
  gipp.startStats();  
});
tc.addTearDown(function() {
  var xslTime = 0;
  var stats = gipp.getStats("jsx3.gui.Matrix");
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].message == "xsl") {
      xslTime += stats[i].ms;
    }
  }
  gipp.addCategory(this, "xsl", xslTime);

  gipp.stopStats();
});

/* Example of getStats() with timeMethod(). */
tc = gipp.addTestCase("Remove column", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);

  // have to do this to capture xsl timing statistics
  matrix.setPagingModel(0);

  var col = matrix.getChild("newColumn");
  matrix.removeChild(col);

  matrix.setPagingModel(1);

  return gipp.SLEEP;
});
tc.addSetUp(function() {
  gipp.timeMethod("jsx3.gui.Matrix", "getXSL");
  gipp.startStats();  
});
tc.addTearDown(function() {
  var xslTime = 0;
  var stats = gipp.getStats("jsx3.gui.Matrix");
  gipp.timeMethod("jsx3.gui.Matrix", "getXSL", true);

  for (var i = 0; i < stats.length; i++) {
    if (stats[i].message == "getXSL") {
      xslTime += stats[i].ms;
    }
  }
  gipp.addCategory(this, "xsl", xslTime);

  gipp.stopStats();
});

gipp.addTestCase("Add 3 columns", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);

  for (var i = 0; i < 3; i++) {
    var col = new jsx3.gui.Matrix.Column("newColumn" + i);
    col.setPath("jsxid");
    col.setText("New column #" + i);
    matrix.setChild(col);
  }
  matrix.repaint();
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Repaint data (5)", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.repaintData();
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Repaint (5)", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.repaint();
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Reset XSL (5)", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.resetXslCacheData();
  matrix.getXSL();
});

gipp.addTestCase("Remove 3 columns", function(objServer) {
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
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Hide column", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.getChild(0).setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Show column", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.getChild(0).setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Sort", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.setSortPath("jsxtext");
  matrix.doSort();
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Set column width", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.getChild(0).setWidth(200, true);
  return gipp.SLEEP_LONG;
});

/* Example of {unit:"x"} */
gipp.addTestCase("Insert record", function(objServer, intTime) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.insertRecord({jsxid:"new" + intTime, jsxtext:"Inserted Record #" + intTime}, "jsxroot", true);
}, {unit:"x"});

gipp.addTestCase("Insert before", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.insertRecordBefore({jsxid:"new2", jsxtext:"Inserted Record #2"}, "UK", true);
});

gipp.addTestCase("Remove record", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.deleteRecord("UK", true);
});

gipp.addTestCase("Reorder columns", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  matrix.insertBefore(matrix.getChild(1), matrix.getChild(0), true);
  return gipp.SLEEP_LONG;
});

gipp.addTestCase("Destroy", function(objServer) {
  var pane = objServer.getJSXByName("matrixPane");
  var matrix = pane.getChild(0);
  pane.removeChild(matrix);
});
