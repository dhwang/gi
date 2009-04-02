/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

rebalancePaletteDocks: function(newContainer, oldParent) {
  if (oldParent && oldParent.getName().indexOf("jsx_ide_quadrant") == 0)
    jsx3.ide._rebalancePaletteDocks1(oldParent.getName());
  if (newContainer && newContainer.getParent().getName().indexOf("jsx_ide_quadrant") == 0)
    jsx3.ide._rebalancePaletteDocks1(newContainer.getParent().getName());
},

rebalanceAllPaletteDocks: function(newContainer, oldParent) {
  jsx3.ide._rebalancePaletteDocks1();
},

_rebalancePaletteDocks1: function(strAffectedQuadrant) {
  var ch1 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q1').getChildren().length;
  var ch2 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q2').getChildren().length;
  var ch3 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q3').getChildren().length;
  var ch4 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q4').getChildren().length;
  var ch5 = jsx3.IDE.getJSXByName('jsx_ide_quadrant_q5').getChildren().length;

  if (strAffectedQuadrant == 'jsx_ide_quadrant_q1') {
    this._rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter3'), jsx3.IDE.getJSXByName('jsx_ide_splitter2'),
        ch1, ch2, '0%', '100%', '0%', '20%');
  } else if (strAffectedQuadrant == 'jsx_ide_quadrant_q2') {
    this._rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter3'), jsx3.IDE.getJSXByName('jsx_ide_splitter2'),
        ch2, ch1, '100%', '0%', '0%', '20%');
  } else if (strAffectedQuadrant == 'jsx_ide_quadrant_q3') {
    this._rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter5'), jsx3.IDE.getJSXByName('jsx_ide_splitter4'),
        ch3, ch4, '0%', '100%', '100%', '75%');
  } else if (strAffectedQuadrant == 'jsx_ide_quadrant_q4') {
    this._rebalancePaletteDock2(jsx3.IDE.getJSXByName('jsx_ide_splitter5'), jsx3.IDE.getJSXByName('jsx_ide_splitter4'),
        ch4, ch3, '100%', '0%', '100%', '75%');
  } else {
    // close any unneeded splitters after startup
    if (ch1 == 0) {
      jsx3.IDE.getJSXByName('jsx_ide_splitter3').setSubcontainer1Pct('0%',true);
      if (ch2 == 0) {
        jsx3.IDE.getJSXByName('jsx_ide_splitter2').setSubcontainer1Pct('0%',true);
      }
    } else if (ch2 == 0) {
      jsx3.IDE.getJSXByName('jsx_ide_splitter3').setSubcontainer1Pct('100%',true);
    }
    if (ch3 == 0) {
      jsx3.IDE.getJSXByName('jsx_ide_splitter5').setSubcontainer1Pct('0%',true);
      if (ch4 == 0) {
        jsx3.IDE.getJSXByName('jsx_ide_splitter4').setSubcontainer1Pct('100%',true);
      }
    } else if (ch4 == 0) {
      jsx3.IDE.getJSXByName('jsx_ide_splitter5').setSubcontainer1Pct('100%',true);
    }
  }
},

_rebalancePaletteDock2: function(splitterHalf, splitterSide, child1, child2,
    halfClosed, halfOpen, sideClosed, sideOpen) {
  if (child1 == 0) {
    splitterHalf.setSubcontainer1Pct(halfClosed,true);
    if (child2 == 0)
      splitterSide.setSubcontainer1Pct(sideClosed, true);
  } else if (child2 == 0) {
    splitterHalf.setSubcontainer1Pct(halfOpen,true);
  } else {
    var halfSplit = parseInt(splitterHalf.getSubcontainer1Pct());
    if (halfSplit < 5 || halfSplit > 95)
      splitterHalf.setSubcontainer1Pct('50%', true);
  }

  var sideSplit = parseInt(splitterSide.getSubcontainer1Pct());
  var sideClosedInt = parseInt(sideClosed);
  if ((child1+child2) > 0 && ((sideClosedInt >= 50 && sideSplit > 95)
      || (sideClosedInt < 50 &&  sideSplit < 5)))
    splitterSide.setSubcontainer1Pct(sideOpen, true);
},

