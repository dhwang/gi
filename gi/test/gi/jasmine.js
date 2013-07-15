/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/*
 * Defines a GI framework for writing tests based on Jasmine.
 */

if (!window.gi) window.gi = new Object();
if (!gi.test) gi.test = new Object();
if (!gi.test.jasmine) gi.test.jasmine = new Object();

gi.test.jasmine._init = function(_jasmine) {

  _jasmine.FILE_SCHEME = String(document.location.protocol).indexOf("file") == 0;
  _jasmine.JSX_BASE = "../";
  _jasmine.JSX_JS_BASE = _jasmine.JSX_BASE + "JSX/js/";
  _jasmine.TEST_BASE = "tests/jasmine/";
  _jasmine.HTTP_BASE = _jasmine.FILE_SCHEME ? "http://www.generalinterface.org/tests" : "../test/server";
  
  //jasmine._PENDING_SUITES = [];

  _jasmine.decodeURI = function(strText) {
    if (strText == null) return null;
    if (strText.indexOf("%") < 0) return strText;

    var length = strText.length;
    var decoded = new Array(length);
    var j = 0;

    for (var i = 0; i < strText.length; i++) {
      var chr = strText.charAt(i);
      if (chr == "%") {
        var octet = strText.substring(i+1, i+3);
        if (octet.match(/[^a-fA-F0-9]/)) {
          decoded[j++] = chr;
        } else {
          decoded[j++] = String.fromCharCode(parseInt(octet, 16));
          i += 2;
        }
      } else {
        decoded[j++] = chr;
      }
    }

    return decoded.join("");
  };

  _jasmine.getQueryParams = function(strURL) {
    var params = {};
    var index = strURL.indexOf("?");
    if (index < 0) return params;
    var query = strURL.substring(index+1);
    var pairs = query.split(/&/g);
    for (var i = 0; i < pairs.length; i++) {
      var nv = pairs[i].split("=", 2);
      params[_jasmine.decodeURI(nv[0])] = _jasmine.decodeURI(nv[1]);
    }
    return params;
  };

  _jasmine.loadTestSpecs = function(specs) {
    for (var i = 0; i < specs.length; i++)
      _jasmine.loadScript(_jasmine.TEST_BASE + specs[i]);
  };

  _jasmine.loadScript = function(strSrc, fctDone, objAttr) {
    if (console) console.debug("Loading " + strSrc);
    // instance a new DOM element
    var element = document.createElement("script");
    element.src = strSrc;
    element.type = 'text/javascript';

    if (objAttr) {
      for (var f in objAttr)
        element.setAttribute(f, objAttr[f]);
    }

    if (fctDone) {
      element.onreadystatechange = function() {
        var state = this.readyState;
        if (state == "loaded" || state == "interactive" || state == "complete") {
          this.onreadystatechange = null;
          this.onload = null;
          fctDone(strSrc);
        }
      };
      element.onload = function() {
        element.onreadystatechange = null;
        element.onload = null;
        fctDone(strSrc);
      };
    }

    // bind the element to the browser DOM to begin loading the resource
    document.getElementsByTagName("head")[0].appendChild(element);
  };

  _jasmine.loadGI = function() {
    _jasmine.loadScript(_jasmine.JSX_JS_BASE + "JSX30.js", _jasmine._doneLoadingJSX30,
        {jsxappempty:"true"});
  };

  _jasmine.TestSuite = function(strPrefix) {
    var tokens = strPrefix.split(/\W/);
    this._prefix = tokens.join("_");
    tokens.pop();
    this._path = tokens.join("/") + "/";
  };

  _jasmine.TestSuite.prototype.getPrefix = function() {
    return this._prefix;
  };

  _jasmine.TestSuite.prototype.resolveURI = function(strPath) {
    var path = _jasmine.TEST_BASE + this._path + strPath;
    return _jasmine.decodeURI(path);
  };

  _jasmine.TestSuite.prototype.newServer = function(strConfig, strPath, bGUI, objEnv) {
    var doc = null;
    if (strConfig) {
      doc = (new jsx3.xml.Document()).load(this.resolveURI(strConfig));
      if (doc.hasError())
        throw new Error("Error loading server configuration file: " + doc.getError());
    } else {
      doc = (new jsx3.xml.Document()).loadXML("<data/>");
    }

    var settings = new jsx3.app.Settings(doc);
    if (objEnv == null) objEnv = {};
    objEnv.jsxsettings = settings;

    var objGUI = null;
    if (bGUI) {
      objGUI = document.createElement("div");
      document.getElementsByTagName("body")[0].appendChild(objGUI);
    }

    return new jsx3.app.Server(this.resolveURI(strPath), objGUI, bGUI, objEnv);
  };

  _jasmine.TestSuite.prototype._prefix = null;
  _jasmine.TestSuite.prototype._path = null;

  /**
   *
   */
  _jasmine.makeTestFunction = function(fctBody, arg1) {
    var a = [];
    for (var i = 1; i < arguments.length; i++)
      a[i-1] = arguments[i];

    return function() {
      fctBody.apply(null, a);
    };
  };


  /**
   *
   */
  _jasmine.require = function(strClass1) {
    if (console) console.debug("Requiring " + strClass1 + "...");

    var bFirst = _jasmine._waiting == null;
    if (bFirst)
      _jasmine._waiting = [];

    for (var i = 0; i < arguments.length; i++) {
      try {
        if (eval(arguments[i]) == null) {
          _jasmine._waiting.push(arguments[i]);
        }
      } catch (e) {
        _jasmine._waiting.push(arguments[i]);
      }
    }

  };

  _jasmine._doneLoadingJSX30 = function(strSrc) {
    if (strSrc == _jasmine.JSX_JS_BASE + "JSX30.js") {
      // Copy CLASS_LOADER browser tokens into jasmine
      var tokens = ["IE", "IE7", "MOZ", "FX", "SAF", "GOG", "KON", "SVG", "VML"];
      for (var i = 0; i < tokens.length; i++)
        _jasmine[tokens[i]] = jsx3.CLASS_LOADER[tokens[i]];

      // Copy any URL parameters into JSX environment
      var params = _jasmine.getQueryParams(window.location.search);
      for (var p in params)
        jsx3.setEnv(p, params[p]);
    }

    _jasmine._tryLoadLogger();

    for (i = 0; _jasmine._waiting && i < _jasmine._waiting.length; i++) {
      try {
        if (eval(_jasmine._waiting[i]) != null)
          _jasmine._waiting.splice(i--, 1);
      } catch (e) {}
    }

//    if (console) console.debug("Loaded " + strSrc + ". Still waiting for [" + jasmine._waiting + "]");

    if (_jasmine._jsxbaseclasses == null) {
      _jasmine._jsxbaseclasses = jsx3.lang.ClassLoader.SYSTEM_SCRIPTS.concat();

      _jasmine.BUILD = _jasmine._jsxbaseclasses.length <= 2;
      _jasmine.SOURCE = !_jasmine.BUILD;
      _jasmine.DEP = typeof(jsx3.ABSOLUTEPATH) == "string";
      _jasmine.NODEP = !_jasmine.DEP;
      _jasmine.INTERACTIVE = jsx3.getEnv("jsxtestinter") == "1";
      _jasmine.NOINTERACTIVE = !_jasmine.INTERACTIVE;
      _jasmine.NETWORK = true;
      _jasmine.NONETWORK = !_jasmine.NETWORK;

      _jasmine[String(window.location.protocol).replace(/\W/g, "")] = true;

    }

    if (_jasmine._waiting && _jasmine._waiting.length > 0) {
      if (_jasmine._jsxbaseclasses.length > 0) {
        var nextPath = _jasmine._jsxbaseclasses.shift();
        // HACK: without timeout was causing stack overflow on Safari
        window.setTimeout(function() {
          _jasmine.loadScript(jsx3.CLASS_LOADER.resolvePath(_jasmine.JSX_JS_BASE + nextPath), _jasmine._doneLoadingJSX30);
        }, 0);
      } else {
        for (i = 0; i < _jasmine._waiting.length; i++) {
          try {
            if (console) console.debug("Requiring class " + _jasmine._waiting[i] + "...");
            jsx3.require(_jasmine._waiting[i]);
          } catch (e) {
            _jasmine.warn("Could not load class " + _jasmine._waiting[i] + ": " + e);
          }
        }

        _jasmine._loadJsxIncludes();

        _jasmine._waiting = [];
        window.setTimeout(function() {
          if (console) console.debug("Setting status to complete (A).");
          _jasmine.onLoaded();
        }, 0);
      }
    } else {
      _jasmine._loadJsxIncludes();

      window.setTimeout(function() {
        if (console) console.debug("Setting status to complete (B).");
        _jasmine.onLoaded();
      }, 0);
    }
  };

  _jasmine._tryLoadLogger = function() {
    if (!this._loggerinit && jsx3.util && jsx3.util.Logger) {
      this._loggerinit = true;
      var h = new jsx3.util.Logger.FormatHandler("jasmine");
      var methods = [null, "fail", "warn", "warn", "inform", "debug", "debug"];
      h.handle = function(objRecord) {
        var m = window[methods[objRecord.getLevel()]];
        if (m) {
          try {
            m.apply(window, [jsx3.util.strEscapeHTML(this.format(objRecord))]);
          } catch (e) {}
        }
      };
      jsx3.util.Logger.GLOBAL.addHandler(h);
    }
  };

  _jasmine._loadJsxIncludes = function() {
    // NOTE: this depends on unpublished API of the GI class loader
    if (jsx3.app && jsx3.app.PropsBundle && jsx3.System) {
      jsx3.app.PropsBundle.getProps(_jasmine.JSX_BASE + "JSX/locale/messages.xml", null, jsx3.getSystemCache());
      jsx3.app.PropsBundle.getProps(_jasmine.JSX_BASE + "JSX/locale/locale.xml", null, jsx3.getSystemCache());
    }
  };

  _jasmine.onLoaded = function() {
    // publish loaded event
  };
  // Assertion functions
  // add custom Jasmine matcher here

  _jasmine.assertInstanceOf = function(expected) {
    var objArg = this.actual;
    var fctConstructor = typeof(expected) == "string" ? eval(expected) : expected;

    if (typeof(fctConstructor) != "function")
      return false;

    return objArg instanceof fctConstructor || (objArg && objArg.instanceOf && objArg.instanceOf(fctConstructor));
  };

  _jasmine.assertTypeOf = function(expected) {
    var var1 = this.actual;

    return typeof(var1) == expected;
  };

  _jasmine.assertEquals = function(expected) {
    var actual = this.actual;

    if (expected != null && typeof(expected) == "object" && typeof(expected.equals) == "function") {
      return expected.equals(actual);
    } else {
      return this.env.equals_(actual, expected);
    }
  };

  _jasmine.matchers = {
    toBeInstanceOf: _jasmine.assertInstanceOf,
    toBeTypeOf: _jasmine.assertTypeOf,
    toEquals: _jasmine.assertEquals
  };
  // Logging functions

  /**
   *
   */
  _jasmine.log = function() {
    if (window.log) log.apply(null, arguments);
    if (window.console) try { window.console.log.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  _jasmine.warn = function() {
    if (window.warn) warn.apply(null, arguments);
    if (window.console) try { window.console.warn.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  _jasmine.inform = function() {
    if (window.inform) inform.apply(null, arguments);
    if (window.console) try { window.console.info.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  _jasmine.debug = function() {
    if (window.debug) debug.apply(null, arguments);
    if (window.console) try { window.console.debug.apply(window.console, arguments); } catch (e) {}
  };

};

gi.test.jasmine._init(gi.test.jasmine);
delete gi.test.jasmine._init;
