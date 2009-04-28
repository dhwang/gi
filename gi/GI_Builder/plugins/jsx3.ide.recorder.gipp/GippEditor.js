
jsx3.Class.defineClass("jsx3.ide.gipp.Editor", jsx3.ide.Editor, null, function(Editor, Editor_prototype) {

  var gui = jsx3.gui;
  var Interactive = gui.Interactive;

  Editor.START = "/* BEGIN GIPP RECORDER */";
  Editor.END = "/* END GIPP RECORDER */";

  Editor_prototype.render = function(objContainer) {
    var xml = this.getPlugIn().getResource("editor").getData();
    return objContainer.loadXML(xml, false, this.getPlugIn());
  };

  Editor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();
    this._error = false;

    if (objFile && objFile.isFile()) {
      var text = objFile.read();
      var i1 = text.indexOf(Editor.START);
      var i2 = text.indexOf(Editor.END);

      if (i1 >= 0 && i2 >= 0 && i2 > i1) {
        var data = text.substring(i1 + Editor.START.length, i2);
        this._loadJSON(data);

        this._prefix = text.substring(0, i1);
        this._suffix = text.substring(i2 + Editor.END.length);
      } else {
        this.getPlugIn().getServer().alert(null, "The file could not be parsed.");
        this._error = true;
      }
    } else {
      this._prefix = "// Do NOT edit the text in this file from the BEGIN to the END comments.\n" +
          "// Doing so will prevent the file from being read by General Interface Builder.\n" + 
          "\n";
      this._suffix = "\n\n" +
          "// Insert manual tests here.\n\n" +
          "gi.test.gipp.recorder.playbackTests(recorderTests);";
    }
  };

  Editor_prototype.save = function() {
    if (this._error) {
      return false;
    } else {
      var data = this._prefix + Editor.START + "\n\n" + this._toJSON() + "\n\n" + Editor.END + this._suffix;

      if (jsx3.ide.writeUserFile(this.getOpenFile(), data)) {
        this.setDirty(false);
        this.publish({subject:"saved"});
        return true;
      } else {
        return false;
      }
    }
  };

  Editor_prototype._toJSON = function() {
    var s = "var recorderTests = [\n  ";

    for (var i = this._getGrid().getXML().getChildIterator(); i.hasNext(); ) {
      var n = i.next();

      var label = jsx3.$O.json(n.getAttribute("label"));
      var target = jsx3.$O.json(n.getAttribute("target"));
      var action = jsx3.$O.json(n.getAttribute("action"));
      var args = jsx3.$O.json(n.getAttribute("args"));
      var wait = jsx3.$O.json(n.getAttribute("wait"));

      s += "{label:" + label + ", target:" + target + ", action:" + action + ", args:" + args + ", wait:" + wait + "}";

      if (i.hasNext())
        s += ",\n  ";
    }

    s += "\n];";
    return s;
  };

  Editor_prototype._loadJSON = function(json) {
    try {
      var recorderTests = jsx3.eval(json + "; recorderTests;");

      var g = this._getGrid();
      var x = jsx3.xml.CDF.Document.newDocument();

      for (var i = 0; i < recorderTests.length; i++) {
        var rec = recorderTests[i];
        rec.jsxid = jsx3.xml.CDF.getKey();
        x.insertRecord(rec);
      }

      g.setSourceXML(x);
      g.repaint();
    } catch (e) {
      var ex = jsx3.NativeError.wrap(e);
      jsx3.ide.LOG.error("Error loading file: " + ex, ex);
    }
  };

  Editor_prototype.getPlugIn = function() {
    return jsx3.IDE.GippEditorPlugin;
  };

  Editor_prototype.onToggleLaunch = function() {
    if (this._running) {
      if (this._recorder) {
        this._recorder.close();
        this._recorder = null;
        this._running = false;
      }      
    } else {
      var w = window.open(this.getPlugIn().resolveURI("recorder.html").toString(), "gipprecorder");
      if (w) {
        w["gippeditor"] = this;
        this._recorder = w;
      } else {
        this.getPlugIn().getServer().alert(null, "A pop-up blocker prevented the recorder from opening.");
      }
    }
  };

  Editor_prototype.onRecorderLaunched = function() {
    this._running = true;
    this.getContent().getLaunchBtn().setText("Stop Recorder", true);
  };

  Editor_prototype.onRecorderStopped = function() {
    this._running = false;
    this._recorder = null;
    this.getContent().getLaunchBtn().setText("Launch Recorder", true);
  };

  Editor_prototype.onInsertRecord = function(rec) {
    var g = this._getGrid();
    var sel = g.getValue();

    if (!rec)
      rec = {jsxid:jsx3.xml.CDF.getKey(), label:"", target:"", action:"", wait:""};
    else if (!rec.jsxid)
      rec.jsxid = jsx3.xml.CDF.getKey();

    if (sel) {
      var before = g.getRecordNode(sel).getNextSibling();
      if (before)
        g.insertRecordBefore(rec, before.getAttribute("jsxid"));
      else
        g.insertRecord(rec);
    } else {
      var f = g.getXML().getChildIterator().next();
      if (f)
        g.insertRecordBefore(rec, f.getAttribute("jsxid"));
      else
        g.insertRecord(rec);
    }

    g.setValue(rec.jsxid);

    this.setDirty(true);
  };

  Editor_prototype.onEditRecord = function(recordId) {
    this.setDirty(true);
  };

  Editor_prototype.onDeleteRecord = function(recordId) {    
    this._getGrid().deleteRecord(recordId);
    this.setDirty(true);
  };

  Editor_prototype.onReorder = function() {
    this.setDirty(true);
    return true;
  };

  Editor_prototype.onLaunchGIPP = function(bConfirmed) {
    var objFile = this.getOpenFile();
    if (objFile && objFile.isFile()) {
      if (!bConfirmed && this.isDirty()) {
        jsx3.IDE.confirm("Save Before Launching?",
            "Save file before launching it in GIPP?",
            jsx3.$F(function (d) {
              d.doClose();
              this.save();
              this.onLaunchGIPP(true);
            }).bind(this), jsx3.$F(function() {
              d.doClose();
              this.onLaunchGIPP(true);
            }).bind(this), "Save", "Continue", 2);
      } else {
        var gippPlugIn = this.getPlugIn().getEngine().getPlugIn("jsx3.ide.gipp");

        if (gippPlugIn && gippPlugIn.isConfigured()) {
          gippPlugIn.launch(jsx3.ide.PROJECT.getDirectory().relativePathTo(objFile), 50);
        } else {
          this.getPlugIn().getServer().alert(null, "You must configure the GIPP plug-in in the IDE Settings dialog before launching this file in GIPP.");
        }
      }
    } else {
      this.getPlugIn().getServer().alert(null, "You must save this file before launching it in GIPP.");
    }
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getGrid = function() {
    return this.getContent().getGrid();
  };

  Editor_prototype.getJsxSrc = function() {
    return this.getPlugIn().resolveURI("recorder.html").relativize(jsx3.resolveURI(jsx3.MAIN_SCRIPT));
  };

  Editor_prototype.getJsxAppPath = function() {
    return this.getPlugIn().resolveURI("recorder.html").relativize(
        jsx3.resolveURI("jsxuser:///" + jsx3.ide.PROJECT.getPathFromHome()));
  };

  Editor_prototype.onModelEvent = function(objJSX, strType, objContext, hasListener) {
//    jsx3.log("onModelEvent " + [strType, objJSX]);
    // Some events only matter if they are listened to. But some events matter because they change the state of
    // controls that may be used for further tests.
    if (hasListener || this._shouldRecord(objJSX, strType)) {
      this.onInsertRecord({label:"", target:this._getTargetString(objJSX), wait:hasListener ? "DONE" : "",
          action:this._getActionString(strType, objContext), args:this._getActionArgsString(strType, objContext)});
      this.setDirty(true);
    }
  };

  Editor_prototype.onAssert = function(objJSX) {
    var g = this._getGrid();
    var val = g.getValue();
    if (val) {
      g.insertRecordProperty(val, "wait", this._getAssertString(objJSX), true);
      this.setDirty(true);
    }
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._shouldRecord = function(objJSX, strType) {
    return strType == Interactive.CHANGE ||
           strType == Interactive.SELECT ||
           (strType == Interactive.SHOW && ((gui.Tab && objJSX instanceof gui.Tab) || (gui.Stack && objJSX instanceof gui.Stack))) ||
           strType == Interactive.TOGGLE; 
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getTargetString = function(objJSX) {
    var dom = objJSX.getServer().getDOM();
    var tokens = [];

    while (objJSX) {
      var parent = objJSX.getParent();
      var name = objJSX.getName();
      var matches = dom.getAllByName(name);

      if (matches.length == 1 || !parent) {
        tokens.unshift("#" + name);
        break;
      } else if (parent.findDescendants(function(x){ return x.getName() == name; }, false, true).length == 1) {
        tokens.unshift("#" + name);
      } else {
        tokens.unshift(objJSX.getChildIndex());
      }

      objJSX = objJSX.getParent();
    }

    return tokens.join("/");
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getAssertString = function(objJSX) {
    var target = this._getTargetString(objJSX);
    if (jsx3.gui.Form && objJSX.instanceOf(jsx3.gui.Form)) {
      return "VALUE, " + target + ", " + jsx3.$O.json(objJSX.getValue());
    } else
      return "EXISTS, " + target;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getActionString = function(strType, objContext) {
    return strType;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getActionArgsString = function(strType, objContext) {
    var a = [];
    for (var f in objContext) {
      var obj = objContext[f];

      if (obj && obj.getClass && obj.getClass().getName() == "jsx3.gui.Event") {
        var o = {type:obj.getType()};
        if (obj.keyCode())
          o.keyCode = obj.keyCode();
        if (obj.altKey()) o.altKey = true;
        if (obj.shiftKey()) o.shiftKey = true;
        if (obj.ctrlKey()) o.ctrlKey = true;
        if (obj.metaKey()) o.metaKey = true;
        a.push(f + ":" + jsx3.$O.json(o));
      } else if (obj && obj.getUTCDate) {
        a.push(f + ":new Date('" + obj.toString() + "')");
      } else {
        a.push(f + ":" + jsx3.$O.json(obj));
      }
    }

    return a.join(', ');
  };

});
