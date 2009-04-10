/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber _viewsize _vieworigin _point _pixel _offset _inverse

/**
 * GUI utility class that provides a way to display HTML content on-screen in an HTML equivalent of a heavyweight container.
 * Instances of this class are often used to display menu lists, select lists, spyglass, and focus-rectangles.
 * An instance of this class cannot be serialized, it is merely a run-time construct similar to an alert or input box.
 *
 * @since 3.0
 */
jsx3.Class.defineClass("jsx3.gui.Heavyweight", null, null, function(Heavyweight, Heavyweight_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Heavyweight.jsxclass.getName());

  /**
   * {Object<String, jsx3.gui.Heavyweight>}
   * @private
   * @jsxobf-clobber
   */
  Heavyweight._INSTANCES = {};

  /**
   * @private
   * @jsxobf-clobber
   */
  Heavyweight._SERIAL = 1;

  /**
   * {int} 32000
   */
  Heavyweight.DEFAULTZINDEX = 32000;

  Heavyweight.PADDING = 10;

  /**
   * instance initializer
   * @param strId {String} id to identify this HW instance among all others; this id will be used by both jsx3.gui.Heavyweight (to index it in the hash) and by the browser as the HTML tag's "id" attribute. If no ID is passed, a unique ID will be assigned by the system and is available by calling, [object].getId();
   * @param objOwner {jsx3.gui.Painted}
   */
  Heavyweight_prototype.init = function(strId, objOwner) {
    /* @jsxobf-clobber */
    this._id = strId != null ? strId : Heavyweight._getKey();
    /* @jsxobf-clobber */
    this._owner = objOwner;

    //persist a ref in the hash (this is removed when 'destroy' is called on the object
    if (Heavyweight._INSTANCES[this._id] != null)
      Heavyweight._INSTANCES[this._id].destroy();

    Heavyweight._INSTANCES[this._id] = this;
  };

  /**
   * used by the app to ensure a session-unique key as well as VIEW-unique ID (since we own the 'jsx' prefix for IDs, not too tough to generate a unique key; just increment)
   * @return {String} unique key
   * @private
   * @jsxobf-clobber
   */
  Heavyweight._getKey = function() {
    return "jsx_heavyweight_" + Heavyweight._SERIAL++;
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  Heavyweight._hideAll = function() {
    var c = Heavyweight._INSTANCES;
    var bFocus = false;
    for (var f in c) {
      c[f].hide();
      if (! bFocus && c[f]._owner) {
        c[f]._owner.focus();
        bFocus = true;
      }
    }
  };

  jsx3.gui.Event.subscribe(jsx3.gui.Event.RESIZE, Heavyweight._hideAll);

  /**
   * Returns the first document body in the document
   * @return {HTMLElement} first document body in the document
   * @private
   * @jsxobf-clobber
   */
  Heavyweight_prototype._getBody = function() {
    if (this._owner) {
      var doc = this._owner.getDocument();
      if (doc)
        return doc.getElementsByTagName("body")[0];
      else
        LOG.warn(jsx3._msg("gui.hw.doc", this));
    } else {
      LOG.warn(jsx3._msg("gui.hw.own", this));
    }
    return null;
  };

  /**
   * Returns the instance of the heavyweight object with the given ID; to get the on-screen HTML instance call: jsx3.gui.Heavyweight.GO([id]).getRendered()
   * @param strId {String} unique ID for the heavyweight instance
   * @return {jsx3.gui.Heavyweight}
   */
  Heavyweight.GO = function(strId) {
    return Heavyweight._INSTANCES[strId];
  };

  /**
   * Sets the text/HTML for the control to be displayed on-screen; returns reference to self to facilitate method chaining;
   * @param bDisplay {boolean} true if null; if true, the heavyweight container is positioned and displayed immediately; if false, the container is painted on-screen, but its CSS 'visibility' property is set to 'hidden', allowing the developer to adjust as needed (via 2-pass, etc) before actually displaying;
   */
  Heavyweight_prototype.show = function(bDisplay) {
    //establish a globally uniqe key for this heavyweight instance; since user has now decided to display it (e.g., add it to the browser VIEW), we need to index and track for proper dereferencing
    var strId = this.getId();

    //get the content for the heavyweight; exit early if no valid content exists
    var strText = this.getHTML();
    if (jsx3.util.strEmpty(strText)) return;

    //get the width and height (were these explicitly set or not)
    var intWidth = this.getWidth();
    var strWidth = intWidth == null ? "" : "width:" + intWidth + "px;";
    var intHeight = this.getHeight();
    var strHeight = intHeight == null ? "" : "height:" + intHeight + "px;";

    //wrap the HTML that the user wants to display in the spy container
    var strHTML = '<span id="' + strId + '" class="jsx30block" style="position:absolute;overflow:;' + strWidth + strHeight + 'left:0px;top:0px;z-index:' + this.getZIndex() + ';visibility:hidden;">' + strText + '</span>';

    //insert HTML directly into the Browser DOM
    var objBody = this.getDomParent();
    jsx3.html.insertAdjacentHTML(objBody, "beforeEnd", strHTML);

    //call VIEW methods to adjust the positioning according the rules and ratios specified for the HW instance
    this.applyRatio();
    this.applyRules("Y");
    this.applyRules("X");

    //show unless explicitly told not to
    if (bDisplay != false) this.setVisibility(jsx3.gui.Block.VISIBILITYVISIBLE);

    // register for destroy of owner
    if (this._owner)
      this._owner.subscribe(jsx3.gui.Interactive.DESTROY, this, "_onOwnerDestroyed");
  };

  /**
   * can be called if show() has been called; resets the ratio (width/total) of the VIEW to be that of [object].getRatio()
   * @param bRecalc {boolean} false if null; if true, this is a recalculation of the ratio based upon how large the browser UI is in relation to the adjusted width; this is typically called in situations where the content is displayed using a ratio
   */
  Heavyweight_prototype.applyRatio = function(bRecalc) {
    //initialize variables
    var objGUI = this.getRendered();
    if (objGUI && objGUI.style) {
      //get current height/width (this will give us the total
      var intHeight = null, intWidth = null;
      if (bRecalc || !objGUI.childNodes[0]) {
        //in two-pass situation: ignore child dimensions. the HW container is as large as it can be
        intHeight = objGUI.offsetHeight;
        intWidth = objGUI.offsetWidth;
      } else {
        intHeight = objGUI.childNodes[0].offsetHeight;
        intWidth = objGUI.childNodes[0].offsetWidth;
      }

      var vntRatio = this.getRatio();
      if (vntRatio) {
        //reset and redimension based on user preference and adjust HW dimensions to be exactly as large as content
        intWidth = parseInt(vntRatio * (intWidth + intHeight));
//LUKE: 3.2 pixelWidth, etc.
        objGUI.style.width = intWidth + "px";
        objGUI.childNodes[0].style.width = intWidth;
        if (bRecalc != true) {
          intHeight = objGUI.childNodes[0].offsetHeight;
//LUKE: 3.2 pixelWidth, etc.
          objGUI.style.height = intHeight + "px";
        } else {
//LUKE: 3.2 pixelWidth, etc.
          objGUI.childNodes[0].style.height = intHeight + "px";
        }
      } else if (bRecalc != true) {
        //adjust HW dimensions to be exactly as large as content
//LUKE: 3.2 pixelWidth, etc.
        objGUI.style.width = intWidth + "px";
        objGUI.style.height = intHeight + "px";
      }
    }
  };

  /** @package */
  Heavyweight_prototype.setContentNodePath = function(strPath) {
    /* @jsxobf-clobber */
    this._jsxcontentpath = strPath;
  };

  /** @private @jsxobf-clobber */
  Heavyweight_prototype._getContentNode = function(objGUI) {
    return jsx3.html.selectSingleElm(objGUI, this._jsxcontentpath != null ? this._jsxcontentpath : 0);
  };

  /**
   * can be called if show() has been called; allows an existing HW window to re-apply its rules (used for complex layouts requiring a multi-pass)
   * @param strAxis {String} character (string) representing whether the rule is for the X or Y axis. Rememeber to capitalize!
   */
  Heavyweight_prototype.applyRules = function(strAxis) {
    //initialize variables used by both AXES
    var objGUI = this.getRendered();
    var objBody = this.getDomParent();
    if (objGUI == null || objBody == null) return;

    //initialize constants specific to the axis along which we're trying to positing the HW instance
    var strClientDim, strOffsetDim, strSizeDim, intSize, intExplicitSize;
    if (strAxis == "X") {
      strClientDim = "clientWidth";
      strOffsetDim = "left";
      strSizeDim = "width";
      intSize = this._getContentNode(objGUI).offsetWidth;
      intExplicitSize = this.getWidth();
    } else {
      strClientDim = "clientHeight";
      strOffsetDim = "top";
      strSizeDim = "height";
      intSize = this._getContentNode(objGUI).offsetHeight;
      intExplicitSize = this.getHeight();
    }

    //initialize variables used for positioning along this axis; get the size (clientwidth/clientheight) for the document body
    var intRuleCount = this.getPositionRules()[strAxis].length;
    var intBodyClientSize = objBody[strClientDim];
    var intOrigin = 0;

    if (LOG.isLoggable(jsx3.util.Logger.TRACE))
      LOG.trace("applyRules - axis:" + strAxis + " size:" + intSize + " explicit:" + intExplicitSize +
                " space:" + intBodyClientSize);
    
    //loop to apply the axis-specific rules (loop until a perfict fit is found)
    for (var i=0;i<intRuleCount;i++) {
      //get the current rule and the point on the HW instance that will be its origin as we position it for the current rule
      var objRule = this.getPositionRule(i, strAxis);
      var objHWP = this.getPoint(objGUI, objRule._point);

      //if the current rule does not specify an anchor point (an AXIS origin) from which to position horizontally, decrement the origin so it fits
      if (objRule._pixel == null) {
        //decrease origin until we fit or are off the left edge of the browser; offsets are not applied when there is no anchor to offset from
        intOrigin = Math.max(Heavyweight.PADDING, intBodyClientSize - intSize - Heavyweight.PADDING);
      } else {
        //derive origin based on standard positioning logic
        intOrigin = objRule._inverse ?
                    objRule._pixel + objRule._offset - objHWP[strAxis] - intSize :
                    objRule._pixel + objRule._offset - objHWP[strAxis];
      }

      //check to see if the content fits within the document BODY; if not keep iterating
      if (intOrigin < 0 || (intOrigin + intSize) > intBodyClientSize) {
        // this rule does not provide a perfect fit; append the amount of horizontal real-estate that this rule provides.
        // If no rules end up matching, use the rule that provides the greatest amount of visible content
        objRule._viewsize = objRule._inverse ? intOrigin :
                            ((intOrigin < 0) ? intSize + intOrigin : intBodyClientSize - intOrigin);
        objRule._vieworigin = intOrigin;

        if (LOG.isLoggable(jsx3.util.Logger.TRACE))
          LOG.trace("rule is not perfect - index:" + i + " point:" + objRule._point + " inverse:" + objRule._inverse + " size:" + intSize +
                    " origin:" + intOrigin + " space:" + intBodyClientSize + " maxsize:" + objRule._viewsize);        
      } else {
        if (LOG.isLoggable(jsx3.util.Logger.TRACE))
          LOG.trace("applying rule - index:" + i + " point:" + objRule._point + " pixel:" + objRule._pixel +
                    " offset:" + objRule._offset);

        // the content fits at this position; physically move the HW instance, set flag that a match was found,
        // and exit the loop
        objGUI.style[strOffsetDim] = intOrigin + "px";
        objGUI.style[strSizeDim] = intSize + "px";
        return;
      }
    }

    //if no rule was found for this axis that provided a perfect fit, loop to find the next-best option
    var intMax = -1;
    var intMaxIndex = -1;
    for (var i=0;i<intRuleCount;i++) {
      var objRule = this.getPositionRule(i,strAxis);
      if (intMax < objRule._viewsize) {
        intMax = objRule._viewsize;
        intMaxIndex = i;
      }
    }

    // update the origin for the winning rule
    var objRule = this.getPositionRule(Math.max(0,intMaxIndex), strAxis);
    // seems to return null for things that don't end up being displayed anywhere (mis-configured chart series)
    if (objRule != null) {
      if (LOG.isLoggable(jsx3.util.Logger.TRACE))
        LOG.trace("apply best rule - index:" + intMaxIndex + " origin:" + objRule._vieworigin + " size:" + objRule._viewsize +
                  " point:" + objRule._point);

      objGUI.style[strOffsetDim] = objRule._vieworigin + "px";

      //adjust the size for the winning rule if user did not explicitly set a height/width
      if (intExplicitSize == null) {
        objGUI.childNodes[0].style[strSizeDim] = Math.max(0, objRule._viewsize - Heavyweight.PADDING) + "px";
        if (this.getOverflow() == jsx3.gui.Block.OVERFLOWSCROLL) objGUI.childNodes[0].style.overflow = "auto";
        objGUI.style[strSizeDim] = Math.max(0, objRule._viewsize - Heavyweight.PADDING) + "px";
        if (objRule._vieworigin < 0) objGUI.style[strOffsetDim] = Heavyweight.PADDING + "px";
      }
    }
  };

  /**
   * destorys the on-screen VIEW for the HW container; Hide() only affects the VIEW; this is not the same as setting visibility to "hidden", which doesn't actually destroy the VIEW
   */
  Heavyweight_prototype.hide = function() {
    //while it's still hidden, get the true height for the item
    var objGUI = this.getRendered();
    if (objGUI != null) objGUI.parentNode.removeChild(objGUI);

    // unregister for destroy of owner
    if (this._owner)
      this._owner.unsubscribe(jsx3.gui.Interactive.DESTROY, this);
  };

  /** @private @jsxobf-clobber */
  Heavyweight_prototype._onOwnerDestroyed = function(objEvent) {
    if (LOG.isLoggable(jsx3.util.Logger.TRACE))
      LOG.trace("_onOwnerDestroyed " + objEvent.target.getName());

    // have to get document through the parent of owner because owner is already removed from the view
    var parent = objEvent.context.objPARENT;
    var objGUI = parent.getDocument().getElementById(this.getId());
    if (objGUI != null) objGUI.parentNode.removeChild(objGUI);

    this._owner.unsubscribe(jsx3.gui.Interactive.DESTROY, this);
    this._owner = null;
    delete Heavyweight._INSTANCES[this.getId()];
    this._id = null;
  };

  /**
   * destroy's the on-screen VIEW for the HW container AND removes any reference to the instance from the hash; Destroy() affects the MODEL and the VIEW
   */
  Heavyweight_prototype.destroy = function() {
    if (! Heavyweight._INSTANCES[this._id])
      return;

    //destroy the VIEW (if it exists);
    this.hide();
    this._owner = null;

    // destroy ref to the MODEL
    delete Heavyweight._INSTANCES[this._id];
    this._id = null;
  };

  /**
   * Returns handle/reference to the Heavyweight Object's on-screen counterpart&#8212;basically a handle to a DHTML SPAN;
   * @param objGUI {jsx3.gui.Event|HTMLElement|HTMLDocument} optional argument improves efficiency if provided.
   * @return {HTMLElement} Browser-Native DHTML object
   */
  Heavyweight_prototype.getRendered = function(objGUI) {
    var strId = this.getId();
    if (strId == null) return null;

    var doc = null;
    if (objGUI instanceof jsx3.gui.Event) {
        if (objGUI.srcElement())
          doc = objGUI.srcElement().ownerDocument;
    } else if (objGUI != null) {
      doc = objGUI.getElementById ? objGUI : objGUI.ownerDocument;
    }
    if (! doc && this._owner) doc = this._owner.getDocument();

    if (doc)
      return doc.getElementById(strId);
    else if (this._owner != null && this._owner.getServer() != null) // only an error if the owner is still on the DOM
      LOG.warn(jsx3._msg("gui.hw.doc", this));      

    return null;
  };

  Heavyweight_prototype.containsHtmlElement = function(objElement) {
    var r = this.getRendered(objElement);
    if (r) {
      while (objElement != null) {
        if (r == objElement)
          return true;
        objElement = objElement.parentNode;
      }
    }
    return false;
  };

  /**
   * Returns the unique id for this heavyweight instance
   * @return {String}
   */
  Heavyweight_prototype.getId = function() {
    return this._id;
  };

  /**
   * Sets the unique id for this heavyweight instance
   * @param strId {String} id to set
   * @private
   */
  Heavyweight_prototype._setId = function(strId) {
    //called by init to give a unique id to this heavyweight instance; as this is not tracked as part of the standard JSX DOM, it has its own internal id interface
    this._id = strId;
  };

  /**
   * Returns the HTML content to display inside the HW instance on-screen
   * @return {String}
   */
  Heavyweight_prototype.getHTML = function() {
    return this.html;
  };

  /**
   * Sets the HTML content to display inside the HW instance on-screen; returns ref to self
   * @param strHTML {String} HTML
   * @return {jsx3.gui.Heavyweight} this
   */
  Heavyweight_prototype.setHTML = function(strHTML, bRepaint) {
    this.html = strHTML;
    if (bRepaint) {
      var me = this.getRendered();
      if (me != null) me.innerHTML = strHTML;
    }
    return this;
  };

  /**
   * Returns an object reference to the Browser Element parent to be used; if none specified, the browser BODY will be used
   * @return {HTMLElement}
   */
  Heavyweight_prototype.getDomParent = function() {
    return (this._parent == null) ? this._getBody() : this._parent;
  };

  /**
   * Sets an object reference to the Browser Element parent to be used; if none specified, the browser BODY will be used. NOTE: this method must be called before setting any point rules for the hW instance, so those functions know the true origin from which to calculate left/top positions; returns ref to self
   * @param objGUI {HTMLElement} HTML element in the browser
   * @return {jsx3.gui.Heavyweight} this
   */
  Heavyweight_prototype.setDomParent = function(objGUI) {
    /* @jsxobf-clobber */
    this._parent = objGUI;
    return this;
  };

  /**
   * Returns the ratio (a decimal between .01 and .99) to multiply the "Rise + Run" by. When applied by the 'show'
   * command during a double-pass, a width to height ratio can be established to provide a consistent L&amp;F for
   * the text content.  For example, a value of .8 would mean that the width of the heavyweight container would
   * represent 80% and the height would represent 20% of the total perimiter
   * @return {Number}
   */
  Heavyweight_prototype.getRatio = function() {
    return this._ratio;
  };

  /**
   * Sets the ratio (a decimal between .01 and .99) to multiply the "Rise + Run" by. When applied by the 'show' command during a double-pass, a width to height ratio can be established to provide a consistent L&amp;F for the text content.  For example, a value of .8 would mean that the width of the heavyweight container would represent 80% and the height would represent 20% of the total perimiter;
   *            returns a ref to self
   * @param vntRatio {Number} any value between .01 and .99
   * @return {jsx3.gui.Heavyweight} this
   */
  Heavyweight_prototype.setRatio = function(vntRatio) {
    /* @jsxobf-clobber */
    this._ratio = vntRatio;
    return this;
  };

  /**
   * Returns the overflow property for CONTENTS of the HW container; it is assumed that anytime a perfect fit cannot occur that the content will have its overflow property set to 'auto' unless specified otherwise
   * @return {String} [jsx3.gui.Block.OVERFLOWSCROLL, jsx3.gui.Block.OVERFLOWHIDDEN, jsx3.gui.Block.OVERFLOWEXPAND]
   */
  Heavyweight_prototype.getOverflow = function() {
    return (this._overflow == null) ? jsx3.gui.Block.OVERFLOWSCROLL : this._overflow;
  };

  /**
   * Sets the overflow property for CONTENTS of the HW container; it is assumed that anytime a perfect fit cannot occur that the content will have its overflow property set to 'auto' unless specified otherwise
   *            returns reference to self to facilitate method chaining;
   * @param strOverflow {String} [jsx3.gui.Block.OVERFLOWSCROLL, jsx3.gui.Block.OVERFLOWHIDDEN, jsx3.gui.Block.OVERFLOWEXPAND]
   * @return {jsx3.gui.Heavyweight} this object
   */
  Heavyweight_prototype.setOverflow = function(strOverflow) {
    /* @jsxobf-clobber */
    this._overflow = strOverflow;
    return this;
  };

  /**
   * if the HW instance has an on-screen VIEW, this method can be used to toggle its visibility; it has no effect on the MODEL; it is most commonly used when "[object].show(false);" is called, allowing the developer to manually adjust layout before actually showing the HW instance.
   *            returns a ref to self for method chaining
   * @param strVisibility {String} [jsx3.gui.Block.VISIBILITYVISIBLE, jsx3.gui.Block.VISIBILITYHIDDEN]
   * @return {jsx3.gui.Heavyweight} this object
   */
  Heavyweight_prototype.setVisibility = function(strVisibility) {
    //update the MODEL
    var objGUI = this.getRendered();
    if (objGUI) objGUI.style.visibility = strVisibility;
    return this;
  };

  /**
   * Returns the z-index property; assumes jsx3.gui.Heavyweight.DEFAULTZINDEX if none supplied
   * @return {int}
   */
  Heavyweight_prototype.getZIndex = function() {
    return (this._zindex != null) ? this._zindex : Heavyweight.DEFAULTZINDEX;
  };

  /**
   * Sets the CSS z-index for the object; if null, is passed, jsx3.gui.Heavyweight.DEFAULTZINDEX will be used as the default value
   * @param intZIndex {int} z-index value
   */
  Heavyweight_prototype.setZIndex = function(intZIndex) {
    /* @jsxobf-clobber */
    this._zindex = intZIndex;
    return this;
  };

  /**
   * Returns the CSS width property (in pixels); if this value is set, it is assumed that the Heavyweight container will not have its width lessened to fit on-screen.
   * @return {int} width (in pixels)
   */
  Heavyweight_prototype.getWidth = function() {
    return (this._width == null) ? null : this._width;
  };

  /**
   * Sets the CSS width property (in pixels); if this value is set, it is assumed that the Heavyweight container will not have its width lessened to fit on-screen.
   * @param intWidth {int} width (in pixels)
   */
  Heavyweight_prototype.setWidth = function(intWidth) {
    /* @jsxobf-clobber */
    this._width = intWidth;
    return this;
  };

  /**
   * Returns the CSS height property (in pixels); if this value is set, it is assumed that the Heavyweight container will not have its height lessened to fit on-screen.
   * @return {int} height (in pixels)
   */
  Heavyweight_prototype.getHeight = function() {
    return (this._height == null) ? null : this._height;
  };

  /**
   * Sets the CSS height property (in pixels); if this value is set, it is assumed that the Heavyweight container will not have its height lessened to fit on-screen.
   *            returns reference to self to facilitate method chaining;
   * @param intHeight {int} height (in pixels)
   * @return {jsx3.gui.Heavyweight} this object
   */
  Heavyweight_prototype.setHeight = function(intHeight) {
    /* @jsxobf-clobber */
    this._height = intHeight;
    return this;
  };

  /**
   * adds a POSITION RULE ruleset (X value) (a simple structure/hash) to the array of position rules; NOTE: POSITION RULE objects are used by the show() method to determine the best possible location for a heavyweight item
   * @param objAnchor {Object|jsx3.gui.Event} Either an event, or an on-screen HTML element
   * @param strAnchorPoint {String} REQUIRED if @objAnchor is an HTML element; when used, defines one of  the valid 9 compass points: 4 primary: (N, S, E, W); 4 secondary: (NE, SE, SW, NW); and origin: (O). NOTE: it
   *            is from this point (on @objAnchor) that the heavyweight item will try to position itself
   * @param strPoint {String} Defines one of  the valid 9 compass points: 4 primary: (N, S, E, W); 4 secondary: (NE, SE, SW, NW); and origin: (O). NOTE: it
   *            is from this point (on the Heavyweight instance) that the heavyweight item will try to position itself
   * @param intOff {int} offset (in pixels) by which to nudge the horizontal placement of the HW instance before displaying (useful for submenus, for example, where their left has a -10px offset to overlay the parent menu item)
   * @return {jsx3.gui.Heavyweight} this object (this)
   */
  Heavyweight_prototype.addXRule = function(objAnchor,strAnchorPoint,strPoint,intOff,bInverse) {
    //get anchor pivot (is this a GUI object or the browser's event object?)
    var intX = (objAnchor instanceof jsx3.gui.Event) ? objAnchor.clientX() : this.getPoint(objAnchor, strAnchorPoint).X;
    this.addRule(intX, strPoint, intOff, "X", bInverse);
    return this;
  };

  /**
   * adds a POSITION RULE ruleset (Y value) (a simple structure/hash) to the array of position rules; NOTE: POSITION RULE objects are used by the show() method to determine the best possible location for a heavyweight item
   * @param objAnchor {Object|jsx3.gui.Event} Either an event or an on-screen HTML element
   * @param strAnchorPoint {String} REQUIRED if @objAnchor is an HTML element; when used, defines one of  the valid 9 compass points: 4 primary: (N, S, E, W); 4 secondary: (NE, SE, SW, NW); and origin: (O). NOTE: it
   *            is from this point (on @objAnchor) that the heavyweight item will try to position itself
   * @param strPoint {String} Defines one of  the valid 9 compass points: 4 primary: (N, S, E, W); 4 secondary: (NE, SE, SW, NW); and origin: (O). NOTE: it
   *            is from this point (on the Heavyweight instance) that the heavyweight item will try to position itself
   * @param intOff {int} offset (in pixels) by which to nudge the vertical placement of the HW instance before displaying (useful for submenus, for example, where their left has a -10px offset to overlay the parent menu item)
   * @return {jsx3.gui.Heavyweight} this object (this)
   */
  Heavyweight_prototype.addYRule = function(objAnchor,strAnchorPoint,strPoint,intOff,bInverse) {
    //get anchor pivot (is this a GUI object or the browser's event object?)
    var intY = (objAnchor instanceof jsx3.gui.Event) ? objAnchor.clientY() : this.getPoint(objAnchor, strAnchorPoint).Y;
    this.addRule(intY, strPoint, intOff, "Y", bInverse);
    return this;
  };

  /**
   * adds a POSITION RULE ruleset (a simple structure/hash) to the array of position rules; NOTE: POSITION RULE objects are used by the show() method to determine the best possible location for a heavyweight item
   * @param intPixel {int} left position (in pixels) for the anchorpoint the heavyweight instance will try to layout in context of
   * @param strPoint {String} Defines one of  the valid 9 compass points: 4 primary: (N, S, E, W); 4 secondary: (NE, SE, SW, NW); and origin: (O). NOTE: it
   *            is from this point (on the Heavyweight instance) that the heavyweight item will try to position itself
   * @param intOff {int} offset (in pixels) by which to nudge the vertical placement of the HW instance before displaying (useful for submenus, for example, where their left has a -10px offset to overlay the parent menu item)
   * @param strAxis {String} character (string) representing whether the rule is for the X or Y axis. Rememeber to capitalize!
   * @return {jsx3.gui.Heavyweight} this object (this)
   */
  Heavyweight_prototype.addRule = function(intPixel, strPoint, intOff, strAxis, bInverse) {
    //add the new event object to the events array for the object
    var objRules = this.getPositionRules();
    var objA = objRules[strAxis];
    objA[objA.length] = {_pixel:intPixel, _offset:intOff, _point:strPoint, _inverse:bInverse};

    //return reference to self to facilitate chaining
    return this;
  };

  /**
   * Returns a POSITION RULE object at the given index; NOTE: POSITION RULE objects are JavaScript objects that implement the following 3 properties: _pixel (the on-screen point around which to pivot/place), _offset (amount to nudge the placement), _point (compass direction)
   * @param intIndex {int} the index (in rank order of execution) of the POSITION RULEing rule set to apply (it is assumed that at least one POSITION RULE ruleset exists)
   * @param strAxis {String} character (string) representing whether the rule is for the X or Y axis. Rememeber to capitalize!
   * @return {String}
   */
  Heavyweight_prototype.getPositionRule = function(intIndex,strAxis) {
    //return the entire array of events bound to this object instance
    return this.getPositionRules()[strAxis][intIndex];
  };

  /**
   * Returns a JavaScript object array (hash).  This hash contains the Y rules and the X rules for positioning the object
   * @return {Object<String, Array>}
   */
  Heavyweight_prototype.getPositionRules = function() {
    //return the structure of rules bound to this HW instance
    if (typeof(this._positionrules) != "object") {
      /* @jsxobf-clobber */
      this._positionrules = {};
      this._positionrules.X = [];
      this._positionrules.Y = [];
    }
    return this._positionrules;
  };

  /**
   * Returns a JavaScript object with properties:  X,Y (Left and Top); relating to the 4 primary (N, S, E, W), 4 secondary (NE, SE, SW, NW), and origin (O) compass positions for O
   * @param objGUI {HTMLElement|jsx3.gui.Block|int} GUI object in the browser DOM (typically an HTML element such as a DIV or SPAN) for which to provide the X,Y for
   * @param strPoint {String} a character denoting one of the valid 9 compass points: 4 primary: (N, S, E, W); 4 secondary: (NE, SE, SW, NW); and origin: (O)
   */
  Heavyweight_prototype.getPoint = function(objGUI, strPoint) {
    if (typeof(objGUI) == "number") return {X:objGUI, Y:objGUI};

    //get the absolute position for this element (heavyweights are always direct children of the first BODY element in an HTML document)
    var objAbs = null;
    if (objGUI instanceof jsx3.gui.Block)
      objAbs = objGUI.getAbsolutePosition(this.getDomParent());
    else
      objAbs = jsx3.html.getRelativePosition(this.getDomParent(), objGUI);

    //return the correct X/Y
    switch(strPoint) {
      case "N":
        return {X:objAbs.L+Math.floor(objAbs.W/2),Y:objAbs.T};
      case "S":
        return {X:objAbs.L+Math.floor(objAbs.W/2),Y:objAbs.T+objAbs.H};
      case "E":
        return {X:objAbs.L+objAbs.W,Y:objAbs.T+Math.floor(objAbs.H/2)};
      case "W":
        return {X:objAbs.L,Y:objAbs.T+Math.floor(objAbs.H/2)};
      case "NE":
        return {X:objAbs.L+objAbs.W,Y:objAbs.T};
      case "SE":
        return {X:objAbs.L+objAbs.W,Y:objAbs.T+objAbs.H};
      case "SW":
        return {X:objAbs.L,Y:objAbs.T+objAbs.H};
      case "NW":
        return {X:objAbs.L,Y:objAbs.T};
      case "O":
        return {X:objAbs.L+Math.floor(objAbs.W/2),Y:objAbs.T+Math.floor(objAbs.H/2)};
    }
  };

  /**
   * converts the object to a string representation more useful than the default implementation provided by the native JS engine
   * @return {String} object profile as a string
   */
  Heavyweight_prototype.toString = function() {
    return this.jsxsuper() + " " + this.getId() + "/" + this._owner;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Heavyweight.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Heavyweight
 * @see jsx3.gui.Heavyweight
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Heavyweight", -, null, function(){});
 */
jsx3.Heavyweight = jsx3.gui.Heavyweight;

/* @JSC :: end */
