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
    var regex = /^(\d+)?([a-zA-Z_]\w*)?$/;

    var v1t = v1.split(/\./);
    var v2t = v2.split(/\./);
    var maxLength = Math.max(v1t.length, v2t.length);

    var ad, al, bd, bl;

    for (var i = 0; i < maxLength; i++) {
      if (v1t.length > i && regex.test(v1t[i])) {
        ad = parseInt(RegExp.$1) || Number(0);
        al = RegExp.$2;
      } else {
        ad = 0;
        al = "";
      }

      if (v2t.length > i && regex.test(v2t[i])) {
        bd = parseInt(RegExp.$1) || Number(0);
        bl = RegExp.$2;
      } else {
        bd = 0;
        bl = "";
      }

      if (ad > bd) return 1;
      if (ad < bd) return -1;
      if (al > bl) return 1;
      if (al < bl) return -1;
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
   * <code>&amp; &lt; &gt; "</code>. This method also replaces any character that is not a valid XML character
   * (valid character codes are: 0x09, 0x0A, 0x0D, 0x20-0xD7FF, 0xE000-0xFFFD, 0x10000-0x10FFFF) with "&#92;uXX" where XX
   * is the unicode hex value of the character.
   *
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strEscapeHTML = function(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(
        // NOTE: the XML spec would be [^\x09\x0A\x0D\x20-\xD7FF\xE000-\xFFFD\x10000-\x10FFFF] but Firefox won't
        // compile that regex, see http://www.w3.org/TR/REC-xml/
        /[^\x09\x0A\x0D\x20-\x7F]/g,
        function(m) {
          var c = m.charCodeAt(0);
          if (c < 0x20 || (c > 0xD7FF && c < 0xE000) || (c > 0xFFFD && c < 0x10000) || c > 0x10FFFF)
            return "\\u" + c.toString(16);
          else
            return m;
        } );
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

      buffer[c++] = base64s.charAt((bits & 0xfc0000) >> 18);
      buffer[c++] = base64s.charAt((bits & 0x03f000) >> 12);
      buffer[c++] = base64s.charAt((bits & 0x000fc0) >> 6);
      buffer[c++] = base64s.charAt((bits & 0x00003f));
    }

    if (i < length) {
      var dual = i < length - 1;

      var bits = (s.charCodeAt(i) & 0xff) << 16;
      if (dual)
        bits |= (s.charCodeAt(i+1) & 0xff) << 8;

      buffer[c++] =   base64s.charAt((bits & 0xfc0000) >> 18);
      buffer[c++] =   base64s.charAt((bits & 0x03f000) >> 12);
      if (dual)
        buffer[c++] = base64s.charAt((bits & 0x000fc0) >> 6);
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

/* @JSC :: begin BENCH */

  util.Timer = function(strTopic, strMessage, intLevel) {
    this._t1 = new Date().getTime();
    this._topic = strTopic.toString();
    this._message = strMessage;
    this._level = intLevel || 4; // default is INFO
  };

  util.Timer.prototype.log = function(strMessage, bReset) {
    var t2 = new Date().getTime();
    if (! this._logger) {
      if (jsx3.util.Logger)
        this._logger = jsx3.util.Logger.getLogger("bench." + this._topic);
    }

    if (this._logger && this._logger.isLoggable(this._level))
      this._logger.log(this._level, this._message + (strMessage ? " : " + strMessage : "") + " : " + (t2 - this._t1) + "ms");

    if (bReset) this._t1 = t2;
  };

  util.CatTimer = function(strTopic, strName, intLevel) {
    this._topic = strTopic.toString();
    this._name = strName;
    this._level = intLevel || 4; // default is INFO
    this.reset();
  };

  util.CatTimer.prototype.start = function(strCategory) {
    if (! this._current) {
      this._current = strCategory;
      this._lasttime = new Date().getTime();
    }
  };

  util.CatTimer.prototype.pause = function(strCategory) {
    if (this._current == strCategory) {
      var t = new Date().getTime() - this._lasttime;
      this._current = null;
      if (this._cats[strCategory] == null) this._cats[strCategory] = 0;
      this._cats[strCategory] += t;
    }
  };

  util.CatTimer.prototype.log = function() {
    var message = this._name;
    for (var f in this._cats) {
      message += " " + f + ":" + this._cats[f] + "ms";
    }
    if (jsx3.util.Logger)
      jsx3.util.Logger.getLogger("bench." + this._topic).log(this._level, message);
  };

  util.CatTimer.prototype.reset = function() {
    this._cats = {};
    this._current = null;
    this._lasttime = null;
  };

/* @JSC :: end */

});

/* @JSC :: begin BENCH */

/**
 * A name-value map that holds its contents only during the current JavaScript "thread"/stack. All contents of
 * a weak map are cleared after the next window timeout.
 *
 * @since 3.5
 * @package
 */
jsx3.Class.defineClass("jsx3.util.WeakMap", null, null, function(WeakMap, WeakMap_prototype) {

  /** @private @jsxobf-clobber */
  WeakMap._SERIAL = 0;
  /** @private @jsxobf-clobber */
  WeakMap._ALL = {};
  /** @private @jsxobf-clobber */
  WeakMap._TO = null;

  /** @package */
  WeakMap.expire = function() {
    window.clearTimeout(WeakMap._TO);
    WeakMap._TO = null;
    for (var f in WeakMap._ALL) {
      var m = WeakMap._ALL[f];
      if (m._dirty) m._map = {};
    }
  };

  /**
   * The instance initializer.
   */
  WeakMap_prototype.init = function() {
    /* @jsxobf-clobber */
    this._serial = WeakMap._SERIAL++;
    /* @jsxobf-clobber */
    this._map = {};
    /* @jsxobf-clobber */
    this._dirty = false;

    WeakMap._ALL[this._serial] = this;
  };

  /**
   * Returns a value stored in this map.
   * @param strKey {String}
   * @return {Object}
   */
  WeakMap_prototype.get = function(strKey) {
    return this._map[strKey];
  };

  /**
   * Sets a value stored in this map.
   * @param strKey {String}
   * @param strValue {Object}
   */
  WeakMap_prototype.set = function(strKey, strValue) {
    this._map[strKey] = strValue;
    this._dirty = true;
    if (! WeakMap._TO) WeakMap._TO = window.setTimeout(WeakMap.expire, 0);
  };

  /**
   * Destroys this map. This method should be called for proper garbage collection to occur.
   */
  WeakMap_prototype.destroy = function(strKey, strValue) {
    delete this._map;
    delete WeakMap._ALL[this._serial];
  };

});

/* @JSC :: end */
