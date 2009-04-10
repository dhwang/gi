/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-global-rename-pattern  _jsx(\w+) _jsx$1
// @jsxobf-clobber  _target _addin _queued _loaded _server
// @jsxobf-reserved  IE FX ie6 ie7 ie fx SAF SVG VML IE6 IE7

if (window['jsx_main'] == null)
/* Wrap the entire system initialization in this one function, which we will call once and then destroy */
window['jsx_main'] = function() {

  /* Browser detection, the result of which is setting the strPath variable. */
  var BrowserDetect = function() {
    var agt = this.agt = navigator.userAgent.toLowerCase();

    var major = parseInt(navigator.appVersion);
    var minor = parseFloat(navigator.appVersion);

    this.nav     = ((agt.indexOf('mozilla')!=-1) && (agt.indexOf('spoofer') < 0)
                     && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera') < 0)
                     && (agt.indexOf('webtv') < 0) && (agt.indexOf('hotjava') < 0));
    this.nav6    = this.nav && major == 5;
    this.nav6up  = this.nav && major >= 5;

    this.gecko   = this.nav6up && agt.indexOf('gecko') >= 0;
    this.geckook = this.gecko && this.getVersionAfter('gecko/') >= 20050915;
    this.ffox    = this.nav6up && agt.indexOf('firefox') >= 0;
    this.ffox15  = this.ffox && this.getVersionAfter('firefox/') >= 1.5;
    this.ffox2   = this.ffox15 && this.getVersionAfter('firefox/') >= 2.0;
    this.ffox3   = this.ffox2 && this.getVersionAfter('firefox/') >= 3.0;
    this.safari  = agt.indexOf('applewebkit') >= 0;
    this.safari2 = this.safari && this.getVersionAfter('applewebkit/') >= 420;

    this.opera   = agt.indexOf("opera") >= 0;
    if (this.opera) {
      var operavers = this.getVersionAfter('opera ');
      this.opera85 = operavers >= 8.5 && operavers < 9;
      this.opera9 = operavers >= 9;
    }

    this.ie      = agt.indexOf("msie") >= 0 && !this.opera;
    if (this.ie) {
      var ievers   = this.getVersionAfter('msie ');
      this.ie6     = major == 4 && Math.floor(ievers) == 6;
      this.ie6up   = ievers >= 6;
      this.ie7     = Math.floor(ievers) == 7;
      this.ie7up   = ievers >= 7;
      this.ie8     = Math.floor(ievers) == 8;
      this.ie8up   = ievers >= 8;
    }
  };

  /* @jsxobf-clobber */
  BrowserDetect.prototype.getVersionAfter = function(strToken) {
    var index = this.agt.indexOf(strToken);
    return index >= 0 ? parseFloat(this.agt.substring(index+strToken.length)) : 0;
  };

  /* Load the JSX system if not already loaded. */
  if (window['jsx3'] == null) {

    /** @jsxdoc-category  jsx3 */
    window.jsx3 = {};
    jsx3.lang = {};
    jsx3.util = {};

    /**
     * {String} base path for the core JS classes for gi runtime (JSX/js)
     * @package
     * @final @jsxobf-final
     */
    jsx3.SYSTEM_ROOT = "JSX";

    /**
     * {String} base path for the core JS classes for gi runtime (JSX/js)
     * @package
     * @final
     */
    jsx3.SYSTEM_SCRIPTS = jsx3.SYSTEM_ROOT + "/js";

    /**
     * {String} the path to the main JavaScript file (JSX30.js)
     * @package
     * @final
     */
    jsx3.MAIN_SCRIPT = jsx3.SYSTEM_SCRIPTS + "/JSX30.js";

    /**
     * {String} An application's folder must be a descendent of a folder with this name for GI to work properly.
     * @package
     * @final @jsxobf-final
     */
    jsx3.APP_DIR_NAME = "JSXAPPS";

/* @JSC :: begin DEP */

    /**
     * {String} Absolute path (the path on the server (file or http) from the accessible root to the directory
     *   containing the JSX system folder. Specifies a directory (ie it's empty or ends with a "/").
     * @deprecated  Use jsx3.getEnv("jsxabspath")
     */
    jsx3.ABSOLUTEPATH = "";

    /**
     * {String} Path for application resources (the prefix that precedes JSXAPPS). Specifies a directory (ie it's
     *   empty or ends with a "/").
     * @deprecated  Use <code>jsx3.getEnv("jsxhomepath")</code>.
     */
    jsx3.APPPATH = "";

/* @JSC :: end */

    /**
     * {jsx3.gui.Event}
     */
    jsx3.STARTUP_EVENT = null;

    /** @private @jsxobf-clobber */
    jsx3.ENVIRONMENT = {};

    /**
     * @param strKey {String}
     * @return {String}
     */
    jsx3.getEnv = function(strKey) {
      return jsx3.ENVIRONMENT[strKey];
    };

    /**
     * @private
     */
    jsx3.setEnv = function(strKey, strValue) {
      if (jsx3.ENVIRONMENT[strKey] != null && jsx3.ENVIRONMENT[strKey] != strValue)
        window.alert(jsx3._msg("boot.env_reset", strKey, jsx3.ENVIRONMENT[strKey], strValue));
      jsx3.ENVIRONMENT[strKey] = strValue;
    };

    /**
     * Delegates to <code>System.getMessage()</code> if it has been defined. Otherwise, it returns the message
     * key with any arguments appended on the end.
     * @see jsx3.lang.System#getMessage()
     * @package
     */
    jsx3._msg = function(strKey, strTokens) {
      if (jsx3.System && jsx3.System.getMessage) return jsx3.System.getMessage.apply(null, arguments);
      var a = new Array(arguments.length);
      for (var i = 0; i < a.length; i++) a[i] = arguments[i];
      return a.join(" ");
    };

    // A simple event publishing interface for the classes in this file.
    var evtPub = {};

    /* @jsxobf-clobber */
    evtPub._subscribe = function(strSubject, objTarget, strMethod) {
      if (this._evtpubreg == null)
        /* @jsxobf-clobber */
        this._evtpubreg = {};
      var list = this._evtpubreg[strSubject];
      if (list == null)
        list = this._evtpubreg[strSubject] = [];
      list[list.length] = [objTarget, strMethod];
    };

    /* @jsxobf-clobber */
    evtPub._unsubscribe = function(strSubject, objTarget) {
      if (this._evtpubreg != null) {
        for (var subject in this._evtpubreg) {
          var list = this._evtpubreg[strSubject];
          for (var i = 0; i < list.length; i++) {
            if (list[i][0] == objTarget)
              list.splice(i--, 1);
          }
        }
      }
    };

    /* @jsxobf-clobber */
    evtPub._publish = function(objEvent) {
      if (this._evtpubreg != null) {
        var list = this._evtpubreg[objEvent.subject];
        if (list) {
          if (objEvent._target == null)
            objEvent._target = this;

          list = list.concat(); // defensive copy
          for (var i = 0; i < list.length; i++) {
            if (typeof(list[i][0]) == "function")
              list[i][0](objEvent);
            else if (typeof(list[i][1]) == "string")
              list[i][0][list[i][1]](objEvent);
            else
              list[i][1].apply(list[i][0], [objEvent]);
          }
        }
      }
    };

    /* @jsxobf-clobber */
    evtPub._import = function(objTarget) {
      objTarget._subscribe = this._subscribe;
      objTarget._unsubscribe = this._unsubscribe;
      objTarget._publish = this._publish;
    };


    jsx3.util.JobManager = function() {
      this.init.apply(this, arguments);
    };

    /**
     * @package
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.util.JobManager", Object, null, function(){});
     */
    var defineJobManager = function(JobManager, JobManager_prototype) {

      /**
       * The instance initializer.
       */
      JobManager_prototype.init = function() {
        this.reset();

        var me = this;
        /* @jsxobf-clobber */
        this._finishFunct = function() {
          this.constructor.prototype.finish.apply(this);
          me._onFinish(this);
        };

/*
        this._win = window.open("JSX/html/jsx3.app.Monitor.html", "jobManager",
              "directories=no," +
              "location=no," +
              "menubar=no," +
              "status=yes," +
              "personalbar=no," +
              "titlebar=yes," +
              "toolbar=no," +
              "resizable=yes," +
              "scrollbars=no," +
              "width=500," +
              "height=400");
        this._win.focus();
*/
      };

      JobManager_prototype.log = function(strMessage) {
/*
        if (!this._win.closed && this._win.appendMessage) {
          strMessage = strMessage.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
          this._win.appendMessage(strMessage, "WARN");
        }
*/
      };

      /**
       * Add a job to this manager. If the manager is running and no prerequisites are specified then the job is run
       * immediately.
       *
       * @param objJob {jsx3.util.Job} the job to add.
       * @param preReqs {Array<String> | String...} the ids of all the jobs that must finish before the job is run.
       * @throws {Error}  if a job with the same id as <code>objJob</code> is currently waiting in this manager or
       *   if any prerequisite id does not correspond to a job not currently waiting in this job manager.
       */
      JobManager_prototype.addJob = function(objJob, preReqs) {
        var id = objJob.getId();

        if (this._byId[id])
          throw new Error(jsx3._msg("job.dup", id));

        /* @jsxobf-clobber */
        objJob._manager = this;
        this._byId[id] = objJob;
        this._idToPres[id] = [];
        this._waitCt++;

        for (var i = 1; i < arguments.length; i++) {
          preReqs = arguments[i];
          if (preReqs instanceof Array)
            for (var j = 0; j < preReqs.length; j++)
              this.addPrereq(id, preReqs[j]);
          else if (preReqs != null)
            this.addPrereq(id, preReqs);
        }

//        this.log("Add job " + objJob + " with pres [" + this._idToPres[id] + "]");

        this._runIfReady(id);

        return objJob;
      };

      /**
       * Adds a prerequisite to the job with id <code>jobId</code>.
       * @param jobId {String} the id of the job to which to add the prerequisite.
       * @param preId {String} the id of the job that is a prerequisite for the job with id <code>jobId</code>.
       * @throws {Error}  if either parameter refers to a job not currently waiting in this job manager.
       */
      JobManager_prototype.addPrereq = function(jobId, preId) {
        if (! this._byId[preId])
          return;
        if (! this._byId[jobId])
          throw new Error(jsx3._msg("job.pre_bad", jobId, preId));

        this._idToPres[jobId].push(preId);

        if (! this._idToDepIds[preId])
          this._idToDepIds[preId] = [jobId];
        else
          this._idToDepIds[preId].push(jobId);
      };

      /**
       * Returns a job by its job id or <code>null</code> if no such job is waiting to run.
       * @param jobId {String}
       * @return jsx3.util.Job
       */
      JobManager_prototype.getJob = function(jobId) {
        return this._byId[jobId];
      };

      /**
       * Starts this job manager.
       */
      JobManager_prototype.start = function() {
        if (! this._running) {
          this._running = true;
          this._runIfReady();
        }
      };

      /**
       * Pauses this job manager.
       */
      JobManager_prototype.pause = function() {
        this._running = false;
      };

      /**
       * Resets this job manager.
       */
      JobManager_prototype.reset = function() {
        if (this._byId != null) {
          for (var jobId in this._byId)
            this._byId[jobId].finish = jsx3.util.Job.prototype.finish;
        }

        /* @jsxobf-clobber */
        this._byId = {};        // index jobs by their id
        /* @jsxobf-clobber */
        this._idToPres = {};    // store the prereqs of every job
        /* @jsxobf-clobber */
        this._idToDepIds = {};  // index jobs by the ids of the jobs they depend on
        /* @jsxobf-clobber */
        this._idsRunning = {};  // index all running ids so we don't run them twice
        /* @jsxobf-clobber */
        this._running = false;  // whether this job manager is running
        /* @jsxobf-clobber */
        this._waitCt = 0;       // the number of waiting/finishing jobs
        /* @jsxobf-clobber */
        this._doneCt = 0;       // the number of finished jobs
        /* @jsxobf-clobber */
        this._finishQ = [];     // the finishing queue, a list of job ids that are finishing
        /* @jsxobf-clobber */
        this._finishSP = false; // the finishing queue semaphore, indicates that the queue is processing
      };

      /**
       * Returns the number of jobs waiting to run or finishing.
       */
      JobManager_prototype.getWaitCt = function() {
        return this._waitCt;
      };

      /**
       * Returns the number of jobs that have finished.
       */
      JobManager_prototype.getDoneCt = function() {
        return this._doneCt;
      };

      /**
       * Checks to see if a job is ready to run, i.e. that all prerequisites have already run, and if so runs it. If
       * <code>jobId</code> is not provided, then all currently waiting jobs are considered.
       * @param jobId {String} the id of the job to run if it is ready.
       * @private
       * @jsxobf-clobber
       */
      JobManager_prototype._runIfReady = function(jobId) {
        if (this._running) {
          if (jobId) {
            if (this._idToPres[jobId].length == 0 && !this._idsRunning[jobId])
              this._runJob(jobId);
          } else {
            for (jobId in this._byId) {
              if (this._idToPres[jobId].length == 0 && !this._idsRunning[jobId])
                this._runJob(jobId);
            }
          }
        }
      };

      /**
       * @private
       * @jsxobf-clobber
       */
      JobManager_prototype._runJob = function(jobId) {
        var objJob = this._byId[jobId];

//        this.log("Running job " + objJob);
        this._idsRunning[jobId] = true;
        var intCmd = objJob.run();
        delete objJob.run;
//        this.log("... ran job " + objJob + " with result " + intCmd);

        if (typeof(intCmd) == "undefined" || intCmd == jsx3.util.Job.DONE ||
            (intCmd == jsx3.util.Job.WAIT && objJob.getState() == jsx3.util.Job.FINISHED)) {
          this._onFinish(objJob);
        } else if (intCmd == jsx3.util.Job.SLEEP) {
          var me = this;
          window.setTimeout(function() {
            me._onFinish(objJob);
          }, 0);
        } else {
          objJob.finish = this._finishFunct;
        }
      };

      /**
       * @private
       * @jsxobf-clobber
       */
      JobManager_prototype._onFinish = function(objJob) {
        var id = objJob.getId();
//        this.log("_onFinish " + objJob);

//        this._publish({subject:"finish", job:objJob});

        delete this._idsRunning[id];
        delete this._byId[id];
        delete this._idToPres[id];

        this._finishQ[this._finishQ.length] = id;
        if (! this._finishSP)
          this._finishThread();
      };

      /**
       * @private
       * @jsxobf-clobber
       */
      JobManager_prototype._finishThread = function() {
        // Set the semaphore to true so that the loop cannot cause this method to be called again in an ever-growing stack.
        this._finishSP = true;

        while (this._finishQ.length > 0) {
          var jobId = this._finishQ.shift();

          this._doneCt++;
          this._waitCt--;

          var dependentJobs = this._idToDepIds[jobId];
          if (dependentJobs) {
            delete this._idToDepIds[jobId];

            for (var i = 0; i < dependentJobs.length; i++) {
              var dependentJobId = dependentJobs[i];
              var prereqs = this._idToPres[dependentJobId];

              for (var j = 0; j < prereqs.length; j++) {
                if (prereqs[j] == jobId) {
                  prereqs.splice(j, 1);
                  break;
                }
              }

//              if (prereqs.length > 0)
//                this.log("Job " + dependentJobId + " now has prereqs " + prereqs);
              this._runIfReady(dependentJobId);
            }
          }
        }

        // Set the semaphore to false.
        this._finishSP = false;

        if (this._waitCt == 0) {
//          this.log("Publishing done!");
          if (this.publish)
            this.publish({subject:"done"});
        } else {
//          this.log("Not done! waiting:" + this._waitCt + " done:" + this._doneCt);
        }
      };
    };
    defineJobManager(jsx3.util.JobManager, jsx3.util.JobManager.prototype);


    jsx3.util.Job = function() {
      this.init.apply(this, arguments);
    };

    /**
     * @package
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.util.Job", Object, null, function(){});
     */
    var defineJob = function(Job, Job_prototype) {

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job will not finish until the
       *   <code>finish()</code> method is called.
       * @final @jsxobf-final
       */
      Job.WAIT = 0;

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job has finished and any dependent
       *   jobs should be run immediately.
       * @final @jsxobf-final
       */
      Job.DONE = 1;

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job has finished and any dependent
       *   jobs should be run after breaking the JavaScript stack with <code>window.setTimeout()</code>.
       * @final @jsxobf-final
       */
      Job.SLEEP = 2;

      /**
       * {int} Value for the state property indicating that this job has not yet finished.
       * @final @jsxobf-final
       */
      Job.WAITING = 0;

      /**
       * {int} Value for the state property indicating that this job has finished.
       * @final @jsxobf-final
       */
      Job.FINISHED = 1;

      /** @private @jsxobf-clobber */
      Job._SERIAL = 0;

      /**
       * The instance initializer.
       * @param id {String} the unique job id. If this parameter is not provided, a suitable unique value is generated.
       */
      Job_prototype.init = function(id, fctRun) {
        /* @jsxobf-clobber */
        this._id = id != null ? id : Job._SERIAL++;
        /* @jsxobf-clobber */
        this._state = Job.WAITING;

        if (fctRun)
          this.run = fctRun;
      };

      /**
       * Returns the job id.
       * @return {String}
       */
      Job_prototype.getId = function() {
        return this._id;
      };

      Job_prototype.getManager = function() {
        return this._manager;
      };

      /**
       * Runs the job. This method should be overridden for any job that wants to perform some action.
       * @return {int} <code>WAIT</code>, <code>DONE</code>, or <code>SLEEP</code>.
       * @see #WAIT
       * @see #DONE
       * @see #SLEEP
       */
      Job_prototype.run = function() {
        return Job.DONE;
      };

      /**
       * A job should call this method on itself if its run() method returns <code>WAIT</code> to communicate to the
       * job manager that it has finished.
       * @see #WAIT
       */
      Job_prototype.finish = function() {
        this._state = Job.FINISHED;
        if (this._publish)
          this._publish({subject:"finish"});
      };

      /**
       * Returns the job state.
       * @return <code>WAITING</code> or <code>FINISHED</code>.
       * @see #WAITING
       * @see #FINISHED
       */
      Job_prototype.getState = function() {
        return this._state;
      };

      Job_prototype.toString = function() {
        return this._id;
      };

    };
    defineJob(jsx3.util.Job, jsx3.util.Job.prototype);

    /**
     * The class loader manages the initialization bootstrapping of the JSX runtime and subsequent loading of
     * applications and add-ins.
     *
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader", null, null, function(){});
     */
    jsx3.lang.ClassLoader = function(objBrowser) {
      this.init(objBrowser);
    };

    var defineClassLoader = function(ClassLoader, ClassLoader_prototype) {

      var Job = jsx3.util.Job;
      var proto = null;

      evtPub._import(ClassLoader_prototype);

      // @jsxobf-clobber  _src _doc _cache _props _class _locale

      /* JavaScript job */
      ClassLoader.JsJob = function(strId, strSrc) {
        this._id = strId || strSrc;
        this._src = strSrc;
      };
      proto = ClassLoader.JsJob.prototype = new Job();

      proto.run = function() {
        // instance a new DOM element
        var element = document.createElement("script");
        element.src = this._src;
        element.type = 'text/javascript';
        element.id = this._id;

        // set up onload handler
        var me = this;
        if (jsx3.CLASS_LOADER.IE) {
          element.onreadystatechange = function() {
            var state = this.readyState;
            if (state == "loaded" || state == "interactive" || state == "complete") {
              element.onreadystatechange = null;
              me.finish();
            }
          };
        } else {
          element.onload = function() {
            element.onload = null;
            me.finish();
          };
        }

        jsx3.CLASS_LOADER._setStatus("@gi.boot.status.load1@" + this._src + "@gi.boot.status.load2@");

        // bind the element to the browser DOM to begin loading the resource
        document.getElementsByTagName("head")[0].appendChild(element);

        return Job.WAIT;
      };

      evtPub._import(proto);


      /* CSS job */
      ClassLoader.CssJob = function(strId, strSrc) {
        this._id = strId || strSrc;
        this._src = strSrc;
      };
      proto = ClassLoader.CssJob.prototype = new Job();

      proto.run = function() {
        // instance a new DOM element
        var element = document.createElement("link");
        element.id = this._id;
        element.href = this._src;
        element.rel = "stylesheet";
        element.type = "text/css";

        // TODO: does Mozilla support a callback? CSS files can probably be loaded in parallel anyway...
        if (jsx3.CLASS_LOADER.IE) {
          var me = this;
          element.onload = function() {
            element.onload = null;
            me.finish();
          };
        }

        jsx3.CLASS_LOADER._setStatus("@gi.boot.status.load1@" + this._src + "@gi.boot.status.load2@");

        //bind the element to the browser DOM to begin loading the resource
        document.getElementsByTagName("head")[0].appendChild(element);

        return Job.DONE;
      };

      proto.toString = function() {
        return this._id + " " + this._src;
      };


      /* XML job */
      ClassLoader.XmlJob = function(strId, strSrc, objCache, objClass) {
        this._id = strId || strSrc;
        this._src = strSrc;
        this._cache = objCache;
        this._class = objClass;
      };
      proto = ClassLoader.XmlJob.prototype = new Job();

      proto.run = function() {
        this._load();
        return Job.WAIT;
      };

      proto.getDocument = function() {
        return this._doc;
      };

      /** @private @jsxobf-clobber */
      proto._load = function() {
        var d = this._doc = (this._class || jsx3.xml.Document.jsxclass).newInstance();
        d.setAsync(true);
        d.subscribe("*", this, "_finish");

        jsx3.CLASS_LOADER._setStatus("@gi.boot.status.load1@" + this._src + "@gi.boot.status.load2@");
        d.load(this._src);
      };

      /** @private @jsxobf-clobber */
      proto._finish = function() {
        if (this._cache)
          this._cache.setDocument(this._id, this._doc);
        this.finish();
      };


      /* JSS job */
      ClassLoader.JssJob = function(strId, strSrc, objProps, objCache) {
        this._id = strId || strSrc;
        this._src = strSrc;
        this._props = objProps;
        this._cache = objCache;
      };
      proto = ClassLoader.JssJob.prototype = new ClassLoader.XmlJob();

      proto.run = function() {
        var doc = this._cache.getDocument(this._id);

        if (doc) {
          this._props.loadXML(doc, this._id);
          return Job.DONE;
        } else {
          this._load();
          return Job.WAIT;
        }
      };

      proto._finish = function(objEvent) {
        var doc = objEvent.target;
        this._cache.setDocument(this._id, doc);

        if (! doc.hasError()) {
          this._props.loadXML(doc, this._id);
        } else {
//          this.getManager().log("Error loading JSS properties file " + this._src + ": " + doc.getError());
        }
        this.finish();
      };


      /* PropsBundle job */
      ClassLoader.PropsBundleJob = function(strSrc, objProps, objCache, objLocale) {
        this._id = strSrc;
        this._src = strSrc;
        this._props = objProps;
        this._cache = objCache;
        this._locale = objLocale;
      };
      proto = ClassLoader.PropsBundleJob.prototype = new ClassLoader.XmlJob();

      proto.run = function() {
        var doc = this._cache.getDocument(this._id);

        if (doc) {
          this._props.addParent(jsx3.app.PropsBundle.getProps(this._src, this._locale, this._cache));
          return Job.DONE;
        } else {
          this._load();
          return Job.WAIT;
        }
      };

      proto._finish = function(objEvent) {
        this._cache.setDocument(this._id, objEvent.target);
        this._props.addParent(jsx3.app.PropsBundle.getProps(this._src, this._locale, this._cache));
        this.finish();
      };


      /* Class job */
      ClassLoader.ClassJob = function(strClass) {
        this._id = strClass;
      };
      proto = ClassLoader.ClassJob.prototype = new Job();

      proto.run = function() {
        if (jsx3.lang.Class && jsx3.lang.Class.forName(this._id))
          return Job.DONE;

        jsx3.CLASS_LOADER._subscribe("class", this, "_onClass");
        return Job.WAIT;
      };

      /** @private @jsxobf-clobber */
      proto._onClass = function(objEvent) {
        if (objEvent.name == this._id) {
          jsx3.CLASS_LOADER._unsubscribe("class", this);
          this.finish();
        }
      };


      /* Define all the system JavaScript resource files to load. This array will be modified by the file merger
             during the build process so we include some comments to help the file merger find it. */
      /** @package */
      ClassLoader.SYSTEM_SCRIPTS = [
          "jsx3/javascript.js",
          "jsx3/lang/pkg.js",
          "jsx3/lang/Object.js",
          "jsx3/lang/Method.js",
          "jsx3/lang/Class.js",
          "jsx3/lang/Exception.js",
          "jsx3/lang/NativeError.js",
          "jsx3/lang/Package.js",
          "jsx3/package.js",
          "jsx3/util/package.js",
          "jsx3/util/List.js",
          "jsx3/app/AddIn.js",
          "jsx3/util/EventDispatcher.js",
          "jsx3/net/URI.js",
          "jsx3/gui/Event.js",
          "jsx3/EVT.js",                // -> deprecated
          "jsx3/app/Browser.js",
          "jsx3/app/Settings.js",
          "jsx3/xml/Entity.js",
          "jsx3/xml/Document.js",
          "jsx3/xml/Template.js",
          "jsx3/net/Request.js",
          "jsx3/util/Logger.js",
          "jsx3/util/Locale.js",
          "jsx3/util/NumberFormat.js",
          "jsx3/util/DateFormat.js",
          "jsx3/util/MessageFormat.js",
          "jsx3/html/package.js",
          "jsx3/app/Cache.js",
          "jsx3/app/Properties.js",
          "jsx3/app/PropsBundle.js",
          "jsx3/lang/System.js",
          "jsx3/xml/CDF.js",             // -> could possibly be loaded as needed legacy
          "jsx3/app/DOM.js",
          "jsx3/app/Server.js",
          "jsx3/app/Model.js"
      ];

      /** @package */
      ClassLoader.INCLUDES = [
        {id: "jsx_css_ie", type:"css", browser:"IE_MQ", src:"css/ie/JSX.css"},
        {id: "jsx_css_ie_strict", type:"css", browser:"IE_MS", src:"css/ie/JSX.css"},
        {id: "jsx_css_mz", type:"css", browser:"MOZ,SAF", src:"css/@path@/JSX.css"},
        {id: "jsx_jss_css", type:"ljss", src:"jss/CSS.xml"},
        {id: "jsx_locale", type:"ljss", src:"locale/locale.xml"},
        {id: "jsx_messages", type:"ljss", src:"locale/messages.xml"}
      ];

      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.INTERNET_EXPLORER_6 = 11;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.INTERNET_EXPLORER_7 = 12;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.INTERNET_EXPLORER_8P = 13;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.OPERA_8_5 = 21;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.FIREFOX_1_5 = 31;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.FIREFOX_2 = 32;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.FIREFOX_3P = 33;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.MOZILLA_6 = 35;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.GECKO = 36;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.SAFARI_2 = 41;
      /** @private @jsxobf-clobber @jsxobf-final */
      ClassLoader.OTHER = 99;

      /** @private @jsxobf-clobber */
      ClassLoader.PATH_MAP  = {11:"ie6", 12:"ie7", 13:"ie7", 21:"fx", 31:"fx", 32:"fx", 33:"fx", 35:"fx", 36:"fx", 41:"saf"};
      /** @private @jsxobf-clobber */
      ClassLoader.DEF_MAP   = {11:["IE","IE6","VML"], 12:["IE","IE7","VML"], 21:["OPERA"],
          31:["FX","MOZ","SVG","GKO"], 41:["SAF","SVG","KON"]};

      ClassLoader.DEF_MAP[ClassLoader.FIREFOX_3P] = ClassLoader.DEF_MAP[ClassLoader.FIREFOX_2] =
          ClassLoader.DEF_MAP[ClassLoader.FIREFOX_1_5];
      ClassLoader.DEF_MAP[ClassLoader.MOZILLA_6] = ClassLoader.DEF_MAP[ClassLoader.GECKO] =
          ClassLoader.DEF_MAP[ClassLoader.FIREFOX_1_5];
      ClassLoader.DEF_MAP[ClassLoader.INTERNET_EXPLORER_8P] =
          ClassLoader.DEF_MAP[ClassLoader.INTERNET_EXPLORER_7];

      /** @private @jsxobf-clobber */
      ClassLoader.SUPPORTED = {11:true, 12:true, 31:true, 32:true};
      /** @private @jsxobf-clobber */
      ClassLoader.MODE_MAP = {0:"IE_MQ", 1: "FX_MQ", 2: "IE_MS", 3: "FX_MS"};

      /** {int}
        * @final @jsxobf-final */
      ClassLoader.LOAD_ALWAYS = 1;
      /** {int}
        * @final @jsxobf-final */
      ClassLoader.LOAD_AUTO = 0;

      var LOG = null;
      var Logger = null;

      /* @jsxobf-clobber */
      ClassLoader.BROWSER_MAP = [
          "ie8up", ClassLoader.INTERNET_EXPLORER_8P,
          "ie7up", ClassLoader.INTERNET_EXPLORER_7,
          "ie6up", ClassLoader.INTERNET_EXPLORER_6,
          "ffox3", ClassLoader.FIREFOX_3P,
          "ffox2", ClassLoader.FIREFOX_2,
          "ffox15", ClassLoader.FIREFOX_1_5,
          "safari2", ClassLoader.SAFARI_2,
          "opera85", ClassLoader.OPERA_8_5,
          "geckook", ClassLoader.GECKO,
          "nav6up", ClassLoader.MOZILLA_6
      ];

      /** @package */
      ClassLoader_prototype.init = function(objBrowser) {
        for (var i = 0; i < ClassLoader.BROWSER_MAP.length; i += 2) {
          if (objBrowser[ClassLoader.BROWSER_MAP[i]]) {
            this._type = ClassLoader.BROWSER_MAP[i+1];
            break;
          }
        }

        if (this._type == null) this._type = ClassLoader.OTHER;

        for (var i = 0; i < ClassLoader.DEF_MAP[this._type].length; i++)
          this[ClassLoader.DEF_MAP[this._type][i]] = true; // so that jsx3.CLASS_LOADER.IE, etc are defined for precompiler

        /* @jsxobf-clobber */
        this._apps = [];
        /* @jsxobf-clobber */
        this._addins = {};
      };

      /** @package */
      ClassLoader_prototype.destroy = function() {
        for (var i = 0; i < this._apps.length; i++) {
          var app = this._apps[i];
          for (var f in app) delete app[f];
        }
        delete this._apps;
        delete this._addins;
        delete this._jobManager;
      };

      ClassLoader_prototype.getTypes = function() {
        return ClassLoader.DEF_MAP[this._type];
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._start = function() {
        /* @jsxobf-clobber */
        this._jobManager = new jsx3.util.JobManager();

        var jobManager = this._jobManager;
        var includes = ClassLoader.INCLUDES;
        var me = this;

        // update progress bars
        var scripts = ClassLoader.SYSTEM_SCRIPTS;

        var progJob = new Job("jsx.prog1", function() {
          me._updateAllProgressTo(1, scripts.length);
        });
        jobManager.addJob(progJob);

        // 1. Required JavaScript
        var lastJobId = null;
        for (var i = 0; i < scripts.length; i++) {
          var src = ClassLoader._toAbsolute(jsx3.SYSTEM_SCRIPTS + "/" + this.resolvePath(scripts[i]));
          var job = new ClassLoader.JsJob("jsxjs" + i, src);
          job._subscribe("finish", this, "_onJsJobFinished");

          jobManager.addJob(job, lastJobId);
          lastJobId = job.getId();
        }
        jobManager.addJob(new Job("jsx.js"), lastJobId ? lastJobId : null);
        jobManager.addJob(new Job("jsx.gui.xsl"), "jsx.js");

        // 2. Classes
        var classes = ["jsx3.xml.Document", "jsx3.app.Settings", "jsx3.util.Logger.AlertHandler", "jsx3.util.Locale",
            "jsx3.html.Selection", "jsx3.util.EventDispatcher", "jsx3.app.Server", "jsx3.net.URI", "jsx3.lang.System"];
        for (var i = 0; i < classes.length; i++)
          jobManager.addJob(new ClassLoader.ClassJob(classes[i]));

        // 3A. load logger configuration
        var loggerConfigJob = new ClassLoader.XmlJob("logger.config",
            jsx3.getEnv("jsx_logger_config") || "jsx:/../logger.xml");
        jobManager.addJob(loggerConfigJob, "jsx3.xml.Document");

        // 3B. configure logger once configuration file is loaded
        var configLoggerJob = new Job("logger.init", function() {
          var doc = loggerConfigJob.getDocument();
          jsx3.util.Logger.Manager.getManager().initialize(doc);

          // Set these local variables for convenience
          Logger = jsx3.util.Logger;
          LOG = jsx3.util.Logger.getLogger("ClassLoader");
        });
        jobManager.addJob(configLoggerJob, loggerConfigJob.getId(), "jsx3.util.Logger.AlertHandler");

        // 4A. jsx3.util.EventDispatcher mixin
        var edMixinJob = new Job("jsx.edmix", function() {
          jsx3.util.EventDispatcher.jsxclass.mixin(me);
          jsx3.util.EventDispatcher.jsxclass.mixin(me._jobManager);
          me._jobManager.subscribe("*", me, function(objEvent) { this.publish(objEvent); });
        });
        jobManager.addJob(edMixinJob, "jsx3.util.EventDispatcher");

        // 4B. Determine HTML Mode
        var htmlModeJob = new Job("jsx.html.mode", function() {
          me[ClassLoader.MODE_MAP[jsx3.html.getMode()]] = true;
        });
        jobManager.addJob(htmlModeJob, "jsx3.html.Selection");

        // 5. Request JSX CSS
        var requestCssJob = new Job("jsx.css.request", function() {
          var allJsxCss = [];
          for (var i = 0; i < includes.length; i++) {
            var inc = includes[i];
            if (inc.type == "css" && me._passesBrowser(inc.browser)) {
              var src = ClassLoader._toAbsolute(jsx3.SYSTEM_ROOT + "/" + me.resolvePath(inc.src));
              var job = new ClassLoader.CssJob(inc.id, src);
              allJsxCss[allJsxCss.length] = job.getId();
              this.getManager().addJob(job);
            }
          }
          if (allJsxCss.length > 0) {
            jobManager.addJob(new Job("jsx.css"), allJsxCss);
            jobManager.addPrereq("jsx", "jsx.css");
          }
        });
        jobManager.addJob(requestCssJob, "jsx.html.mode");

        // 5A. Request system JSS Properties and localized PropBundles
        var requestJssJob = new Job("jsx.jss.request", function() {
          var allJsxJss = [];
          for (var i = 0; i < includes.length; i++) {
            var inc = includes[i];
/*            if (inc.type == "jss") {
              var src = ClassLoader._toAbsolute(jsx3.SYSTEM_ROOT + "/" + me.resolvePath(inc.src));
              var job = new ClassLoader.JssJob(inc.id, src, jsx3.System.JSS, jsx3.getSystemCache());
              allJsxJss[allJsxJss.length] = job.getId();
              this.getManager().addJob(job);
            } else */if (inc.type == "ljss" && jsx3.app.PropsBundle) {
              var src = ClassLoader._toAbsolute(jsx3.SYSTEM_ROOT + "/" + me.resolvePath(inc.src));
              var job = new ClassLoader.PropsBundleJob(src, jsx3.System.LJSS, jsx3.getSystemCache());
              allJsxJss[allJsxJss.length] = job.getId();
              jobManager.addJob(job);
            }
          }
          if (allJsxJss.length > 0) {
            jobManager.addJob(new Job("jsx.xml"), allJsxJss);
            jobManager.addPrereq("jsx", "jsx.xml");
          }
        });
        jobManager.addJob(requestJssJob, "jsx3.lang.System");

        // 5B. Request the XSL of any loaded Cacheable class, as it loads
        var checkCacheable = function(objEvent) {
          if (jsx3.xml && jsx3.xml.Cacheable) {
            var objClass = jsx3.Class.forName(objEvent.name);
            if (jsx3.xml.Cacheable.jsxclass.isAssignableFrom(objClass)) {
              var strURL = objClass.getConstructor().DEFAULTXSLURL;
              if (strURL) {
                var job = new ClassLoader.XmlJob(strURL, strURL, jsx3.getSharedCache(), jsx3.xml.XslDocument.jsxclass);
                jobManager.addJob(job);
                jobManager.addPrereq("jsx.gui.xsl", job.getId());
              }
            }
          }
        };
        this._subscribe("class", checkCacheable);
        jobManager.addJob(new Job("jsx.gui.xsldn", function() {
          me._unsubscribe("class", checkCacheable);
        }), "jsx.js");

        // 6. jsx job for the JSX runtime
        jobManager.addJob(new Job("jsx"), "jsx.js", "jsx.xsl", requestCssJob.getId(), requestJssJob.getId());
        jobManager.addJob(new Job("jsx.startup", function() { jsx3.startup(); }), "jsx");

        // 7. load each queued app
        for (var f in this._apps)
          this._loadApp(this._apps[f]);

        // 8. start the threaded queue, after a timeout
        window.setTimeout(function() {
          jobManager.start();
        }, 0);
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._cleanUpApp = function(objApp) {
        for (var i = this._apps.length - 1; i >= 0; i--) {
          if (this._apps[i] == objApp) {
            this._apps.splice(i, 1);
            break;
          }
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._updateAllProgressTo = function(intStage, intTotal) {
        for (var i = 0; i < this._apps.length; i++) {
          var prog = this._apps[i]._progress;
          prog.updateStage(intStage, intTotal);
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._onJsJobFinished = function(objEvent) {
        for (var i = 0; i < this._apps.length; i++)
          var prog = this._apps[i]._progress;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._isSupported = function() {
        return this._forcesupported || ClassLoader.SUPPORTED[this._type];
      };

      /** @package */
      ClassLoader_prototype.passesLoad = function(intLoad) {
        return intLoad === true ||
               intLoad == ClassLoader.LOAD_ALWAYS;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._passesBrowser = function(strBrowser) {
        if (strBrowser == null) return true;
        if (this[strBrowser]) return true;
        var def = ClassLoader.DEF_MAP[this._type].join("|");
        var regexp = new RegExp("\\b(" + def + ")\\b");
        return regexp.test(strBrowser);
      };

      /** @package */
      ClassLoader_prototype.isActive = function() {
        return this._jobManager.getWaitCt() > 0;
      };

      /** @package */
      ClassLoader_prototype.addJob = function(objJob, preReq) {
        return this._jobManager.addJob.apply(this._jobManager, arguments);
      };

      /** @package */
      ClassLoader_prototype.loadResource = function(strSrc, strId, strType, objJob) {
        var job = null;
        if (strType == "script") {
          job = new ClassLoader.JsJob(strId, strSrc);
        } else if (strType == "css") {
          job = new ClassLoader.CssJob(strId, strSrc);
        } else {
          throw new jsx3.IllegalArgumentException("strType", strType);
        }

        this._jobManager.addJob(job);
        if (objJob)
          this._jobManager.addJob(objJob, job.getId());
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._initClassPath = function() {
        if (this._cp == null)
          /* @jsxobf-clobber */
          this._cp = [[ClassLoader._toAbsolute(jsx3.SYSTEM_SCRIPTS + "/"), /^jsx3\.(gui|util|app|xml|net)\.[\w\.]+$/]];
        return this._cp;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._addClassPath = function(strPath, strRegex) {
        strRegex = strRegex.replace(/\./g, "\\.").replace(/\*\*/g, "[\\w\\.]*").replace(/\*/g, "\\w*");
        this._initClassPath().push([strPath, new RegExp("^" + strRegex + "$")]);
      };

      /** @package @jsxobf-clobber-shared */
      ClassLoader_prototype._addClassPathOf = function(obj) {
        var settings = obj.getSettings();
        var classPath = settings.get("classpath");
        if (classPath) {
          var paths = classPath.split(",");
          for (var i = 0; i < paths.length; i++) {
            var tokens = paths[i].split(":");
            this._addClassPath(obj.resolveURI(tokens[0]).toString(), tokens[1]);
          }
        }
      };

      /** @private @jsxobf-clobber-shared */
      ClassLoader_prototype._classDidLoad = function(objClass) {
        var strName = objClass.getName();

        this._publish({subject:"class", name:strName});
        if (this.publish)
          this.publish({subject:"class", name:strName});
      };

      /** @private @jsxobf-clobber-shared */
      ClassLoader_prototype._packageDidLoad = function(objPackage) {

      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._setStatus = function(strStatus, intExpire) {
        if (intExpire == null) intExpire = 1000;
        var status = "@gi.boot.status.pre@" + strStatus;
        window.status = status;

        // clear the previous timeout
        if (jsx3._jsxstatustimeout != null)
          window.clearTimeout(jsx3._jsxstatustimeout);

        /* @jsxobf-clobber */
        jsx3._jsxstatustimeout = window.setTimeout(function() {
          jsx3._jsxstatustimeout = null;
          if (window.status == status)
            window.status = "";
        }, intExpire);
      };

      /**
       * @param strClass {String} the fully-qualified name of the class to load.
       * @throws {jsx3.Exception} if no registered classpath matched the class name or if the loaded JS file did not
       *    define the class to load.
       */
      ClassLoader_prototype.loadClass = function(strClass) {
        /* not sure why this got fixed ...
        if (jsx3.getXmlVersion() < 4)
          throw new jsx3.Exception("Cannot call loadClass() with this version of the HTTP control. (" + strClass + ")");
        */

        this._setStatus("@gi.boot.status.load1@" + strClass + "@gi.boot.status.load2@");
        var path = strClass.replace(/\./g, "/") + ".js";

        var req = new jsx3.net.Request();

        this._initClassPath();
        for (var i = 0; i < this._cp.length; i++) {
          var regex = this._cp[i][1];

          if (regex.test(strClass)) {
            var filePath = this._cp[i][0] + path;
            var success = false;
            try {
              success = this.loadJSFileSync(filePath);
            } catch (e) {
              var ex = jsx3.NativeError.wrap(e);
              throw new jsx3.Exception(jsx3._msg("boot.class_ex", strClass, ex), ex);
            }

            if (success) {
              var objClass = jsx3.Class.forName(strClass);
              if (objClass == null)
                throw new jsx3.Exception(jsx3._msg("boot.class_undef", filePath, strClass));

              return objClass;
            }
          }
        }

        throw new jsx3.Exception(jsx3._msg("boot.class_err", strClass));
      };

      /**
       * @param strURI {String}
       * @return {boolean}
       */
      ClassLoader_prototype.loadJSFileSync = function(strURI) {
        var req = new jsx3.net.Request();
        req.open("GET", strURI, false);
        req.send();

        if (req.getStatus() == jsx3.net.Request.STATUS_OK) {
          var script = req.getResponseText();
          jsx3.eval(script);
          return true;
        }

        return false;
      };

      /**
       * @package
       */
      ClassLoader_prototype.resolvePath = function(strPath) {
        return strPath.replace(/@path@/g, ClassLoader.PATH_MAP[this._type]);
      };

      /**
       * takes any string (assumed to be a valid URL) and prepends that string with the appropriate path information. This function
       *          is used by the JSX framework to resolve file locations at runtime, and is always used by system methods that need to resolve
       *          the location of a resource.  For example, if the application is located at "/system/JSXAPPS/app1/" and a resource is requested
       *          at "JSXAPPS/app1/components/appCanval.xml", this method would return "/system/JSXAPPS/app1/components/appCanval.xml"
       * @param strURL {String} URL (any relative URL, http, or https);
       * @return {String} will return the URL, formatted with any necessary path information prepended to locate the resource at runtime
       * @private
       * @jsxobf-clobber
       */
      ClassLoader._toAbsolute = function(strURL) {
        var s = null;
        //given portal implementations, any string instance that represents a URI can call this method to add a prepend of the absolute path
        if (strURL.charAt(0) == "/" || strURL.match(/^\w+:\/\//)) {
          s = strURL.toString();
        } else if (strURL.substring(0, 4) == "JSX/") {
          s = jsx3.getEnv("jsxabspath") + strURL;
        } else {
          s = jsx3.getEnv("jsxhomepath") + strURL;
        }

        return s;
      };

      // @jsxobf-clobber  _settings _path _gui _loaded _ns _progress _queue _type _done _running _tick _ticktime
      // @jsxobf-clobber  _src _id _pre _status _type _painted _env _classloader _stage _total

      /**
       * @param strAppPath {String}
       * @param objGUI {HTMLElement}
       * @param objEnv {Object<String,String>}
       * @package
       */
      ClassLoader_prototype.loadApp = function(strAppPath, objGUI, objEnv) {
        // Decode URI encoding of app path
        strAppPath = strAppPath.replace(/%([0-9a-fA-F]{2})/g,
            function(m, g1) { return String.fromCharCode(parseInt(g1, 16)); });

        // Remove trailing / from app path
        if (strAppPath.charAt(strAppPath.length - 1) == "/")
          strAppPath = strAppPath.substring(0, strAppPath.length - 1);

        // Set env variables for the home path, etc.
        var appDirIndex = strAppPath.indexOf(jsx3.APP_DIR_NAME + "/");
        var appPrefix = appDirIndex >= 0 ? strAppPath.substring(0, appDirIndex) : "";

        if (! jsx3.getEnv("jsxmanualhome"))
          jsx3.setEnv("jsxhomepath", appPrefix);    // when Builder is running, we wait to set this to the user home dir
        jsx3.setEnv("jsxscriptapppath", appPrefix); // this is always the path to the main project, including Builder

        var app = {_path:strAppPath, _gui:objGUI, _queued:false, _loaded:false, _env: objEnv};

        var intType = objEnv["jsxapploader"] != null ? objEnv["jsxapploader"] : this._apps.length > 0 ? 1 : 0;
        var progress = app._progress = new ClassLoader.Progress(this, intType, objGUI);

        if (this._isSupported()) {
          window.setTimeout(function(){ progress.paintProgress();}, 0);
        } else {
          window.setTimeout(function(){ progress.paintNotSupported();}, 0);
        }

        this._apps.push(app);

        if (this._jobManager)
          this._loadApp(app);
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._loadApp = function(objApp) {
        var strAppPath = objApp._path;
        var jobPrefix = "app." + strAppPath;
        var jobManager = this._jobManager;

        var configJob = new ClassLoader.XmlJob(jobPrefix + ".config", strAppPath + "/config.xml");

        var me = this;
        var loadJob = new Job(jobPrefix + ".queue", function() {
          me._onAppConfigLoaded(configJob.getDocument(), objApp);
        });

        jobManager.addJob(configJob, "jsx3.xml.Document");
        jobManager.addJob(loadJob, "jsx3.app.Server", configJob.getId());
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._onAppConfigLoaded = function(objXML, objApp) {
        var jobMgr = this._jobManager;
        var server = null;
        jobMgr.pause();

        if (objXML.hasError()) {
          LOG.fatal(jsx3._msg("boot.app_cfgerr", objXML.getSourceURL(), objXML.getError()));
        }

        var settings = objApp._settings = new jsx3.app.Settings(objXML);
        objApp._env.jsxsettings = settings;

        try {
          server = objApp._server = new jsx3.app.Server(objApp._path, objApp._gui, false, objApp._env);
          delete objApp._gui;
        } catch (e) {
          var ex = jsx3.NativeError.wrap(e);
          LOG.fatal(jsx3._msg("boot.app_insterr", objApp._path, ex), ex);
          return;
        }

        var prog = objApp._progress;
        var jobPrefix = "app." + objApp._path;

        // 0.
        this._addClassPathOf(server);

        // 1. Queue all required addins
        var jsPrereqs = ["jsx.js", "logger.init"];
        var arrAddins = settings.get("addins");
        if (arrAddins) {
          for (var j = 0; j < arrAddins.length; j++) {
            var addinKey = arrAddins[j];
            this._loadAddin(addinKey);

            jsPrereqs.push("addin." + addinKey + ".js", "addin." + addinKey + ".jss");
          }
        }

        var progJob = new Job(jobPrefix + ".prog");
        jobMgr.addJob(progJob, jsPrereqs);

        var includes = settings.get("includes");

        if (includes) {
          var jsCount = 0;
          var cssIds = [], xmlIds = [], lastJsId = progJob.getId();

          for (var i = 0; i < includes.length; i++) {
            var inc = includes[i];

            if (this.passesLoad(inc.onLoad || inc.load) &&
                this._passesBrowser(inc.browser)) {

              var src = server.resolveURI(inc.src);

              if (inc.type == "css") {
                // 2. Load App CSS
                var job = new ClassLoader.CssJob(inc.id, src);
                jobMgr.addJob(job);
                cssIds[cssIds.length] = job.getId();
              } else if (inc.type == "script") {
                // 3. Load App JS
                var job = new ClassLoader.JsJob(inc.id, src);
                job._subscribe("finish", prog, "_incrementDone");

                jobMgr.addJob(job, lastJsId);
                lastJsId = job.getId();
                jsCount++;
              } else if (inc.type == "xml" || inc.type == "xsl") {
                var job = new ClassLoader.XmlJob(inc.id, src, server.getCache());
                jobMgr.addJob(job);
                xmlIds[xmlIds.length] = job.getId();
              } else if (inc.type == "jss") {
                var job = new ClassLoader.JssJob(inc.id, src, server.getProperties(), server.getCache());
                jobMgr.addJob(job);
                xmlIds[xmlIds.length] = job.getId();
              } else if (inc.type == "ljss") {
                var job = new ClassLoader.PropsBundleJob(src, server.LJSS, server.getCache(), server.getLocale());
                jobMgr.addJob(job);
                xmlIds[xmlIds.length] = job.getId();
              }
            }
          }

          progJob.run = function() {
            prog.updateStage(3, jsCount);
          };

          if (cssIds.length > 0)
            jobMgr.addJob(new Job(jobPrefix + ".css"), cssIds);

          if (xmlIds.length > 0)
            jobMgr.addJob(new Job(jobPrefix + ".xml"), xmlIds);

          if (lastJsId)
            jobMgr.addJob(new Job(jobPrefix + ".js"), lastJsId);
        }

        // 4. Load App Component
        var compURL = settings.get("objectseturl");
        var componentJob = null;
        if (compURL) {
          componentJob = new ClassLoader.XmlJob(jobPrefix + ".comp", objApp._server.resolveURI(compURL));
          jobMgr.addJob(componentJob);
        }

        var progJob2 = new Job(jobPrefix + ".prog1", function() {
          prog.updateStage(4, 1);
          return Job.SLEEP;
        });
        jobMgr.addJob(progJob2, "jsx", jobPrefix + ".css", jobPrefix + ".xml", jobPrefix + ".js");

        var me = this;
        jobMgr.addJob(new Job(jobPrefix + ".progx", function() {
          prog._destroy();
          me._cleanUpApp(objApp);
        }), progJob2.getId());

        // 5. Paint
        var paintJob = new Job(jobPrefix + ".paint");
        if (componentJob != null) {
          paintJob.run = function() {
            objApp._server.paint(componentJob.getDocument());
          };
          jobMgr.addJob(paintJob, componentJob.getId(), progJob2.getId());
        } else {
          paintJob.run = function() {
            objApp._server.paint();
          };
          jobMgr.addJob(paintJob, progJob2.getId());
        }

        jobMgr.start();
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._forceStartQueue = function() {
        if (! this._forcesupported) {
          /* @jsxobf-clobber */
          this._forcesupported = true;

          for (var i = 0; i < this._apps.length; i++)
            this._apps[i]._progress.paintProgress();

          this._start();
        }
      };

      /** @package */
      ClassLoader_prototype.loadAddin = function(objAddin) {
        var strKey = objAddin.getKey();
        if (! this._addins[strKey]) {
          this._addins[strKey] = {};

          this._jobManager.pause();
          this._jobManager.addJob(new Job("addin." + strKey + ".x"));
          this._createAddinJobs(strKey, "addin." + strKey + ".x");

          this._onAddinConfigLoaded(objAddin, null);
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._loadAddin = function(strKey) {
        var jobPrefix = "addin." + strKey;

        if (this._addins[strKey]) {
          ;
        } else {
          this._addins[strKey] = {};

          var configJob = new ClassLoader.XmlJob(jobPrefix + ".config",
              jsx3.System.addinKeyToPath(strKey) + "/config.xml");

          var me = this;
          var configLoadJob = new Job(jobPrefix + ".load", function() {
            me._onAddinConfigLoaded(configJob.getDocument(), strKey);
          });

          this._jobManager.addJob(configJob, "jsx3.xml.Document");
          this._jobManager.addJob(configLoadJob, configJob.getId(), "jsx3.lang.System");

          this._createAddinJobs(strKey, configLoadJob.getId());
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._createAddinJobs = function(strKey, strJobId) {
        var jobPrefix = "addin." + strKey;

        var jsJob = this._jobManager.addJob(new Job(jobPrefix + ".js"), strJobId);
        var cssJob = this._jobManager.addJob(new Job(jobPrefix + ".css"), strJobId);
        var jssJob = this._jobManager.addJob(new Job(jobPrefix + ".jss"), strJobId);
        var addinJob = this._jobManager.addJob(new Job(jobPrefix),
            jsJob.getId(), cssJob.getId(), jssJob.getId());
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._onAddinConfigLoaded = function(objXML, strKey) {
        var addin = null, settings = null;
        if (objXML instanceof jsx3.app.AddIn) {
          addin = objXML;
          settings = addin.getSettings();
          strKey = addin.getKey();
        } else {
          if (objXML.hasError()) {
            LOG.fatal(jsx3._msg("boot.add_cfgerr", objXML.getSourceURL(), objXML.getError()));
            return;
          }

          settings = new jsx3.app.Settings(objXML);
          addin = this._addins[strKey]._addin = new jsx3.app.AddIn(strKey, settings);
        }

        var jobPrefix = "addin." + strKey;
        var jobManager = this._jobManager;

        var addinVarPath = settings.get("addin");
        if (addinVarPath)
          jsx3.System.registerAddin(addinVarPath, addin);
        this._addClassPathOf(addin);

        jobManager.pause();

        var addinIncludes = settings.get('includes');
        if (addinIncludes != null) {
          var lastJsJobId = ["jsx.js", "logger.init"];

          for (var i = 0; i < addinIncludes.length; i++) {
            var include = addinIncludes[i];

            if (this.passesLoad(include.onLoad || include.load) && this._passesBrowser(include.browser)) {
              var src = addin.resolveURI(include.src).toString();

              if (include.type == 'script') {
                var job = jobManager.addJob(new ClassLoader.JsJob(include.id,  src), lastJsJobId);
                job._subscribe("finish", this, "_onJsJobFinished");
                lastJsJobId = job.getId();
              } else if (include.type == 'css') {
                var job = jobManager.addJob(new ClassLoader.CssJob(include.id,  src));
                jobManager.addPrereq(jobPrefix + ".css", job.getId());
              } else if (include.type == 'jss') {
                var job = jobManager.addJob(new ClassLoader.JssJob(include.id,  src, jsx3.System.JSS, jsx3.getSystemCache()));
                jobManager.addPrereq(jobPrefix + ".jss", job.getId());
              }
            }
          }

          if (lastJsJobId)
            jobManager.addPrereq(jobPrefix + ".js", lastJsJobId);
        }

        jobManager.start();
      };

    };

    defineClassLoader(jsx3.lang.ClassLoader, jsx3.lang.ClassLoader.prototype);

    /* @jsxobf-clobber */
    jsx3.lang.ClassLoader.Progress = function(objClassLoader, intType, objGUI) {
      this._classloader = objClassLoader;

      this._type = intType;
      this._gui = objGUI;
      this._stage = 0;
      this._done = 0;
      this._total = 1;
    };

    var defineClassLoaderProgress = function(Progress, Progress_prototype) {

      /** @private @jsxobf-clobber */
      Progress.STAGE_NAMES = ["@gi.boot.stage.init@", "@gi.boot.stage.system@", "@gi.boot.stage.addins@",
          "@gi.boot.stage.app@", "@gi.boot.stage.paint@"];
      /** @private @jsxobf-clobber */
      Progress.STAGE_WEIGHTS = [[0.0,0.10,0.60,0.80,0.97,1.00,1.00], [0,0,0,0,0.95,1.00]];

      /** @private @jsxobf-clobber */
      Progress.WAITING = "@gi.boot.stage.wait@";
      /** @private @jsxobf-clobber */
      Progress.WAITING_SUFFIX = ["&#160;.","&#160;&#160;.","&#160;&#160;&#160;."];

      /** @private @jsxobf-clobber @jsxobf-final */
      Progress.TYPE_NORMAL = 0;
      /** @private @jsxobf-clobber @jsxobf-final */
      Progress.TYPE_PORTAL = 1;

      /** @private @jsxobf-clobber */
      Progress.isStrict = function(objProgress) {
        if (Progress.STRICT == null) {
          /* @jsxobf-clobber */
          Progress.STRICT = objProgress._classloader.MOZ || objProgress._classloader.KON;
          if (! Progress.STRICT) {
            try {
              var test = '<input type="text" id="_jsx3_progress_test" style="position:absolute;top:0px;left:-120px;width:100px;height:30px;padding:8px;margin:0px;"/>';
              objProgress._gui.insertAdjacentHTML("beforeEnd", test);
              var input = objProgress._gui.ownerDocument.getElementById("_jsx3_progress_test");
              Progress.STRICT = input.offsetHeight != 30;
              input.parentNode.removeChild(input);
            } catch (e) {
              window.alert(e.description);
            }
          }
        }
        return Progress.STRICT;
      };

      /** @private @jsxobf-clobber */
      Progress_prototype.paintProgress = function() {
        var w = this._gui.offsetWidth;
        var h = this._gui.offsetHeight;
        var strict = Progress.isStrict(this);

        this._painted = true;

        if (this._type == Progress.TYPE_NORMAL) {
          var width = 222 - (strict ? 4 : 0);
          var height = 62 - (strict ? 4 : 0);
          var barHeight = 17 - (strict ? 2 : 0);
          var insideBarHeight = barHeight - (strict ? 0 : 1);
          var top = Math.max(0, Math.round((h - height)/3));
          var left = Math.max(0, Math.round((w - width)/2));

          var html = '<div style="position:absolute;top:'+top+'px;left:'+left+'px;font-family:Arial,sans-serif;width:'+width+'px;'+
                  'border:1px solid #666677;padding:2px;background-color:#BBBBCC;">'+
              '<div style="height:'+height+'px;border:1px solid #8899AA;padding:0px;background-color:#EEEEEE;">'+
                '<div style="padding: 4px;">'+
                  '<div style="font-size:10px;">@gi.boot.powered@</div>'+
                  '<div style="font-size:16px;">TIBCO&#160;<span style="font-weight:bold;">General&#160;Interface&#8482;</span></div>'+
                '</div>'+
                '<div style="position:absolute;top:'+(height-barHeight+(strict?2:1))+'px;height:'+barHeight+'px;width:'+(width-(strict?2:8))+'px;background-color:#DDE0EE;border-top:1px solid #8899AA;">'+
                  '<div style="height:'+insideBarHeight+'px;position:absolute;background-color:#BBCCEE;width:0px;overflow:hidden;">&#160;</div>'+
                  '<div style="height:'+insideBarHeight+'px;font-family:Verdana,sans-serif;position:absolute;font-size:10px;color:#000033;padding:1px 4px 2px 4px;">'+Progress.STAGE_NAMES[0]+'</div>'+
                '</div>'+
              '</div>'+
            '</div>';

          this._gui.innerHTML = html;
          this._gui.style.backgroundColor = "#9898a5";
        } else {
          var width = 165 - (strict ? 4 : 0);
          var height = 52 - (strict ? 4 : 0);
          var barHeight = 16 - (strict ? 2 : 0);
          var insideBarHeight = barHeight - (strict ? 0 : 2);
          var top = Math.max(0, Math.round((h - height)/3));
          var left = Math.max(0, Math.round((w - width)/2));

          var html = '<div><div style="position:absolute;top:'+top+'px;left:'+left+'px;font-family:Arial,sans-serif;width:'+width+'px;height:'+height+'px;padding:0px;">'+
              '<div style="padding: 6px;">'+
                '<div style="font-size:9px;">@gi.boot.powered@</div>'+
                '<div style="font-size:12px;">TIBCO&#160;<span style="font-weight:bold;">General&#160;Interface&#8482;</span></div>'+
              '</div>'+
              '<div style="position:absolute;top:'+(height-barHeight+(strict?2:1))+'px;height:'+barHeight+'px;width:'+(width-(strict?2:0))+'px;background-color:#EEF5FF;border:1px solid #88AACC;">'+
                '<div style="height:'+insideBarHeight+'px;position:absolute;background-color:#BBDDFF;width:0px;overflow:hidden;">&#160;</div>'+
                '<div style="height:'+insideBarHeight+'px;text-align:center;font-family:Verdana,sans-serif;z-index:1;position:absolute;font-size:9px;color:#556677;padding:1px 4px 2px 4px;">&#160;</div>'+
              '</div>'+
            '</div></div>';

          this._gui.innerHTML = html;
          this._gui.style.backgroundColor = "#FFFFFF";
        }
      };

      /** @private @jsxobf-clobber */
      Progress_prototype.paintNotSupported = function() {
        var w = this._gui.offsetWidth;
        var h = this._gui.offsetHeight;
        var strict = Progress.isStrict(this);

        this._painted = true;

        var width = 222 - (strict ? 4 : 0);
        var height = 136 - (strict ? 4 : 0);
        var barHeight = 17 - (strict ? 2 : 0);
        var insideBarHeight = barHeight - (strict ? 0 : 1);
        var top = Math.max(0, Math.round((h - height)/3));
        var left = Math.max(0, Math.round((w - width)/2));

        var _forceStartQueue = "_forceStartQueue";
        var html =
          '<div style="position:absolute;top:'+top+'px;left:'+left+'px;font-family:Arial,sans-serif;width:'+width+'px;'+
              'border:1px solid #666677;padding:2px;background-color:#BBBBCC;">'+
            '<div style="height:'+height+'px;border:1px solid #8899AA;padding:0px;background-color:#EEEEEE;">'+
              '<div style="padding: 4px;">'+
                '<div style="font-size:10px;">@gi.boot.powered@</div>'+
                '<div style="font-size:16px;">TIBCO&#160;<span style="font-weight:bold;">General&#160;Interface&#8482;</span></div>'+
                '<div style="padding:6px 0px 0px 0px;font-size:10px;font-family:Verdana,sans-serif;">@gi.runtime.notsupported@' +
                   '<div style="color:#000033;padding:8px 0px 0px 0px;margin:0px 0px 0px -2px;">'+
                     '<span style="font-size:8px;">&gt; </span><a style="color:#000033;" href="http://power.tibco.com/gi/builderlink/sysreqs34/" target="_blank">@gi.boot.seefullreqs@</a>'+
                     '<div style="padding:2px 0px 0px 0px;"><span style="font-size:8px;">&gt; </span><span id="jsxforcestart_span" tabindex="1" style="cursor:pointer;text-decoration:underline;" ' +
                       'onclick="jsx3.CLASS_LOADER.'+_forceStartQueue+'();" onkeydown="if (event.keyCode == 13) this.onclick();">@gi.runtime.notsupported.cont@</span></div>'+
                   '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>';

        this._gui.innerHTML = html;
        this._gui.style.backgroundColor = "#9898a5";

        window.setTimeout(function() { document.getElementById("jsxforcestart_span").focus(); }, 0);
      };

      Progress_prototype.updateStage = function(intStage, intTotal) {
//        this._classloader._jobManager.log("updateStage stage:" + intStage + " total:" + intTotal);

        this._stage = intStage;
        this._total = intTotal;
        this._done = 0;
        this.updateProgress(true);
      };

      /** @private @jsxobf-clobber */
      Progress_prototype._incrementDone = function() {
        this._done++;
        this.updateProgress(false);

        if (this._classloader.IE && ((this._done % 15) == 0 || this._total < 5)) {
          var jobManager = this._classloader._jobManager;

          if (jobManager._running) {
//            jobManager.log("Pausing class loader");
            jobManager.pause();
            window.setTimeout(function() { jobManager.start(); }, 0);
          }
        }
      };

      /** @private @jsxobf-clobber */
      Progress_prototype.updateProgress = function(bLabel) {
        if (! this._painted) return;

        var weights = Progress.STAGE_WEIGHTS[this._type];

        var ratio = this._total == 0 ? 1 : Math.max(0, Math.min(1, (this._done/this._total)));
        var percent = weights[this._stage] + (weights[this._stage+1] - weights[this._stage]) * ratio;
        percent = Math.min(percent, 1);

//        this._classloader._jobManager.log("total:" + this._total + ", done:" + this._done + " ratio:" + ratio + " percent:" + percent);

        try {
          if (bLabel && this._type == Progress.TYPE_NORMAL)
            this._setMessage(Progress.STAGE_NAMES[this._stage]);

          var bar = this._gui.childNodes[0].childNodes[0].childNodes[1].childNodes[0];
          var pixels = Math.round(bar.parentNode.offsetWidth*percent);

          if (this._type == Progress.TYPE_PORTAL) {
            if (pixels > 0) {
              this._setMessage(Progress.STAGE_NAMES[4]);
            } else {
              if (this._tick == null) {
                this._tick = 0;
                this._setMessage(Progress.WAITING + Progress.WAITING_SUFFIX[0]);
                this._ticktime = (new Date()).getTime();
              } else {
                var now = (new Date()).getTime();
                if (now - this._ticktime > 500) {
                  this._tick++;
                  this._setMessage(Progress.WAITING + Progress.WAITING_SUFFIX[this._tick % Progress.WAITING_SUFFIX.length]);
                  this._ticktime = now;
                }
              }
            }
          }

          bar.style.width = pixels + "px";
        } catch (e) { /*this._classloader._jobManager.log(e)*/; }
      };

      /** @private @jsxobf-clobber */
      Progress_prototype._setMessage = function(strMessage) {
        try {
          this._gui.childNodes[0].childNodes[0].childNodes[1].childNodes[1].innerHTML = strMessage;
        } catch (e) {;}
      };

      /** @private @jsxobf-clobber */
      Progress_prototype._destroy = function(objEvent) {
        delete this._gui;
      };
    };

    defineClassLoaderProgress(jsx3.lang.ClassLoader.Progress, jsx3.lang.ClassLoader.Progress.prototype);

    /** @jsxdoc-category  jsx3 */

    /**
     * {jsx3.lang.ClassLoader} the system class loader.
     */
    jsx3.CLASS_LOADER = new jsx3.lang.ClassLoader(new BrowserDetect());
  }

  var getUrlParameters = function(strURL) {
    var p = {};
    var queryIndex = strURL.indexOf("?");
    if (queryIndex >= 0) {
      strURL = strURL.substring(queryIndex + 1);
      var tokens = strURL.split("&");
      for (var i = 0; i < tokens.length; i++) {
        var equalsIndex = tokens[i].indexOf("=");
        if (equalsIndex >= 0) {
          p[tokens[i].substring(0, equalsIndex)] = tokens[i].substring(equalsIndex + 1);
        } else {
          p[tokens[i]] = true;
        }
      }
    }
    return p;
  };

  /* The attributes of the <script> tag that HTML reserves. */
  var scriptAttributes = {id:true, space:true, type:true, charset:true, defer:true, src:true, language:true};

  var loadScript = function(objScript) {
    var params = getUrlParameters(objScript.src);
    var attrs = objScript.attributes;
    for (var i = 0; i < attrs.length; i++) {
      if (!scriptAttributes[attrs[i].nodeName]) {
        params[attrs[i].nodeName] = attrs[i].nodeValue;
      }
    }

    for (var f in params) {
      if (f.indexOf("jsx") == 0 && f.indexOf("jsxapp") != 0) {
        jsx3.setEnv(f, params[f]);
        delete params[f];
      }
    }

    var src = objScript.getAttribute("src");
    var abspath = src.substring(0, src.indexOf(jsx3.MAIN_SCRIPT));
    abspath = abspath.replace(/\/\.\//g, "/").replace(/^\.\//, "");
    jsx3.setEnv("jsxabspath", abspath);

    if (!params["jsxappempty"]) {
      var strAppPath = params["jsxapppath"];
      if (strAppPath) {
        jsx3.CLASS_LOADER.loadApp(strAppPath, objScript.parentNode, params);
        return true;
      } else {
        window.alert("@gi.boot.jsxapppath@");
      }
    }

    return false;
  };

  var loadAllScripts = function() {
    var allScripts = document.getElementsByTagName("script");
    var numScripts = allScripts.length;
    var bStart = false;

    // iterate through all scripts to find this script
    for (var i = 0; i < numScripts; i++) {
      var oneScript = allScripts.item(i);
      var src = oneScript.getAttribute("src");
      if (!oneScript.getAttribute("jsxloaded") && src && src.indexOf(jsx3.MAIN_SCRIPT) >= 0) {
        bStart = bStart || loadScript(oneScript);
      }
    }

    if (bStart && jsx3.CLASS_LOADER._isSupported())
      jsx3.CLASS_LOADER._start();
  };

  loadAllScripts();
};

window.jsx_main();
