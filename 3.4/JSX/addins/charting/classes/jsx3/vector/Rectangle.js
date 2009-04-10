/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Paints a vector rectangle.
 */
jsx3.Class.defineClass("jsx3.vector.Rectangle", jsx3.vector.Shape, null, function(Rectangle, Rectangle_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Rectangle_prototype.init = function(left, top, width, height) {
    //call constructor for super class
    this.jsxsuper("rect", left, top, width, height);
  };

  /**
   * clip this rectangle to the bounds of the obj param
   * @param obj {jsx3.gui.Block|jsx3.html.BlockTag} an object that has getLeft() ... methods
   */
  Rectangle_prototype.clipToBox = function( obj ) {
    this.clipTo(obj.getLeft(), obj.getTop(), obj.getWidth(), obj.getHeight());
  };
  
  /**
   * clip this rectangle to the bounds of {l1, t1, w1, h1}
   */
  Rectangle_prototype.clipTo = function( l1, t1, w1, h1 ) {
    var l = Math.max(this.getLeft(), l1);
    var t = Math.max(this.getTop(), t1);
    var w = Math.min(this.getWidth() - (l-this.getLeft()), l1 + w1 - l);
    var h = Math.min(this.getHeight() - (t-this.getTop()), t1 + h1 - t);
    
    // TODO: rectangle's stroke will not clip correctly
    this.setDimensions(l, t, w, h);
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  Rectangle_prototype.paintUpdate = function() {
    this.jsxsuper();
    
    this.removeProperty("coordsize"); // only needed by v:group
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Rectangle_prototype.getWidth = function() {
    var s = this.getProperty("width");
    return s != null ? parseInt(s) : null;
  };

  Rectangle_prototype.setWidth = function( width ) {
    this.setProperty("width", typeof(width) == "number" ? width + "px" : width);
  };

  Rectangle_prototype.getHeight = function() {
    var s = this.getProperty("height");
    return s != null ? parseInt(s) : null;
  };

  Rectangle_prototype.setHeight = function( height ) {
    this.setProperty("height", typeof(height) == "number" ? height + "px" : height);
  };
  
/* @JSC */ }
  
});
