/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Wraps the browser-native exception object (what might be caught in a typical try/catch/finally block).
 * <p/>
 * The following sample code shows how to use try/catch blocks in JavaScript and ensure that a caught 
 * exception is always an instance of <code>jsx3.lang.Exception</code>:
 * <pre>
 * try {
 *   tryIt(); // code that may throw a native error (null-pointer, etc)
 *            // or an instance of jsx3.Exception
 * } catch (e) {
 *   e = jsx3.NativeError.wrap(e);
 *   // now e is guaranteed to be an instance of jsx3.Exception
 *   window.alert(e.printStackTrace());
 * }
 * </pre>
 *
 * @since 3.1
 */
jsx3.Class.defineClass("jsx3.lang.NativeError", jsx3.lang.Exception, null, function(NativeError, NativeError_prototype) {

  var Exception = jsx3.Exception;

  /** @private @jsxobf-clobber */
  NativeError.ALWAYS_ALERT_UNCAUGHT = false;
  /** @private @jsxobf-clobber */
  NativeError.ALERT_UNCAUGHT = true;
  
  /**
   * Wraps a native browser exception in an instance of <code>NativeError</code>. This method also accepts 
   * an argument of type <code>jsx3.Exception</code>, in which case it will just return the argument. This method wraps 
   * any other type of argument by converting it to a string and and creating a new j<code>sx3.Exception</code> with that message.
   *
   * @param objError {jsx3.Exception|Object} 
   * @return {jsx3.Exception}
   */
  NativeError.wrap = function(objError) {
    // this branch is IE-specific
    if (objError instanceof Error)
      return new NativeError(objError);
    else if (objError instanceof Exception)
      return objError;
    else 
      return new Exception("" + objError);
  };
  
  /**
   * Initializes the error trapping mechanism. Once this methor is called, all uncaught exceptions will be routed
   * through this class to the logging system.
   * @param-package fctTrap {Function}
   */
  NativeError.initErrorCapture = function(fctTrap) {
    window.onerror = arguments.length > 0 ? fctTrap : NativeError.errorTrap;
  };
  
  NativeError.stopErrorCapture = function(fctTrap) {
    window.onerror = null;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
  /** @private @jsxobf-clobber */
  NativeError._UNCAUGHT_MATCH = "thrown and not caught";
/* @JSC */ } else {
  /** @private @jsxobf-clobber */
  NativeError._UNCAUGHT_MATCH = "uncaught exception:";
/* @JSC */ }
  
  /**
   * The error trap for Internet Explorer. Accepts the standard IE arguments and routes the error to the logging
   * system. If the error message indicates that the erro was caused by an uncaught exception, will try to find the
   * actual jsx3.Exception instance.
   *
   * @param msg {String}
   * @param url {String}
   * @param line {int}
   * @private
   * @jsxobf-clobber
   */
  NativeError.errorTrap = function(msg, url, line) {
    try {
      if (!NativeError.ALWAYS_ALERT_UNCAUGHT && 
          jsx3.Class.forName("jsx3.util.Logger") != null && jsx3.util.Logger.GLOBAL != null) {
        if (msg.indexOf(NativeError._UNCAUGHT_MATCH) >= 0) {
          if (Exception._LAST_THROWN != null) {
            var stack = jsx3.lang.getStack(0);
            if (stack.length < 2 || stack.contentsEqual(Exception._LAST_THROWN.getStack())) {
              if (stack.length < 2)
                jsx3.util.Logger.GLOBAL.logStack(jsx3.util.Logger.ERROR,
                    jsx3._msg("error.trap", msg, NativeError._convertLineNumber(line), url), 1);
              jsx3.util.Logger.GLOBAL.error(jsx3._msg("error.uncaught"), Exception._LAST_THROWN);
              Exception._LAST_THROWN = true;
              return true;
            }
          }
        }
        // IE interprets line numbers incorrectly (one off)
        jsx3.util.Logger.GLOBAL.logStack(jsx3.util.Logger.ERROR,
            jsx3._msg("error.trap", msg, NativeError._convertLineNumber(line), url), 1);
        return true;
      } else if (NativeError.ALERT_UNCAUGHT) {
        if (msg.indexOf(NativeError._UNCAUGHT_MATCH) >= 0) {
          if (Exception._LAST_THROWN != null) {
            var stack = jsx3.lang.getStack(0);
            if (stack.contentsEqual(Exception._LAST_THROWN.getStack())) {
              window.alert(jsx3._msg("error.uncaught") + "\n" + Exception._LAST_THROWN.printStackTrace());
              return true;
            }
          }
        }
        
        var stack = jsx3.lang.getStack(0);
        window.alert(jsx3._msg("error.trap", msg, NativeError._convertLineNumber(line), url) +
            "\n" + Exception.formatStack(stack));
        return true;
      } else {
        return false;
      }
    } catch (e) {
      window.alert(jsx3._msg("error.trap_err", NativeError.wrap(e), msg, NativeError._convertLineNumber(line), url));
    }
  };
  
  /** @private @jsxobf-clobber */
  NativeError_prototype._error = null;
    
  /**
   * The instance initializer.
   * @param objError {Object} browser-native exception object (what would be thrown by a try/catch block)
   * @throws {jsx3.IllegalArgumentException} if <code>objException</code> is not a native browser error. Use 
   *    <code>NativeError.wrap()</code> if the type of caught object is unknown.
   * @see #wrap()
   */
  NativeError_prototype.init = function(objError) {
    if (!(objError instanceof Error))
      throw new jsx3.IllegalArgumentException("objError", objError);
    
    this._error = objError;
    this.jsxsuper();
  };

  /**
   * Returns the native message for this error.
   * @return {String}
   */
  NativeError_prototype.getMessage = function() {
    return this._error.message != null ? this._error.message.replace(/\s*$/,"") : "";
  };

  /**
   * Returns the URL of the JavaScript include where this error was raised.
   * @return {String}
   */
  NativeError_prototype.getFileName = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    return this._error.sourceURL;
/* @JSC */ } else {
    return this._error.fileName;
/* @JSC */ }
  };

  /**
   * Returns the line number in the JavaScript include where this error was raised.
   * @return {int}
   */
  NativeError_prototype.getLineNumber = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    return this._error.line;
