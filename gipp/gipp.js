/*
 * Copyright (c) 2007-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

if (!window.gi) window.gi = new Object();
if (!gi.test) gi.test = new Object();
if (!gi.test.gipp) gi.test.gipp = new Object();

/**
 * The TIBCO General Interface&#8482; Performance Profiler.
 * <p/>
 * Any static field in this package that is not defined <code>final</code> may be overridden by the user. There
 * are a number of places to override these values, which are listed here in increasing precedence:
 * <ol>
 *   <li>In <code>config.js</code>.</li>
 *   <li>In a script tag in <code>gipp.html</code> (or a copy of that file) after the script tag that loads 
 *       <code>config.js</code>.</li>
 *   <li>As a key value pair in the query party of the URL from which GIPP loads.</li>
 *   <li>In the GIPP user interface form (<code>GI</code>, <code>APP</code>, and <code>BENCHMARK_JS</code> only).</li>
 * </ol>
 *
 * @jsxdoc-definition  jsx3.Package.definePackage("gi.test.gipp", function(){});
 */
(function(gipp) {

  /**
   * {Object} A test case function may return this to indicate that it is an asynchronous test. The test case must
   *   somehow subsequently call <code>completeTestCase()</code> to indicate that the test has completed.
   * @see #completeTestCase()
   * @final
   */
  gipp.WAIT = new Object();

  /**
   * {Object} A test case function may return this to indicate that it has finished but that the test harness should
   *   sleep before completing the test case. Returning this is handy if the test case queues up a bunch of operations
   *   in jsx3.sleep() but shouldn't be considered finished until the sleep queue has emptied.
   * @final
   */
  gipp.SLEEP = new Object();

  /**
   * {Object} A test case function may return this to indicate that it has finished only when the GI sleep queue
   * empties.
   * @final
   */
  gipp.SLEEP_LONG = new Object();

  /**
   * {Object} A test case function may return this to indicate that it is an asynchronous test. The test case should
   *   set <code>POLL.poll</code> to a Function that returns <code>true</code> when the test is completed. The
   *   benchmark harness will call <code>POLL.poll()</code> at an interval until it returns <code>true</code>. The
   *   harness will pass the Server instance as the only parameter to the polling function.
   * @final
   */
  gipp.POLL = new Object();
  
  /**
   * {int} The number of times to run the test suite. The default is <code>1</code>. The value must be between
   * 1 and 100.
   */
  gipp.RUNS = 1;

  /**
   * {boolean} Whether to start the test suite automatically. The default is <code>false</code>.
   */
  gipp.AUTORUN = false;

  /**
   * {String|Array<String>} The path of the GI installation, relative to the GIPP launch page, <code>gipp.html</code>. 
   *   This "GI:" input control is pre-populated with this value. If the value is an array then the input control
   *   changes to a select box. 
   */
  gipp.GI = "";

  /**
   * {String|Array<String>} The path of the GI application to test, relative to the GIPP launch page, <code>gipp.html</code>. 
   *   This "Project:" input control is pre-populated with this value. If the value is an array then the input control
   *   changes to a select box. 
   */
  gipp.APP = "";

  /**
   * {String|Array<String>} The path of the JavaScript file that contains benchmarking code for each app that is 
   *   tested using the benchmarking harness. The path is relative to the project directory.
   *   This "JS:" input control is pre-populated with this value. If the value is an array then the input control
   *   changes to a multi-select box. 
   */
  gipp.BENCHMARK_JS = "benchmark.js";

  /**
   * {Object<String,String>} A key-value map of deployment parameters that will be added to the tested application.
   */
  gipp.DEPLOYMENT_PARAM = {};  

  /**
   * {int} The number of milliseconds of timeout between running test cases.
   */
  gipp.TICK = 250;

  /**
   * {int} The number of milliseconds of timeout between calls to the polling function.
   */
  gipp.INTERVAL = 100;

  /**
   * {int} The number of milliseconds to wait before cancelling a test case that returns <b>WAIT</b>.
   */
  gipp.TIMEOUT = 3000;
  
  /**
   * {int} The number of milliseconds to wait before cancelling a test case that returns <b>POLL</b>.
   */
  gipp.POLL_TIMEOUT = 60000;
  
  /**
   * {String} If this field is set then the test results are posted to this URL when the tests complete. 
   */
  gipp.POST_URL = "";

  /**
   * {String} If the test results are posted to <code>POST_URL</code>, use this user name for simple HTTP authentication.
   */
  gipp.POST_USERNAME = "";

  /**
   * {String} If the test results are posted to <code>POST_URL</code>, use this password for simple HTTP authentication.
   */
  gipp.POST_PASSWORD = "";
  
  /**
   * {boolean} Whether or not to parse the query parameters of the URL of the GIPP page and override configuration variables
   * with them. The default is <code>true</code>. GIPP does its best to parse values from their string representation.
   * The following formats are supported:
   * <ul>
   *   <li>JavaScript number</li>
   *   <li>Array: [1,2,'a','b']</li>
   *   <li>Object: {a:1,b:"B"}</li>
   *   <li>"string" or 'string' or string</li>
   * </ul>
   */
  gipp.IMPORT_URLPARAMS = true;


  /** @package */
  gipp.init = function() {
    if (gipp.IMPORT_URLPARAMS)
      gipp._importQueryParams();
    
    /* @jsxobf-clobber */
    gipp._runner = new gipp.Runner(window.document);
  };
  
  /** @private @jsxobf-clobber */
  gipp._importQueryParams = function() {
    var params = gipp._getQueryParams(window.location.search);
    for (var f in params) {
      gipp[f] = gipp._parseParam(params[f]);
    }
  };
  
  /** @private @jsxobf-clobber */
  gipp._parseParam = function(strValue) {
    if (!isNaN(strValue)) {
      return Number(strValue);
    } else if (strValue.match(/^\[.*\]$/)) {
      var v = [];
      var tokens = strValue.substring(1, strValue.length - 1).split(/\s*,\s*/g);
      for (var i = 0; i < tokens.length; i++)
        v[i] = gipp._parseParam(tokens[i]);
      return v;
    } else if (strValue.match(/^\{.*\}$/)) {
      var v = {};
      var tokens = strValue.substring(1, strValue.length - 1).split(/\s*,\s*/g);
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        var index = t.indexOf(":");
        if (index >= 0) {
          var key = t.substring(0, index);
          v[k] = gipp._parseParam(t.substring(index+1));
        }
      }
      return v;
    } else if (strValue.match(/^".*"$/) || strValue.match(/^'.*'$/)) {
      return strValue.substring(1, strValue.length - 1);
    } else if ("true" == strValue) {
      return true;
    } else if ("false" == strValue) {
      return false;
    } else {
      return strValue;
    }
  };

  /** @private @jsxobf-clobber */
  gipp._getQueryParams = function(strURL) {
    var params = {};
    var index = strURL.indexOf("?");
    if (index < 0) return params;
    var query = strURL.substring(index+1);
    var pairs = query.split(/&/g);
    for (var i = 0; i < pairs.length; i++) {
      var nv = pairs[i].split("=", 2);
      params[gipp._decodeURI(nv[0])] = gipp._decodeURI(nv[1]);
    }
    return params;
  };
  
  /** @private @jsxobf-clobber */
  gipp._decodeURI = function(strText) {
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
  
  /** @package */
  gipp.runPause = function(objGUI) {
    var runner = gipp._runner;
    
    if (objGUI.value == "Run")
      runner._run();
    else
      runner._pause();
  };

  /** @package */
  gipp.step = function() {
    gipp._runner._step();
  };

  /** @package */
  gipp.reload = function() {
    window.location.reload(true);
  };

  gipp.evaluate = function(e) {
    this._cancelEvt(e);
    gipp._runner._evaluate();
  };

  /** @private @jsxobf-clobber */
  gipp._cancelEvt = function(e) {
    try {
      if (e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      } else
        e.cancelBubble = true;
    } catch (e) {}
  };
  
  /** @package */
  gipp.exportReport = function() {
    var runner = gipp._runner;
    
    var data = runner._getReport();
    if (gipp._copy(data)) {
      runner._clearLog();
      runner._log("The tab-delimited report data has been copied to the clipboard.");
    } else {
      runner._clearLog();
      runner._log("Could not use the clipboard, opening window instead.");
      var w = window.open("about:blank", "BenchReport");
      w.document.write("<html><head><title>Benchmark Report</title></head><body><pre>" + data + "</pre></body></html>");
      w.focus();
    }
  };
  
  /** @package */
  gipp.exportReportXml = function() {
    var runner = gipp._runner;
    
    var data = runner._getReportXML();    
    if (gipp._copy(data)) {
      runner._clearLog();
      runner._log("The XML report data has been copied to the clipboard.");
    } else {
      runner._clearLog();
      runner._log("Could not use the clipboard, opening window instead.");
      var w = window.open("about:blank", "BenchReport");
      w.document.write("<html><head><title>Benchmark Report</title></head><body><pre>" + gipp._strEscapeHTML(data) + "</pre></body></html>");
      w.focus();
    }
  };
  
  /** @private @jsxobf-clobber */
  gipp._strEscapeHTML = function(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(
        /[^\x09\x0A\x0D\x20-\xD7FF\xE000-\xFFFD\x10000-\xFFFFF]/g,
        function(m) { return "\\u" + m.charCodeAt().toString(16); } );
  };

  /**
   * Returns the runner singleton for this execution of GIPP.
   * @return {gi.test.gipp.Runner}
   */
  gipp.getRunner = function() {
    return this._runner;
  };
  
  /**
   * Adds a test case to the set of currently running test cases. Convenience method for creating an instance of
   * <code>TestCase</code> and adding it to the test runner. 
   *
   * @param strId {String} the name (unique identifier) of the test.
   * @param fctCase {Function} the test case function. This function will be called with a single argument, which is
   *    the instance of <code>jsx3.app.Server</code> for the application being tested.
   * @param objMeta {Object<String,String>} optional metadata for this test. The recognized keys are:
   *    <code>label {String}</code> - the label to show in the UI, defaults to the test ID. 
   *    <code>description {String}</code> - the description of the test case to export in the report data.
   *    <code>single {boolean}</code> - whether to only run a test case once even when running the suite multiple times,
   *    <code>unit {String}</code> - <code>ms</code> (default) or <code>x</code>,
   *    <code>limit {int}</code> - the number of milliseconds to give to the test case if the unit is <code>x</code>.
   *       The default is 1000.
   * @return {gi.test.gipp.TestCase}
   */
  gipp.addTestCase = function(strId, fctCase, objMeta) {
    var testCase = new gipp.TestCase(strId, fctCase);
    if (objMeta) {
      if (objMeta.single) testCase.setSingle(true);
      if (objMeta.unit) testCase.setUnit(objMeta.unit);
      if (objMeta.limit) testCase.setLimitMs(objMeta.limit);
      if (objMeta.label) testCase.setLabel(objMeta.label);
      if (objMeta.description) testCase.setDescription(objMeta.description);
    }
    
    gipp._runner.addTest(testCase);
    return testCase;
  };

  /**
   * Adds sub-test case information to the test results. A test case result may be partitioned into one or more
   * categories. A test case function can call this method to report the time taken by a category during each run
   * of the test function.
   * @param objJob {gi.test.gipp.TestCase} the test case. 
   * @param strCategory {String} the category key. This should be a valid XML attribute name.
   * @param intValue {int} the number of milliseconds attributable to the category.
   */
  gipp.addCategory = function(objJob, strCategory, intValue) {
    var results = this._runner._resultsMap[objJob.getId()];
    results.setCategoryValue(strCategory, this._runner._runIndex, intValue);
  };
  
  /**
   * Adds a test case that loads a GI application into the GIPP UI.
   * @param strPath {String} the path of the application to load, relative to the GIPP launch page.
   */
  gipp.addLoadAppCase = function(strPath) {
    gipp._runner._addLoadAppCase(strPath);
  };

  /**
   * Adds a test case for loading a JavaScript file asynchronously.
   * @param strPath {String} the relative path to the JavaScript file to load.
   */
  gipp.addLoadJsCase = function(strPath) {
    gipp._runner._addLoadJsCase(strPath);
  };

  /**
   * Completes the currently running test case. This method must be called once after any test case returns
   * <code>WAIT</code>.
   * @param strId {String} the ID of the currently running test to complete. This parameter is required and is
   *   used as a check to ensure that programmer error does not lead to one test case completing another.
   * @see #WAIT
   */
  gipp.completeTestCase = function(strId) {
    gipp._runner._completeTestCase(strId);
  };
  
  /**
   * Starts collecting statistics from timing messages generated in the debug build of GI.
   */
  gipp.startStats = function() {
    if (!gipp._stats && jsx3 && jsx3.util && jsx3.util.Timer)
      /* @jsxobf-clobber */
      gipp._stats = jsx3.util.Timer.listen();
  };

  /**
   * Stops collecting statistics from timing messages generated in the debug build of GI.
   */
  gipp.stopStats = function() {
    if (gipp._stats) {
      jsx3.util.Timer.ignore(gipp._stats);
      gipp._stats = null;
    }
  };

  /**
   * Returns all statistics collected since <code>startStats()</code> was called. If <code>strTopic</code> is 
   * provided only statistics with that topic are returned. Each element in the returned array has the following
   * properties:
   * <ul>
   *   <li>topic {String} - usually the class name</li>
   *   <li>subtopic {String} - usually an instance identifier</li>
   *   <li>message {String} - usually the action/method performed</li>
   *   <li>ms {int} - the time taken in milliseconds</li>
   * </ul>
   * <b>This method returns an empty array unless running against a source or debug build of GI 3.6 or later.</b>
   *
   * @param strTopic {String}
   * @return {Array<Object>}
   * @see #startStats()
   * @see #stopStats()
   */
  gipp.getStats = function(strTopic) {
    var s = [];
    if (gipp._stats) {
      if (strTopic == null) 
        return gipp._stats;
      
      for (var i = 0; i < gipp._stats.length; i++) {
        var aStat = gipp._stats[i];
        if (aStat.topic == strTopic)
          s.push(aStat);
      }
    }
    return s;
  };
  
  /**
   * Generates timing statistics for every call to a method. The method must be an instance method of a class
   * defined with <code>jsx3.lang.Class.defineClass()</code>.
   * <p/>
   * <b>This method is a no-op unless running against a source or debug build of GI 3.6 or later.</b>
   *
   * @param strClass {String} the name of a GI class.
   * @param strMethod {String} the name of a method of <code>strClass</code>.
   * @param bEnd {boolean} if <code>true</code>, then stop timing the method.
   * @see #getStats()
   * @see #startStats()
   * @see #stopStats()
   */
  gipp.timeMethod = function(strClass, strMethod, bEnd) {
    if (jsx3.AOP && jsx3.util.Timer) {
      var pcId = "gipp." + strClass + "$" + strMethod;
      
      if (bEnd) {
        jsx3.AOP.pcrem(pcId);
      } else {
        jsx3.AOP.pc(pcId, {classes:strClass, methods:strMethod}).around(pcId, function(aop) {
          var t1 = new jsx3.util.Timer(strClass);
          var rv = aop.proceed.apply(aop, jsx3.Method.argsAsArray(arguments, 1));
          t1.log(strMethod);
          return rv;
        });
      }
    }
  };

  /** @private @jsxobf-clobber */
  gipp._copy = function(strText) {
    if (window.clipboardData) {
      clipboardData.setData('text',strText);
      return true;
    } else if (window.netscape && netscape.security && netscape.security.PrivilegeManager) {
      //get an instance of the clipboard
      netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
      var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
      if (clip) {
        //make sure clipboard is accessible
        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if (trans) {
          //specify Unicode as the string format
          trans.addDataFlavor('text/unicode');

          //instance a native String
          var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
          str.data = strText;

          //(is this due to unicode double-byte?)
          trans.setTransferData("text/unicode",str,strText.length*2);

          var clipid = Components.interfaces.nsIClipboard;
          clip.setData(trans,null,clipid.kGlobalClipboard);
          return true;
        }
      }
    }

    return false;
  };
  
})(gi.test.gipp);


