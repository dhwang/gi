/*
 * Copyright (c) 2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

if (!window.gi) window.gi = new Object();
if (!gi.test) gi.test = new Object();
if (!gi.test.gipp) gi.test.gipp = new Object();

// @jsxobf-clobber  _resizeto _jobs _index _thisrun _running _TOPOLL _SERVER _CURRENTJOB

/**
 * The TIBCO General Interface&#8482; Performance Profiler.
 *
 * @jsxdoc-definition  jsx3.Package.definePackage("gi.test.gipp", function(){});
 */
gi.test.gipp._init = function(gipp) {

  /**
   * {int} The number of times to run the test suite. The default is <code>1</code>.
   */
  gipp.RUNS = 1;

  /**
   * {boolean} Whether to start the test suite automatically. The default is <code>false</code>.
   */
  gipp.AUTORUN = false;

  /**
   * {String|Array<String>} The path of the GI installation, relative to the GIPP launch page, <code>gipp.html</code>. 
   */
  gipp.GI = "";

  /**
   * {String|Array<String>} The path of the GI application to test, relative to the GIPP launch page, <code>gipp.html</code>. 
   */
  gipp.APP = "";

  /**
   * {String|Array<String>} The path of the JavaScript file that contains benchmarking code for each app that is 
   *    tested using the benchmarking harness. The path is relative to the project directory.
   */
  gipp.BENCHMARK_JS = "benchmark.js";

  /**
   * {Object<String,String>} A key-value map of deployment parameters that will be added to the tested application.
   */
  gipp.DEPLOYMENT_PARAM = {};
  
  /**
   * {Object} A test case function may return this to indicate that it is an asynchronous test. The test case must
   *   somehow subsequently call <code>completeTestCase()</code> to indicate that the test has completed.
   * @see #completeTestCase()
   */
  gipp.WAIT = new Object();

  /**
   * {Object} A test case function may return this to indicate that it has finished but that the test harness should
   *   sleep before completing the test case. Returning this is handy if the test case queues up a bunch of operations
   *   in jsx3.sleep() but shouldn't be considered finished until the sleep queue has emptied.
   */
  gipp.SLEEP = new Object();

  /**
   * {Object} A test case function may return this to indicate that it has finished only when the GI sleep queue
   * empties.
   */
  gipp.SLEEP_LONG = new Object();

  /**
   * {Object} A test case function may return this to indicate that it is an asynchronous test. The test case should
   *   set <code>POLL.poll</code> to a Function that returns <code>true</code> when the test is completed. The
   *   benchmark harness will call <code>POLL.poll()</code> at an interval until it returns <code>true</code>. The
   *   harness will pass the Server instance as the only parameter to the polling function.
   */
  gipp.POLL = new Object();

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

  
  /** @package */
  gipp.init = function() {
    gipp._setValueOrOptions("input_gi", gipp.GI);
    gipp._setValueOrOptions("input_project", gipp.APP);
    gipp._setValueOrOptions("input_js", gipp.BENCHMARK_JS, true);

    if (gipp.AUTORUN)
      window.setTimeout(gipp._run, 250);

    gipp._setRun(0);
    gipp._updateResultsHeight();

    if (window.addEventListener) {
      window.addEventListener("resize", gipp._updateResultsHeight, false);
    } else if (window.attachEvent) {
      window.attachEvent("onresize", gipp._updateResultsHeight, false);
    }

    document.getElementById("btn_run").focus();
  };

  /** @private @jsxobf-clobber */
  gipp._updateResultsHeight = function() {
    if (gipp._resizeto) return;
    gipp._resizeto = window.setTimeout(function() {
      delete gipp._resizeto;

      var resultsDiv = document.getElementById("results");
      var height = document.body.clientHeight - 2;
      for (var i = 0; i < resultsDiv.parentNode.childNodes.length; i++) {
        var c = resultsDiv.parentNode.childNodes[i];
        if (c.nodeType == 1 && c != resultsDiv) height -= c.offsetHeight;
      }
      resultsDiv.style.height = Math.max(0, height) + "px";
    }, 0);
  };

  /** @private @jsxobf-clobber */
  gipp._setRun = function(intRun) {
    document.getElementById("runs").innerHTML = "Run " + intRun + "/" + gipp.RUNS;
  };

  /** @private @jsxobf-clobber */
  gipp._setValueOrOptions = function(strName, strValue, bMulti) {
    var bArr = strValue instanceof Array;
    if (bArr && strValue.length == 1) {
      strValue = strValue[0];
      bArr = false;
    }
    
    if (bArr) {
      var orig = document.getElementById(strName);
      var select = document.createElement("select");
      select.id = strName;
      if (bMulti) {
        select.setAttribute("multiple", "multiple");
        select.setAttribute("size", "2");
      }
      select.setAttribute("tabindex", orig.getAttribute("tabindex"));

      for (var i = 0; i < strValue.length; i++) {
        var option = document.createElement("option");
        option.setAttribute("value", strValue[i]);
        if (bMulti || i == 0)
          option.setAttribute("selected", "selected");
        option.appendChild(document.createTextNode(strValue[i]));
        select.appendChild(option);
      }
      orig.parentNode.replaceChild(select, orig);
    } else if (strValue) {
      document.getElementById(strName).value = strValue;
    }
  };

  /** @private @jsxobf-clobber */
  gipp._getFormValue = function(strName, bArray) {
    var input = document.getElementById(strName);
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
  gipp._start = function() {
    gipp._clearAppPane();

    gipp._jobs = [];
    gipp._index = 0;
    gipp._thisrun = 0;

    var path = gipp._getFormValue("input_project");
    gipp.addLoadAppCase(path);

    var js = gipp._getFormValue("input_js", true);
    for (var i = 0; i < js.length; i++)
      gipp.addLoadJsCase(path + "/" + js[i]);
  };

  gipp.runPause = function(objGUI) {
    if (objGUI.value == "Run")
      gipp._run();
    else
      gipp._pause();
  };

  /** @private @jsxobf-clobber */
  gipp._run = function() {
    if (! gipp._jobs) gipp._start();
    gipp._running = true;
    gipp._updateButtons();
    gipp._nextJob();
  };

  /** @package */
  gipp.step = function() {
    if (! gipp._jobs) gipp._start();
    gipp._nextJob();
  };

  /** @private @jsxobf-clobber */
  gipp._pause = function() {
    gipp._running = false;
    window.clearTimeout(gipp._TO);
    gipp._updateButtons();
  };

  /** @package */
  gipp.stop = function() {
    gipp._jobs = null;
    gipp._index = 0;
    gipp._pause();
    if (gipp._TOPOLL)
      window.clearInterval(gipp._TOPOLL);
  };

  /** @package */
  gipp.reload = function() {
    window.location.reload();
  };

  /** @package */
  gipp.exportReport = function() {
    var lines = [];
    lines.push("Name\tAverage\tUnit");
    for (var i = 1; i <= gipp.RUNS; i++)
      lines.push("\tRun " + i);
    lines.push("\tError");
    lines.push("\n");

    for (var i = 0; i < this._jobs.length; i++) {
      var job = this._jobs[i];
      lines.push(job.name, "\t");

      if (job.unit == "x") {
        lines.push(Math.round(job.times/job.runs), "\tx");
        for (var j = 1; j <= gipp.RUNS; j++)
          lines.push("\t", (job["times" + j] != null ? job["times" + j] : ""));
      } else {
        lines.push(Math.round(job.time/job.runs), "\tms");
        for (var j = 1; j <= gipp.RUNS; j++)
          lines.push("\t", (job["time" + j] != null ? job["time" + j] : ""));
      }

      lines.push("\t", job.error ? (job.error.message || job.error.toString()) : "");
      lines.push("\n");
    }

    var data = lines.join("");
    if (gipp._copy(data)) {
      window.alert("The tab-delimited report data has been copied to the clipboard.");
    } else {
      var w = window.open("about:blank", "BenchReport");
      w.document.write("<html><head><title>Benchmark Report</title></head><body><pre>" + data + "</pre></body></html>");
    }
  };

  /** @package */
  gipp.exportReportXml = function() {
    var lines = [];
    lines.push('<data jsxid="jsxroot">\n');

    for (var i = 0; i < this._jobs.length; i++) {
      lines.push('  <record');
      var job = this._jobs[i];
      lines.push(' jsxid="', gipp._strEscapeHTML(job.name), '"');

      if (job.unit == "x") {
        lines.push(' unit="x"');
        lines.push(' avg="', job.times, '"');
        for (var j = 1; j <= gipp.RUNS; j++)
          lines.push(' r' + j + '="', (job["times" + j] != null ? job["times" + j] : ""), '"');
      } else {
        lines.push(' unit="ms"');
        lines.push(' avg="', job.time, '"');
        for (var j = 1; j <= gipp.RUNS; j++)
          lines.push(' r' + j + '="', (job["time" + j] != null ? job["time" + j] : ""), '"');
      }

      if (job.error)
        lines.push(' error="', gipp._strEscapeHTML(job.error.message || job.error.toString()), '"');

      lines.push('/>\n');
    }

    lines.push('</data>\n');

    var data = lines.join("");
    if (gipp._copy(data)) {
      window.alert("The XML report data has been copied to the clipboard.");
    } else {
      var w = window.open("about:blank", "BenchReport");
      w.document.write("<html><head><title>Benchmark Report</title></head><body><pre>" + gipp._strEscapeHTML(data) + "</pre></body></html>");
    }
  };

  /** @private @jsxobf-clobber */
  gipp._strEscapeHTML = function(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(
        /[^\x09\x0A\x0D\x20-\xD7FF\xE000-\xFFFD\x10000-\xFFFFF]/g,
        function(m) { return "\\u" + m.charCodeAt().toString(16); } );
  };

  /** @private @jsxobf-clobber */
  gipp._clearAppPane = function() {
    var t = document.getElementById("app_container");
    for (var i = t.childNodes.length - 1; i >= 0; i--)
      t.removeChild(t.childNodes[i]);
  };

  /** @private @jsxobf-clobber */
  gipp._clearResults = function() {
    var t = document.getElementById("table_results");
    for (var i = t.childNodes.length - 1; i >= 0; i--)
      t.removeChild(t.childNodes[i]);
  };

  /**
   * Adds a test case to the set of currently running test cases.
   * @param strName {String} the name (unique identifier) of the test.
   * @param fctCase {Function} the test case function. This function will be called with a single argument, which is
   *    the instance of <code>jsx3.app.Server</code> for the application being tested.
   * @param objMeta {Object<String,String>} optional metadata for this test. The recognized keys are:
   *    <code>single {boolean}</code> - whether to only run a test case once even when running the suite multiple times,
   *    <code>unit {String}</code> - <code>ms</code> (default) or <code>x</code>,
   *    <code>limit {int}</code> - the number of milliseconds to give to the test case if the unit is <code>x</code>.
   *       The default is 1000.
   */
  gipp.addTestCase = function(strName, fctCase, objMeta) {
    var job = {};
    if (objMeta)
      for (var f in objMeta)
        job[f] = objMeta[f];

    job.name = strName;
    job.fct = fctCase;
    job.runs = 0;
    job.time = 0;
    if (job.unit != "x") {
      job.unit = "ms";
    } else {
      job.times = 0;
      if (job.limit == null)
        job.limit = 1000;
    }

    gipp._jobs.push(job);
    gipp._updateOutput(strName, "", "");
  };

  /**
   * Adds a test case that loads a GI application into the GIPP UI.
   * @param strPath {String} the path of the application to load, relative to the GIPP launch page.
   */
  gipp.addLoadAppCase = function(strPath) {
    gipp.addTestCase("Load application", function() {
      var div = document.createElement("div");
      div.id = "app";
      document.getElementById("app_container").appendChild(div);

      var element = document.createElement("script");
      
      var param = gipp.DEPLOYMENT_PARAM;
      if (param && typeof(param) == "object") {
        for (var f in param)
          element.setAttribute(f, String(param[f]));
      }
      
      element.src = gipp._getFormValue("input_gi") + "/JSX/js/JSX30.js";
      element.setAttribute("jsxapppath", strPath);
      element.setAttribute("jsxlt", "true");
      element.setAttribute("caption", ""); // prevent title from changing
      element.type = 'text/javascript';

      div.appendChild(element);

      gipp.POLL.poll = gipp._checkAppLoad;
      return gipp.POLL;
    }, {single:true});
  };

  /** @private @jsxobf-clobber */
  gipp._checkAppLoad = function() {
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
          gipp._SERVER = app;
          return true;
        }
      }
    }
    
    return false;
  };

  /**
   * Adds a test case for loading a JavaScript file asynchronously.
   * @param strPath {String} the relative path to the JavaScript file to load.
   */
  gipp.addLoadJsCase = function(strPath) {
    var shortPath = strPath.indexOf("/") >= 0 ? strPath.substring(strPath.lastIndexOf("/") + 1) : strPath;
    var name = "Load " + shortPath;
    gipp.addTestCase(name, function() {

      var element = document.createElement("script");
      element.src = strPath;
      element.type = 'text/javascript';

      if (jsx3.CLASS_LOADER.IE || parseFloat(jsx3.lang.System.getVersion()) < 3.2) {
        element.onreadystatechange = function() {
          var state = this.readyState;
          if (state == "loaded" || state == "interactive" || state == "complete") {
            element.onreadystatechange = null;
            element.onload = null;
            window.setTimeout(function() { gipp.completeTestCase(name); }, 0);
          }
        };
      } else {
        element.onload = function() {
          element.onreadystatechange = null;
          element.onload = null;
          window.setTimeout(function() { gipp.completeTestCase(name); }, 0);
        };
      }

      // bind the element to the browser DOM to begin loading the resource
      window.setTimeout(function() { document.getElementsByTagName("head")[0].appendChild(element); }, 0);
      return gipp.WAIT;
    }, {single:true});
  };

  /** @private @jsxobf-clobber */
  gipp._peekNextJob = function() {
    var i = gipp._index;
    var job = null;
    do {
      job = gipp._jobs[i++];
    } while (job != null && (job.single && job.runs > 0));
    return job;
  };

  /** @private @jsxobf-clobber */
  gipp._nextJob = function() {
    var job = null;
    do {
      job = gipp._jobs[gipp._index++];
    } while (job != null && (job.single && job.runs > 0));
    gipp._CURRENTJOB = job;

    // todo: need to increment job in case

    if (job) {
      gipp._status("Running: " + job.name);
      gipp._setActive(job.name);

      job.runs++;
      gipp._setRun(job.runs);

      gipp._T1 = new Date().getTime();
      gipp._TIMES = -1;

      var funct = job.fct;
      var result = null;

      var ex = null;
      try {
        if (job.unit == "x") {
          var d = gipp._T1;
          while (d - gipp._T1 < job.limit) {
            funct(gipp._SERVER, gipp._TIMES + 1);
            gipp._TIMES++;
            d = new Date().getTime();
          }
        } else {
          result = funct(gipp._SERVER);
        }
      } catch (e) {
        job.error = ex = e;
      }

      if (ex) {
        var strError = ex.message || ex.toString();
        strError = strError.replace(/"/g, "&quot;").replace(/'/g, "\\'");
        gipp._updateOutput(job.name, '<span class="error" onclick="window.alert(\'' + strError + '\')">Error</span>', "");
        gipp._continueNextTest();
      } else {
        if (result === gipp.SLEEP_LONG && jsx3.subscribe) {
          gipp._status("Sleeping: " + job.name);
          jsx3.subscribe(jsx3.QUEUE_DONE, gipp._sleepQueueEmpty);
          jsx3.sleep(function() { 1; });
        } else if (result === gipp.SLEEP_LONG || result === gipp.SLEEP) {
          gipp._status("Sleeping: " + job.name);
          if (jsx3.sleep)
            jsx3.sleep(function() { gipp.completeTestCase(job.name); });
          else
            window.setTimeout(function() { gipp.completeTestCase(job.name); }, 0);
        } else if (result === gipp.WAIT) {
          gipp._status("Waiting: " + job.name);
          gipp._TOTO = window.setTimeout(function() { gipp._timeoutTestCase(job.name); }, gipp.TIMEOUT);
        } else if (result === gipp.POLL) {
          gipp._status("Polling: " + job.name);
          gipp._TOPOLL = window.setInterval(gipp._checkPollingCase, gipp.INTERVAL);
          gipp._updateButtons();
        } else {
          gipp.completeTestCase(job.name);
        }
      }
    } else {
      gipp._error("No next job.");
    }
  };

  /** @private @jsxobf-clobber */
  gipp._sleepQueueEmpty = function(strName) {
    jsx3.unsubscribe(jsx3.QUEUE_DONE, gipp._sleepQueueEmpty);
    gipp.completeTestCase(gipp._CURRENTJOB.name);
  };

  /** @private @jsxobf-clobber */
  gipp._timeoutTestCase = function(strName) {
    delete gipp._TOTO;
    gipp._updateOutput(strName, '&#x221E;', "");
    gipp._continueNextTest();
  };

  /** @private @jsxobf-clobber */
  gipp._checkPollingCase = function() {
    if (gipp.POLL.poll(gipp._SERVER)) {
      window.clearInterval(gipp._TOPOLL);
      delete gipp._TOPOLL;
      delete gipp.POLL.poll;
      gipp.completeTestCase(gipp._CURRENTJOB.name);
    }
  };

  /**
   * Completes the currently running test case. This method must be called once after any test case returns
   * <code>WAIT</code>.
   * @param strName {String} the name of the currently running test to complete. This parameter is required and is
   *   used as a check to ensure that programmer error does not lead to one test case completing another.
   * @see #WAIT
   */
  gipp.completeTestCase = function(strName) {
    if (gipp._TOTO) {
      window.clearTimeout(gipp._TOTO);
      delete gipp._TOTO;
    }

    var job = gipp._CURRENTJOB;
    if (job.name != strName) {
      gipp._error("Attempt to complete test case " + strName + " but the running case is " + job.name + ".");
      return;
    }

    if (job.unit == "x") {
      job.times += gipp._TIMES;
      job["times" + job.runs] = gipp._TIMES;
      delete gipp._TIMES;
      gipp._updateOutput(job.name, Math.round(job.times/job.runs), "x");
    } else {
      var t2 = new Date().getTime();
      var total = t2 - gipp._T1;
      delete gipp._T1;
      job.time += total;
      job["time" + job.runs] = total;
      gipp._updateOutput(job.name, Math.round(job.time/job.runs), "ms");
    }

    gipp._status("Finished: " + job.name);

    gipp._continueNextTest();
    gipp._updateButtons();
  };

  /** @private @jsxobf-clobber */
  gipp._continueNextTest = function() {
    if (gipp._running) {
      if (gipp._index < gipp._jobs.length) {
        gipp._TO = window.setTimeout(gipp._nextJob, gipp.TICK);
      } else {
        this._updateTotal();

        if (gipp._thisrun < gipp.RUNS - 1) {
          gipp._thisrun++;
          gipp._index = 0;
          gipp._TO = window.setTimeout(gipp._nextJob, gipp.TICK);
        } else {
          gipp._running = false;
          gipp._status("All Done");
          gipp._setActive();
        }
      }
    }
  };

  /** @private @jsxobf-clobber */
  gipp._updateTotal = function() {
    var t = 0;
    for (var i = 0; i < gipp._jobs.length; i++)
      t += (gipp._jobs[i].time / gipp._jobs[i].runs);

    gipp._updateOutput("<b>Total</b>", Math.round(t), "ms");
  };

  /** @private @jsxobf-clobber */
  gipp._updateOutput = function(strName, strVal1, strVal2) {
    var id = "output." + strName;
    var tr = document.getElementById(id);
    if (! tr) {
      var table = document.getElementById("table_results");

      var tbody = document.createElement("tbody");
      tr = document.createElement("tr");
      tr.setAttribute("id", id);

      var elm1 = document.createElement("td");
      elm1.className = "name";
      var elm2 = document.createElement("td");
      elm2.className = "val1";
      var elm3 = document.createElement("td");
      elm3.className = "val2";

      tr.appendChild(elm1);
      tr.appendChild(elm2);
      tr.appendChild(elm3);

      tbody.appendChild(tr);
      table.appendChild(tbody);
    }

    tr.childNodes[0].innerHTML = strName;
    tr.childNodes[1].innerHTML = strVal1;
    tr.childNodes[2].innerHTML = strVal2;

    gipp._scrollToResult(tr);
  };

  /** @private @jsxobf-clobber */
  gipp._setActive = function(strName) {
    if (gipp._lastactive) {
      var tr = document.getElementById(gipp._lastactive);
      if (tr)
        tr.className = "";
    }

    var id = "output." + strName;
    var tr = document.getElementById(id);
    if (tr)
      tr.className = "active";

    gipp._lastactive = id;
  };

  /** @private @jsxobf-clobber */
  gipp._scrollToResult = function(tr) {
    var div = document.getElementById("results");
    div.scrollTop = Math.max(0, tr.offsetHeight + tr.offsetTop - div.offsetHeight + 8);
  };

  /** @private @jsxobf-clobber */
  gipp._error = function(strMessage) {
    window.alert(strMessage);
  };

  /** @private @jsxobf-clobber */
  gipp._updateButtons = function() {
    var nextJob = gipp._peekNextJob();
    document.getElementById("btn_run").value = gipp._running ? "Pause" : "Run";
    document.getElementById("btn_run").disabled = nextJob != null ? "" : "disabled";
    document.getElementById("btn_step").disabled = !gipp._running && nextJob != null ? "" : "disabled";
    document.getElementById("btn_export").disabled = document.getElementById("btn_exportxml").disabled =
        !gipp._running && gipp._jobs != null && nextJob == null ? "" : "disabled";
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

  /** @private @jsxobf-clobber */
  gipp._status = function(strText) {
    window.status = strText;
  };
};

gi.test.gipp._init(gi.test.gipp);
delete gi.test.gipp._init;