/* @JSC */ } else {
    return NativeError._convertLineNumber(this._error.lineNumber);
/* @JSC */ }
  };

  /** @private @jsxobf-clobber */
  NativeError._convertLineNumber = function(line) {
    if (jsx3.util.numIsNaN(line)) return null;
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    return line - 1;
/* @JSC */ } else {
    return line;
/* @JSC */ }
  };

  /**
   * Returns the native browser name for this error.
   * @return {String}
   */
  NativeError_prototype.getName = function() {
    return this._error.name;
  };

/* @JSC :: begin DEP */

  /**
   * Returns true if this error was due to poorly-formatted JavaScript (lexical/structural as opposed to logical).
   * @return {boolean}
   * @deprecated
   */
  NativeError_prototype.isStructural = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    return this._error && (this._error.number & 0xFFFF) == 1009;
/* @JSC */ } else {
    return false;
/* @JSC */ }
  };

/* @JSC :: end */
  
  NativeError_prototype.getType = function() {
    if (this._error instanceof EvalError) return "EvalError";
    if (this._error instanceof RangeError) return "RangeError";
    if (this._error instanceof ReferenceError) return "ReferenceError";
    if (this._error instanceof SyntaxError) return "SyntaxError";
    if (this._error instanceof TypeError) return "TypeError";
    return "Error";
  };

  /**
   * Returns the native error as a human-readable string.
   * @return {String}
   */
  NativeError_prototype.toString = function() {
    var line = this.getLineNumber();
    var file = this.getFileName();
    var s = this.getMessage();
    if (line || file) {
      s += " (type:" + this.getType() + ", ";
      if (line) s += "line:" + line;
      if (file) {
        if (line) s += ", ";
        s += "file:" + file;
      }
      s += ")";
    }
    return s;
  };

});
  
