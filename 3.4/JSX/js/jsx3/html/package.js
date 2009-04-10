/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Utility methods related to rendering HTML.
 */
jsx3.Package.definePackage('jsx3.html', function(html) {

  var Event = jsx3.gui.Event;

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  html.MODE_IE_QUIRKS = 0;

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  html.MODE_FF_QUIRKS = 1;

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  html.MODE_IE_STRICT = 2;

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  html.MODE_FF_STRICT = 3;

  /**
   * Returns one of four values representing an intersection of the browser type (ff or ie) and the doctype (strict or quirks).
   * @param objGUI {Object} HTML element that will contain a given GI server instance
   * @return {int} one of: Box.MODE_IE_QUIRKS (0), Box.MODE_FF_Quirks (1), Box.MODE_IE_STRICT (2), Box.MODE_FF_STRICT (3)
   * @package
   */
  html.getMode = function(objGUI) {
    if (html._MODE == null) {
      var doc = objGUI != null ? objGUI.ownerDocument : document;
      //use the server container to paint the mode-test objects
      var objBody = objGUI || document.getElementsByTagName("body")[0];

      /* @jsxobf-clobber */
      html._MODE = html.MODE_IE_QUIRKS;
      //check the boxmodel using a textbox (if the textbox grew, mode is mozilla-strict or ie-strict)
      var test1 = '<input type="text" id="_jsx3_gui_painted_box_1" style="position:absolute;top:0px;left:-120px;width:100px;height:30px;padding:8px;margin:0px;"/>';
      jsx3.html.insertAdjacentHTML(objBody, "beforeEnd", test1);

      if (doc.getElementById("_jsx3_gui_painted_box_1").offsetHeight != 30) {
        if (jsx3.CLASS_LOADER.IE) {
          html._MODE = html.MODE_IE_STRICT;
        } else {
          html._MODE = html.MODE_FF_STRICT;
        }
      } else {
        //check the box model using a div (if the div grew, mode is mozilla quirks)
        var test2 = '<div id="_jsx3_gui_painted_box_2" style="position:absolute;top:0px;left:-116px;width:100px;height:24px;padding:8px;"></div>';
        jsx3.html.insertAdjacentHTML(objBody, "beforeEnd", test2);

        if (parseInt(doc.getElementById("_jsx3_gui_painted_box_2").offsetWidth) > 100)
          html._MODE = html.MODE_FF_QUIRKS;
      }
    }

    return html._MODE;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /**
   * Accounts for the scrollbar structure itself, providing how much of the lower portion of the scrollbar is used for padding by the given browser
   * @param intSize {int} the size of the scrollbar.
   * @param strCSS {String} one of: scroll, auto
   * @return {int}
   * @package
   */
  html.getScrollSizeOffset = function(intSize,strCSS) {
    //ie only offsets the scroll handles when in 'scroll' mode
    return (strCSS == "scroll") ? intSize : 0;
  };

  /**
   * Binds the event to the given DOM object.
   * @param objDOM {Object} Native HTML element
   * @param strName {String} Event name. For example, onclick, onfocus
   * @param objFn {Object} function, function literal
   * @package
   */
  html.addEventListener = function(objDOM, strName, objFn) {
    objDOM[strName] = typeof(objFn) == "function" ? objFn : new Function(objFn);
    // NOTE: attachEvent doesn't work because "this" does not resolve in functions that it executes ... lame
    /*  Could do this but it might cause a worse memory leak in IE ...
    var funct =  typeof(objFn) == "function" ? objFn : new Function(objFn);
    objDOM.attachEvent(strName, function() { funct.apply(objDOM); } );
    */
    // objDOM.attachEvent(strName, typeof(objFn) == "function" ? objFn : new Function(objFn));
  };

  /**
   * Removes the event to the given DOM object.
   * @param objDOM {Object} Native HTML element
   * @param strName {String} Event name. For example, onclick, onfocus
   * @param objFn {Object} function, function literal
   * @package
   */
  html.removeEventListener = function(objDOM, strName, objFn) {
    objDOM[strName] = null;
    // NOTE: attachEvent doesn't work because "this" does not resolve in functions that it executes ... lame
    // objDOM.detachEvent(strName, objFn);
  };

  /**
   * Creates a new style rule and adds to the collection of style rules
   * @param selector {String} style name.  For example: .heavyWeight or .redBoldItem
   * @param declaration {String} For example: color:red;background-color;orange;
   * @param declaration {Object} Optionally provide to update the appropriate document instance
   * @package
   */
  html.createRule = function(selector,declaration,objDocument) {
    if(!objDocument) objDocument = document;
    var head = objDocument.getElementsByTagName("head")[0];
    var objStyle = (typeof objDocument.createElementNS != "undefined") ?
      objDocument.createElementNS("http://www.w3.org/1999/xhtml", "style") :
      objDocument.createElement("style");
    objStyle.setAttribute("type", "text/css");
    objStyle.setAttribute("media", "screen");
    head.appendChild(objStyle);
    var objNew = objDocument.styleSheets[objDocument.styleSheets.length - 1];
    if(typeof objNew.addRule == "object") {
      objNew.addRule(selector, declaration);
    }
  };

  /**
   * Gets the first instance of the given CSS rule matching the given ID
   * @param strRuleName {String} rule name. For example: <code>img.big</code> or <code>.big</code> or <code>#myid</code>
   * @package
   */
  html.getRuleByName = function(strRuleName) {
    var mysheets = document.styleSheets;
    for(var j=0;j<mysheets.length;j++) {
      var mysheet = mysheets[j];
      for (var i=0; i<mysheet.rules.length; i++){
        if(mysheet.rules[i].selectorText+"" == strRuleName) {
          return mysheet.rules[i];
        }
      }
    }
    return null;
  };

  /**
   * Copies the given string of text to the clipboard
   * @param strText {String} text to copy
   */
  html.copy = function(strText) {
    //for now only allow the text data type
    window.clipboardData.setData('text',strText);
  };

  /**
   * Returns the current text content of the clipboard
   * @return {String}
   */
  html.paste = function() {
    //for now only allow the text data type
    return window.clipboardData.getData('text');
  };

  /**
   * returns the position of a screen element relative to another screen element.
   * @param objRoot {object} the screen element relative to which to judge the position of <code>objGUI</code>
   * @param objGUI {object} the screen element whose position to judge relative to <code>objRoot</code>
   * @return {object} object with the properties: L, T, W, H (corresponding to left, top width, height)
   * @package
   */
  html.getRelativePosition = function(objRoot, objGUI) {
    var oD = html.findPos(objGUI,objRoot);
    return {L:oD.l,T:oD.t,W:objGUI.offsetWidth, H:objGUI.offsetHeight};
  };

  /* @jsxobf-clobber */
  html.findPos = function(obj,objParent) {
    var curleft = 0;
    var curtop = 0;
    var intLeftBorder = 0;
    var intTopBorder = 0;
    var bW;

    if(obj.offsetParent) {
      while(1 && obj != objParent) {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;

        //calculate the borders if the parent exists
        if(obj.offsetParent) {
          bW = obj.offsetParent.style.borderLeftWidth ? parseInt(obj.offsetParent.style.borderLeftWidth) : 0;
          if(!isNaN(bW)) intLeftBorder += bW;
          bW = obj.offsetParent.style.borderTopWidth ? parseInt(obj.offsetParent.style.borderTopWidth) : 0;
          if(!isNaN(bW)) intTopBorder += bW;
        }

        if(!obj.offsetParent)
          break;
        obj = obj.offsetParent;

        //account for the scrollposition for the parent
        curleft -= obj.scrollLeft;
        curtop -= obj.scrollTop;
      }
    } else if(obj.x) {
      curleft += obj.x;
      curtop += obj.y;
    }
    return {l:curleft+intLeftBorder,t:curtop+intTopBorder};
  };

  /**
   * reveals a DOM element by scrolling the necessary parent DIVs and SPANs
   * @param objGUI {dom} the DOM element to reveal
   * @param objRoot {dom} the last parent to reveal relative to
   * @param intPaddingX {int} the desired horizontal pixel padding after revealing, if null then no horizontal repositioning if at least part of the DOM element is showing
   * @param intPaddingY {int} the desired vertical pixel padding after revealing, if null then no vertical repositioning if at least part of the DOM element is showing
   * @package
   */
  html.scrollIntoView = function(objGUI, objRoot, intPaddingX, intPaddingY) {
    var objNode = objGUI.parentNode;

    while (objNode != null) {
      var tagName = objNode.tagName.toLowerCase();
      if (tagName == "span" || tagName == "div") {
        var relPos = html.getRelativePosition(objNode, objGUI);

        // make horizontal dimension visible
        // left edge of child off view to the right
        if (objNode.clientWidth + objNode.scrollLeft <= relPos.L) {
          objNode.scrollLeft = (relPos.L + objGUI.offsetWidth) - objNode.clientWidth + intPaddingX;
        }
        // right edge of child off view to the right
        else if (objNode.clientWidth + objNode.scrollLeft < relPos.L + objGUI.offsetWidth && (intPaddingX != null)) {
          objNode.scrollLeft = (relPos.L + objGUI.offsetWidth) - objNode.clientWidth + intPaddingX;
        }
        // right edge of child off view to the left
        if (objNode.scrollLeft >= relPos.L + objGUI.offsetWidth) {
          objNode.scrollLeft = relPos.L - intPaddingX;
        }
        // left edge of child off view to the left
        else if (objNode.scrollLeft > relPos.L && intPaddingX != null) {
          objNode.scrollLeft = relPos.L - intPaddingX;
        }

        // make vertical dimension visible
        // top edge of child off view to the bottom
        if (objNode.clientHeight + objNode.scrollTop <= relPos.T) {
          objNode.scrollTop = (relPos.T + objGUI.offsetHeight) - objNode.clientHeight + intPaddingY;
        }
        // bottom edge of child off view to the bottom
        else if (objNode.clientHeight + objNode.scrollTop < relPos.T + objGUI.offsetHeight && (intPaddingY != null)) {
          objNode.scrollTop = (relPos.T + objGUI.offsetHeight) - objNode.clientHeight + intPaddingY;
        }
        // bottom edge of child off view to the top
        if (objNode.scrollTop >= relPos.T + objGUI.offsetHeight) {
          objNode.scrollTop = relPos.T - intPaddingY;
        }
        // top edge of child off view to the top
        else if (objNode.scrollTop > relPos.T && intPaddingY != null) {
          objNode.scrollTop = relPos.T - intPaddingY;
        }
      }

      if (objNode == objRoot) break;

      objNode = objNode.parentNode;
    }
  };

  /**
   * Returns the serialized HTML representation of <code>objElement</code>.
   * @param objElement {HTMLElement}
   */
  html.getOuterHTML = function(objElement) {
    return objElement.outerHTML;
  };

  /**
   * Replaces <code>objElement</code> with an HTML snippet, <code>strHTML</code>.
   * @param objElement {HTMLElement}
   * @param strHTML {String}
   */
  html.setOuterHTML = function(objElement, strHTML) {
    return objElement.outerHTML = strHTML;
  };

  /**
   * Replaces the children of <code>objElement</code> with a text node of value <code>strText</code>.
   * @param objElement {HTMLElement}
   * @param strText {String}
   */
  html.setInnerText = function(objElement, strText) {
    return objElement.innerText = strText;
  };

  /**
   * @package
   */
  html.insertAdjacentHTML = function(objElement, strWhere, strHTML) {
    objElement.insertAdjacentHTML(strWhere, strHTML);
    return strHTML;
  };

  /**
   * @package
   */
  html.updateCSSOpacity = function(objGUI, fltOpacity) {
    objGUI.style.filter = "alpha(opacity=" + ((isNaN(fltOpacity)) ? fltOpacity : fltOpacity * 100) + ")";
  };

  /**
   * gets the CSS string appropriate to generate an opacity filter
   * @param dblPct {Number} inclusively between 0 and 1. For example: 0, .5, .95, 1
   * @return {object} CSS string
   * @package
   */
  html.getCSSOpacity = function(dblPct) {
    return "filter:alpha(opacity=" + ((isNaN(dblPct)) ? dblPct:dblPct*100)+ ");";
  };

  html._FOCUSABLE = {input:true, textarea:true, select:true, body:true, a:true, img:true, button:true, frame:true,
      iframe:true, object:true};

  /**
   * @package
   */
  html.isFocusable = function(objGUI) {
    return objGUI.focus != null &&
        (parseInt(objGUI.getAttribute("jsxtabindex")) >= 0 || html._FOCUSABLE[objGUI.tagName.toLowerCase()]);
  };

/* @JSC */ } else {

  html.getScrollSizeOffset = function(intSize,strCSS) {
    //firefox never offsets the scroll handles
    return 0;
  };

  html.addEventListener = function(objDOM, strName, objFn) {
    strName = strName.replace(/^on/,"");
    objDOM.addEventListener(strName, typeof(objFn) == "function" ? objFn : new Function("event", objFn), false);
  };

  html.removeEventListener = function(objDOM,strName,objFn) {
    strName = strName.replace(/^on/,"");
    objDOM.removeEventListener(strName, objFn, false);
  };

  html._FOCUSABLE = {input:true, textarea:true, select:true, body:true, a:true, img:true, button:true, frame:true,
      iframe:true, object:true};

  html.isFocusable = function(objGUI) {
    return objGUI.focus != null &&
        (parseInt(objGUI.tabIndex) >= 0 || html._FOCUSABLE[objGUI.tagName.toLowerCase()]);
  };

  html.createRule = function(selector,declaration,objDocument) {
    if(!objDocument) objDocument = document;
    var head = objDocument.getElementsByTagName("head")[0];
    var objStyle = (typeof objDocument.createElementNS != "undefined") ?
      objDocument.createElementNS("http://www.w3.org/1999/xhtml", "style") :
      objDocument.createElement("style");
    var styleRule = objDocument.createTextNode(selector + " {" + declaration + "}");
    objStyle.appendChild(styleRule);
    objStyle.setAttribute("type", "text/css");
    objStyle.setAttribute("media", "screen");
    head.appendChild(objStyle);
  };

  html.getRuleByName = function(strRuleName) {
    var mysheets = document.styleSheets;
    for(var j=0;j<mysheets.length;j++) {
      var mysheet = mysheets[j];
      for (var i=0; i<mysheet.cssRules.length; i++){
        if(mysheet.cssRules[i].selectorText == strRuleName)
          return mysheet.cssRules[i];
      }
    }
    return null;
  };

  html.copy = function(strText) {
    //get an instance of the clipboard
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
    var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
    if(clip) {
      //make sure clipboard is accessible
      var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
      if(trans) {
        //specify Unicode as the string format
        trans.addDataFlavor('text/unicode');

        //instance a native String
        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        str.data = strText;

        //(is this due to unicode double-byte?)
        trans.setTransferData("text/unicode",str,strText.length*2);

        var clipid = Components.interfaces.nsIClipboard;
        clip.setData(trans,null,clipid.kGlobalClipboard);
      }
    }
  };

  html.paste = function() {
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
    if(clip) {
      var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
      if(trans) {
        trans.addDataFlavor("text/unicode");
        clip.getData(trans,clip.kGlobalClipboard);
        var str = {};
        var strLength = {};
        trans.getTransferData("text/unicode",str,strLength);

        if(str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
        return ((str) ? str.data.substring(0,strLength.value / 2) : null);
      }
    }
    return null;
  };

  html.getRelativePosition = function(objRoot, objGUI) {
    //initialize
    var objDimension = {W:objGUI.offsetWidth, H:objGUI.offsetHeight};
    var intLeft = objGUI.scrollLeft;
    var intTop = objGUI.scrollTop;
    var intLeftBorder = 0;
    var intTopBorder = 0;
    var ot = objGUI.offsetTop;
    var ol = objGUI.offsetLeft;
    var sl = objGUI;
    var sht = 0;
    var shl = 0;
    var bW;

    //account for initial scroll offset (while statement below starts with parent, not self) as well as border
    if(objGUI.offsetParent) {
      shl -= objGUI.offsetParent.scrollLeft;
      sht -= objGUI.offsetParent.scrollTop;

      bW = objGUI.offsetParent.style.borderLeftWidth ? parseInt(objGUI.offsetParent.style.borderLeftWidth) : 0;
      if(!isNaN(bW)) intLeftBorder += bW;
      bW = objGUI.offsetParent.style.borderTopWidth ? parseInt(objGUI.offsetParent.style.borderTopWidth) : 0;
      if(!isNaN(bW)) intTopBorder += bW;
    }

    while((objGUI = objGUI.offsetParent) != null && objGUI != objRoot) {
      ot += objGUI.offsetTop;
      ol += objGUI.offsetLeft;

      if(objGUI.offsetParent) {
        //calculate the borders if the parent exists
        bW = objGUI.offsetParent.style.borderLeftWidth ? parseInt(objGUI.offsetParent.style.borderLeftWidth) : 0;
        if(!isNaN(bW)) intLeftBorder += bW;
        bW = objGUI.offsetParent.style.borderTopWidth ? parseInt(objGUI.offsetParent.style.borderTopWidth) : 0;
        if(!isNaN(bW)) intTopBorder += bW;
        //account for scrolling parent
        shl += objGUI.offsetParent.scrollLeft;
        sht += objGUI.offsetParent.scrollTop;
      }

      if(objGUI.offsetParent && objGUI.offsetParent.offsetParent) {
        //account for the scrollposition for the parent
        var scrollTop = objGUI.offsetParent.scrollTop;
        if(!isNaN(scrollTop)) sht -= scrollTop;
        var scrollLeft = objGUI.offsetParent.scrollLeft;
        if(!isNaN(scrollLeft)) shl -= scrollLeft;
      }
    }
    objGUI = sl;

    while((objGUI = objGUI.parentNode) != null && objGUI != objRoot) {
      if(objGUI.parentNode && objGUI.parentNode.parentNode && !(objGUI.parentNode.tagName && objGUI.parentNode.tagName.toUpperCase() == "BODY")){
        var scrollTop = objGUI.parentNode.scrollTop;
        if(!isNaN(scrollTop) && scrollTop > 0 ) sht -= scrollTop;
        var scrollLeft = objGUI.parentNode.scrollLeft;
        if(!isNaN(scrollLeft) && scrollLeft > 0 ) shl -= scrollLeft;
      }
    }

    //Formula: intLeft + 2(intLeftBorder) (what the hell???)
    objDimension.L = ol + shl + (2*intLeftBorder);
    objDimension.T = ot + sht + (2*intTopBorder);
    return objDimension;
  };

  html.scrollIntoView = function(objGUI, objRoot, intPaddingX, intPaddingY) {
    var objNode = objGUI.parentNode;

    while (objNode != null) {
      var tagName = objNode.tagName.toLowerCase();
      if (tagName == "span" || tagName == "div") {
        var relPos = html.getRelativePosition(objNode, objGUI);

        // make horizontal dimension visible
        // left edge of child off view to the right
        if (objNode.clientWidth + objNode.scrollLeft <= relPos.L) {
          objNode.scrollLeft = (relPos.L + objGUI.offsetWidth) - objNode.clientWidth + intPaddingX;
        }
        // right edge of child off view to the right
        else if (objNode.clientWidth + objNode.scrollLeft < relPos.L + objGUI.offsetWidth && (intPaddingX != null)) {
          objNode.scrollLeft = (relPos.L + objGUI.offsetWidth) - objNode.clientWidth + intPaddingX;
        }
        // right edge of child off view to the left
        if (objNode.scrollLeft >= relPos.L + objGUI.offsetWidth) {
          objNode.scrollLeft = relPos.L - intPaddingX;
        }
        // left edge of child off view to the left
        else if (objNode.scrollLeft > relPos.L && intPaddingX != null) {
          objNode.scrollLeft = relPos.L - intPaddingX;
        }

        // make vertical dimension visible
        // top edge of child off view to the bottom
        if (objNode.clientHeight + objNode.scrollTop <= relPos.T) {
          objNode.scrollTop = (relPos.T + objGUI.offsetHeight) - objNode.clientHeight + intPaddingY;
        }
        // bottom edge of child off view to the bottom
        else if (objNode.clientHeight + objNode.scrollTop < relPos.T + objGUI.offsetHeight && (intPaddingY != null)) {
          objNode.scrollTop = (relPos.T + objGUI.offsetHeight) - objNode.clientHeight + intPaddingY;
        }
        // bottom edge of child off view to the top
        if (objNode.scrollTop >= relPos.T + objGUI.offsetHeight) {
          objNode.scrollTop = relPos.T - intPaddingY;
        }
        // top edge of child off view to the top
        else if (objNode.scrollTop > relPos.T && intPaddingY != null) {
          objNode.scrollTop = relPos.T - intPaddingY;
        }
      }

      if (objNode == objRoot) break;

      objNode = objNode.parentNode;
    }
  };

  html.getOuterHTML = function(objElement) {
    if (window.SVGElement && objElement instanceof SVGElement) {
      return (new XMLSerializer()).serializeToString(objElement);
    } else {
      var str = [];

      switch (objElement.nodeType) {
        case 1: // ELEMENT_NODE
          str[str.length] = "<" + objElement.nodeName.toLowerCase();

          if (objElement.namespaceURI)
            str[str.length] = ' xmlns="' + objElement.namespaceURI + '"';

          for (var i=0; i<objElement.attributes.length; i++) {
            var item = objElement.attributes.item(i);
            if (item.nodeValue != null)
              str[str.length] = " " + item.nodeName + "=\"" + item.nodeValue + "\"";
          }

          if (objElement.childNodes.length == 0)// && leafElems[node.nodeName])
            str[str.length] = "/>";
          else {
            str[str.length] = ">" + objElement.innerHTML + "</" + objElement.nodeName.toLowerCase() + ">";
          }
          break;

        case 3:  //TEXT_NODE
          str[str.length] = objElement.nodeValue;
          break;

        case 4: // CDATA_SECTION_NODE
          str[str.length] = "<![CDATA[" + objElement.nodeValue + "]]>";
          break;

        case 5: // ENTITY_REFERENCE_NODE
          str[str.length] = "&" + objElement.nodeName + ";";
          break;

        case 8: // COMMENT_NODE
          str[str.length] = "<!--" + objElement.nodeValue + "-->";
          break;
      }

      return str.join("");
    }
  };

  html.setOuterHTML = function(objElement, strHTML) {
    if (window.SVGElement && objElement instanceof SVGElement) {
      if (! strHTML) {
        objElement.parentNode.removeChild(objElement);
      } else {
        var r = objElement.ownerDocument.createRange();
        r.setStartBefore(objElement);
        var df = r.createContextualFragment(strHTML);
        objElement.parentNode.replaceChild(df, objElement);
      }
    } else {
      try {
        var r = objElement.ownerDocument.createRange();
        r.setStartBefore(objElement);
        var df = r.createContextualFragment(strHTML);
        objElement.parentNode.replaceChild(df, objElement);
      } catch (e) {
        var trunc = typeof(strHTML) == "string" ? strHTML.substring(0, 50) : strHTML;
        throw new jsx3.Exception(jsx3._msg("html.set_outer", objElement, trunc), jsx3.NativeError.wrap(e));
      }
    }
  };

  html.setInnerText = function(objElement, strText) {
    for (var i = objElement.childNodes.length - 1; i >= 0; i--)
      objElement.removeChild(objElement.childNodes[i]);

    objElement.appendChild(objElement.ownerDocument.createTextNode(strText));
  };

  html.insertAdjacentHTML = function(objElement, strWhere, strHTML) {
    if (strWhere.toLowerCase() == "beforeend") {
      var r = objElement.ownerDocument.createRange();
      r.setStartAfter(objElement);
      var df = r.createContextualFragment(strHTML);
      objElement.appendChild(df);
      return strHTML;
    } else if (strWhere.toLowerCase() == "beforebegin") {
      var r = objElement.ownerDocument.createRange();
      r.setStartBefore(objElement);
      var df = r.createContextualFragment(strHTML);
      objElement.parentNode.insertBefore(df,objElement);
      return strHTML;
    } else {
      throw new jsx3.Exception(jsx3._msg("html.adj", strWhere));
    }
  };

  html.updateCSSOpacity = function(objGUI, fltOpacity) {
    objGUI.style.MozOpacity = fltOpacity.toString();
  };

  html.getCSSOpacity = function(dblPct) {
    return "-moz-opacity:" + dblPct + ";";
  };

/* @JSC */ }

  /**
   * gets the CSS string appropriate to generate a top-down or left-to-right fade, appropriate for a windowbar
   * @param bLeftRight {Boolean} if true, returns the CSS property required to show a left-to-right fade within a narrow column (otherwise a top-down fade in a short row)
   * @return {object} CSS string
   * @package
   */
  html.getCSSFade = function(bLeftRight) {
    return html.getCSSPNG((bLeftRight) ? jsx3.resolveURI("jsx:///images/icons/h.png") :jsx3.resolveURI("jsx:///images/icons/v.png"));
  };


/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {

  /**
   * gets the CSS string appropriate to render a png via CSS
   * @param strResolvedURL {String} fully resolved url for the png
   * @return {object} CSS string
   * @package
   */
  html.getCSSPNG = function(strResolvedURL) {
    return "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + strResolvedURL + "', sizingMethod='scale');";
  };

/* @JSC */ } else {

  html.getCSSPNG = function(strResolvedURL) {
    return "background-image:url(" + strResolvedURL + ");";
  };

/* @JSC */ }

  /**
   * Traverses the browser DOM up from <code>objGUI</code> and returns the first GI DOM node that contains
   * <code>objGUI</code>.
   * @param objGUI {HTMLElement}
   * @return {jsx3.app.Model}
   */
  html.getJSXParent = function(objGUI) {
    while (objGUI != null) {
      if (objGUI.id && objGUI.id.indexOf("_jsx_") == 0) {
        var myJSX = jsx3.GO(objGUI.id);
        if (myJSX != null)
          return myJSX;
      }
      objGUI = objGUI.parentNode;
    }
    return null;
  };

  /**
   * @package
   */
  html.removeOutputEscaping = function(objGUI) {
    var queue = jsx3.util.List.wrap([objGUI]);
    while (queue.size() > 0) {
      var node = queue.removeAt(0);
      if (node.nodeName.toLowerCase() == "span" && node.className == "disable-output-escp") {
        node.innerHTML = node.innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").
            replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&([a-zA-Z_]+);/g, html._entNameToCode);
        node.className = "";
      } else {
        queue.addAll(node.childNodes);
      }
    }
  };

  /**
   * @package
   */
  html.removeOutputEscapingSpan = function(strHTML) {
    return strHTML.replace(/<span class="disable-output-escp">([\s\S]*?)<\/span>/g,
        function(strMatch, text) {
          return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').
              replace(/&amp;/g, "&").replace(/&([a-zA-Z_]+);/g, html._entNameToCode);
        });
  };

  /** @private @jsxobf-clobber */
  html._ENT_MAP = {
    nbsp:160, copy:169, reg:174, deg:176, middot:183, le:8804, ge:8805, lt:60, gt:62, euro:8364, ndash:8211,
    mdash:8212, lsquo:8216, rsquo:8217, ldquo:8220, rdquo:8221, permil:8240
/* this would be the entire map:
    nbsp:160, iexcl:161, cent:162, pound:163, curren:164, yen:165, brvbar:166, sect:167, uml:168, copy:169, ordf:170,
    laquo:171, not:172, shy:173, reg:174, macr:175, deg:176, plusmn:177, sup2:178, sup3:179, acute:180, micro:181,
    para:182, middot:183, cedil:184, sup1:185, ordm:186, raquo:187, frac14:188, frac12:189, frac34:190, iquest:191,
    Agrave:192, Aacute:193, Acirc:194, Atilde:195, Auml:196, Aring:197, AElig:198, Ccedil:199, Egrave:200, Eacute:201,
    Ecirc:202, Euml:203, Igrave:204, Iacute:205, Icirc:206, Iuml:207, ETH:208, Ntilde:209, Ograve:210, Oacute:211,
    Ocirc:212, Otilde:213, Ouml:214, times:215, Oslash:216, Ugrave:217, Uacute:218, Ucirc:219, Uuml:220, Yacute:221,
    THORN:222, szlig:223, agrave:224, aacute:225, acirc:226, atilde:227, auml:228, aring:229, aelig:230, ccedil:231,
    egrave:232, eacute:233, ecirc:234, euml:235, igrave:236, iacute:237, icirc:238, iuml:239, eth:240, ntilde:241,
    ograve:242, oacute:243, ocirc:244, otilde:245, ouml:246, divide:247, oslash:248, ugrave:249, uacute:250, ucirc:251,
    uuml:252, yacute:253, thorn:254, yuml:255, fnof:402, Alpha:913, Beta:914, Gamma:915, Delta:916, Epsilon:917,
    Zeta:918, Eta:919, Theta:920, Iota:921, Kappa:922, Lambda:923, Mu:924, Nu:925, Xi:926, Omicron:927, Pi:928,
    Rho:929, Sigma:931, Tau:932, Upsilon:933, Phi:934, Chi:935, Psi:936, Omega:937, beta:946, gamma:947, delta:948,
    epsilon:949, zeta:950, eta:951, theta:952, iota:953, kappa:954, lambda:955, mu:956, nu:957, xi:958, omicron:959,
    pi:960, rho:961, sigmaf:962, sigma:963, tau:964, upsilon:965, phi:966, chi:967, psi:968, omega:969, thetasym:977,
    upsih:978, piv:982, bull:8226, hellip:8230, prime:8242, Prime:8243, oline:8254, frasl:8260, weierp:8472, image:8465,
    real:8476, trade:8482, alefsym:8501, larr:8592, uarr:8593, rarr:8594, darr:8595, harr:8596, crarr:8629, lArr:8656,
    uArr:8657, rArr:8658, dArr:8659, hArr:8660, forall:8704, part:8706, exist:8707, empty:8709, nabla:8711, isin:8712,
    notin:8713, ni:8715, prod:8719, sum:8721, minus:8722, lowast:8727, radic:8730, prop:8733, infin:8734, ang:8736,
    and:8743, or:8744, cap:8745, cup:8746, int:8747, there4:8756, sim:8764, cong:8773, asymp:8776, ne:8800, equiv:8801,
    le:8804, ge:8805, sub:8834, sup:8835, nsub:8836, sube:8838, supe:8839, oplus:8853, otimes:8855, perp:8869,
    sdot:8901, lceil:8968, rceil:8969, lfloor:8970, rfloor:8971, lang:9001, rang:9002, loz:9674, spades:9824,
    clubs:9827, hearts:9829, diams:9830, amp:38, lt:60, gt:62, OElig:338, oelig:339, Scaron:352, scaron:353, Yuml:376,
    circ:710, tilde:732, ensp:8194, emsp:8195, thinsp:8201, zwnj:8204, zwj:8205, lrm:8206, rlm:8207, ndash:8211,
    mdash:8212, lsquo:8216, rsquo:8217, sbquo:8218, ldquo:8220, rdquo:8221, bdquo:8222, dagger:8224, Dagger:8225,
    permil:8240, lsaquo:8249, rsaquo:8250, euro:8364
*/
  };

  /** @private @jsxobf-clobber */
  html._entNameToCode = function(strMatch, strName) {
    var code = html._ENT_MAP[strName];
    return code ? ("&#" + code + ";") : strMatch;
  };

  /** @private @jsxobf-clobber */
  html._IMAGE_LOADER_ID = "jsx_image_loader";

  /**
   * Pre-loads images into the HTML page so that they are available immediately when a control paints them.
   * @param varImages {String...|jsx3.net.URI...|Array<String|jsx3.net.URI>} one or more relative URIs to image files. Each URI will be resolved against the
   *    default resolver.
   */
  html.loadImages = function(varImages) {
    var imageDiv = document.getElementById(html._IMAGE_LOADER_ID);
    if (imageDiv == null) {
      var body = document.getElementsByTagName("body")[0];
      if (body) {
        imageDiv = document.createElement("div");
        imageDiv.id = html._IMAGE_LOADER_ID;
        imageDiv.style.display = "none";
        body.appendChild(imageDiv);
      } else {
        return;
      }
    }

    var a = varImages instanceof Array ? varImages : arguments;
    for (var i = 0; i < a.length; i++) {
      if (!a[i]) continue;
      var src = jsx3.resolveURI(a[i]);
      var id = html._IMAGE_LOADER_ID + "_" + src;
      if (document.getElementById(id) == null) {
        var image = document.createElement("img");
        image.setAttribute("id", id);
        image.setAttribute("src", src);
        imageDiv.appendChild(image);
      }
    }
  };

  /**
   * Updates a given style on a named CSS rule
   * @param strRuleName {String} rule name. For example: <code>img.big</code> or <code>.big</code> or <code>#myid</code>
   * @param strStyleName {String} name of style.  For example: <code>backgroundColor</code>
   * @param strValue {String} For example: <code>orange</code>
   * @package
   */
  html.updateRule = function(strRuleName, strStyleName, strValue) {
    var objRule = jsx3.html.getRuleByName(strRuleName);
    if(objRule) objRule.style[strStyleName] = strValue;
  };

  /** @package */
  html.getElementById = function(objRoot, strId, bDepthFirst) {
    return this.findElements(objRoot, function(x) { return x.id == strId; }, bDepthFirst, false, false, true);
  };

  /** @package */
  html.getElementByTagName = function(objRoot, strTagName, bDepthFirst) {
    strTagName = strTagName.toLowerCase();
    return this.findElements(objRoot, function(x) { return x.tagName.toLowerCase() == strTagName; },
        bDepthFirst, false, false, true);
  };

  /** @package */
  html.getElementsByTagName = function(objRoot, strTagName, bDepthFirst) {
    strTagName = strTagName.toLowerCase();
    return this.findElements(objRoot, function(x) { return x.tagName.toLowerCase() == strTagName; },
        bDepthFirst, true, false, true);
  };

  /** @package */
  html.findElements = function(objRoot, fctTest, bDepthFirst, bMultiple, bShallow, bIncludeSelf) {
    var fctPush = bDepthFirst ? 'unshift' : 'push';
    var matches = bMultiple ? [] : null;
    var list = bIncludeSelf ? [objRoot] : this.nodesToArray(objRoot.childNodes);

    while (list.length > 0) {
      var node = list.shift();

      if (fctTest.call(null, node)) {
        if (bMultiple)
          matches[matches.length] = node;
        else
          return node;
      }

      if (! bShallow)
        list[fctPush].apply(list, this.nodesToArray(node.childNodes));
    }

    return matches;
  };

  /** @package */
  html.getElmUpByTagName = function(objStart, strTagName, bIncludeSelf) {
    return html.findElementUp(objStart, function(x) { return x.nodeName.toLowerCase() == strTagName; }, bIncludeSelf);
  };

  /** @package */
  html.findElementUp = function(objStart, fctTest, bIncludeSelf) {
    var objRoot = objStart.ownerDocument.documentElement;
    var node = bIncludeSelf ? objStart : objStart.parentNode;
    while (node != null) {
      if (fctTest.call(null, node))
        return node;
      if (node == objRoot) break;
      node = node.parentNode;
    }
    return null;
  };

  /** @package */
  html.selectSingleElm = function(objRoot, args) {
    var index = 1, arrArgs = arguments;
    if (arguments.length == 2) {
      if (typeof(args) == "string") {
        index = 0;
        arrArgs = args.split(/\//g);
      } else if (args instanceof Array) {
        index = 0;
        arrArgs = args;
      }
    }

    var node = objRoot;
    for (var i = index; node != null && i < arrArgs.length; i++) {
      var token = arrArgs[i];
      if (!(isNaN(token))) {
        var n = Number(token);
        var ct = node.childNodes.length;
        var realIndex = 0, elmFound = 0;
        for (; realIndex < ct && elmFound < n; realIndex++) {
          if (node.childNodes[realIndex].nodeType == 1)
            elmFound++;
        }
        node = node.childNodes[realIndex];
      } else {
        throw new jsx3.Exception();
      }
    }

    return node;
  };

  /** @package */
  html.nodesToArray = function(nodes) {
    var a = new Array(nodes.length);
    for (var i = 0; i < nodes.length; i++)
      a[i] = nodes[i];
    return a;
  };

  /**
   * @package
   */
  html.getSelection = function(objTextElm) {
    return new html.Selection(objTextElm);
  };

  /**
   * Focuses the next HTML element that should receive focus. The objEvent should be a native browser
   * key down event with a key of TAB.
   * @package
   */
  html.focusNext = function(objGUI, objEvent) {
    var last = objGUI;
    while (last.lastChild) last = last.lastChild;
    while (!html.isFocusable(last) && last != objGUI)
      last = last.previousSibling || last.parentNode;

    if (last != objGUI || html.isFocusable(last)) {
//      jsx3.log("focusing next of: " + html.getOuterHTML(last));
      if (last.onfocus != null) {
        var temp = last.onfocus;
        last.onfocus = null;
        last.focus();
        jsx3.sleep(function(){last.onfocus = temp;});
      } else {
        last.focus();
      }
    }
  };

  /**
   * Focuses the previous HTML element that should receive focus. The objEvent should be a native browser
   * key down event with a key of shift+TAB.
   * @package
   */
  html.focusPrevious = function(objGUI, objEvent) {
    var first = this.findElements(objGUI, function(x) { return html.isFocusable(x); }, true, false, false, true);
    if (first != null) {
//      jsx3.log("focusing previous of: " + html.getOuterHTML(first));
      if (first.onfocus != null) {
        var temp = first.onfocus;
        first.onfocus = null;
        first.focus();
        jsx3.sleep(function(){first.onfocus = temp;});
      } else {
        first.focus();
      }
    }
  };

});

/**
 * @package
 */
jsx3.Class.defineClass('jsx3.html.Selection', null, null, function(Selection, Selection_prototype) {

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  Selection_prototype.init = function(objTextElm) {
    /* @jsxobf-clobber */
    this._selection = objTextElm.ownerDocument.selection.createRange().duplicate();
    /* @jsxobf-clobber */
    this._input = objTextElm;
  };

  Selection_prototype.getStartIndex = function() {
    var range = this._input.ownerDocument.selection.createRange();
    var dupRange = null;
    if (this._input.tagName.toLowerCase() == "textarea") {
      dupRange = range.duplicate();
      dupRange.moveToElementText(this._input);
    } else { // tagName == "input"
      dupRange = this._input.createTextRange();
    }
    dupRange.setEndPoint('EndToEnd', range);
    return dupRange.text.length - range.text.length;
  };

  Selection_prototype.getEndIndex = function() {
    var range = this._input.ownerDocument.selection.createRange();
    var dupRange = null;
    if (this._input.tagName.toLowerCase() == "textarea") {
      dupRange = range.duplicate();
      dupRange.moveToElementText(this._input);
    } else { // tagName == "input"
      dupRange = this._input.createTextRange();
    }
    dupRange.setEndPoint('EndToEnd', range);
    return dupRange.text.length;
  };

  Selection_prototype.setRange = function(intStart, intEnd) {
    var value = this._input.value;
//    jsx3.log("set range to {" + intStart + "," + intEnd + "} " +
//        value.substring(intStart-10, intStart) + "|" + value.substring(intStart, intEnd) +  "|" +
//        value.substring(intEnd, intEnd + 10));
    var regexp = /\r\n|\r|\n/g;
    var origEnd = intEnd;
    while (regexp.test(value) && regexp.lastIndex <= origEnd) {
      intStart -= 1;
      intEnd -= 1;
    }
//    jsx3.log("adjust range to {" + intStart + "," + intEnd + "}");

    var range = this._input.createTextRange();
    range.collapse(true);
    range.moveStart("character", intStart);
    range.moveEnd("character", intEnd - intStart);
    range.select();
  };

  Selection_prototype.getOffsetLeft = function() {
    return this._selection.offsetLeft;
  };

  Selection_prototype.getOffsetTop = function() {
    return this._selection.offsetTop;
  };

  Selection_prototype.getText = function() {
    return this._selection.text;
  };

  Selection_prototype.setText = function(strText) {
    this._selection.text = strText;
  };

  Selection_prototype.insertCaret = function(strWhere) {
    if (strWhere == "end") {
      this._selection.collapse();
      this._selection.select();
    } else {
      throw new jsx3.Exception();
    }
  };

/* @JSC */ } else {

  Selection_prototype.init = function(objTextElm) {
    /* @jsxobf-clobber */
    this._selection = {elm:objTextElm, start:objTextElm.selectionStart, end:objTextElm.selectionEnd,
        scrollt:objTextElm.scrollTop, scrolll:objTextElm.scrollLeft};
  };

  Selection_prototype.getStartIndex = function() {
    return this._selection.start;
  };

  Selection_prototype.getEndIndex = function() {
    return this._selection.end;
  };

  Selection_prototype.setRange = function(intStart, intEnd) {
    this._selection.start = intStart;
    this._selection.end = intEnd;
    this._selection.elm.setSelectionRange(intStart, intEnd);
  };

  Selection_prototype.getOffsetLeft = function() {
    if (this._selection.pos == null)
      this._selection.pos = jsx3.html.getRelativePosition(null, this._selection.elm);
    return this._selection.pos.L;
  };

  Selection_prototype.getOffsetTop = function() {
    if (this._selection.pos == null)
      this._selection.pos = jsx3.html.getRelativePosition(null, this._selection.elm);
    return this._selection.pos.T;
  };

  Selection_prototype.getText = function() {
    return this._selection.elm.value.substring(this._selection.start, this._selection.end);
  };

  Selection_prototype.setText = function(strText) {
    this._selection.elm.value = this._selection.elm.value.substring(0, this._selection.start) +
        strText + this._selection.elm.value.substring(this._selection.end);
    this._selection.elm.setSelectionRange(this._selection.start, this._selection.start + strText.length);
    this._selection.elm.end = this._selection.elm.selectionEnd;
  };

  Selection_prototype.insertCaret = function(strWhere) {
    this._selection.elm.focus();

    if (strWhere == "end") {
      this._selection.elm.setSelectionRange(this._selection.elm.end, this._selection.elm.end);
    } else {
      throw new jsx3.Exception();
    }

    this._selection.elm.scrollTop = this._selection.scrollt;
    this._selection.elm.scrollLeft = this._selection.scrolll;
  };

/* @JSC */ }

});
