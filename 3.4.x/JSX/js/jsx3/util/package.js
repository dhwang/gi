/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Utility classes.
 */
jsx3.Package.definePackage("jsx3.util", function(util) {

  /**
   * Compares two version strings. A version string is list of arbitrary length of numbers separated by '.'. The
   * first number is the most significant.
   *
   * @param v1 {String} the first version string.
   * @param v2 {String} the second version string.
   * @return {int} <code>1</code> if <code>v1</code> is greater than <code>v2</code>, <code>-1</code> if
   *   <code>v2</code> is greater than <code>v1</code>, or <code>0</code> if <code>v1</code> and <code>v2</code> are equal.
   * @package
   */
  util.compareVersions = function(v1, v2) {
    var v1t = v1.split(/\./);
    var v2t = v2.split(/\./);
    var maxLength = Math.max(v1t.length, v2t.length);

    for (var i = 0; i < maxLength; i++) {
      var a = parseInt(v1t[i]) || Number(0);
      var b = parseInt(v2t[i]) || Number(0);
      if (a > b) return 1;
      if (a < b) return -1;
    }

    return 0;
  };

  /**
   * Calculates <code>a mod b</code>, but the result is not allowed to be negative.
   * @param v {Number} a
   * @param mod {Number} b
   * @return {Number} <code>a mod b</code> if <code>a >= 0</code>, <code>b + a mod b</code>, if <code>a < 0</code>.
   * @since 3.2
   */
  util.numMod = function(v, mod) {
    return v < 0 ? (v % mod) + mod : (v % mod);
  };

  /**
   * Returns <code>v == null || isNaN(v)</code>.
   * @param v {Object} any value.
   * @return {boolean}
   * @since 3.2
   */
  util.numIsNaN = function(v) {
    return v == null || v === "" || isNaN(v);
  };

  /**
   * Rounds <code>v</code> to the nearest value that can be divided by <code>intUnit</code>.
   * @param v {Number}
   * @param intUnit {int}
   * @return {Number}
   * @since 3.2
   */
  util.numRound = function(v, intUnit) {
    return Math.round(v/intUnit) * intUnit;
  };

  /**
   * Returns whether <code>s</code> is <code>null</code> or an empty string.
   * @param s {String}
   * @return {boolean}
   * @since 3.2
   */
  util.strEmpty = function(s) {
    return s == null || s === "";
  };

  /**
   * Returns the array index of <code>o</code> in <code>a</code>. Comparisons are performed with strict equals (===).
   * @param a {Array}
   * @param o {Object}
   * @return {int}
   */
  util.arrIndexOf = function(a, o) {
    for (var i = 0; i < a.length; i++)
      if (a[i] === o) return i;
    return -1;
  };

  /** @private @jsxobf-clobber */
  util._TRIM_REGEX = /(^\s*)|(\s*$)/g;

  /**
   * Returns <code>s</code> trimmed of trailing and leading spaces (anything matching the regexp <code>/\s/</code>).
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strTrim = function(s) {
    return s.replace(util._TRIM_REGEX, "");
  };

  /**
   * Returns <code>s</code> with the following four characters replaced by their escaped equivalent:
   * <code>&amp; &lt; &gt; "</code>.
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strEscapeHTML = function(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  };

  /**
   * Limits <code>s</code> to length <code>intMax</code> by placing an ellipsis in values that are too long.
   * @param s {String}
   * @param intMax {int} the maximum length of the string returned by this method.
   * @param strEllipsis {String} the ellipsis to use. <code>"..."</code> is used by default.
   * @param fltPos {Number} the placement of the ellipsis as a value between 0 and 1. 1, the default, means that the
   *   ellipsis comes at the end of the truncated string. Other values mean that the head and tail of the string
   *   will be returned with the ellipsis somewhere in the middle.
   * @return {String}
   * @since 3.2
   */
  util.strTruncate = function(s, intMax, strEllipsis, fltPos) {
    if (strEllipsis == null) strEllipsis = "...";
    if (fltPos == null) fltPos = 1.0;

    if (s.length > intMax && strEllipsis.length < intMax) {
      var l = intMax - strEllipsis.length;
      var beforeLength = Math.round(l * fltPos);
      var before = s.substring(0, beforeLength);
      var after = s.substring(s.length - (l - beforeLength));
      return before + strEllipsis + after;
    } else {
      return s;
    }
  };

  /**
   * Returns whether <code>s</code> ends with <code>strTest</code>.
   * @param s {String}
   * @param strTest {String}
   * @return {boolean}
   * @since 3.2
   */
  util.strEndsWith = function(s, strTest) {
    var index = s.lastIndexOf(strTest);
    return index >= 0 && index == s.length - strTest.length;
  };

  /** @private @jsxobf-clobber */
  util._BASE64S = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  /**
   * Returns the result of encoding <code>s</code> to its base-64 equivalent.
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strEncodeBase64 = function(s) {
    var base64s = util._BASE64S;
    var buffer = new Array(Math.ceil(s.length * 4 / 3));

    var i = 0, c = 0, length = s.length;
    for (; i <= length - 3; i += 3) {
      var bits = (s.charCodeAt(i)   & 0xff) << 16 |
                 (s.charCodeAt(i+1) & 0xff) << 8  |
                 (s.charCodeAt(i+2) & 0xff);

      buffer[c++] = base64s.charAt((bits & 0x00fc0000) >> 18);
      buffer[c++] = base64s.charAt((bits & 0x0003f000) >> 12);
      buffer[c++] = base64s.charAt((bits & 0x00000fc0) >> 6);
      buffer[c++] = base64s.charAt((bits & 0x0000003f));
    }

    if (i < length) {
      var dual = i < length - 1;

      var bits = (s.charCodeAt(i) & 0xff) << 16;
      if (dual)
        bits |= (s.charCodeAt(i+1) & 0xff) << 8;

      buffer[c++] = base64s.charAt((bits & 0x00fc0000) >> 18);
      buffer[c++] = base64s.charAt((bits & 0x0003f000) >> 12);
      if (dual)
        buffer[c++] = base64s.charAt((bits & 0x00000fc0) >> 6);
      else
        buffer[c++] = "=";
      buffer[c++] = "=";
    }

    return buffer.join("");
  };

  /**
   * Returns the result of decoding <code>s</code> from its base-64 equivalent.
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strDecodeBase64 = function(s) {
    var base64s = util._BASE64S;
    var buffer = new Array(Math.ceil(s.length / 4));

    //declare variables
    var i = 0, c = 0, length = s.length;
    for (; i < length; i += 4) {
      var bits = (base64s.indexOf(s.charAt(i))   & 0xff) << 18 |
                 (base64s.indexOf(s.charAt(i+1)) & 0xff) << 12 |
                 (base64s.indexOf(s.charAt(i+2)) & 0xff) <<  6 |
                 (base64s.indexOf(s.charAt(i+3)) & 0xff);

      buffer[c++] = String.fromCharCode((bits & 0xff0000) >> 16, (bits & 0xff00) >> 8, bits & 0xff);
    }

    if (s.charCodeAt(i-2) == 61)
      buffer[c-1] = buffer[c-1].substring(0,1);
    else if (s.charCodeAt(i-1) == 61)
      buffer[c-1] = buffer[c-1].substring(0,2);

    return buffer.join("");
  };

});
