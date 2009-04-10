/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Block");

/**
 * Paints the result of an XSL transformation in an Block. A transformation is performed on the XML source document
 * with the XSL source document. The result is serialized HTML, which is painted to screen.
 */
jsx3.Class.defineClass("jsx3.gui.BlockX", jsx3.gui.Block, [jsx3.xml.Cacheable], function(BlockX, BlockX_prototype) {

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   */
  BlockX_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight) {
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  BlockX_prototype.paint = function() {
    this.applyDynamicProperties();
    
    //call paint method for superclass, passing results of interface method from _JSXXML class, 'doCall()'
    return this.jsxsuper(this.doTransform());
  };

  /**
   * Returns the XSL string of this object.
   * @return {String}
   */
  BlockX_prototype.getXSLString = function() {
    return this.jsxxsl;
  };

  /**
   * Sets the XSL string of this object.
   * @param strXSL {String}
   * @return {jsx3.xml.Cacheable} this object.
   */
  BlockX_prototype.setXSLString = function(strXSL) {
    this.jsxxsl = strXSL;
    return this;
  };

  /**
   * Returns the XSL URL of this object.
   * @return {String}
   */
  BlockX_prototype.getXSLURL = function() {
    return this.jsxxslurl;
  };

  /**
   * Sets the XSL URL of this object.
   * @param strXSLURL {String}
   * @return {jsx3.xml.Cacheable} this object.
   */
  BlockX_prototype.setXSLURL = function(strXSLURL) {
    this.jsxxslurl = strXSLURL;
    return this;
  };

  BlockX_prototype.getXSL = function() {
    var XslDocument = jsx3.xml.XslDocument;
    var strXSLId = this.getXSLId();
    var objCache = this.getServer().getCache();

    //look internally for data (either an embedded string of XSL or a URL reference)
    var objXSL = objCache.getDocument(strXSLId);
    if (objXSL == null) {
      //check if xml is an internal string or external ref
      if (this.getXSLString() != null) {
        //xsl contained internally as a string
        objXSL = (new XslDocument()).loadXML(this.getXSLString());
      } else if (this.getXSLURL() != null) {
        //xsl located at given url
        objXSL = (new XslDocument()).load(this.getUriResolver().resolveURI(this.getXSLURL()));
      } else {
        objXSL = jsx3.getSharedCache().getOrOpenDocument(
            jsx3.xml.Cacheable.DEFAULTSTYLESHEET, null, XslDocument.jsxclass);
      }

      //check the jsxdocument instance for any parsing errors
      if (objXSL.hasError()) {
        jsx3.util.Logger.getLogger(BlockX.jsxclass.getName()).error(
            jsx3._msg("xml.err_load_xsl", this, objXSL.getError()));
        return objXSL;
      }

      //persist the xsl to the cache
      objCache.setDocument(strXSLId, objXSL);
    }

    return objXSL;
  };

  /**
   * @private
   */
  BlockX_prototype.onDestroy = function(objParent) {
    //call standard destroy method for model (removes on-screen view if one exists)
    this.jsxsuper(objParent);
    this.onDestroyCached(objParent);
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  BlockX.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.BlockX. Most functionality of this class was moved into a new interface,
 *    <code>jsx3.xml.Cacheable</code>.
 * @see jsx3.gui.BlockX
 * @see jsx3.xml.Cacheable
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.BlockX", -, null, function(){});
 */
jsx3.BlockX = jsx3.gui.BlockX;

/* @JSC :: end */