toggleStageOnly: function(bShowPalettes) {
  var splitter1 = jsx3.IDE.getJSXByName('jsx_ide_splitter1');
  var splitter2 = jsx3.IDE.getJSXByName('jsx_ide_splitter2');
  var splitter4 = jsx3.IDE.getJSXByName('jsx_ide_splitter4');

  var pct1 = parseInt(splitter1.getSubcontainer1Pct());
  var pct2 = parseInt(splitter2.getSubcontainer1Pct());
  var pct4 = parseInt(splitter4.getSubcontainer1Pct());

  if (bShowPalettes == null)
    bShowPalettes = pct1 > 95 || pct2 < 5 || pct4 > 95;

  if (bShowPalettes) {
    if (pct1 > 95)
      splitter1.setSubcontainer1Pct(splitter1._jsxlastopen || splitter1.jsxdefault1pct, true);
    if (pct2 < 5)
      splitter2.setSubcontainer1Pct(splitter2._jsxlastopen || splitter2.jsxdefault1pct, true);
    if (pct4 > 95)
      splitter4.setSubcontainer1Pct(splitter4._jsxlastopen || splitter4.jsxdefault1pct, true);
    jsx3.ide.rebalanceAllPaletteDocks();
  } else {
    splitter1._jsxlastopen = pct1 > 95 ? null : pct1;
    splitter2._jsxlastopen = pct2 < 5 ? null : pct2;
    splitter4._jsxlastopen = pct4 > 95 ? null : pct4;

    splitter1.setSubcontainer1Pct("100%", true);
    splitter2.setSubcontainer1Pct("0%", true);
    splitter4.setSubcontainer1Pct("100%", true);
  }
},

  _getTempTypes: function() {
    if (!this._TEMPLATE_TYPES) {
      /* @jsxobf-clobber */
      this._TEMPLATE_TYPES = {
        prop:  { root: jsx3.ide.getPlugIn("jsx3.ide.palette.properties").resolveURI("templates"), pathMethod: "getPropertiesPath" },
        event: { root: jsx3.ide.getPlugIn("jsx3.ide.palette.events").resolveURI("templates"), pathMethod: "getModelEventsPath" },
        xsl:   { root: jsx3.ide.getPlugIn("jsx3.ide.palette.xslparams").resolveURI("templates"), pathMethod: "getXslParamPath" }
      };
    }
    return this._TEMPLATE_TYPES;
  },

  /**
   * @param strType {String} prop, event, or xsl.
   * @param objJSX {jsx3.lang.Object}
   * @return {jsx3.xml.Document}
   */
  getTemplateForObject: function(strType, objJSX) {
    if (typeof objJSX.getMetadataXML == "function") {
      return objJSX.getMetadataXML(strType);
    }
    
    var struct = this._getTempTypes()[strType];

    // lazily load the built-in catalog file
    if (! struct.inited) {
      this.loadTemplateCatalog(strType, "catalog.xml",
          {resolveURI: function(u) { return struct.root + "/" + u; }});
      struct.inited = true;
    }

    var strPath = null;

    if (typeof(objJSX[struct.pathMethod]) == "function")
      strPath = objJSX[struct.pathMethod]();

    if (strPath == null) {
      var inheritance = objJSX.getClass().getInheritance();
      inheritance.unshift(objJSX.getClass());
      for (var i = 0; strPath == null && i < inheritance.length; i++)
        strPath = struct.registry[inheritance[i].getName()];
    }

    if (strPath) {
      var objXML = jsx3.IDE.getCache().getDocument(strPath);
      if (objXML == null) {
        objXML = new jsx3.xml.CDF.Document().load(strPath);
        jsx3.IDE.getCache().setDocument(strPath, objXML);
      }

      if (objXML.hasError()) {
        this.getLog().warn("Error loading " + strPath + ": " + objXML.getError());
      } else {
        return objXML;
      }
    }

    return null;
  },

  /**
   * @param strType {String} prop, event, or xsl.
   * @param strPath {String}
   * @param objResolver {jsx3.net.URIResolver}
   * @package  don't obfuscate
   */
  loadTemplateCatalog: function(strType, strPath, objResolver) {
    var struct = this._getTempTypes()[strType];
    if (objResolver == null) objResolver = jsx3.IDE;
    var doc = new jsx3.xml.Document().load(objResolver.resolveURI(strPath));
    for (var i = doc.selectNodeIterator("/data/record"); i.hasNext(); ) {
      var node = i.next();
      this.registerTemplateForClass(strType, node.getAttribute("jsxid"),
          objResolver.resolveURI(node.getAttribute("jsxtext")));
    }
  },

  /**
   * @param strType {String} prop, event, or xsl.
   * @param strClass {String} the fully-qualified class name.
   * @param strPath {String} the absolute (resolved) path to the template file.
   * @package  don't obfuscate
   */
  registerTemplateForClass: function(strType, strClass, strPath) {
    var struct = this._getTempTypes()[strType];
    if (struct.registry == null) struct.registry = {};
    struct.registry[strClass] = strPath;
  }

});
