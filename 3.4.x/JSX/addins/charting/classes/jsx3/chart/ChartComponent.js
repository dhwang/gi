/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

// @jsxobf-clobber-shared  _bridge

/**
 * A base class for every logical component of a chart. A chart component exists in the DOM tree and 
 * is selectable with ctrl-click in a component editor in General Interface&#8482; Builder.
 * <p/>
 * This class defines the idiom in which all chart components are painted. Each component has a render
 * root, which is a VectorGroup. During the updateView() method, the component should add to the root
 * the vector paint helpers that are necessary to render the component. The component should assume that
 * the render root has been cleared before each call to updateView(). updateView() must always call its
 * super method.
 */
jsx3.Class.defineClass("jsx3.chart.ChartComponent", jsx3.gui.Block, null, function(ChartComponent, ChartComponent_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var vector = jsx3.vector;
  var chart = jsx3.chart;
  
  /** @private @jsxobf-clobber */
  ChartComponent.BAD_REFERENCE = {};
  ChartComponent.MASK_PROPS_NOEDIT = {NN: false, SS: false, EE: false, WW: false, MM: false};
  ChartComponent.MASK_PROPS_ALLEDIT = {NN: true, SS: true, EE: true, WW: true, MM: true};
  ChartComponent.MASK_PROPS_ALLEDITREL = {NN: false, SS: true, EE: true, WW: false, MM: false};

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   */
  ChartComponent_prototype.init = function(name) {
    //call constructor for super class
    this.jsxsuper(name);
    
    /* @jsxobf-clobber */
    this.renderRoot = null;
    /* @jsxobf-clobber */
    this.trans = null;
  };
  
  /**
   * Returns the chart of which this component is a part.
   * @return {jsx3.chart.Chart} this if this is a chart, or the first ancestor that is a chart
   */
  ChartComponent_prototype.getChart = function() {
    return this.findAncestor(function(x){return chart.Chart && x instanceof chart.Chart;}, true);
  };
  
  /**
   * Gets the current render root. The current render root is thrown away after each call to updateView() so it is not safe to hold onto it across calls to updateView()
   * @return {jsx3.vector.Group}
   * @private
   */
  ChartComponent_prototype.getRenderRoot = function() {
    if (this.renderRoot == null) 
      this.updateView();
    return this.renderRoot;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * calls updateView() but only if it has never been called before on this instance, then delegates paint() to the render root
   * @return {String} HTML
   */
  ChartComponent_prototype.paint = function() {
    var bTrace = chart.LOG_BENCH.isLoggable(jsx3.util.Logger.TRACE);
    if (this.renderRoot == null) {
      if (bTrace) chart.LOG_BENCH.trace("paint() update view - " + this.getId());
      this.updateView();
    }
    
    if (bTrace) chart.LOG_BENCH.trace("paint() serializing - " + this.getId());
    var html = this.renderRoot.paint();
    if (bTrace) chart.LOG_BENCH.trace("paint() done - " + this.getId());
    return html;
  };

  /**
   * calls updateView() before paint()
   */
  ChartComponent_prototype.repaint = function() {
    this.updateView();
    var html = this.jsxsuper();
    
    // HACK: needed to get around a weird rendering bug in IE
    var myChart = this.getChart();
    if (myChart != null) {
      var obj = myChart.getRendered();
      if (obj != null) {
        var zIndex = obj.style.zIndex;
        if (zIndex == null) zIndex = 0;
        obj.style.zIndex = zIndex + 1;
        obj.style.zIndex = zIndex;
      }
    }
    
    return html;
  };
  
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  
  ChartComponent_prototype.isDomPaint = function() {
    return true;
  };
          
  ChartComponent_prototype.paint = function() {
    throw new jsx3.Exception();
  };

  ChartComponent_prototype.paintDom = function() {
    if (this.renderRoot == null)
      this.updateView();
    return this.renderRoot.paintDom();
  };

  ChartComponent_prototype.repaint = function() {
    this.updateView();
    return this.jsxsuper();
  };
  
/* @JSC */ }

  /**
   * override to clear out transient object references
   * @private
   */
  ChartComponent_prototype.doClone = function(objCloneParent) {
    this.renderRoot = null;
    this.trans = null;
    
    return this.jsxsuper(objCloneParent);
  };

  /**
   * refreshes the render root and copies some basic HTML attributes and CSS styles from the component into the render root
   * @package
   */
  ChartComponent_prototype.updateView = function() {
    this.applyDynamicProperties();

    var parent = null, oldroot = null;
    
    // refresh the render root by release the old one
    if (this.renderRoot != null) {
      // if this render root is attached to a parent, we'll keep track of that and attach the
      // new render root to the old parent
      oldroot = this.renderRoot;
      parent = oldroot.getParent();
    }
    
    // create the new render root
    this.renderRoot = this.getCanvasClass().newInstance();
    // copy attributes set in the component into the render root
    this.renderRoot.setId(this.getId());
    this.renderRoot.setDimensions(this.getDimensions());
    this.renderRoot.setZIndex(this.getZIndex());
    this.renderRoot.setPosition(this.getRelativePosition() ? "relative" : "absolute");
    
    // set attributes from jsx3.gui.Painted interface
    var attr = this.getAttributes();
    for (var f in attr)
      this.renderRoot.setProperty(f, attr[f]);

    // attach new root to old parent
    if (parent != null) {
      parent.replaceChild(this.renderRoot, oldroot);
    }
    
    if (oldroot != null)
      oldroot.release();
  };
  
  ChartComponent_prototype.getCanvasClass = function() {
    return vector.Group.jsxclass;
  };
  
  ChartComponent_prototype.setEventProperties = function(objTag) {
    if (objTag == null) 
      objTag = this.renderRoot;
    
    var events = {};
    if (this.getMenu() != null)
      events[Event.MOUSEUP] = true;
    if (this.hasEvent(Interactive.SELECT))
      events[Event.CLICK] = true;
    if (this.hasEvent(Interactive.EXECUTE))
      events[Event.DOUBLECLICK] = true;
    if (this.hasEvent(Interactive.SPYGLASS)) {
      events[Event.MOUSEOVER] = "doSpyOver";
      events[Event.MOUSEOUT] = "doSpyOut";
    }

    this.renderHandlers(events, objTag);
  };
  
  /* @jsxobf-clobber */
  ChartComponent._BRIDGE = "_bridge";
  
/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  ChartComponent_prototype.renderHandlers = function(objMap, objTag) {
    for (var i = 0; i < Interactive.BRIDGE_EVENTS.length; i++) {
      var eventType = Interactive.BRIDGE_EVENTS[i];
      var eventHandler = "on" + eventType;
      var strEvent = [];
      
      var attrEvent = this.getAttribute(eventHandler);
      if (attrEvent) {
        strEvent.push(attrEvent.replace(/"/g, "&quot;"));
        if (! attrEvent.match(/;\s*$/))
          strEvent.push(";");
      }
      var bridgeMethod = objMap[eventType];
      if (bridgeMethod) {
        if (typeof(bridgeMethod) != "string")
          bridgeMethod = Interactive.BRIDGE_EVENTS_MAP[eventType];
        strEvent.push('jsx3.GO(\'' + this.getId() + '\').'+ChartComponent._BRIDGE+'(event,this,\'' + bridgeMethod + '\');');
      }

      if (strEvent.length > 0)
        objTag.setProperty(eventHandler, strEvent.join(""));
    }
  };
  
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  ChartComponent_prototype.renderHandlers = function(objMap, objTag) {
    var bHasDouble = objMap[Event.DOUBLECLICK];

    for (var i = 0; i < Interactive.BRIDGE_EVENTS.length; i++) {
      var eventType = Interactive.BRIDGE_EVENTS[i];
      // SVG does not have a double click event so we have to do some fancy footwork to support it, see below
      if (bHasDouble && (eventType == Event.DOUBLECLICK || eventType == Event.CLICK)) continue;
      
      var eventHandler = "on" + eventType;
      var strEvent = [];
      
      var attrEvent = this.getAttribute(eventHandler);
      if (attrEvent) {
        strEvent.push(attrEvent.replace(/"/g, "&quot;"));
        if (! attrEvent.match(/;\s*$/))
          strEvent.push(";");
      }
      var bridgeMethod = objMap[eventType];
      if (bridgeMethod) {
        if (typeof(bridgeMethod) != "string")
          bridgeMethod = Interactive.BRIDGE_EVENTS_MAP[eventType];
        strEvent.push("jsx3.GO('" + this.getId() + "')."+ChartComponent._BRIDGE+"(evt,this,'" + bridgeMethod + "');");
      }

      if (strEvent.length > 0)
        objTag.setProperty(eventHandler, strEvent.join(""));
    }

    if (bHasDouble) {
      var strEvt = "";
      var dblclickMethod = Interactive.BRIDGE_EVENTS_MAP[Event.DOUBLECLICK];

      if (objMap[Event.CLICK]) {
        var clickMethod = Interactive.BRIDGE_EVENTS_MAP[Event.CLICK];
        strEvt = "jsx3.GO('" + this.getId() + "')."+ChartComponent._BRIDGE+"(evt,this,evt.detail%2==1?'"+
            clickMethod+"':'"+dblclickMethod+"');";
      } else {
        strEvt = "if(evt.detail%2==0)jsx3.GO('" + this.getId() + "')."+
            ChartComponent._BRIDGE+"(evt,this,'"+dblclickMethod+"');";
      }

      objTag.setProperty("onclick", strEvt);
    }
  };

/* @JSC */ }
  
  /**
   * copies this instance's values of getBackgroundColor() and getAlpha() into a vector fill for the vector parameter
   * @param objShape {jsx3.vector.Shape} the vector whose fill to set
   * @package
   */
  ChartComponent_prototype.copyBackgroundToFill = function(objShape) {
    var color = this.getBackgroundColor();
    
    if (color != null && color.match(/\S/)) {
      var fill = objShape.getFirstChildOfType(vector.Fill);
      if (fill == null) {
        fill = new vector.Fill();
        objShape.setFill(fill);
      }
      fill.setColor(color);
      
      // this class does not define getAlpha()
      if (typeof(this.getAlpha) == 'function') 
        fill.setAlpha(this.getAlpha());
    } else {
      objShape.setFill(null);
    }
  };
  
  /**
   * copies this instance's values of getBorderColor(), getBorderAlpha(), and getBorderWidth() into a VectorStroke for the vector parameter
   * @param objShape {jsx3.vector.Shape} the vector whose stroke to set
   * @package
   */
  ChartComponent_prototype.copyBorderToStroke = function(objShape) {
    var color = this.getBorderColor();
    
    if (color != null && color.match(/\S/)) {
      var stroke = objShape.getFirstChildOfType(vector.Stroke);
      if (stroke == null) {
        stroke = new vector.Stroke();
        objShape.setStroke(stroke);
      }
      stroke.setColor(color);
      
      // this class does not define getBorderAlpha() or getBorderWidth()
      if (typeof(this.getBorderAlpha) == 'function') 
        stroke.setAlpha(this.getBorderAlpha());
      if (typeof(this.getBorderWidth) == 'function') 
        stroke.setWidth(this.getBorderWidth());
    } else {
      objShape.setStroke(null);
    }
  };

  /**
   * Sets the value of a reference field; a reference field is a string field that evals to some sort of object.
   * @param fieldName {String} the name of the reference field, this method will set this[fieldName]
   * @param asString {String} the value of the field as a string (before it's eval'ed)
   * @package
   */
  ChartComponent_prototype.setReferenceField = function( fieldName, asString ) {
    this[fieldName] = asString;
    // clear the cached result so that the next call to getReferenceField() will eval again
    this["_" + fieldName + "_eval"] = null;
  };

  /**
   * fetches the eval'ed result of a reference field; caches the result (ok or invalid)
   * @param fieldName {String} the name of the reference field
   * @param type {String} the eval'ed result will be constrained to this javascript type, defaults to 'object'
   * @package
   */
  ChartComponent_prototype.getReferenceField = function( fieldName, type ) {
    if (type == null) type = "object";
    // we store the cached results in this field
    var exField = "_" + fieldName + "_eval";
    
    // only eval if not cached
    if (! this[exField] && this[fieldName]) {
      try {
        // eval it
        var localFunct = this.eval("var f = " + this[fieldName] + "; f;");
        this[exField] = localFunct;
        // constrain to type
        if (typeof(this[exField]) != type) {
          chart.LOG.error("error evaluating '" + fieldName + "', " + this[exField] + " is not of type " + type);
          this[exField] = ChartComponent.BAD_REFERENCE;
        }
      } catch (e) {
        e = jsx3.NativeError.wrap(e);
        // remember that eval fails
        this[exField] = ChartComponent.BAD_REFERENCE;
        chart.LOG.error("error evaluating " + type + " field '" + fieldName, e);
      }
    }
    
    // previous eval may have failed ... return null in this case
    return this[exField] != ChartComponent.BAD_REFERENCE ? this[exField] : null;
  };

  /**
   * calls getReferenceField() with the type parameter of 'function'
   * @param fieldName {String} the name of the reference field
   * @package
   */
  ChartComponent_prototype.getFunctionField = function( fieldName ) {
    return this.getReferenceField(fieldName, "function");
  };

  ChartComponent_prototype.toString = function() {
    return "[ChartComponent '" + this.getName() + "']";
  };
    
  /**
   * store a local field that will never be serialized; uses a separate namespace than normal instance fields
   * @param name {String} the name of the field
   * @param value {Object} the value of the field
   * @private
   */
  ChartComponent_prototype.storeTransient = function( name, value ) {
    // since this.trans is regular javascript object, it won't be serialized
    if (this.trans == null) this.trans = {};
    this.trans[name] = value;
  };
  
  /**
   * fetches the value of a field set with storeTransient()
   * @param name {String} the name of the field
   * @return {Object} the value of the field
   * @package
   */
  ChartComponent_prototype.fetchTransient = function( name ) {
    return (this.trans != null) ? this.trans[name] : null;
  };
  
  /**
   * removes a field set with storeTransient()
   * @param name {String} the name of the field
   * @package
   */
  ChartComponent_prototype.clearTransient = function( name ) {
    if (this.trans != null)
      delete this.trans[name];
  };

  /** 
   * by default disallow size editing and moving of chart components in GI 
   */
  ChartComponent_prototype.getMaskProperties = function() {
    return ChartComponent.MASK_PROPS_NOEDIT;
  };
  
  // need to override the following methods that Builder calls when editing an object on the stage

  ChartComponent_prototype.setLeft = function(left, bRepaint) {
    this.jsxsuper(left, bRepaint);
    // NOTE: implements the GI box model, which is different that the standard HTML one
    if (this.renderRoot != null && this.getRelativePosition() == jsx3.gui.Block.ABSOLUTE)
      this.renderRoot.setLeft(left);
    return this;
  };

  ChartComponent_prototype.setTop = function(top, bRepaint) {
    this.jsxsuper(top, bRepaint);
    // NOTE: implements the GI box model, which is different that the standard HTML one
    if (this.renderRoot != null && this.getRelativePosition() == jsx3.gui.Block.ABSOLUTE)
      this.renderRoot.setTop(top);
    return this;
  };

  ChartComponent_prototype.setWidth = function(width, bRepaint) {
    this.jsxsuper(width);
    if (this.renderRoot != null) {
      this.renderRoot.setWidth(width);
      if (bRepaint) this.repaint();
    }
    return this;
  };

  ChartComponent_prototype.setHeight = function(height, bRepaint) {
    this.jsxsuper(height);
    if (this.renderRoot != null) {
      this.renderRoot.setHeight(height);
      if (bRepaint) this.repaint();
    }
    return this;
  };

  ChartComponent_prototype.setRelativePosition = function(position, bRepaint) {
    this.jsxsuper(position, bRepaint);
    if (this.renderRoot != null) {
      // NOTE: implements the GI box model, which is different that the standard HTML one
      if (position == jsx3.gui.Block.RELATIVE) {
        this.renderRoot.setPosition("relative");
        this.renderRoot.setLeft(0);
        this.renderRoot.setTop(0);
      } else {
        this.renderRoot.setPosition("absolute");
        this.renderRoot.setLeft(this.getLeft());
        this.renderRoot.setTop(this.getTop());
      }
    }
    return this;
  };

  /**
   * parses the margin field into an array of four int values 
   * @return {Array<int>} [top,right,bottom,left]
   * @package
   */
  ChartComponent_prototype.getMarginDimensions = function() {
    return this.getDimensionsFromCss(this.getMargin());
  };
  
  /**
   * parses the padding field into an array of four int values 
   * @return {Array<int>} [top,right,bottom,left]
   * @package
   */
  ChartComponent_prototype.getPaddingDimensions = function() {
    return this.getDimensionsFromCss(this.getPadding());
  };

  /**
   * parses any CSS value into an array of four int values 
   * @return {Array<int>} [top,right,bottom,left]
   * @private
   */
  ChartComponent_prototype.getDimensionsFromCss = function(css) {
    if (css) {
      if (typeof(css) == "number") {
        return [css,css,css,css];
      } else {
        var tokens = ("" + css).split(/\D+/);
        if (tokens[0] === "") tokens.shift();
        if (tokens.length > 0 && tokens[tokens.length] === "") tokens.pop();
        if (tokens.length >= 4) {
          return [parseInt(tokens[0]),parseInt(tokens[1]),parseInt(tokens[2]),parseInt(tokens[3])];
        } else if (tokens.length >= 1) {
          var p = parseInt(tokens[0]);
          return [p,p,p,p];
        }
      }
    }
    
    return [0,0,0,0];  
  };

  ChartComponent_prototype.getCanSpy = function() {
    return true;
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  ChartComponent.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