/**
 * The GIPP controller object. This class rovides access to all test cases and results.
 *
 * @see gi.test.gipp#getRunner()
 *
 * @jsxdoc-definition  jsx3.lang.Class.defineClass("gi.test.gipp.Runner", Object, null, function() {});
 */
(function(Runner) {
  var Runner_prototype = Runner.prototype;
  var gipp = gi.test.gipp;
  
  /** @private */
  Runner_prototype.init = function(objDoc) {
    /* @jsxobf-clobber */
    this._doc = objDoc;

    this._setValueOrOptions("input_gi", this._const("GI"));
    this._setValueOrOptions("input_project", this._const("APP"));
    this._setValueOrOptions("input_js", this._const("BENCHMARK_JS"), true);

    if (this._const("AUTORUN"))
      window.setTimeout(this._callback("_run"), this._const("TICK"));
    
    /* @jsxobf-clobber */
    this._runs = Math.max(1, Math.min(100, this._const("RUNS")));
    this._setRun(0);
    this._updateResultsHeight();

    if (window.addEventListener) {
      window.addEventListener("resize", this._callback("_updateResultsHeight"), false);
    } else if (window.attachEvent) {
      window.attachEvent("onresize", this._callback("_updateResultsHeight"), false);
    }

    this._doc.getElementById("btn_run").focus();
  };
  
  Runner_prototype._reset = function() {
    /* @jsxobf-clobber */
    this._jobList = [];
    /* @jsxobf-clobber */
    this._jobMap = {};
    /* @jsxobf-clobber */
    this._resultsMap = {};
    
    /* @jsxobf-clobber */
    this._jobIndex = 0;
    this._runs = Math.max(1, Math.min(100, this._const("RUNS")));
    /* @jsxobf-clobber */
    this._runIndex = 0;
    
    /* @jsxobf-clobber */
    this._server = null;
    /* @jsxobf-clobber */
    this._running = false;
    /* @jsxobf-clobber */
    this._thisJob = null;
    
    /* @jsxobf-clobber */
    this._stateStartTime = null;
    /* @jsxobf-clobber */
    this._stateTimes = null;
  };
  
  Runner_prototype._step = function() {
    if (! this._jobList) 
      this._start();
    this._nextJob();    
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._start = function() {
    this._reset();
    this._clearAppPane();

    var path = this._getFormValue("input_project");
    this._addLoadAppCase(path);

    var js = this._getFormValue("input_js", true);
    for (var i = 0; i < js.length; i++)
      this._addLoadJsCase(path + "/" + js[i]);
  };

  /**
   * Adds a test case to this runner.
   * @param objTest {gi.test.gipp.TestCase}
   */
  Runner_prototype.addTest = function(objTest) {
    var id = objTest.getId();
    if (! this._jobMap[id]) {
      this._jobList.push(objTest);
      this._jobMap[id] = objTest;
      this._resultsMap[id] = new gipp.Result();
      this._updateOutput(objTest.getId(), objTest.getLabel(), "", "");
    } else {
      this._log("Duplicate test ID: " + id);
    }
  };

  /**
   * @param strId {String} the test case ID.
   * @return {gi.test.gipp.TestCase}
   */
  Runner_prototype.getTest = function(strId) {
    return this._jobMap[strId];
  };

  /**
   * @param strId {String} the test case ID.
   * @return {gi.test.gipp.Result}
   */
  Runner_prototype.getResult = function(strId) {
    return this._resultsMap[strId];
  };

  /**
   * Adds a test case that loads a GI application into the GIPP UI.
   * @param strPath {String} the path of the application to load, relative to the GIPP launch page.
   * @private 
   * @jsxobf-clobber
   */
  Runner_prototype._addLoadAppCase = function(strPath) {
    var me = this;
    var testCase = new gipp.TestCase("app." + strPath, function() {
      var div = me._doc.createElement("div");
      div.id = "app";
      me._getById("app_container").appendChild(div);

      var element = me._doc.createElement("script");
      
      var param = me._const("DEPLOYMENT_PARAM");
      if (param && typeof(param) == "object") {
        for (var f in param)
          element.setAttribute(f, String(param[f]));
      }
      
      element.src = me._getFormValue("input_gi") + "/JSX/js/JSX30.js";
      element.setAttribute("jsxapppath", strPath);
      element.setAttribute("jsxlt", "true");
      element.setAttribute("caption", ""); // prevent title from changing
      element.type = 'text/javascript';

      div.appendChild(element);

      gipp.POLL.poll = me._callback("_checkAppLoad");
      return gipp.POLL;
    });
    
    testCase.setSingle(true);
    testCase.setLabel("Load application");
    
    this.addTest(testCase);
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._checkAppLoad = function() {
    if (window.jsx3) {
      var apps = null;
      if (jsx3.lang && jsx3.lang.System && jsx3.lang.System.getAllApps)
        apps = jsx3.lang.System.getAllApps();
      else if (jsx3.app && jsx3.app.Server && jsx3.app.Server.allServers)
        apps = jsx3.app.Server.allServers();

      if (apps && apps.length > 0) {
        var app = apps[0];
        var root = app.getJSXByName("JSXROOT");
        if (root && root.getRendered()) {
          this._server = app;
          return true;
        }
      }
    }
    
    return false;
  };

  /**
   * Adds a test case for loading a JavaScript file asynchronously.
   * @param strPath {String} the relative path to the JavaScript file to load.
   * @private 
   * @jsxobf-clobber
   */
  Runner_prototype._addLoadJsCase = function(strPath) {
    var me = this;
    
    var testCase = new gipp.TestCase("js." + strPath, function() {
      var job = this;
      var element = me._doc.createElement("script");
      element.src = strPath;
      element.type = 'text/javascript';

      if (jsx3.CLASS_LOADER.IE || parseFloat(jsx3.lang.System.getVersion()) < 3.2) {
        element.onreadystatechange = function() {
          var state = this.readyState;
          if (state == "loaded" || state == "interactive" || state == "complete") {
            element.onreadystatechange = null;
            element.onload = null;
            window.setTimeout(me._callback("_completeTestCase", [job.getId()]), 0);
          }
        };
      } else {
        element.onload = function() {
          element.onreadystatechange = null;
          element.onload = null;
          window.setTimeout(me._callback("_completeTestCase", [job.getId()]), 0);
        };
      }

      // bind the element to the browser DOM to begin loading the resource
      window.setTimeout(function() { me._doc.getElementsByTagName("head")[0].appendChild(element); }, 0);
      return gipp.WAIT;
    });
    
    var shortPath = strPath.indexOf("/") >= 0 ? strPath.substring(strPath.lastIndexOf("/") + 1) : strPath;
        
    testCase.setSingle(true);
    testCase.setLabel("Load " + shortPath);
    
    this.addTest(testCase);
  };

  /**
   * Completes the currently running test case. This method must be called once after any test case returns
   * <code>WAIT</code>.
   * @param strId {String} the name of the currently running test to complete. This parameter is required and is
   *   used as a check to ensure that programmer error does not lead to one test case completing another.
   * @see #WAIT
   * @private 
   * @jsxobf-clobber
   */
  Runner_prototype._completeTestCase = function(strId) {
    var t2 = new Date();
    
    if (this._to_timeout) {
      window.clearTimeout(this._to_timeout);
      delete this._to_timeout;
    }

    var job = this._thisJob;
    if (job.getId() != strId) {
      this._log("Attempt to complete test case " + strId + " but the running case is " + job.getId() + ".");
      return;
    }
    
    var results = this._resultsMap[strId];

    if (job.getUnit() == gipp.TestCase.TIMES) {
      results.setValue(this._runIndex, this._stateTimes);
      delete this._stateTimes;
    } else {
      results.setValue(this._runIndex, t2 - this._stateStartTime);
      delete this._stateStartTime;
    }
    
    try {
      job._runTearDown(this._runIndex);      
    } catch (e) { ; }

    this._updateOutput(job.getId(), null, Math.round(results.getAverage()), job.getUnit());
    
    this._status("Finished: " + job.getLabel());

    this._continueNextTest();
    this._updateButtons();
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._callback = function(strName, arrArgs) {
    var me = this;
    if (arrArgs == null) arrArgs = [];
    return function() {
      return me[strName].apply(me, arrArgs);
    };
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._getById = function(id) {
    return this._doc.getElementById(id);
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._const = function(strId) {
    return gipp[strId];
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._run = function() {
    if (! this._jobList) 
      this._start();
    
    this._running = true;
    this._updateButtons();
    this._nextJob();
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._evaluate = function() {
    var script = this._getById("eval_script").value;
    var message = "";
    try {
      message = eval(script);
    } catch (e) {
      message = e.message || e.description || e.toString;
    }
    
    this._getById("eval_result").firstChild.innerHTML = gipp._strEscapeHTML(String(message));
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._pause = function() {
    this._running = false;
    window.clearTimeout(this._to_tick);
    this._updateButtons();
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._nextJob = function() {
    var job = null;
    do {
      job = this._jobList[this._jobIndex++];
    } while (job != null && (this._runIndex > 0 && job.isSingle()));
    
    this._thisJob = job;

    if (job) {
      this._status("Running: " + job.getLabel());
      this._setActive(job.getId());

      var funct = job.getFunction();
      var result = null;

      var ex = null;
      try {
        job._runSetUp(this._runIndex);
        
        this._stateStartTime = new Date();
        this._stateTimes = -1;

        if (job.getUnit() == gipp.TestCase.TIMES) {
          var limit = job.getLimitMs();
          var d = this._stateStartTime;
          while (d - this._stateStartTime < limit) {
            funct.apply(job, [this._server, this._stateTimes + 1]);
            this._stateTimes++;
            d = new Date();
          }
        } else {
          result = funct.apply(job, [this._server]);
        }
      } catch (e) {
        this._resultsMap[job.getId()].setError(this._runIndex, e);
        ex = e;
      }

      if (ex) {
        var strError = ex.message || ex.toString();
        strError = strError.replace(/"/g, "&quot;").replace(/'/g, "\\'");
        this._updateOutput(job.getId(), null, '<span class="error" onclick="window.alert(\'' + strError + '\')">Error</span>', "");
        this._continueNextTest();
      } else {
        if (result === gipp.SLEEP_LONG && jsx3.subscribe) {
          this._status("Sleeping: " + job.getLabel());
          jsx3.subscribe(jsx3.QUEUE_DONE, this, "_sleepQueueEmpty");
          jsx3.sleep(function() {});
        } else if (result === gipp.SLEEP_LONG || result === gipp.SLEEP) {
          this._status("Sleeping: " + job.getLabel());
          if (jsx3.sleep)
            jsx3.sleep(this._callback("_completeTestCase", [job.getId()]));
          else
            window.setTimeout(this._callback("_completeTestCase", [job.getId()]), 0);
        } else if (result === gipp.WAIT) {
          this._status("Waiting: " + job.getLabel());
          /* @jsxobf-clobber */
          this._to_timeout = window.setTimeout(this._callback("_timeoutTestCase", [job.getId()]), this._const("TIMEOUT"));
        } else if (result === gipp.POLL) {
          this._status("Polling: " + job.getLabel());
          /* @jsxobf-clobber */
          this._to_polling = window.setInterval(this._callback("_checkPollingCase"), this._const("INTERVAL"));
          this._to_timeout = window.setTimeout(this._callback("_timeoutTestCase", [job.getId()]), this._const("POLL_TIMEOUT"));
          this._updateButtons();
        } else {
          this._completeTestCase(job.getId());
        }
      }
    } else {
      this._log("Error (1)");
    }
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._updateResultsHeight = function() {
    if (this._resizeto) return;
    
    /* @jsxobf-clobber */
    var me = this;
    this._resizeto = window.setTimeout(function() {
      delete me._resizeto;

      var resultsDiv = me._getById("results");
      var height = me._doc.body.clientHeight - 2;
      for (var i = 0; i < resultsDiv.parentNode.childNodes.length; i++) {
        var c = resultsDiv.parentNode.childNodes[i];
        if (c.nodeType == 1 && c != resultsDiv && c.style.position != "absolute") 
          height -= c.offsetHeight;
      }
      resultsDiv.style.height = Math.max(0, height) + "px";
    }, 0);
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._setRun = function(intRun) {
    this._getById("runs").innerHTML = "Run " + intRun + "/" + this._runs;
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._setValueOrOptions = function(strName, strValue, bMulti) {
    var bArr = strValue instanceof Array;
    if (bArr && strValue.length == 1) {
      strValue = strValue[0];
      bArr = false;
    }
    
    if (bArr) {
      var orig = this._getById(strName);
      var select = this._doc.createElement("select");
      select.id = strName;
      if (bMulti) {
        select.setAttribute("multiple", "multiple");
        select.setAttribute("size", "2");
      }
      select.setAttribute("tabindex", orig.getAttribute("tabindex"));

      for (var i = 0; i < strValue.length; i++) {
        var option = this._doc.createElement("option");
        option.setAttribute("value", strValue[i]);
        if (bMulti || i == 0)
          option.setAttribute("selected", "selected");
        option.appendChild(this._doc.createTextNode(strValue[i]));
        select.appendChild(option);
      }
      orig.parentNode.replaceChild(select, orig);
    } else if (strValue) {
      this._getById(strName).value = strValue;
    }
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._getFormValue = function(strName, bArray) {
    var input = this._getById(strName);
    if (input.tagName.toLowerCase() == "select") {
      var vals = [];
      for (var i = 0; i < input.length; i++)
        if (input[i].selected)
          vals.push(input[i].value);

      return bArray ? vals : vals[0];
    } else {
      return bArray ? [input.value] : input.value;
    }
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._getReport = function() {
    var lines = [];
    lines.push("Name\tDescription\tCategory\tAverage\tUnit");
    for (var i = 0; i < this._runs; i++)
      lines.push("\tRun " + (i+1));
    lines.push("\tError");
    lines.push("\n");

    for (var i = 0; i < this._jobList.length; i++) {
      var job = this._jobList[i];
      var result = this._resultsMap[job.getId()];

      lines.push(job.getLabel(), "\t", (job.getDescription() || ""), "\t\t");
      lines.push(Math.round(result.getAverage()), "\t", job.getUnit());

      for (var j = 0; j < this._runs; j++) {
        var val = result.getValue(j);
        lines.push("\t", val != null ? val : "");
      }

      var e = result.getError();
      lines.push("\t", e ? (e.message || e.toString()) : "");
      lines.push("\n");
      
      var cats = result.getCategories();
      for (var j = 0; j < cats.length; j++) {
        var c = cats[j];

        lines.push(job.getLabel(), "\t\t", c, "\t");
        lines.push(Math.round(result.getCategoryAverage(c)), "\t", job.getUnit());

        for (var k = 0; k < this._runs; k++) {
          var val = result.getCategoryValue(c, j);
          lines.push("\t", val != null ? val : "");
        }
        lines.push("\t\n");
      }      
    }

    return lines.join("");
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._getReportXML = function() {
    var lines = [];
    lines.push('<data jsxid="jsxroot">\n');

    for (var i = 0; i < this._jobList.length; i++) {
      var job = this._jobList[i];
      var result = this._resultsMap[job.getId()];
      
      var cat = result.getCategories();
      
      lines.push('  <record');
      lines.push(' jsxid="', gipp._strEscapeHTML(job.getId()), 
                '" jsxtext="', gipp._strEscapeHTML(job.getLabel()), '"');
      var desc = job.getDescription();
      if (desc != null) 
        lines.push(' description="', gipp._strEscapeHTML(desc), '"');
      lines.push(' unit="', job.getUnit(), '"');
      lines.push(' average="', Math.round(result.getAverage()), '"');
      for (var j = 0; j < cat.length; j++) {
        lines.push(' avg.', cat[j], '="', Math.round(result.getCategoryAverage(cat[j])), '"');
      }
      lines.push('>');

      for (var j = 0; j < this._runs; j++) {
        var val = result.getValue(j);
        var e = result.getError(j);
        if (val || e) {
          lines.push('<run index="', j, '"', 
              (val != null ? ' value="' + val + '"': ""), 
              (e ? ' error="' + gipp._strEscapeHTML(e.message || e.toString()) + '"': ""));
          for (var k = 0; k < cat.length; k++) {
            lines.push(' cat.', cat[k], '="', Math.round(result.getCategoryValue(cat[k], j)), '"');
          }          
          lines.push("/>");
        }
      }
      
      lines.push('</record>\n');
    }

    lines.push('</data>\n');

    return lines.join("");
  };
  
  Runner_prototype._clearLog = function() {
    var div = this._getById("log").firstChild;
    div.innerHTML = "";
  };
  
  Runner_prototype._log = function(strMessage) {
    var div = this._getById("log").firstChild;
    var msg = this._doc.createElement("div");
    msg.appendChild(this._doc.createTextNode(gipp._strEscapeHTML(strMessage)));
    div.appendChild(msg);
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._clearAppPane = function() {
    var t = this._getById("app_container");
    for (var i = t.childNodes.length - 1; i >= 0; i--)
      t.removeChild(t.childNodes[i]);
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._peekNextJob = function() {
    var i = this._jobIndex;
    var job = null;
    do {
      job = this._jobList[i++];
    } while (job != null && (this._runIndex > 0 && job.isSingle()));
    return job;
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._sleepQueueEmpty = function(strName) {
    jsx3.unsubscribe(jsx3.QUEUE_DONE, this, "_sleepQueueEmpty");
    this._completeTestCase(this._thisJob.getId());
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._timeoutTestCase = function(strId) {
    if (this._to_polling) {
      window.clearInterval(this._to_polling);
      delete this._to_polling;
    }
    delete this._to_timeout;
    this._updateOutput(strId, null, '&#x221E;', "");
    this._continueNextTest();
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._checkPollingCase = function() {
    if (gipp.POLL.poll(this._server)) {
      window.clearInterval(this._to_polling);
      delete this._to_polling;
      delete gipp.POLL.poll;
      this._completeTestCase(this._thisJob.getId());
    }
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._allTestsFinished = function() {
    this._running = false;
    this._status("All Done");
    this._setActive();
    
    if (this._const("POST_URL")) {
      var me = this;
      window.setTimeout(function() { me._postResults(); }, this._const("TICK"));
    }
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._postResults = function() {
    var r = null;

    try {
      if (window.ActiveXObject) {
        r = new ActiveXObject("MSXML2.XMLHTTP");
      } else if (window.XMLHttpRequest) {
        r = new XMLHttpRequest();
      }
      
      if (r) {
        try {
          if (window.netscape && netscape.security)
            netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
        } catch (e) {;}
  
        r.open("POST", this._const("POST_URL"), false, this._const("POST_USERNAME"), this._const("POST_PASSWORD"));
        r.send(this._getReportXML());
  
        if (r.status == 0 || r.status == 200) {
          this._log("Test results successfully posted to " + this._const("POST_URL") + ".");
        } else {
          this._log("Posting test results failed with status " + r.status + ".");
        }
      } else {
        this._log("Could not post test results because XMLHttpRequest is not available.");
      }
    } catch (e) {
      this._log("Posting test results failed with error: " + e.message);
    }
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._updateTotal = function() {
    var t = 0;
    for (var i = 0; i < this._jobList.length; i++) {
      var job = this._jobList[i];
      if (job.getUnit() == gipp.TestCase.MILLIS) {
        var result = this._resultsMap[job.getId()];
        t += result.getTotal();
      }
    }

    this._updateOutput("gipp.total", "<b>Total</b>", Math.round(t), "ms");
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._updateOutput = function(strId, strLabel, strVal1, strVal2) {
    var id = "output." + strId;
    var tr = this._getById(id);
    if (! tr) {
      var table = this._doc.getElementById("table_results");

      var tbody = this._doc.createElement("tbody");
      tr = this._doc.createElement("tr");
      tr.setAttribute("id", id);

      var elm1 = this._doc.createElement("td");
      elm1.className = "name";
      var elm2 = this._doc.createElement("td");
      elm2.className = "val1";
      var elm3 = this._doc.createElement("td");
      elm3.className = "val2";

      tr.appendChild(elm1);
      tr.appendChild(elm2);
      tr.appendChild(elm3);

      tbody.appendChild(tr);
      table.appendChild(tbody);
    }

    if (strLabel != null)
      tr.childNodes[0].innerHTML = strLabel;
    tr.childNodes[1].innerHTML = strVal1;
    tr.childNodes[2].innerHTML = strVal2;

    this._scrollToResult(tr);
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._setActive = function(strId) {
    if (this._lastactive) {
      var tr = this._doc.getElementById(this._lastactive);
      if (tr)
        tr.className = "";
    }

    var id = "output." + strId;
    var tr = this._getById(id);
    if (tr)
      tr.className = "active";

    this._lastactive = id;
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._scrollToResult = function(tr) {
    var div = this._getById("results");
    div.scrollTop = Math.max(0, tr.offsetHeight + tr.offsetTop - div.offsetHeight + 8);
  };

  /** @private @jsxobf-clobber */
  Runner_prototype._updateButtons = function() {
    var nextJob = this._peekNextJob();
    this._getById("btn_run").value = this._running ? "Pause" : "Run";
    this._getById("btn_run").disabled = nextJob != null ? "" : "disabled";
    this._getById("btn_step").disabled = !this._running && nextJob != null ? "" : "disabled";
    this._getById("btn_export").disabled = this._doc.getElementById("btn_exportxml").disabled =
        !this._running && this._jobList != null && nextJob == null ? "" : "disabled";
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._continueNextTest = function() {
    if (this._running) {
      if (this._jobIndex < this._jobList.length) {
        /* @jsxobf-clobber */
        this._to_tick = window.setTimeout(this._callback("_nextJob"), this._const("TICK"));
      } else {
        this._updateTotal();

        if (this._runIndex < this._runs - 1) {
          this._runIndex++;
          this._jobIndex = 0;
          this._setRun(this._runIndex + 1);
          this._to_tick = window.setTimeout(this._callback("_nextJob"), this._const("TICK"));
        } else {
          this._allTestsFinished();
        }
      }
    }
  };
  
  /** @private @jsxobf-clobber */
  Runner_prototype._status = function(strText) {
    window.status = strText;
  };

  Runner_prototype.toString = function() {
    return "GIPP Runner";
  };
  
})(gi.test.gipp.Runner = function() { this.init.apply(this, arguments); });


/**
 * A test case. 
 *
 * @see gi.test.gipp#addTestCase()
 * @see gi.test.gipp.Runner#addTest()
 * @see gi.test.gipp.Runner#getTest()
 *
 * @jsxdoc-definition  jsx3.lang.Class.defineClass("gi.test.gipp.TestCase", Object, null, function() {});
 */
(function(TestCase) {
  var TestCase_prototype = TestCase.prototype;
  
  /**
   * {String} The "millisecond" unit.
   * @see #setUnit()
   * @final
   */
  TestCase.MILLIS = "ms";

  /**
   * {String} The "times" unit.
   * @see #setUnit()
   * @final
   */
  TestCase.TIMES = "x";

  /**
   * {int} The default maximum number of milliseconds in which to run a test case using the "times" unit.
   * @see #setLimitMs()
   * @final
   */
  TestCase.DEFAULT_LIMIT = 1000;
  
  /** @private @jsxobf-clobber */
  TestCase_prototype._unit = TestCase.MILLIS;
  /** @private @jsxobf-clobber */
  TestCase_prototype._limit = TestCase.DEFAULT_LIMIT;
  /** @private @jsxobf-clobber */
  TestCase_prototype._single = false;
  /** @private @jsxobf-clobber */
  TestCase_prototype._desc = null;
  
  /**
   * @param strId {String} the unique test ID.
   * @param fctTest {Function} the test function. The test function is sent two parameters. The first is the server
   *   of the application being tested. The second one is passed if the unit of the test is <code>TIMES</code> and is equal to 
   *   the sum of the times that the function has been called in this test run. 
   */
  TestCase_prototype.init = function(strId, fctTest) {
    /* @jsxobf-clobber */
    this._id = strId;
    /* @jsxobf-clobber */
    this._funct = fctTest;
    /* @jsxobf-clobber */
    this._setup = [];
    /* @jsxobf-clobber */
    this._teardown = [];
  };
    
  /**
   * @return {String}
   */
  TestCase_prototype.getId = function() {
    return this._id;
  };
    
  /**
   * @return {String}
   */
  TestCase_prototype.getLabel = function() {
    return this._label || this._id;
  };
    
  /**
   * @param strLabel {String}
   */
  TestCase_prototype.setLabel = function(strLabel) {
    this._label = strLabel;
  };
    
  /**
   * @return {String}
   */
  TestCase_prototype.getDescription = function() {
    return this._desc;
  };
    
  /**
   * @param strDesc {String}
   */
  TestCase_prototype.setDescription = function(strDesc) {
    this._desc = strDesc;
  };
    
  /**
   * @return {Function}
   */
  TestCase_prototype.getFunction = function() {
    return this._funct;
  };
    
  /**
   * @return {boolean}
   */
  TestCase_prototype.isSingle = function() {
    return this._single;
  };
  
  /**
   * @param bSingle {boolean}
   */
  TestCase_prototype.setSingle = function(bSingle) {
    this._single = Boolean(bSingle);
  };
    
  /**
   * @return {String} <code>MILLIS</code> or <code>TIMES</code>.
   * @see #MILLIS
   * @see #TIMES
   */
  TestCase_prototype.getUnit = function() {
    return this._unit;
  };
    
  /**
   * @param strUnit {String} <code>MILLIS</code> or <code>TIMES</code>.
   * @see #MILLIS
   * @see #TIMES
   */
  TestCase_prototype.setUnit = function(strUnit) {
    this._unit = strUnit;
  };
    
  /**
   * @return {int}
   */
  TestCase_prototype.getLimitMs = function() {
    return this._limit;
  };
    
  /**
   * @param intLimit {int}
   */
  TestCase_prototype.setLimitMs = function(intLimit) {
    this._limit = intLimit;
  };
  
  TestCase_prototype.toString = function() {
    return this._id;
  };
  
  /** @private @jsxobf-clobber */
  TestCase_prototype._runSetUp = function(intRun) {
    for (var i = 0; i < this._setup.length; i++) {
      var o = this._setup[i];
      if (intRun == 0 || o[1])
        o[0].apply(this);
    }
  };
  
  /** @private @jsxobf-clobber */
  TestCase_prototype._runTearDown = function(intRun) {
    for (var i = 0; i < this._teardown.length; i++) {
      var o = this._teardown[i];
      if (intRun == 0 || o[1])
        o[0].apply(this);
    }
  };
  
  /**
   * Adds a set-up function to this test case. A set-up function happens before the test case is called and is not 
   * counted in the time of the test case.
   * @param fctSetUp {Function} the set up function. This function will be called in the context of this test case
   *    instance.
   * @param bOnce {boolean} whether to only execute this function once even when preforming multiple test runs.
   */
  TestCase_prototype.addSetUp = function(fctSetUp, bOnce) {
    this._setup.push([fctSetUp, bOnce]);
  };
    
  /**
   * Adds a tear-down function to this test case. A tear-down function happens after the test case is called and is not 
   * counted in the time of the test case.
   * @param fctTearDown {Function}  the tear down function. This function will be called in the context of this test case
   *    instance.
   * @param bOnce {boolean} whether to only execute this function once even when preforming multiple test runs.
   */
  TestCase_prototype.addTearDown = function(fctTearDown, bOnce) {
    this._teardown.push([fctTearDown, bOnce]);
  };
    
})(gi.test.gipp.TestCase = function() { this.init.apply(this, arguments); });


/**
 * A data object that stores the results of a test case. There is one result object per test case per GIPP execution.
 *
 * @see gi.test.gipp.Runner#getResult()
 * 
 * @jsxdoc-definition  jsx3.lang.Class.defineClass("gi.test.gipp.Result", Object, null, function() {});
 */
(function(Result) {
  var Result_prototype = Result.prototype;
  
  /** @private */
  Result_prototype.init = function() {
    /* @jsxobf-clobber */
    this._data = [];
    /* @jsxobf-clobber */
    this._e = [];
    /* @jsxobf-clobber */
    this._category = {};
  };
  
  /**
   * @param intRun {int} the test run index.
   * @param numValue {Number} the test value (times or milliseconds).
   */
  Result_prototype.setValue = function(intRun, numValue) {
    this._data[intRun] = numValue;
  };
    
  /**
   * @param intRun {int} the test run index.
   * @return {Number}
   */
  Result_prototype.getValue = function(intRun) {
    return this._data[intRun];
  };
  
  /**
   * @return {Array<String>}
   */
  Result_prototype.getCategories = function() {
    var c = [];
    for (var f in this._category)
      c.push(f);
    return c;
  };
  
  /**
   * @param strCategory {String} the category ID.
   * @param intRun {int} the test run index.
   * @param numValue {Number} the test value (times or milliseconds).
   */
  Result_prototype.setCategoryValue = function(strCategory, intRun, numValue) {
    var c = this._category[strCategory];
    if (!c)
      c = this._category[strCategory] = [];
    c[intRun] = numValue;
  };
    
  /**
   * @param strCategory {String} the category ID.
   * @param intRun {int} the test run index.
   * @return {Number}
   */
  Result_prototype.getCategoryValue = function(strCategory, intRun) {
    var c = this._category[strCategory];
    if (c) return c[intRun];
    return null;
  };
    
  /**
   * @return {Number}
   */
  Result_prototype.getTotal = function() {
    var t = 0;
    for (var i = 0; i < this._data.length; i++) {
      if (!isNaN(this._data[i]))
        t += this._data[i];
    }
    return t;
  };
    
  /**
   * @return {Number}
   */
  Result_prototype.getAverage = function() {
    var t = 0;
    var d = 0;
    for (var i = 0; i < this._data.length; i++) {
      if (!isNaN(this._data[i])) {
        t += this._data[i];
        d++;
      }
    }
    return d == 0 ? 0 : t / d;
  };
  
  /**
   * @param strCategory {String} the category ID.
   * @return {Number}
   */
  Result_prototype.getCategoryTotal = function(strCategory) {
    var c = this._category[strCategory];
    if (c) {
      var t = 0;
      for (var i = 0; i < c.length; i++) {
        if (!isNaN(c[i]))
          t += c[i];
      }
      return t;
    } else {
      return null;
    }
  };
    
  /**
   * @param strCategory {String} the category ID.
   * @return {Number}
   */
  Result_prototype.getCategoryAverage = function(strCategory) {
    var c = this._category[strCategory];
    if (c) {
      var d = 0;
      var t = 0;
      for (var i = 0; i < c.length; i++) {
        if (!isNaN(c[i])) {
          t += c[i];
          d++;
        }
      }
      return d == 0 ? 0 : t / d;
    } else {
      return null;
    }
  };
  
  /**
   * @param intRun {int} the test run index.
   * @param e {Object} the error raised by the test function.
   */
  Result_prototype.setError = function(intRun, e) {
    this._e[intRun] = e;
  };
    
  /**
   * @param intRun {int} the test run index.
   * @return {Object}
   */
  Result_prototype.getError = function(intRun) {
    if (intRun != null) {
      return this._e[intRun];
    } else {
      for (var i = 0; i < this._e.length; i++)
        if (this._e[i]) return this._e[i];
      return null;
    }
  };
    
})(gi.test.gipp.Result = function() { this.init.apply(this, arguments); });


/**
 * Convenience methods for invoking events on GUI objects. The methods in this package simulate user interaction
 * with a General Interface&#8482; application by changing the state of a control and at the same time invoking any
 * bound "model" event.
 *
 * @jsxdoc-definition  jsx3.lang.Package.definePackage("gi.test.gipp.evt", function() {});
 */
(function(evt) {

  /**
   * Invokes the <code>EXECUTE</code> event on a GUI object.
   * @param objJSX {jsx3.gui.Button|jsx3.gui.ImageButton|jsx3.gui.Matrix|jsx3.gui.Menu|jsx3.gui.Table|jsx3.gui.ToolbarButton|jsx3.gui.Tree}
   * @param strRecordId {String, Array<String>} the CDF record ID(s) for Matrix, Menu, Tree and Table.
   */
  evt.execute = function(objJSX, strRecordId) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.Button && objJSX instanceof gui.Button) {
      objJSX.doExecute();
    } else if (gui.ImageButton && objJSX instanceof gui.ImageButton) {
      objJSX.doEvent(Interactive.EXECUTE, {objEVENT:null});
    } else if (gui.ToolbarButton && objJSX instanceof gui.ToolbarButton) {
      objJSX.doExecute();
    } else if (gui.Matrix && objJSX instanceof gui.Matrix) {
      objJSX.setValue(strRecordId);
      if (strRecordId instanceof Array) {
        for (var i = 0; i < strRecordId.length; i++)
          objJSX.executeRecord(strRecordId[i]);
        objJSX.doEvent(Interactive.EXECUTE, {objEVENT:null, strRECORDID:strRecordId[0], strRECORDIDS:strRecordId});
      } else {
        objJSX.executeRecord(strRecordId);
        objJSX.doEvent(Interactive.EXECUTE, {objEVENT:null, strRECORDID:strRecordId, strRECORDIDS:[strRecordId]});
      }
    } else if (gui.Menu && objJSX instanceof gui.Menu) {
      objJSX.executeRecord(strRecordId);
      objJSX.doEvent(Interactive.EXECUTE, {objEVENT:null, strRECORDID:strRecordId});
    } else if (gui.Tree && objJSX instanceof gui.Tree) {
      var id = strRecordId instanceof Array ? strRecordId[0] : strRecordId;
      var ids = strRecordId instanceof Array ? strRecordId : [strRecordId];
      
      for (var i = 0; i < ids.length; i++)
        objJSX.executeRecord(ids[i]);
      
      objJSX.doEvent(Interactive.EXECUTE, {objEVENT:null, strRECORDID:id, strRECORDIDS:ids});
    } else if (gui.Table && objJSX instanceof gui.Table) {
      var objRecord = objJSX.getRecord(strRecordId);
      if (objRecord) {
        objJSX.eval(objRecord.jsxexecute);
      }
      objJSX.doEvent(Interactive.EXECUTE, {objEVENT:null, strRECORDID:strRecordId});
    }
  };
  
  /**
   * Invokes the <code>SELECT</code> event on a GUI object.
   * @param objJSX {jsx3.gui.Matrix|jsx3.gui.RadioButton|jsx3.gui.Select}
   * @param strRecordId {String} the CDF record ID for Matrix and Select.
   */
  evt.select = function(objJSX, strRecordId) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.Matrix && objJSX instanceof gui.Matrix) {
      objJSX.setValue(strRecordId);
      objJSX.doEvent(Interactive.SELECT, {objEVENT:null, strRECORDID:strRecordId});
    } else if (gui.RadioButton && objJSX instanceof gui.RadioButton) {
      if (objJSX.getSelected() == gui.RadioButton.UNSELECTED) {
        objJSX.setSelected(gui.RadioButton.SELECTED);
        objJSX.doEvent(Interactive.SELECT, {objEVENT:null});
      }
    } else if (gui.Select && objJSX instanceof gui.Select) {
      objJSX.setValue(strRecordId);
      objJSX.doEvent(Interactive.SELECT, {objEVENT:null, strRECORDID:strRecordId});
    }
  };
  
  /**
   * Invokes the <code>CHANGE</code> event on a GUI object.
   * @param objJSX {jsx3.gui.ColorPicker|jsx3.gui.DatePicker|jsx3.gui.Slider|jsx3.gui.Table|jsx3.gui.TextBox|jsx3.gui.ToolbarButton|jsx3.gui.Tree}
   * @param objValue {Object} the new control value.
   */
  evt.change = function(objJSX, objValue) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.ColorPicker && objJSX instanceof gui.ColorPicker) {
      objJSX.setValue(objValue);
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null, intRGB:objValue});
    } else if (gui.DatePicker && objJSX instanceof gui.DatePicker) {
      var oldDate = objJSX.getDate();
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null, oldDATE:oldDate, newDATE:objValue}); // QUESTION: handle veto?
      objJSX.setDate(objValue);
    } else if (gui.Slider && objJSX instanceof gui.Slider) {
      var oldVal = objJSX.getValue();
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null, fpPREVIOUS:oldVal, fpVALUE:objValue}); // QUESTION: handle veto?
      objJSX.setValue(objValue);
    } else if (gui.Table && objJSX instanceof gui.Table) {
      var oldVal = objJSX.getValue();
      objJSX.setValue(objValue);
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null, strRECORDID:objValue, preVALUE:oldVal});
    } else if (gui.TextBox && objJSX instanceof gui.TextBox) {
      var oldVal = objJSX.getValue();
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null, strPREVIOUS:oldVal, strVALUE:objValue}); // QUESTION: handle veto?
      objJSX.setValue(objValue);
    } else if (gui.ToolbarButton && objJSX instanceof gui.ToolbarButton) {
      var newVal = objJSX.getState() ? gui.ToolbarButton.STATEOFF : gui.ToolbarButton.STATEON;
      objJSX.setState(newVal);
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null});
    } else if (gui.Tree && objJSX instanceof gui.Tree) {
      var oldVal = objJSX.getValue();
      objJSX.setValue(objValue);
      objJSX.doEvent(Interactive.CHANGE, {objEVENT:null, preVALUE:oldVal});
    }
  };
  
  /**
   * Invokes the <code>AFTER_MOVE</code> event on a GUI object.
   * @param objJSX {jsx3.gui.Dialog}
   * @param intX {int} the new X position.
   * @param intY {int} the new Y position.
   */
  evt.move = function(objJSX, intX, intY) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.Dialog && objJSX instanceof gui.Dialog) {
      objJSX.setDimensions(intX, intY, null, null, true);
      objJSX.doEvent(Interactive.AFTER_MOVE, {objEVENT:null});
    }
  };
  
  /**
   * Invokes the <code>AFTER_RESIZE</code> event on a GUI object.
   * @param objJSX {jsx3.gui.Dialog|jsx3.gui.Splitter}
   * @param intWidth {int|float} the new width for Dialog or size for Splitter.
   * @param intHeight {int} the new height for Dialog.
   */
  evt.resize = function(objJSX, intWidth, intHeight) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.Dialog && objJSX instanceof gui.Dialog) {
      objJSX.setDimensions(null, null, intWidth, intHeight, true);
      objJSX.doEvent(Interactive.AFTER_RESIZE, {objEVENT:null});
    } else if (gui.Splitter && objJSX instanceof gui.Splitter) {
      objJSX.setSubcontainer1Pct(intWidth, true);
      objJSX.doEvent(Interactive.AFTER_RESIZE, {objEVENT:null, objGUI:null});
    }
  };
  
  /**
   * Invokes the <code>SHOW</code> event on a GUI object.
   * @param objJSX {jsx3.gui.Stack|jsx3.gui.Tab}
   */
  evt.show = function(objJSX) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.Stack && objJSX instanceof gui.Stack) {
      objJSX.doShow();
    } else if (gui.Tab && objJSX instanceof gui.Tab) {
      objJSX.doShow();
    }
  };
  
  /**
   * Invokes the <code>TOGGLE</code> event on a GUI object.
   * @param objJSX {jsx3.gui.CheckBox|jsx3.gui.ImageButton|jsx3.gui.Tree}
   * @param strRecordId {String} the CDF record ID for Tree.
   */
  evt.toggle = function(objJSX, strRecordId) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.CheckBox && objJSX instanceof gui.CheckBox) {
      var newVal = objJSX.getChecked() ? gui.CheckBox.UNCHECKED : gui.CheckBox.CHECKED;
      objJSX.setChecked(newVal);
      objJSX.doEvent(Interactive.TOGGLE, {objEVENT:null, intCHECKED:newVal});
    } else if (gui.ImageButton && objJSX instanceof gui.ImageButton) {
      var newVal = objJSX.getState() ? gui.ImageButton.STATE_OFF : gui.ImageButton.STATE_ON;
      objJSX.doEvent(Interactive.TOGGLE, {objEVENT:null, intSTATE:newVal}); // QUESTION: handle veto?
      objJSX.setState(newVal);
    } else if (gui.Tree && objJSX instanceof gui.Tree) {
      var rec = objJSX.getRecord(strRecordId);
      if (rec) {
        objJSX.toggleItem(strRecordId);
        objJSX.doEvent(Interactive.TOGGLE, {objEVENT:null, strRECORDID:strRecordId, bOPEN:!rec.jsxopen});
      }
    }
  };
  
  /**
   * Invokes the <code>SPYGLASS</code> event on a GUI object.
   * @param objJSX {jsx3.gui.Matrix|jsx3.gui.Table|jsx3.gui.Tree}
   * @param strRecordId {String} the CDF record ID.
   * @param objCol {int|jsx3.gui.Matrix.Column} the column index for Table or the column object for Matrix.
   */
  evt.spy = function(objJSX, strRecordId, objCol) {
    var gui = jsx3.gui;
    var Interactive = gui.Interactive;
    
    if (gui.Matrix && objJSX instanceof gui.Matrix) {
      var html = objJSX.doEvent(Interactive.SPYGLASS, {objEVENT:null, objCOLUMN:objCol, strRECORDID:strRecordId});
      if (html) objJSX.showSpy(html, 10, 10);
    } else if (gui.Table && objJSX instanceof gui.Table) {
      var html = objJSX.doEvent(Interactive.SPYGLASS, {objEVENT:null, strRECORDID:strRecordId, intCOLUMNINDEX:objCol});
      if (html) objJSX.showSpy(html, 10, 10);
    } else if (gui.Tree && objJSX instanceof gui.Tree) {
      var html = objJSX.doEvent(Interactive.SPYGLASS, {objEVENT:null, strRECORDID:strRecordId});
      if (html) objJSX.showSpy(html, 10, 10);
    }
  };
  
})(gi.test.gipp.evt = {});
  
