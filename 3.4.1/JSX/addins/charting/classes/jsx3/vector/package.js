/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * This package and all contained classes are available only when the Charting add-in is enabled.
 */
jsx3.Package.definePackage("jsx3.vector", function(vector){

  /* @jsxobf-final */
  vector.DEFAULT_UNIT = "px";
  
/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  vector.TAGNS = "v";
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  vector.TAGNS = "http://www.w3.org/2000/svg";
/* @JSC */ }

  /**
   * Converts an integer color to a CSS hex string color. If the color parameter is not a number, this function returns the argument as a string.
   * @param color {int|String} The number to convert to hex.
   * @return {String} The CSS hex string.
   */
  vector.colorAsHtml = function( color ) {
    return typeof(color) == "number" ?
      "#" + (color + 0x1000000).toString(16).substring(1):
      "" + color;
  };
  
  /**
   * Converts a number value to a CSS unit.
   * @param value {int|String} The number value as a number or string, defaults to 0
   * @param unit {String} The unit to append to the number, defaults to vector.DEFAULT_UNIT
   * @param killUnit {boolean} If true, remove any unit that may have been included with the param value. Otherwise, the unit will only be appended if no unit was included.
   * @return {String} The CSS value.
   * @package
   */
  vector.toUnit = function(value, unit, killUnit) {
    if (value == null) value = 0;
    if (unit == null) unit = vector.DEFAULT_UNIT;
    
    if (typeof(value) == "number") {
      return value + "" + unit;
    } else {
      value = value.toString();
      value = value.replace(/^\s*(.*?)\s*$/, "$1");
      if (killUnit) 
        value = value.replace(/[^\d\.]/g, "");
      return value.match(/[^\d\.]/) ? value : (value + "" + unit);
    }
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /*
   * Creates a VML Point2D datatype.
   * @param x {int} The x coordinate.
   * @param y {int} The y coordinate.
   * @return {String} The Point2D as a string.
   * @package
   */
  vector.toPoint2D = function( x, y ) {
    return vector.toUnit(x) + "," + vector.toUnit(y);
  };
  
  /*
   * Creates a VML Vector2D datatype.
   * @param x {int} The x coordinate.
   * @param y {int} The y coordinate.
   * @return {String} The Vector2D as a string.
   * @package
   */
  vector.toVector2D = function( x, y ) {
    return vector.toUnit(x,"",true) + " " + vector.toUnit(y,"",true);
  };

/* @JSC */ }

  /**
   * Returns alpha constrained between 0 and 1.
   * @param alpha {number} an alpha value (usually a user input)
   * @return {float} [0.0, 1.0]
   * @package
   */
  vector.constrainAlpha = function( alpha ) {
    return Math.max(0, Math.min(1, alpha));
  };
  
  /**
   * convert degrees (0 at top, clockwise) to radians (0 at right, counterclockwise)
   * @param degrees {Number} a degree value; 0 points upwards, increasing values go clockwise
   * @return {Number} a radian value, between 0 and 2*pi; 0 points rightwards, increasing values go counterclockwise
   */
  vector.degreesToRadians = function(degrees) {
    return jsx3.util.numMod((2 * Math.PI / 360 * (-1 * degrees + 90)), (2 * Math.PI));
  };  
  
});
