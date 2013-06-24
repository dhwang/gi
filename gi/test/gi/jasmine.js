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

gi.test.jasmine._init = function(jasmine) {

  jasmine.FILE_SCHEME = String(document.location.protocol).indexOf("file") == 0;
  jasmine.JSX_BASE = "../";
  jasmine.JSX_JS_BASE = jasmine.JSX_BASE + "JSX/js/";
  jasmine.TEST_BASE = "%2E%2E/test/tests/jasmine/";
  jasmine.HTTP_BASE = jasmine.FILE_SCHEME ? "http://www.generalinterface.org/tests" : "../server";
  
  //jasmine._PENDING_SUITES = [];

  jasmine.decodeURI = function(strText) {
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

  jasmine.getQueryParams = function(strURL) {
    var params = {};
    var index = strURL.indexOf("?");
    if (index < 0) return params;
    var query = strURL.substring(index+1);
    var pairs = query.split(/&/g);
    for (var i = 0; i < pairs.length; i++) {
      var nv = pairs[i].split("=", 2);
      params[jasmine.decodeURI(nv[0])] = jasmine.decodeURI(nv[1]);
    }
    return params;
  };

  /**
   *
   */

  jasmine._addJsTests = function(objSuite, strTest1) {
    for (var i = 1; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!(arg instanceof Array)) arg = [arg];
      for (var j = 0; j < arg.length; j++)
        arg[j] = jasmine.TEST_BASE + arg[j];
      objSuite.addTestPage("../gi/test-js.html?extjs=" + arg.join(","));
    }
  };

  jasmine.loadScript = function(strSrc, fctDone, objAttr) {
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

  jasmine.loadGI = function() {
    jasmine.loadScript(jasmine.JSX_JS_BASE + "JSX30.js", jasmine._doneLoadingJSX30,
        {jsxappempty:"true"});
  };

  jasmine.TestSuite = function(strPrefix) {
    var tokens = strPrefix.split(/\W/);
    this._prefix = tokens.join("_");
    tokens.pop();
    this._path = tokens.join("/") + "/";
  };

  jasmine.TestSuite.prototype.getPrefix = function() {
    return this._prefix;
  };

  jasmine.TestSuite.prototype.resolveURI = function(strPath) {
    var path = jasmine.TEST_BASE + this._path + strPath;
    return jasmine.decodeURI(path);
  };

  jasmine.TestSuite.prototype.newServer = function(strConfig, strPath, bGUI, objEnv) {
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

  jasmine.TestSuite.prototype._prefix = null;
  jasmine.TestSuite.prototype._path = null;

  /**
   *
   */
  jasmine.makeTestFunction = function(fctBody, arg1) {
    var a = [];
    for (var i = 1; i < arguments.length; i++)
      a[i-1] = arguments[i];

    return function() {
      fctBody.apply(null, a);
    };
  };

  jasmine._tests = [];


  /**
   *
   */
  jasmine.require = function(strClass1) {
    if (console) console.debug("Requiring " + strClass1 + "...");

    var bFirst = jasmine._waiting == null;
    if (bFirst)
      jasmine._waiting = [];

    for (var i = 0; i < arguments.length; i++) {
      try {
        if (eval(arguments[i]) == null) {
          jasmine._waiting.push(arguments[i]);
        }
      } catch (e) {
        jasmine._waiting.push(arguments[i]);
      }
    }

  };

  jasmine._doneLoadingJSX30 = function(strSrc) {
    if (strSrc == jasmine.JSX_JS_BASE + "JSX30.js") {
      // Copy CLASS_LOADER browser tokens into jasmine
      var tokens = ["IE", "IE7", "MOZ", "FX", "SAF", "GOG", "KON", "SVG", "VML"];
      for (var i = 0; i < tokens.length; i++)
        jasmine[tokens[i]] = jsx3.CLASS_LOADER[tokens[i]];

      // Copy any URL parameters into JSX environment
      var params = jasmine.getQueryParams(window.location.search);
      for (var p in params)
        jsx3.setEnv(p, params[p]);
    }

    jasmine._tryLoadLogger();

    for (i = 0; jasmine._waiting && i < jasmine._waiting.length; i++) {
      try {
        if (eval(jasmine._waiting[i]) != null)
          jasmine._waiting.splice(i--, 1);
      } catch (e) {}
    }

//    if (console) console.debug("Loaded " + strSrc + ". Still waiting for [" + jasmine._waiting + "]");

    if (jasmine._jsxbaseclasses == null) {
      jasmine._jsxbaseclasses = jsx3.lang.ClassLoader.SYSTEM_SCRIPTS.concat();

      jasmine.BUILD = jasmine._jsxbaseclasses.length <= 2;
      jasmine.SOURCE = !jasmine.BUILD;
      jasmine.DEP = typeof(jsx3.ABSOLUTEPATH) == "string";
      jasmine.NODEP = !jasmine.DEP;
      jasmine.INTERACTIVE = jsx3.getEnv("jsxtestinter") == "1";
      jasmine.NOINTERACTIVE = !jasmine.INTERACTIVE;
      jasmine.NETWORK = true;
      jasmine.NONETWORK = !jasmine.NETWORK;

      jasmine[String(window.location.protocol).replace(/\W/g, "")] = true;

    }

    if (jasmine._waiting && jasmine._waiting.length > 0) {
      if (jasmine._jsxbaseclasses.length > 0) {
        var nextPath = jasmine._jsxbaseclasses.shift();
        // HACK: without timeout was causing stack overflow on Safari
        window.setTimeout(function() {
          jasmine.loadScript(jsx3.CLASS_LOADER.resolvePath(jasmine.JSX_JS_BASE + nextPath), jasmine._doneLoadingJSX30);
        }, 0);
      } else {
        for (i = 0; i < jasmine._waiting.length; i++) {
          try {
            if (console) console.debug("Requiring class " + jasmine._waiting[i] + "...");
            jsx3.require(jasmine._waiting[i]);
          } catch (e) {
            jasmine.warn("Could not load class " + jasmine._waiting[i] + ": " + e);
          }
        }

        jasmine._loadJsxIncludes();

        jasmine._waiting = [];
        window.setTimeout(function() {
          if (console) console.debug("Setting status to complete (A).");
          jasmine.onLoaded();
        }, 0);
      }
    } else {
      jasmine._loadJsxIncludes();

      window.setTimeout(function() {
        if (console) console.debug("Setting status to complete (B).");
        jasmine.onLoaded();
      }, 0);
    }
  };

  jasmine._tryLoadLogger = function() {
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

  jasmine._loadJsxIncludes = function() {
    // NOTE: this depends on unpublished API of the GI class loader
    if (jsx3.app && jsx3.app.PropsBundle && jsx3.System) {
      jsx3.app.PropsBundle.getProps(jasmine.JSX_BASE + "JSX/locale/messages.xml", null, jsx3.getSystemCache());
      jsx3.app.PropsBundle.getProps(jasmine.JSX_BASE + "JSX/locale/locale.xml", null, jsx3.getSystemCache());
    }
  };

  jasmine.onLoaded = function() {
    // publish loaded event
  };
  // Assertion functions
  // TODO - add custom Jasmine matcher here

  // Logging functions

  /**
   *
   */
  jasmine.log = function() {
    if (window.log) log.apply(null, arguments);
    if (window.console) try { window.console.log.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  jasmine.warn = function() {
    if (window.warn) warn.apply(null, arguments);
    if (window.console) try { window.console.warn.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  jasmine.inform = function() {
    if (window.inform) inform.apply(null, arguments);
    if (window.console) try { window.console.info.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  jasmine.debug = function() {
    if (window.debug) debug.apply(null, arguments);
    if (window.console) try { window.console.debug.apply(window.console, arguments); } catch (e) {}
  };

};

gi.test.jasmine._init(gi.test.jasmine);
delete gi.test.jasmine._init;
