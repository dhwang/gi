/*
Copyright 2006-2008 TIBCO Software, Inc

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 (0.7) Initial release -- dhwang
 (0.8) Updated with selenium 0.8.2
        - see the release notes under gitak/gi for list of changed and new features.
        - added include command, which is modified from include command v2.1 by Robert Zimmermann
 (0.9) Updated to Selenium 0.8.3 core, Selenium RC 0.9.2
 */

/* element outerHTML works only on IE. jsx3.html.getOuterHTML() is GI 3.2 crossbrowser function*/
function getOuterHTML(element) {
    if (!element) return "element is null or undefined!";
    if (jsx3.html)
      return jsx3.html.getOuterHTML(element);
    else // if we're not running 3.2.0 use default, which works only in IE.
      return element.outerHTML;
}

function getIEversion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}



function _triggerMouseEvent(element, eventType, canBubble) {
    // x = arguments[3]; y = arguments[4];
   //selenium.browserbot.triggerMouseEvent(element, eventType, canBubble, x, y);
    triggerLeftMouseEvent(element, eventType, canBubble);
}

function _triggerEvent(element, eventType, canBubble) { // old version
   triggerEvent(element, eventType, canBubble, false, false, false, false);
}

function triggerLeftMouseEvent(element, eventType, canBubble, objPos) {
    canBubble = (typeof(canBubble) == 'undefined') ? true : canBubble;
    LOG.debug("left mouse event type = " + eventType + ' arg3=' + arguments[4]);
    var screenX = 0;
    var screenY = 0;
    if (element && element.fireEvent) {
        var evt = element.ownerDocument.createEventObject();
        evt.clientY = 0;
        evt.clientX = 0;
        if (objPos && objPos.T) {
          LOG.debug("event pos T = " + objPos.T + " L=" +  objPos.L );
          evt.clientY = objPos.T;
          evt.clientX = objPos.L;
        }
        evt.detail = 1;
        evt.screenX = screenX;
        evt.screenY = screenY;
        evt.ctrlKey = false;
        evt.shiftKey = false;
        evt.altKey = false;
        evt.metaKey = false;

        if (selenium.browserbot) {
            evt.ctrlKey = selenium.browserbot.controlKeyDown;
            evt.shiftKey = selenium.browserbot.shiftKeyDown;
            evt.altKey = selenium.browserbot.altKeyDown;
            evt.metaKey = selenium.browserbot.metaKeyDown;
		}

		// event.button is used with the onmousedown, onmouseup, and onmousemove events. For other events, it defaults to 0 regardless.
        if (eventType == 'click' || eventType == 'dblclick')
            evt.button = 0; // GI specific.
        else
            evt.button = 1; // IE uses concept of button mask 0=none 1=left 2=right 3=left+right 4=middle.
			
        evt.bubbles = canBubble;
	    evt.relatedTarget = element;
		
        LOG.debug('fire event='+ eventType + ",button="+ evt.button +",ctrl key="+ evt.ctrlKey + ",shft key=" + evt.shiftKey);
        element.fireEvent('on' + eventType, evt);
    }
    else {
        var evt = document.createEvent('MouseEvents');
        var clientY = 0;
        var clientX = 0;
        if (objPos && objPos.T) {
          LOG.debug("event pos T = " + objPos.T + " L=" +  objPos.L );
          clientY=objPos.T;
          clientX=objPos.L;
        }
        var button = 0; // Mozilla left=0, middle=1, right=2
        var controlKey = false;
        var shiftKey = false;
        var altKey = false;
        var metaKey = false;
        if (selenium.browserbot) {
            controlKey = selenium.browserbot.controlKeyDown;
            shiftKey = selenium.browserbot.shiftKeyDown;
            altKey = selenium.browserbot.altKeyDown;
        // Mac only?
            metaKey = selenium.browserbot.metaKeyDown;
		}
		
        if (evt.initMouseEvent)
        {
            LOG.debug("element has initMouseEvent eventType ="+ eventType +",controlKey="+ controlKey +",shiftKey="+ shiftKey);
            evt.initMouseEvent(eventType, canBubble, true, document.defaultView, 1, screenX, screenY, clientX, clientY,
                    controlKey, altKey, shiftKey, metaKey, button, null);
        }
        else {
            LOG.error("element doesen't has initMouseEvent");
            evt.initEvent(eventType, canBubble, true);
            evt.shiftKey = selenium.browserbot.shiftKeyDown;
            evt.metaKey = selenium.browserbot.metaKeyDown;
            evt.altKey = selenium.browserbot.altKeyDown;
            evt.ctrlKey = selenium.browserbot.controlKeyDown;
        }

        element.dispatchEvent(evt);
    }
};


/* Fire a right mouse button mouse event in a browser-compatible manner */
function triggerRightMouseEvent(element, eventType, canBubble, objPos) {
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    LOG.debug("right mouse event type = " + eventType);
    var screenX = 0;
    var screenY = 0;
    if (element.fireEvent) {
        var evt = element.ownerDocument.createEventObject();
        if (objPos && objPos.T) {
          LOG.debug("event pos T = " + objPos.T + " L=" +  objPos.L );
          evt.clientY = objPos.T;
          evt.clientX = objPos.L;
        }
        evt.detail = 1;
        evt.screenX = screenX;
        evt.screenY = screenY;
        evt.ctrlKey = false;
        evt.shiftKey = false;
        evt.altKey = false;
        evt.metaKey = false;

        if (selenium.browserbot) {
            evt.ctrlKey = selenium.browserbot.controlKeyDown;
            evt.shiftKey = selenium.browserbot.shiftKeyDown;
            evt.altKey = selenium.browserbot.altKeyDown;
            evt.metaKey = selenium.browserbot.metaKeyDown;
		}
		
        evt.bubbles = canBubble;
	    evt.relatedTarget = element;
        evt.button = 2;
        element.fireEvent('on' + eventType, evt);
    }
    else {
        var evt = document.createEvent('MouseEvents');
        var localY = 0;
        var localX = 0;

        if (objPos && objPos.T) {
          localY=objPos.T;
          localX=objPos.L;
        }
        evt.initMouseEvent(eventType, canBubble, true, window, 1, screenX, screenY, localX, localY, false, false, false, false, 2, null);
        element.dispatchEvent(evt);
    }
}

// helper,
function getAbsoluteTop(elmId) {
	// Get an object top position from the upper left viewport corner
	// Tested with relative and nested objects
    var o = elmId;
	oTop = o.offsetTop;            // Get top position from the parent object
	while(o.offsetParent!=null) { // Parse the parent hierarchy up to the document element
		oParent = o.offsetParent;  // Get parent object reference
		oTop += oParent.offsetTop; // Add parent top position
		o = oParent;
	}
	// Return top position
	return oTop;
}
function getAbsoluteLeft(elmId) {
	// Get an object top position from the upper left viewport corner
	// Tested with relative and nested objects
    var o = elmId; // must be an HTML element
 	oLeft = o.offsetLeft;            // Get top position from the parent object
	while(o.offsetParent!=null) { // Parse the parent hierarchy up to the document element
		oParent = o.offsetParent;  // Get parent object reference
		oLeft += oParent.offsetLeft; // Add parent top position
		o = oParent;
	}
	// Return top position
	return oLeft;
}

// remove first and last ' or " string quotes
function stripQuotes(qstr) {
    if ((qstr.indexOf('"') == 0) || qstr.indexOf("'") == 0)
       qstr = qstr.slice(1, -1);
    //LOG.debug('stripped text='+qstr)
    return qstr;
}

// parse name=value string into ['name', 'value']
function getNameValue(nameValueString) {
    var params = nameValueString;

    if (nameValueString.indexOf('=') != -1)
     params = nameValueString.split('=');

    if (params instanceof Array)
        return {name:params[0], value:params[1]};
    else
        return params;
}

function getNameId(nameIdString) {
    var params = nameIdString;

    if (nameIdString.indexOf(',') != -1)
     params = nameIdString.split(',');

    if (params instanceof Array) {
        params[1] = stripQuotes(params[1]);
        return {name:params[0], id:params[1]};
    }
    else
        return params;
}
// All do* methods on the Selenium prototype are added as actions.
// Eg add a typeRepeated action to Selenium, which types the text twice into a text box.
// The typeRepeatedAndWait command will be available automatically

Selenium.prototype.doFireRightMouse = function(locator, eventName) {
	/**
   * Explicitly simulate an event from right mouse button, to trigger the corresponding &quot;on<em>event</em>&quot;
   * handler.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param eventName the event name, e.g. "focus" or "blur"
   */
    var element = this.browserbot.findElement(locator);
    var pos = jsx3.html.getRelativePosition(null, element);

    triggerRightMouseEvent(element, eventName, false, pos);
};
Selenium.prototype.doFireLeftMouse = function(locator, eventName) {
	/**
   * Explicitly simulate an event from left mouse button, to trigger the corresponding &quot;on<em>event</em>&quot;
   * handler.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param eventName the event name, e.g. "focus" or "blur"
   */
    var element = this.browserbot.findElement(locator);
    var pos = jsx3.html.getRelativePosition(null, element);

    triggerLeftMouseEvent(element, eventName, false, pos);
};

Selenium.prototype.doSetInterval = function(value) {
/**
  * Set the command run interval between commands.
  * @param value millisecond pause interval between commands.
*/
   htmlTestRunner.controlPanel.runInterval = value;
};

Selenium.prototype.isAllImagesComplete = function() {
/**
isAllImagesComplete - Checks to see if all images on the page have complete property set.

Related Assertions, automatically generated:

assertAllImagesComplete( )
assertNotAllImagesComplete ( )
verifyAllImagesComplete ( )
verifyNotAllImagesComplete ( )
waitForAllImagesComplete ( )
waitForNotAllImagesComplete ( )

*/
    var elements = this.browserbot.getCurrentWindow(true).document.getElementsByTagName('img');
    var result = true;

    for (var i = 0; i < elements.length; i++) {
       if (! elements[i].complete ) {
               result = false;
               LOG.error('image src=' + elements[i].src + ' not loaded');
               //break; // don't stop, check all images
        }
    }
    return result;
};


Selenium.prototype.isImageComplete = function(idsrc) {
/** Check if given image element is loaded completely.
  * @param idsrc (String) element id or src attribute
  *
  */
    var imgElement = this.browserbot.getCurrentWindow(true).document.getElementById(idsrc);
    if (!imgElement) { // do src path search
      var elements = this.browserbot.getCurrentWindow(true).document.getElementsByTagName('img');
      for (var i = 0; i < elements.length; i++) {
       //LOG.debug(idsrc + " img src = " + elements[i].src );
       if ( PatternMatcher.matches(idsrc, elements[i].src)  ) {
            imgElement = elements[i];
            //LOG.debug(idsrc + ' found! ' +  imgElement.src );
        }
      }
    }
    return (imgElement) ? imgElement.complete : false;
};

Selenium.prototype.doChooseJsxCancelConfirmPrompt = function(text) {
/** ChooseCancelConfirmPrompt -- choose cancel on confirm or prompt dialog.
 * @param text (string) Prompt/Comfirm caption text or body text
 *
*/   LOG.debug("doChooseJsxCancelNext label = " + text );

   // alert belong to system root, unless spawn from a dialog object, which is rare
   var oBlock = this.browserbot.findByJsxText(text);

   if (oBlock == null) {
     Assert.fail("Alert caption text or message text '" + text + "' not found.");
     return;
   }
   LOG.debug('object = ' + oBlock);
   var dialog = oBlock.getAncestorOfType('jsx3.gui.Dialog');
   if (dialog) {
     LOG.debug("alert = " + dialog);
     LOG.debug("text = " +  dialog.getDescendantOfName('message').getText() );
     var cancelButton = dialog.getDescendantOfName('cancel');
     if (cancelButton) {
       LOG.debug("cancel button = " +  cancelButton );
       _triggerEvent(cancelButton.getRendered(), 'focus', true);
       _triggerMouseEvent(cancelButton.getRendered(), 'click', true);
     }
   } else {
     Assert.fail("Jsx alert dialog containing '" + text + "' not found.");
     return;
   }
}

Selenium.prototype.doCheckJsx = function(locator) {
    /** Check a jsx3.gui.RadioButton or jsx3.gui.CheckBox control.
     * @param locator (String) RadioButton or CheckBox locator
    */
   var outerSpan = this.browserbot.findElement(locator);
   if (outerSpan) {
     LOG.debug("outerSpan = " + getOuterHTML(outerSpan));
     var input= outerSpan.childNodes[0];
     if (!input.checked) // click only if not yet checked, to check it
        _triggerMouseEvent(outerSpan, 'click', true);
   }

}

Selenium.prototype.doUnCheckJsx = function(locator) {
    /** UnCheck a jsx3.gui.RadioButton or jsx3.gui.CheckBox control.
     * @param locator (String) RadioButton or CheckBox locator
    */
   var outerSpan = this.browserbot.findElement(locator);
   if (outerSpan) {
     LOG.debug("outerSpan = " + getOuterHTML(outerSpan));
     var input= outerSpan.childNodes[0];
     if (input.checked) // click only if checked to uncheck it
        _triggerMouseEvent(outerSpan, 'click', true);
   }
}

Selenium.prototype.doPartialCheckJsx = function(locator) {
/** Partial check jsx3.gui.CheckBox control [-] partial checked state
  * @param locator (String) CheckBox locator
  */
    var jsxname = locator.trim().split('=')[1];
    if (jsxname) {
        LOG.debug('Apply partial check to ' + jsxname);
        this.browserbot.findByJsxName(jsxname).setChecked(jsx3.gui.CheckBox.PARTIAL);
    }
};

Selenium.prototype.doToggleJsxCheckBox = function(locator, value) {
/** Check a jsx3.gui.RadioButton or jsx3.gui.CheckBox control. In case of checkbox
 * this action will toggle the state.
 * @param locator (String) RadioButton or CheckBox locator
 * @param value (String) not used
*/
   var outerSpan = this.browserbot.findElement(locator);
   if (outerSpan) {
     LOG.debug("outerSpan = " + getOuterHTML(outerSpan));
     _triggerMouseEvent(outerSpan, 'click', true);
   }
}

// TODO -- implement an action command that acts on select row or focused cell
//Selenium.prototype.doActionJsxSelectedCell = function (locator, value) {
/** Similar to actionJsxMaskCell, but acts on the focused cell.
  * Matrix select column will have the provided locator item selected (and a combo/select will have the provided value typed in). etc.
  * @param locator (String) Cell locator. For example, JsxMatrixCellId=matrixJsxName.id123.1
  * @param value (String) Cell value. Can be a secondary locator like JsxMenuItemId or JsxSelectItemIndex.
 */

//};

Selenium.prototype.doActionJsxMaskCell = function(locator, value) {
/** Depending on the Matrix column mask type, perform different action. For example, matrix text box column will have the value provided typed in.
  * Matrix select column will have the provided locator item selected (and a combo/select will have the provided value typed in). etc.
  * @param locator (String) Cell locator. For example, JsxMatrixCellId=matrixJsxName.id123.1
  * @param value (String) Cell value. Can be a secondary locator like JsxMenuItemId or JsxSelectItemIndex.
 */
   LOG.debug("Action matrix cell" + locator + " with " + value);

   var strategy = locator.split(/=/); // should be a Matrix Cell locator
   var params;
   if (strategy[1].search(/\./) != -1)
        params = strategy[1].split(/\./); // matrix.r.c
   else if (strategy[1].search(/,/) != -1)
        params = strategy[1].split(/,/)  // matrix,text

   var jsxName = params[0];
   jsxName = stripQuotes(jsxName);

   LOG.debug("matrix jsxname = " + jsxName);

   var jsxMatrix =  this.browserbot.findByJsxName(jsxName);
    if (!jsxMatrix) {
        throw new SeleniumError("No object named '"+ jsxName + "' found!");
    }

   var cell_item = this.browserbot.findElement(locator);

   _triggerEvent(cell_item, 'focus', false);
   //_triggerMouseEvent(cell_item, 'click', false);
   var columns = jsxMatrix.getChildren();
   var session = null;
   for (var i=0; (i < columns.length) && (session == null); i++){
        if (columns[i].getChildren().length > 0)
          session = columns[i].getChild(0).emGetSession();
   }
   var activeMaskSession = (session) ? session : null;
   if (activeMaskSession) {
    var activeMask = activeMaskSession.column.getChild(0); // column of the edit mask, get child mask obj
	var activeMaskElement = activeMask.getRendered(); // Non always-on edit mask such as textbox and datepicker have only one instance. So we can safely use the one returned by getRendered().
	LOG.debug(activeMask + ", EditMaskElement = " + getOuterHTML(activeMaskElement));

	_triggerEvent(activeMaskElement, 'focus', false);

    // this.browserbot.triggerMouseEvent(activeMaskElement, 'focus', false);
    if (jsx3.gui.TextBox && activeMask.instanceOf(jsx3.gui.TextBox)) {
        LOG.debug('textboxy action type value' + value)
        this.browserbot.replaceJsxText(activeMask, activeMaskElement, value);
    }
    else if (jsx3.gui.DatePicker && activeMask.instanceOf(jsx3.gui.DatePicker) ) {
        LOG.debug('Matrix pickJsxDate');
        this.doPickJsxDate(activeMask.getName(), value);
    }
    else if (jsx3.gui.Menu && activeMask.instanceOf(jsx3.gui.Menu) ) {
        // value must be a JsxMenuItem[Text/Id/Index] selector
        LOG.debug('instance of jsx3.gui.Menu, menu item=' + value);
        this.doClickJsxMenu('JsxMenuName='+activeMask.getName(), value);
    }
    else if (jsx3.gui.Select && activeMask.instanceOf(jsx3.gui.Select) ) {
        // value must be a JsxSelectItem[Text/Id/Index] selector
        LOG.debug('instance of jsx3.gui.Select, select item=' + value);
        this.doClickJsxSelect('JsxSelectName='+activeMask.getName(), value);
    }
    else if (jsx3.gui.Slider && activeMask.instanceOf(jsx3.gui.Slider) ) {
        LOG.debug('instance of jsx3.gui.Slider');
        this.doMoveSliderRelative('JsxSlidertName='+activeMask.getName(), value);
    }
    else if (jsx3.gui.TimePicker && activeMask.instanceOf(jsx3.gui.TimePicker) ) {
        LOG.debug('instance of Timepicker ' + value);
        this.doPickJsxTime(activeMask.getName(), value);
    }
    else if (jsx3.gui.ImageButton && activeMask.instanceOf(jsx3.gui.ImageButton) ) {
      activeMaskElement = cell_item.childNodes[0].childNodes[0];
	  _triggerEvent(activeMaskElement, 'focus', false);
      LOG.debug('instance of imagebutton ' + getOuterHTML(activeMaskElement));
      _triggerMouseEvent(activeMaskElement, 'mouseover', false); // must do mouseover in Firefox
      _triggerMouseEvent(activeMaskElement, 'click', false);
    }
    else {     
	 // Default click action Always on edit mask columns such as :
	 // Button, Checkbox, RadioButton, ImageButton, ToolbarButton(delete column) 
	 // For Dialog and Block Mask, clickJsxElement MatrixCellByIndex, wait for subMask object, do custom action.
      activeMaskElement = cell_item.childNodes[0].childNodes[0];
	  if (!activeMaskElement) 
	   activeMaskElement = cell_item.childNodes[0];
	  _triggerEvent(activeMaskElement, 'focus', false);

	  LOG.debug('default action mousedown, mouseup, click');
        if (activeMaskElement.onmousedown)
            _triggerMouseEvent(activeMaskElement, 'mousedown', true);
        if (activeMaskElement.onmouseup)
            _triggerMouseEvent(activeMaskElement, 'mouseup', true);
        if (activeMaskElement.onclick)
            _triggerMouseEvent(activeMaskElement, 'click', true);
    }

  }
};

Selenium.prototype.doClickJsxDialogButton = function(dlgLocator, btnLocator) {
/** Click on a dialog box caption bar button. Specify dialog name or
 * caption text as locator and min/max/close button name as value
 *
 * @param dlgLocator (String) dialog name or caption text
 * @param btnLocator (String) min/max/close button name or label text
*/
   dlgLocator = stripQuotes(dlgLocator);
   btnLocator = stripQuotes(btnLocator);

   LOG.debug("doJsxClickDialogButton caption text = " + dlgLocator + ' button=' + btnLocator);
   var jsxCaption = this.browserbot.findByJsxTextAndType(dlgLocator, 'jsx3.gui.WindowBar');
   if (!jsxCaption)
     jsxCaption = this.browserbot.findByJsxNameAndType(dlgLocator, 'jsx3.gui.WindowBar');

   LOG.debug("caption = " + jsxCaption);
   if (!jsxCaption) return false;

   var buttons = jsxCaption.getDescendantsOfType('jsx3.gui.ToolbarButton');

   var buttonElement = null;
   var i = 0;
   for (i=0; i < buttons.length; i++) {
      if (buttons[i].getName() == btnLocator) { // name match
	   buttonElement = buttons[i].getRendered();
       break;
      }
      if (PatternMatcher.matches(btnLocator, buttons[i].getText()) ) { // Text label match
	   buttonElement = buttons[i].getRendered();
       break;
      }
   }
   if (buttonElement != null ) {
	_triggerEvent(buttonElement, 'focus', true);
	_triggerMouseEvent(buttonElement, 'click', true);
   }
};

Selenium.prototype.doClickJsxDateIcon = function(jsxname) {
/**
 * Click on date icon using JsxDateIcon locator
 * @param jsxname (String) tree item locator by jsxid or label text
 */
   var dateicon = this.browserbot.findElement("JsxDateIcon="+jsxname);

    _triggerEvent(dateicon, 'focus', true);
    _triggerMouseEvent(dateicon, 'click', true);
};

Selenium.prototype.doClickJsxDatePrevMonth = function(jsxname) {
    /**	click next month icon element of jsx.gui.DatePicker by 'jsxname'
     *  @param jsxname (String) jsxname locator for DatePicker
     */
   jsxname = jsxname.trim();
   LOG.debug("doClickJsxDatePrevMonth locator =" + jsxname );

   var dateprev = this.browserbot.findElement("JsxDatePrevMonth="+jsxname);

    _triggerEvent(dateprev, 'focus', true);
    _triggerMouseEvent(dateprev, 'click', true);

   var objCal = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.DatePicker") ;
   LOG.debug("datepicker = " + objCal);
   if (!objCal.getDate()) {
     objCal.setDate(new Date()); // current date
   }
    var dateNow = objCal.getDate();
    var monthVal = dateNow.getMonth() - 1;
    if (monthVal < 0) {
        monthVal = 12;
        dateNow.setFullYear(dateNow.getFullYear() - 1)
    }
   dateNow.setMonth(monthVal);
    objCal.setDate(dateNow); // need to commit date change

};

Selenium.prototype.doClickJsxDateNextMonth = function(jsxname) {
 /**	click next month icon element of jsx.gui.DatePicker by 'jsxname'
   *  @param locator (String) jsxname locator for DatePicker
   */
   jsxname = jsxname.trim();
   LOG.debug("doClickJsxDateNextMonth locator =" + jsxname );

   var datenext = this.browserbot.findElement("JsxDateNextMonth="+jsxname);

    _triggerEvent(datenext, 'focus', true);
    _triggerMouseEvent(datenext, 'click', true);

   var objCal = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.DatePicker") ;

   LOG.debug("datepicker = " + objCal);
   if (!objCal.getDate()) {
     objCal.setDate(new Date()); // current date
   }
    var dateNow = objCal.getDate();
    var monthVal = dateNow.getMonth() + 1;
    if (monthVal > 11) {
        monthVal = 0;
        dateNow.setFullYear(dateNow.getFullYear() + 1);
    }
    dateNow.setMonth(monthVal);
    objCal.setDate(dateNow); // need to commit date change
};

Selenium.prototype.doClickJsxDatePrevYear = function(jsxname) {
/**	click next year icon element of jsx.gui.DatePicker by 'jsxname'
 *  @param jsxname (String) jsxname locator for DatePicker
 */
   LOG.debug("doClickJsxDatePrevYear locator =" + jsxname );

   var dateprev = this.browserbot.findElement("JsxDatePrevYear="+jsxname);

    _triggerEvent(dateprev, 'focus', true);
    _triggerMouseEvent(dateprev, 'click', true);

   var objCal = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.DatePicker") ;
   if (objCal) {
   LOG.debug("datepicker = " + objCal);
   if (!objCal.getDate()) {
     objCal.setDate(new Date()); // current date
   }
    var dateNow = objCal.getDate();
    dateNow.setFullYear(dateNow.getFullYear() - 1);
    objCal.setDate(dateNow); // need to commit date change
   }

};

Selenium.prototype.doClickJsxDateNextYear = function(jsxname) {
 /**	click next year icon element of jsx.gui.DatePicker by 'jsxname'
   *  @param jsxname (String) jsxname locator for DatePicker
   */
   LOG.debug("doClickJsxDateNextYear locator =" + jsxname );

   var datenext = this.browserbot.findElement("JsxDateNextYear="+jsxname);

    _triggerEvent(datenext, 'focus', true);
    _triggerMouseEvent(datenext, 'click', true);

   var objCal = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.DatePicker") ;
   if (objCal) {
    LOG.debug("datepicker = " + objCal);
    if (!objCal.getDate()) {
         objCal.setDate(new Date()); // current date
    }
    var dateNow = objCal.getDate();
    dateNow.setFullYear(dateNow.getFullYear() + 1);
    objCal.setDate(dateNow); // need to commit date change
   }
};

Selenium.prototype.doClickJsxElement = function(locator) {
/** Click on jsx element, generic doClick may not work properly.
 * @param locator (String) JsxElement locator
*/

   LOG.debug("doClickJsxElement locator = " + locator );
   var jsxElement = this.browserbot.findElement(locator);
   var jsxElementId = jsxElement.id;

   try {
     if (jsxElement.onmouseover) {
       LOG.debug("do mouseover ..." );
       _triggerMouseEvent(jsxElement, 'mouseover', true);
     }
     if (jsxElement.onfocus) {
       LOG.debug("do focus ..." );
       _triggerEvent(jsxElement, 'focus', false);
     }

     //triggerLeftMouseEvent(jsxElement, 'mousedown', true);
     //triggerLeftMouseEvent(jsxElement, 'mouseup', true);
     triggerLeftMouseEvent(jsxElement, 'click', true);

     //jsxElement =  this.browserbot.getCurrentWindow().document.getElementById(jsxElementId); // still there?
	 /*
     jsxElement = this.browserbot.findElement(locator);
     if (jsxElement && jsxElement.onblur) {
       LOG.debug("do blur ... " );
       //_triggerEvent(jsxElement, 'blur', false);
     }
     if (jsxElement && jsxElement.onmouseout) {
       LOG.debug("do mouseout jsxelement..." );
       //_triggerMouseEvent(jsxElement, 'mouseout', true);
     }
	*/
   } catch (e) {
      LOG.error("Exception caught in clickJsxElement! message=" + e.message);
   }

};

Selenium.prototype.doClickJsxGridDelete = function(locator) {
/**
 * Click on a grid delete cell
 * @param locator (String) Grid cell locator JsxGridCell=jsxname.jsxid.colIndex
 *
 */
   LOG.debug("doClickJsxGridDelete locator = " + locator );
   // action is attached to the child <div> element of the grid cell <td> element
   var divElement = this.browserbot.findElement(locator).childNodes[0];
   if (divElement) {
     _triggerMouseEvent(divElement, 'mouseover', true);
     _triggerMouseEvent(divElement, 'click', true); // actual onclick
   }
};

Selenium.prototype.doClickJsxListHeader = function(locator) {
/**
 * Click on a list header cell.  Need special command because Sorting is
 * trigger by a ghost element that is dynamically inserted.
 * @param locator (String) list header locator JsxListHeaderIndex=jsxname,colIndex
 *
 */
   LOG.debug("doClickJsxListHeader locator = " + locator );
   var text = locator.split("=")[1];
   var params = text.split(",");
   var listJsxName = params[0];
   var listColumnIndex = parseInt(params[1]);
   var jsxElement = null;
   var jsxList = this.browserbot.findByJsxNameAndType(listJsxName, 'jsx3.gui.List');

   if (jsxList != null) {
    LOG.debug('list = ' + jsxList);
    var col = jsxList.getChild(listColumnIndex);
    jsxElement = col.getRendered();

    if (jsxElement) {
     _triggerMouseEvent(jsxElement, 'mousedown', true);
     var ghostElement = this.browserbot.getCurrentWindow(true).document.getElementById(jsxList.getId() + "_jsxghost");
     LOG.debug('ghost = ' + getOuterHTML(ghostElement));
     _triggerMouseEvent(ghostElement, 'mouseup', true);
    }
   }
};

Selenium.prototype.doClickJsxMatrixHeader = function(locator) {
/**
 * Click on a Matrix header cell
 * @param locator (String) matrix header locator JsxMatrixHeaderIndex=jsxname,colIndex
 *
 */
   LOG.debug("doClickJsxMatrixHeader locator = " + locator );
   var elmColumn = this.browserbot.findElement(locator)

   if (elmColumn) {
       var text = locator.split(/=/)[1];
       var params = text.split(/,/);
       var jsxName = params[0];
       var columnIndex = parseInt(params[1]);
       var jsxMatrix = this.browserbot.findByJsxNameAndType(jsxName, 'jsx3.gui.Matrix');

    _triggerMouseEvent(elmColumn, 'mousedown', true);
    var ghostElement = this.browserbot.getCurrentWindow(true).document.getElementById(jsxMatrix.getId() + "_ghost");
    LOG.debug('ghost = ' + getOuterHTML(ghostElement));
    _triggerMouseEvent(ghostElement, 'mouseup', true);
  }
};


Selenium.prototype.doClickJsxMatrixTreeItem = function(locator) {
/**
 *  Click on a Matrix Tree item icon using JsxMatrixTreeItemId
 * @param locator (string) JsxMatrixTreeItemId=mtxJsxName,mtxJsxId
 */
   LOG.debug("doClickJsxMatrixTreeItem " + locator);
   var treeElement = this.browserbot.findElement(locator);
   _triggerMouseEvent(treeElement, 'mousedown', true);
   _triggerMouseEvent(treeElement, 'mouseup', true);
   _triggerMouseEvent(treeElement, 'click', true);
};

Selenium.prototype.doClickJsxMatrixTreeToggle = function(locator) {
/**
 * Click on a Matrix header cell
 * @param locator (String) matrix tree locator jsxname,jsxid
 *
 */
   LOG.debug("doClickJsxMatrixTreeToggle locator = " + locator );
   var text = locator.split("=")[1];
   var params = text.split(",");
   var mtxJsxName = params[0].trim();
   var jsxid = params[1].trim();

   var jsxMatrix = this.browserbot.findByJsxNameAndType(mtxJsxName, 'jsx3.gui.Matrix');

   if (jsxMatrix != null) {
    LOG.debug('matrix = ' + jsxMatrix);
    var elmToggle = getActionableObject(jsxMatrix, 'toggler', jsxid);
    LOG.debug("Tree toggle element = " + getOuterHTML(elmToggle));
    _triggerMouseEvent(elmToggle, 'mousedown', true);
    _triggerMouseEvent(elmToggle, 'mouseup', true);
    _triggerMouseEvent(elmToggle, 'click', true);
  } else {
    LOG.debug("doClickJsxMatrixTreeToggle couldn't find matrix jsxname="+ mtxJsxName );
  }
};

var timerId;

Selenium.prototype.doClickJsxMenu = function(locator, itemLocator) {
/** jsx3.gui.Menu click is actually a mousedown event
 * @param locator (String) Menu locator JsxMenuName/JsxMenuText
 * // itemLocator (String) Menu item locator not working //
 */
   LOG.debug("doClickJsxMenu locator = " + locator );

   var menuElement = this.browserbot.findElement(locator);
   if (menuElement && !this.isJsxMenuWindowPresent(1)) {
    //var objPos = jsx3.html.getRelativePosition(null, menuElement);
     LOG.debug("menu element = " + getOuterHTML(menuElement));
     _triggerEvent(menuElement, 'focus', false);
     _triggerMouseEvent(menuElement, 'mousedown', true);
     // Alternative, use arrow key down.
     //triggerKeyEvent(menuElement, 'keydown', jsx3.gui.Event.KEY_ARROW_DOWN, true);
   }


   if (itemLocator) {    // will not work in 3.1.x
           if (htmlTestRunner.controlPanel.runInterval <= 0)
            this.doPause(500);
       jsx3.sleep( function () {selenium.doClickJsxMenuItem(itemLocator);}, "click_menu_item", this, true);
   }


};

Selenium.prototype.doClickJsxMenuItem = function(locator) {
/** Click a menu item, mostly used internally by clickJsxMenu (menu,item) command.
 * @param locator (String) Menu item locator JsxMenuItemId/JsxMenuItemText
 */
   LOG.debug("doClickJsxMenuItem locator = " + locator );
    var menuElement = this.browserbot.findElement(locator);
    if (menuElement) {
     LOG.debug('element = ' + getOuterHTML(menuElement));
     _triggerEvent(menuElement, 'focus', false);
     _triggerMouseEvent(menuElement, 'mouseover', true);
     _triggerMouseEvent(menuElement, 'click', true);
     //menu item is gone when clicked, no mouseout or blur event
    }
};

Selenium.prototype.doClickJsxSelectItem = function(optionLocator) {
/** Click a select option item, mostly used internally by clickJsxSelect (slct,item) command.
 * @param locator (String) Select item locator JsxSelectItemId/JsxSelectItemText/JsxSelectItemIndex
 */
    LOG.debug("select/combo item option locator = " + optionLocator);
    var selectItemElement = this.browserbot.findElement(optionLocator);
    if (selectItemElement) {
        LOG.debug('select item = ' + getOuterHTML(selectItemElement));

        _triggerEvent(selectItemElement, 'focus', true);
        _triggerMouseEvent(selectItemElement, 'mousedown', true);
        _triggerMouseEvent(selectItemElement, 'click', true);
    }
}

Selenium.prototype.doClickJsxSelect = function(locator, optionLocator) {
/**  This method now a allows selection of a select control item directly
 *  @param locator (String) locator string for select control
 *  @param optionLocator (String) [optional] if provided will select the item specified.
 */
   LOG.debug("doClickJsxSelect/combo locator = " + locator );
   //
   var params = locator.split("=")
   var strategy = params[0].trim();
   var jsxName = params[1].trim();

    var selectElement = this.browserbot.findElement('JsxSelectName='+jsxName);
    if (selectElement.onmousedown) {
      // 3.2 use selectElement
      LOG.debug('select elmt = ' + getOuterHTML(selectElement));
      this.browserbot.findByJsxName(jsxName).focus();
      _triggerEvent(selectElement.childNodes[0], 'focus', true);  // focus?
      //_triggerEvent(selectElement, 'focus', true);  // focus?
      _triggerMouseEvent(selectElement, 'mousedown', true);
      //triggerKeyEvent(selectElement, 'keydown', jsx3.gui.Event.KEY_ARROW_DOWN, true);
    } else {
       // 3.1 use childNodes[0]
      var mElement = selectElement.childNodes[0];
      _triggerEvent(mElement, 'focus', true);
      _triggerMouseEvent(mElement, 'mousedown', true);
    }

    if (optionLocator) { // jsx3.sleep is not in 3.1.x!!
        var time = 500;
        if (htmlTestRunner.controlPanel.runInterval > 0)
            time = htmlTestRunner.controlPanel.runInterval;
        this.doPause(time);
        jsx3.sleep( function () {selenium.doClickJsxSelectItem(optionLocator)}, "click_select_item", this, true);
    }

}

Selenium.prototype.doClickJsxStack = function(locator) {
/** Click on a jsx3.gui.Stack control
 * @param locator (String) Stack locator by jsxname or label text
 */
   LOG.debug("doClickJsxStack locator = " + locator );
   // stackElement.childNodes[0].rows[0].cells[0] is where the action is
   var mElement = this.browserbot.findElement(locator)
   if (mElement.childNodes[0].rows )
       mElement = mElement.childNodes[0].rows[0].cells[0];
   else {

        var params = locator.split('=');
        var strategy = params[0];
        var text = params[1];
        var jsxStack;
        if (strategy == "JsxStackName")
            jsxStack = this.browserbot.findByJsxName(text);
        else
            jsxStack = this.browserbot.findByJsxText(text);

       mElement = getActionableObject(jsxStack, "handle");
      LOG.debug("stack element =" + getOuterHTML(mElement));
   }
   if (mElement ) {
     _triggerMouseEvent(mElement, 'mouseover', true);
     _triggerMouseEvent(mElement, 'click', true);
     _triggerMouseEvent(mElement, 'mouseout', true);
   }
}



Selenium.prototype.doClickJsxToolbarButton = function(text) {
/** Click on a tool bar button, generic click doesn't work.
 * @param text (String) Locator text of Toolbar Button label or jsxname
 */
   LOG.debug("doJsxClickToolbarButton label/jsxname = " + text );
   text.trim();
   var buttonElement = this.browserbot.locateElementByJsxToolbarButtonName(text, null);
   if (buttonElement == null)
     buttonElement = this.browserbot.locateElementByJsxToolbarButtonText(text, null);
   _triggerMouseEvent(buttonElement, 'focus', true);
   _triggerMouseEvent(buttonElement, 'click', true);
}

Selenium.prototype.doClickJsxTreeToggle = function(locator) {
/**
 * Click on Tree toggle icon using JsxTreeItemId/Text locator.
 *
 * @param locator (String) tree item locator by jsxid or label text
 */
   LOG.debug("doJsxClickJsxTreeToggle = " + locator );
   // <img jsxtype=plusminus/>
   var treeElement = this.browserbot.findElement(locator).childNodes[0];
   LOG.debug("Tree toggle element = " + getOuterHTML(treeElement));
   _triggerMouseEvent(treeElement, 'click', true);
};

Selenium.prototype.doClickJsxTreeItem = function(locator) {
/**
 * Click on Tree item using JsxTreeItemId locator.
 * @param locator (String) tree item locator by jsxid or label text
 */
   LOG.debug("doJsxClickJsxTreeToggle = " + locator );
   var treeElement = this.browserbot.findElement(locator).childNodes[1];
   LOG.debug("Tree icon/label element = " + getOuterHTML(treeElement));

   //_triggerMouseEvent(treeElement, 'mouseover', true); // this cause exception on tree?
   _triggerMouseEvent(treeElement, 'click', true);
};


Selenium.prototype.doResizeJsxLayout = function(jsxName, value) {
/**
 * Resize layout with given new dimension Array.
 * @param jsxName (String) jsxname of the layout
 * @param value (String) Comma seperated value specifying new dimension array e.g. 100,*
 */
  LOG.debug("doResizeJsxLayout jsxname = " + jsxName + ",value="+ value);
  var objLayout = this.browserbot.findByJsxName(jsxName);
  var newdim = value.split(',');
  objLayout.setDimensionArray(newdim, true);
};


Selenium.prototype.doRightClickJsxElement = function(locator) {
/**
 * Do a right click on a given jsxname element. Don't use this for List/Grid.
 * @param locator (String)  locator is strategy=jsxname,itemid
*/
   LOG.debug("doRightClickJsxElement = " + locator );
   var params = locator.split("=");
   var strategy = params[0];  // strategy
   var values = params[1];    // jsxname,blah
   var jsxName = values.split(",")[0];

   LOG.debug("jsxname =" + jsxName);
   var jsxObj = this.browserbot.findByJsxName(jsxName);
   LOG.debug("jsxobj = " + jsxObj);

   var thisElement = this.browserbot.findElement(locator);
   LOG.debug("element = " + getOuterHTML(thisElement));

   if (jsxObj) {
     var objPos;
     if (jsx3.html)
      objPos = jsx3.html.getRelativePosition(null, thisElement); // relative to the top, this is new for 3.2
     else {
       objPos = jsxObj.getAbsoltePosition();
       if (jsxObj.instanceOf("jsx3.gui.List")) { // a list/grid
           var headerOffset = jsxObj.getHeaderHeight();
           objPos.T = objPos.T + thisElement.offsetTop + headerOffset ;
           objPos.L = objPos.L + thisElement.offsetLeft;
       }
     }

     LOG.debug("Pos = " + objPos.L + " t=" + objPos.T);
     _triggerEvent(thisElement, 'focus', true);
     triggerRightMouseEvent(thisElement, 'mousedown', true, objPos);
     triggerRightMouseEvent(thisElement, 'mouseup', true, objPos);
     triggerRightMouseEvent(thisElement, 'click', true, objPos);
   }

};


Selenium.prototype.doRightClickJsxListRow = function(locator) {
/**
 * doRightClickJsxListRow -- Right click on a list row
 * @param locator (String) locator=jsxname,item_jsxid
*/
   LOG.debug("doRightClickJsxListRow = " + locator );

   var params = locator.split(",");
   var jsxName = params[0];  // jsxname
   var jsxId = params[1];    // item jsxid

   var listObj = this.browserbot.findByJsxName(jsxName);
   LOG.debug("listobj = "  + listObj);
   var listRowId = listObj.getId() + jsxId;
   LOG.debug("listrowid = " + listRowId);
   var listRowElement = this.browserbot.getCurrentWindow(true).document.getElementById(listRowId);
   LOG.debug("listrow = " + getOuterHTML(listRowElement));

   var objPos = listObj.getAbsolutePosition();
   var listOffset = listObj.getHeaderHeight();
   if (listOffset == undefined)
      listOffset = jsx3.gui.List.DEFAULTHEADERHEIGHT;
   objPos.T = objPos.T + listRowElement.offsetTop + listOffset ;
   objPos.L = objPos.L + listRowElement.offsetLeft;

   LOG.debug("pos T=" + objPos.T + " L=" + objPos.L);
   _triggerMouseEvent(listRowElement, 'focus', true);

   triggerRightMouseEvent(listRowElement,'mousedown', true, objPos);
   triggerRightMouseEvent(listRowElement,'mouseup', true, objPos);
};

Selenium.prototype.doRightClickJsxTreeItem = function(locator) {
/**
 * right click tree item
 * @param locator (String) Tree item locator by jsxname,jsxid
*/
   LOG.debug("doRightClickJsxTreeItem = " + locator );

   var treeItemElement = this.browserbot.findElement(locator)
   LOG.debug("tree icon/label element = " + getOuterHTML(treeItemElement));

   var objPos = jsx3.html.getRelativePosition( null, treeItemElement );

   LOG.debug("pos T=" + objPos.T + " L=" + objPos.L);
   _triggerEvent(treeItemElement, 'focus', true);

   triggerRightMouseEvent(treeItemElement,'mousedown', true, objPos);
   triggerRightMouseEvent(treeItemElement,'mouseup', true, objPos);
};


Selenium.prototype.doDoubleClickJsxElement = function(locator) {
/**
 * Do user double click on a jsx element
 * @param locator (String) A List Row <a href="#locators">element locator</a> can be: listJsxName,recordJsxId or TextPattern
 */
   LOG.debug("doDoubleClickJsxElement locator = " + locator );
   var thisElement = this.browserbot.findElement(locator);
   _triggerEvent(thisElement, 'focus', true);
   triggerLeftMouseEvent(thisElement, 'click', true);     // 3.1.x use click to select in list
   triggerLeftMouseEvent(thisElement, 'dblclick', true);

};

Selenium.prototype.doDoubleClickJsxTreeItem = function(text) {
/**
 * Simulate user double click on a tree item.
 * @param (String) locator A Tree item <a href="#locators">element locator</a> treeJsxName,recordJsxId
 */
   LOG.debug("doDoubleClickJsxElement locator = " + locator );
   var thisElement = this.browserbot.findElement(locator).childNodes[1];

   _triggerMouseEvent(thisElement, 'focus', true);
   triggerLeftMouseEvent(thisElement, 'click', true); // select click
   triggerLeftMouseEvent(thisElement, 'dblclick', true);
};


Selenium.prototype.doMoveJsxSliderPercent = function(locator, value) {
 /**
   * Simulates a user dragging the slider handle to a given percentage location
   *
   * @param locator (String) an <a href="#locators">element locator</a>
   * @param value (String) position defined in [1-100] % position.
   */
  LOG.debug("doMoveJsxSliderPercent locator = " + locator );

  var elementSlider = this.browserbot.findElement(locator);
  var elementSliderHandle = elementSlider.childNodes[1]; // <span> of slider handle

  var param = locator.split('='); 
  var jsxname = stripQuotes(param[1]);
  var jsxSlider = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.Slider");
  var jsxPos = jsxSlider.getAbsolutePosition();

  if (jsx3.html) { // 3.2.0 and later
       elementSliderHandle = getActionableObject(jsxSlider, 'handle');
       jsxPos = jsx3.html.getRelativePosition(null, elementSliderHandle);
  } else {
    jsxPos.T += elementSliderHandle.offsetTop;
    jsxPos.L += elementSliderHandle.offsetLeft;
  }
  triggerLeftMouseEvent(elementSliderHandle, 'mousedown', true, jsxPos);
  triggerLeftMouseEvent(elementSliderHandle, 'mousemove', true, jsxPos);
  LOG.debug("slider value = " + jsxSlider.getValue());
  jsxSlider.setValue(value);  // set percent value
  LOG.debug("New slider value = " + jsxSlider.getValue());

  // check position again
  if (jsx3.html) {
     jsxPos = jsx3.html.getRelativePosition(null, elementSliderHandle);
  } else {
    jsxPos = jsxSlider.getAbsolutePosition();
    jsxPos.T += elementSliderHandle.offsetTop;
    jsxPos.L += elementSliderHandle.offsetLeft;
  }
  triggerLeftMouseEvent(elementSliderHandle, 'mouseup', true, jsxPos);

}

Selenium.prototype.doMoveJsxSliderRelative = function(locator, value) {
	/**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the slider handle element.
   *
   * @param locator (String) an <a href="#locators">element locator</a>
   * @param value (String) position defined in [+/-]Y pixel position, relative to locator element position.
   */
  LOG.debug("doMoveJsxSlider locator = " + locator );
  var elementSlider = this.browserbot.findElement(locator);
  var elementSliderHandle = elementSlider.childNodes[1]; // <span> of slider handle

  var param = locator.split('=');
  var jsxname = stripQuotes(param[1]);
  var jsxSlider = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.Slider");
    if (!elementSliderHandle)
        elementSliderHandle = getActionableObject(jsxSlider, 'handle');
  LOG.debug("slider handle = " + getOuterHTML(elementSliderHandle));

  // handle position = slider position + offset
  var jsxPos = jsxSlider.getAbsolutePosition();
  jsxPos.T += elementSliderHandle.offsetTop;
  jsxPos.L += elementSliderHandle.offsetLeft;

  triggerLeftMouseEvent(elementSliderHandle, 'mousedown', true, jsxPos);
    jsxPos.L += Math.round(parseInt(value) / 2);
  triggerLeftMouseEvent(elementSliderHandle, 'mousemove', true, jsxPos);
    jsxPos.L += Math.round(parseInt(value) / 2);
  triggerLeftMouseEvent(elementSliderHandle, 'mouseup', true, jsxPos);
}


Selenium.prototype.doDragJsxDialogResize = function(locator, posval) {
	/**
   * Simulates a user doing drag resize on a dialog box.
   *
   * @param locator (String) an <a href="#locators">element locator</a>
   * @param posval (String) offset x,y pixel position, relative to current element position.
   */

    // find the resize div handle, child node 4 under dialog
    var element = this.browserbot.findElement(locator).childNodes[3];
    LOG.debug('resize element = ' + getOuterHTML(element));
    var locParams = locator.split('=');
    var strategy = locParams[0];
    var jsxname = locParams[1];
    var jsxObj = this.browserbot.findByJsxName(jsxname);
    var jsxPos = jsxObj.getAbsolutePosition();

    LOG.debug('dialog resize pos.t=' + jsxPos.T + ",pos.l=" + jsxPos.L );
    if (jsx3.html) {
       element = getActionableObject(jsxObj, 'resizer');
       LOG.debug('resize element = ' + getOuterHTML(element));
       jsxPos = jsx3.html.getRelativePosition(null, element);
    } else {
        jsxPos.T = jsxPos.T + jsxObj.getHeight();
        jsxPos.L = jsxPos.L + jsxObj.getWidth();
    }
    LOG.debug('dialog resize pos.t=' + jsxPos.T + ",pos.l=" + jsxPos.L );
    triggerLeftMouseEvent(element, 'mouseover', true, jsxPos);
    triggerLeftMouseEvent(element, 'mousedown', true, jsxPos);

    if (posval) {
      var xy = posval.split(',');
      var offsetX = xy[0];
      var offsetY = xy[1];
       jsxPos.T += Math.round(parseInt(offsetY) / 2);
       jsxPos.L += Math.round(parseInt(offsetX) / 2);
      triggerLeftMouseEvent(element, 'mousemove', true, jsxPos);
       jsxPos.T += Math.round(parseInt(offsetY) / 2);
       jsxPos.L += Math.round(parseInt(offsetX) / 2);
      triggerLeftMouseEvent(element, 'mouseup', true, jsxPos);
    } else {
     Assert.fail("To [x,y] relative offset values required");
    }
    LOG.debug('new dialog props' + jsxObj);
};

Selenium.prototype.doDragJsxDialogTo = function(locator, posval) {
	/**
   * Simulates a user doing drag-and-drop on the specified jsxname object.
   *
   * @param locator (String) an <a href="#locators">JSX locator by jsxname</a>
   * @param posval (String) offset x,y pixel position, relative to current element position.
   */

    var element = this.browserbot.findElement(locator).childNodes[0];
    var jsxname = locator.split('=')[1];
    var jsxObj = this.browserbot.findByJsxName(jsxname);
    if (jsx3.html) { // 3.2.0 class
        element = getActionableObject(jsxObj, 'captionbar');
    }
    var jsxPos = jsxObj.getAbsolutePosition();
    jsxPos.T += 2;
    jsxPos.L += 2; // add 2 pixel to be within the rendered element
    triggerLeftMouseEvent(element, 'mousedown', true, jsxPos);

    if (posval) {
      var xy = posval.split(',');
      var offsetX = xy[0];
      var offsetY = xy[1];
       jsxPos.T += Math.round(parseInt(offsetY) / 2);
       jsxPos.L += Math.round(parseInt(offsetX) / 2);
      triggerLeftMouseEvent(element, 'mousemove', true, jsxPos);
       jsxPos.T += Math.round(parseInt(offsetY) / 2);
       jsxPos.L += Math.round(parseInt(offsetX) / 2);
      triggerLeftMouseEvent(element, 'mouseup', true, jsxPos);
    } else {
     Assert.fail("To [x,y] relative offset values required");
    }
};

Selenium.prototype.doDragJsxTo = function(locator, movementsString) {
/** Deprecated, use dragAndDrop.
   * Simulates a user doing drag-and-drop on the specified jsxname object.
=** Drags an element a certain distance and then drops it
    * @param locator an element locator
    * @param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
    */
    var element = this.browserbot.findElement(locator);
    var clientStartXY = getClientXY(element)
    var clientStartX = clientStartXY[0];
    var clientStartY = clientStartXY[1];
    
    var movements = movementsString.split(/,/);
    var movementX = Number(movements[0]);
    var movementY = Number(movements[1]);
    
    var clientFinishX = ((clientStartX + movementX) < 0) ? 0 : (clientStartX + movementX);
    var clientFinishY = ((clientStartY + movementY) < 0) ? 0 : (clientStartY + movementY);
    
    var mouseSpeed = this.mouseSpeed;
    var move = function(current, dest) {
        if (current == dest) return current;
        if (Math.abs(current - dest) < mouseSpeed) return dest;
        return (current < dest) ? current + mouseSpeed : current - mouseSpeed;
    }
    
    _triggerMouseEvent(element, 'mousedown', true, clientStartX, clientStartY);
    _triggerMouseEvent(element, 'mousemove',   true, clientStartX, clientStartY);
    var clientX = clientStartX;
    var clientY = clientStartY;
    
    while ((clientX != clientFinishX) || (clientY != clientFinishY)) {
        clientX = move(clientX, clientFinishX);
        clientY = move(clientY, clientFinishY);
        _triggerMouseEvent(element, 'mousemove', true, clientX, clientY);
    }
    
  _triggerMouseEvent(element, 'mousemove',   true, clientFinishX, clientFinishY);
  _triggerMouseEvent(element, 'mouseup',   true, clientFinishX, clientFinishY);

};


Selenium.prototype.doDragJsxToJsx = function(locator, locator2) {
/** Deprecated use dragAndDropToObject.
   * Simulates a user doing drag-and-drop on the specified jsxobj to a second jsxobj.
   * // TODO -- still broken
   * @param locator (String) an JsxName <a href="#locators">element locator</a>
   * @param locator2 (String) The second JsxName <a href="#locators">element locator</a>
   */
   var strategy = locator.split('=');
   var params;
   var jsxName;
   /* /(.*)=(.*)[,|\.](.*)/   */
   if (strategy[1].indexOf('.') > 0) {
    params = strategy[1].split(/\./); // jsxname.row.column
	var jsxName = params[0];
   }
   else if (strategy[1].indexOf(',') > 0) {
    params = strategy[1].split(/,/); // jsxname,jsxid
	var jsxName = params[0];
   } else {
     jsxname = strategy[1];
   }
   
   jsxName=stripQuotes(jsxName);
   
  this.doDragAndDropToObject(locator, locator2);
};

// TODO, test mousedown, mousemove, mouseup
Selenium.prototype.doJsxMouseDown = function(locator, posval) {
	/**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">Jsx locator</a>
   * @param posval position defined in x,y pixel position, relative to locator element position.
   */

    var element = this.browserbot.findElement(locator);

    var jsxPos = jsx3.html.getRelativePosition(null, element);

    if (posval) {
      var xy = posval.split(',');
       jsxPos.T = jsxPos.T + parseInt(xy[1]);
       jsxPos.L = jsxPos.L + parseInt(xy[0]);
    }


    triggerLeftMouseEvent(element, 'mousedown', true, jsxPos);
};

Selenium.prototype.doJsxMouseMove = function(locator, posval) {
	/**
   * Simulates a user moving the mouse (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param posval  postion value in x,y pixel positon, relative to locator element position.
   */
    var element = this.browserbot.findElement(locator);
    var jsxPos = jsx3.html.getRelativePosition(null, element);

    if (posval) {
      var xy = posval.split(',');
       jsxPos.T = jsxPos.T + parseInt(xy[1]);
       jsxPos.L = jsxPos.L + parseInt(xy[0]);
    }

    triggerLeftMouseEvent(element, 'mousemove', true, jsxPos);
};

Selenium.prototype.doJsxMouseUp = function(locator, posval) {
	/**
   * Simulates a user releasing the mouse button on the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param posval  postion value in x,y pixel positon, relative to locator element position.
   */
    var element = this.browserbot.findElement(locator);
    var jsxPos = jsx3.html.getRelativePosition(null, element);

    if (posval) {
      var xy = posval.split(',');
       jsxPos.T = jsxPos.T + parseInt(xy[1]);
       jsxPos.L = jsxPos.L + parseInt(xy[0]);
    }

    triggerLeftMouseEvent(element, 'mouseup', true, jsxPos);
};

Selenium.prototype.doTypeJsxTextbox = function(locator, text) {
 /**
  * Type text into a jsx3.gui.TextBox
  *
  * @param locator an element locator
  * @param text  value to input
  */

   LOG.debug("doType " + locator + " with " + text);
   // move jsx3 up to window level to allow normal use of calling jsx3.* directly

   var jsxName = locator.substring(locator.indexOf('=') + 1);// jsxname=blah
   jsxName = stripQuotes(jsxName);

   LOG.debug("textbox jsxname = " + jsxName);

   var jsxObj = this.browserbot.findByJsxName(jsxName);
   LOG.debug('found jsxObj =' + jsxObj);
   var element = this.browserbot.findElement(locator);
   LOG.debug('element found ' + getOuterHTML(element));
    selenium.browserbot.replaceJsxText(jsxObj, element, text);
};


Selenium.prototype.doSpyJsxElement = function(locator) {
/**
 * Trigger spy event on located jsx element. -- TODO, seems to work on Firefox only.
 *
 * @param locator (String) jsx element locator.
 */
   LOG.debug("doSpyJsxElement locator = " + locator );
   var mElement = this.browserbot.findElement(locator);
   if (mElement) {
       var objPos;
       if (jsx3.html)
         objPos = jsx3.html.getRelativePosition(null, mElement);
       else {
         objPos = new Object();
         objPos.T = getAbsoluteTop(mElement);
         objPos.L = getAbsoluteLeft(mElement);
       }
     triggerLeftMouseEvent(mElement, 'mouseover', true, objPos);
     //_triggerMouseEvent(mElement, 'mouseover', true);
   }
};

Selenium.prototype.doTypeJsxGridCell = function(locator, text) {
/** Type in grid text box column
  * @param locator (String) Cell with jsxid id123 and column 1  = gridJsxName.id123.1
  * @param text (String) value to type into Grid cell
 */
   LOG.debug("doType grid cell" + locator + " with " + text);

   var strategy = locator.split('=');
   var params = strategy[1].split('.'); // gridJsxName.r.c
   var jsxName = params[0];
   jsxName=stripQuotes(jsxName);
   LOG.debug("grid jsxname = " + jsxName);

   var jsxGrid =  this.browserbot.findByJsxNameAndType(jsxName, 'jsx3.gui.Grid');
   var cell_item = this.browserbot.findElement(locator);
   _triggerEvent(cell_item, 'focus', true);
    var activeMask = jsxGrid.getActiveMask();
   if (activeMask) {
       _triggerEvent(activeMask.getRendered(), 'focus', true);
       activeMask.setValue(text);
       _triggerEvent(activeMask.getRendered(), 'blur', true);
   }
   _triggerEvent(cell_item, 'blur', true);
};


Selenium.prototype.doPickJsxTime = function(jsxname, value) {
/** Pick a time value in the form of HH:mm:SS.sss into a jsx3.gui.TimePicker
  * TODO -- add support for AM/PM time?
  * @param jsxname (String) DatePicker jsxname
  * @param value (String) date value in valid Date string format
  */
    var otpicker = this.browserbot.findByJsxNameAndType(jsxname.trim(), "jsx3.gui.TimePicker") ;

    var hhmmss = value.split(':');   // hh:mm:ss.sss
    var hours =  hhmmss[0];
    var minutes = hhmmss[1];
    var seconds = hhmmss[2];
    // enter hours value
    this.doType('JsxTimePickerHours='+jsxname.trim(), hours );
    this.doFireEvent('JsxTimePickerHours='+jsxname.trim(), 'blur');
    // enter minutes value
    this.doType('JsxTimePickerMinutes='+jsxname.trim(), minutes );
    this.doFireEvent('JsxTimePickerMinutes='+jsxname.trim(), 'blur');
    if (otpicker.getShowSeconds() == 1) {
        var secon = seconds;
        var milli = 0;
        if (seconds.indexOf('.') > 0 ) {
            var parts = seconds.split('.');
            secon = parts[0];
            milli = parts[1];
        }
        this.doType('JsxTimePickerSeconds='+jsxname.trim(), secon );
        this.doFireEvent('JsxTimePickerSeconds='+jsxname.trim(), 'blur');
        if (otpicker.getShowMillis() == 1) {
            this.doType('JsxTimePickerMillis='+jsxname.trim(), milli );
            this.doFireEvent('JsxTimePickerMillis='+jsxname.trim(), 'blur');
        }
    }

};


Selenium.prototype.doPickJsxDate = function(jsxname, value) {
/** Pick a date value in the form of a parsable Date class value into jsx3.gui.DatePicker control
 * @param jsxname (String) DatePicker jsxname
 * @param value (String) date value in valid Date string format YYYY/MM/dd
 */
   LOG.debug("doPickJsxDate jsxname = " + jsxname );

   var objCal = this.browserbot.findByJsxNameAndType(jsxname, "jsx3.gui.DatePicker") ;
   LOG.debug("datepicker = " + objCal);

   if (!value)
    objCal.setDate(new Date());
   else if (value == 'today' || value == '') {
    objCal.setDate(new Date());
   }
   else {
    objCal.setDate(new Date(value) );
   }

   var elmCal = objCal.getRendered();
   _triggerEvent(elmCal, 'focus', true); // click to open calendar
   _triggerMouseEvent(elmCal, 'click', true); // click to open calendar
   if (elmCal.childNodes.length > 1) { // 3.2.0 has icon img as child element
       var elementIcon = getActionable(objCal, "icon");
       _triggerEvent(elementIcon, 'focus', true);
       _triggerMouseEvent(elementIcon, 'click', true);
   }

   var id = "jsxDatePicker" + objCal.getId();
   var objHw = jsx3.gui.Heavyweight.GO(id);
   if (!objHw) {
   // 3.2, event on img element
    var iconElement = getActionableObject(objCal, 'icon');
    _triggerEvent(iconElement, 'focus', true); // click to open calendar
    _triggerMouseEvent(iconElement, 'click', true); // click to open calendar
   }

    var calDate = objCal.getDate();
    var year = calDate.getFullYear();

    var month = calDate.getMonth();
    var dayid = year.toString() + "-" + month.toString() + "-" + calDate.getDate().toString();
    LOG.debug("dayid = " + dayid);
    var dayElement = getActionableObject(objCal, 'day', dayid);
    //if (dayElement != null) {
    LOG.debug('day = ' + getOuterHTML(dayElement));
     _triggerMouseEvent(dayElement, 'mouseover', true);
     _triggerMouseEvent(dayElement, 'click', true); // click to select date
    //}

};

Selenium.prototype.doRecordStartTime = function(index) {
/**
 * Record a start time for performance timing
 * @param index (String) a start time variable index
 */
 var timevar = 'startTime' + index;
 var currentTime = new Date();
 storedVars[timevar] = currentTime.getTime(); // millisecond value of time
 LOG.debug('**Recorded start time for ' + index + " = " + currentTime);
}

Selenium.prototype.doRecordEndTime = function(index) {
/**
 * Record a end time for performance timing
 * @param index (String) a start time variable index  or Id String
 */
 var timevar = 'endTime' + index;
 var currentTime = new Date();
 storedVars[timevar] = currentTime.getTime(); // millisecond value of time
 LOG.debug('**Recorded end time for ' + index + " = " + currentTime);
};

Selenium.prototype.doShowElapseTime = function(index) {
/**
 * Display elapsed time of given index for performance timing
 * @param index (String) a start time variable index or Id String
 */
  var startvar = 'startTime' + index;
  var endvar = 'endTime' + index;
  var diffTime = storedVars[endvar] - storedVars[startvar];
  storedVars[index] = diffTime;
  var message = "Elapse time for " + index + " is = " + diffTime + " msec.";
  currentTest.currentRow.setMessage(message);
  LOG.debug(message);

};

Selenium.prototype.doSetJsxNamespace = function (namespace) {
/**
  * Set the namespace of our GI application, this is useful when there is more than one application
  * on the same page.
  * @params namespace (String) the namespace name string as defined in application configuration
  */
    this.browserbot.setJsxNamespace(namespace);
	if (namespace && namespace != "null" && namespace != "")
		storedVars[namespace] = namespace;       // save the value as a Selenium global var ${namespace}
};

Selenium.prototype.doUnsubscribeJsxResize = function() {
/**
 * IE bug trigger resize when there's none but dynamic element inserted to DOM
 * use this command to disable all onresize event handlers.
*/

    if (browserVersion.isIE) {
        jsx3.gui.Event.unsubscribeAll(jsx3.gui.Event.RESIZE);
        LOG.info('jsx3.gui.Event.unsubscribeAll(jsx3.gui.Event.RESIZE);');
    }
    else
        LOG.info('unsubscribeJsxResize is noop for non IE browser');
};


Selenium.prototype.isJsxMenuWindowPresent = function(locatorId) {
/** Is the menu dropdown window open, find given the level id
 *
 * @param locatorId (String) Menu dropdown level id
 */

    var elmMenuWindow = this.browserbot.locateElementByJsxMenuWindowId(locatorId, this.browserbot.getDocument());
   if (elmMenuWindow) LOG.debug('elmMenu = ' + getOuterHTML(elmMenuWindow));

   return (elmMenuWindow) ? true : false;
}

Selenium.prototype.isJsxSelectWindowPresent = function (locator) {
/**
 * Is the Select control drop down list present.
 */
   var elmSelectWindow = this.browserbot.locateElementByJsxSelectWindow(locator, this.browserbot.getDocument());
    //LOG.debug('elmSelWin=' + elmSelectWindow);
   return (elmSelectWindow) ? true : false;
}

Selenium.prototype.isJsxButtonPresent = function(text) {
/**
 * Asserts that the specified JsxButton element can be found.
assertJsxButtonPresent( )
assertJsxButtonNotPresent( )
verifyJsxButtonPresent( )
verifyJsxButtonNotPresent( )
waitForJsxButtonPresent( )
waitForJsxButtonNotPresent( )

 * @param text (String) label text or jsxname (or locator like JsxButtonName=jsxname and JsxButtonText=press me)
 */
    try {
        var element = null;
          element = this.browserbot.locateElementByJsxButtonText(text, this.browserbot.getCurrentWindow(true).document);
        if (!element)
          element = this.browserbot.locateElementByJsxButtonName(text, this.browserbot.getCurrentWindow(true).document);
        if (!element)  // locator search
	      element = this.browserbot.findElement(text);
        if (element)
	        return true;
    } catch (e) {
      LOG.debug("exception caught in isJsxButtonPresent");
    }
    return false;
};

Selenium.prototype.isJsxPresent = function(text) {
/**
 * Asserts that the specified JSX object can be found.

assertJsxPresent( )
assertJsxNotPresent( )
verifyJsxPresent( )
verifyJsxNotPresent( )
waitForJsxPresent( )
waitForJsxNotPresent( )

Example
  assertJsxPresent  | mtxGridEditable | |
  verifyJsxPresent  | JsxDateNextYear=dpkrStartDate | |
  waitForJsxPresent | JsxDialogCaption=*Blah* | |

 */
    try {
        // object seach by jsxname
        var objJsx = this.browserbot.findByJsxName(text);
        if (!objJsx) // element locator search
          objJsx = this.browserbot.findElement(text);
        if (!objJsx)
	        return false;
    } catch (e) {
        return false;
    }
    return true;
};

Selenium.prototype.isJsxValueEqual= function(jsxName, value) {
/**
 * Is the value in control with given jsxname equal to value specified
 * assertJsxValueEquals - generic version of above.
 * @param jsxName (String) jsxname of control to locate
 * @param value (String) value to compare against
 */
    jsxName = stripQuotes(jsxName);
    var jsxObject = this.browserbot.findByJsxName(jsxName);
    // Get the actual element value
    var actualValue = jsxObject.getValue();
    LOG.debug('jsxvalue expected=' + value +' actual=' + actualValue);
    return PatternMatcher.matches(value, actualValue);
};

Selenium.prototype.isJsxTextEqual= function(jsxName, value) {
/**
 * Is the text in control with given jsxname equal to value specified
 * assertJsxValueEquals - generic version of above.
 * @param jsxName (String) jsxname of control to locate
 * @param value (String) text to compare against
 */
    jsxName = stripQuotes(jsxName);
    var jsxObject = this.browserbot.findByJsxName(jsxName);

    // Get the actual element value
    var actualValue = jsxObject.getText();
    LOG.debug('jsxtext expected='+ value + ' actual=' + actualValue);
    return PatternMatcher.matches(value, actualValue);
};


Selenium.prototype.assertJsxAlertOK= function(text) {
/** Find alert and dismiss with OK. works with prompt also.
 * @param text (String) alert text in window bar or body text.
 */
    LOG.debug("assertJsxAlert with text=" + text );

   // alert belong to system root, unless spawn from a dialog object, which is rare
   var oBlock = this.browserbot.findByJsxText(text);

   if (oBlock == null) {
     Assert.fail("Alert caption text or message text '" + text + "' not found.");
     return;
   }
   LOG.debug('object = ' + oBlock);
   var dialog = oBlock.getAncestorOfType('jsx3.gui.Dialog');
   if (dialog) {
     LOG.debug("alert = " + dialog);
     LOG.debug("text = " +  dialog.getDescendantOfName('message').getText() );
     var okButton = dialog.getDescendantOfName('ok');
     if (okButton) {
     LOG.debug("ok button = " +  okButton );
     _triggerMouseEvent(okButton.getRendered(), 'click', true);
     }
   } else {
     Assert.fail("Jsx alert dialog containing '" + text + "' not found.");
     return;
   }

}

Selenium.prototype.assertJsxConfirmOK= function(text) {
/**
 * Confirm type alert has a cancel button, but otherwise work the same way as regular alert.
 * @param text (String) confirmation window bar text or body text
 */
  this.assertJsxAlertOK(text);
}

Selenium.prototype.assertJsxPromptOK= function(text, value) {
/**
 * Prompt dialog has a textbox that takes value, but otherwise work the same way as regular alert.
 * @param text (String) confirmation window bar text or body text
 * @param value (String) value to enter to prompt
 */
   LOG.debug("assertJsxAlert with text=" + text );


   // alert belong to system root, unless spawn from a dialog object, which is rare
   var oBlock = this.browserbot.findByJsxText(text);
   if (oBlock == null) {
     Assert.fail("Prompt caption text or message text '" + text + "' not found.");
     return;
   }
   LOG.debug('object = ' + oBlock);
   var dialog = oBlock.getAncestorOfType('jsx3.gui.Dialog');
   if (dialog) {
   //getFirstChildOfType('jsx3.gui.TextBox', true);
     var editbox = dialog.findDescendants(function(objJSX) {
           return (objJSX.instanceOf('jsx3.gui.TextBox') );
       },false,false,false,true);

     editbox.setValue(value);
      //LOG.debug("alert = " + dialog);
     //LOG.debug("text = " +  dialog.getDescendantOfName('message').getText() );
     var okButton = dialog.getDescendantOfName('ok');
     var okTag  = okButton.getRendered();
     _triggerMouseEvent(okTag, 'click', true);
   } else {
     Assert.fail("Jsx prompt dialog containing '" + text + "' not found.");
     return;
   }


}

PageBot.prototype.jsxNamespace = null;

PageBot.prototype.setJsxNamespace = function (namespace) {
/* Set the namespace to use in GI object locator. If left unset then by default we search in the first
 * JSXBODY block.
 * @param namespace (String) GI application name, or namespace.
 */
 if (!namespace || namespace=="null") 
	this.jsxNamespace = null;
 else
	this.jsxNamespace = namespace;
};

PageBot.prototype.getJsxNamespace = function (namespace) {
 return this.jsxNamespace;
};

PageBot.prototype.findElementByNameAndTwoAttributes = function (
    inDocument, tagName, attribute1, value1, attribute2, value2
) {
/**
 * Helper findElementBy "Name and Two Attributes" method
 * e.g. //span[label="something" and class="className"]
 *
 * @param inDocument (Document) document object
 * @param tagName (String) tag name to look under
 * @param attribute1 (String) name of first attribute
 * @param value1 (String) value of first attribute
 * @param attribute2 (String) name of second attribute
 * @param value2 (String) value of second attribute
 */
    if (isIE && attribute1 == "class") {
        attribute1 = "className";
    }
    if (isIE && attribute2 == "class") {
        attribute2 = "className";
    }

    //LOG.debug ("Attr = " + attribute1 + ", attribute2 = " + attribute2);
    var elements = inDocument.getElementsByTagName(tagName);
    for (var i = 0; i < elements.length; i++) {
        var elementAttr = elements[i].getAttribute(attribute1);
        var elementAttr2 = elements[i].getAttribute(attribute2);
        //debug("elementAttr = " + elementAttr + ", elementAttr2 = " + elementAttr2);
        if (elementAttr == value1 && elementAttr2 == value2) {
            return elements[i];
        }

    }
    return null;
};

PageBot.prototype.findElementByTextAndAttribute = function (
    inDocument, tagName, text, attribute1, value1
) {
/*
 * Helper findElementBy "Text and Attribute" method
 * e.g. //span[text()="something" and class="className"]
 *
 * @param inDocument (Document) document object
 * @param tagName (String) tag name to look under
 * @param text (String) tag text to find
 * @param attribute1 (String) name of first attribute
 * @param value1 (String) value of first attribute
*/
    if (isIE && attribute1 == "class") {
        attribute1 = "className";
    }

    LOG.debug ("text = " + text + ", attr = " + attribute1 + ", val = " + value1);
    var elements = inDocument.getElementsByTagName(tagName);
    for (var i = 0; i < elements.length; i++) {
      var elementAttr = elements[i].getAttribute(attribute1);
      //LOG.debug("text = " + getText(elements[i]) + "elementAttr = " + elementAttr);
        if (getText(elements[i]) == text && elementAttr == value1) {
            return elements[i];
        }
    }
    return null;
};

PageBot.prototype.getParentChild = function(jsxname) {
/**
 * getParentChild - split the jsxname into parent name and child name if in "parent.child" notation
 * @param jsxname (String) possible "parent.child" notation
 * @return Array | String  parentjsxname=array[0],childjsxname=array[1] or just childjsxname
 */
    if (jsxname.indexOf('.') > 0) {
        LOG.debug('split parent child')
      return jsxname.split('.');
    } else {
      return jsxname;
    }
}
PageBot.prototype.findByJsxName = function(jsxname) {
/**
 * findByJsxName - find jsx object in body using its jsxname
 *  @param value (String) JSX object jsxname
 *  @return JSX object
 */
   LOG.debug('findByJsxName =' + jsxname );
   // init jsx3 object in case this is first locator called
    window.top.jsx3 = null;
    window.top.jsx3 = this.getCurrentWindow(false).jsx3;

   //LOG.debug('jsx3 = ' + jsx3.getVersion());
  if (!selenium.jsxversion)
	selenium.jsxversion = jsx3.getVersion(); 
   var parentName = 'JSXBODY';
   var pdotc = this.getParentChild(jsxname);

    if ( typeof(pdotc) != 'string') {
        parentName=pdotc[0];
        jsxname=pdotc[1];
    }
  // getJSXByName() does not return the same object as findDescendants(), which access the assoc array directly
   if (this.jsxNamespace != null && this.getCurrentWindow()[this.jsxNamespace] != undefined) {
     LOG.debug('namespace defined='  + this.jsxNamespace);
     return   this.getCurrentWindow()[this.jsxNamespace].getServer().getJSXByName(parentName).findDescendants(
        function(objJSX) {
          return (objJSX.getName() == jsxname);
        }
     ,false,false,false,true);
   } else {
       LOG.debug('using jsx3.GO() ... ' + parentName);
	   var objParent = jsx3.GO(parentName); // This could be undefined.
       return  (objParent) ? objParent.findDescendants(
            function(objJSX) {
              return (objJSX.getName() == jsxname);
            }
         ,false,false,false,true) : null;
   }
}


PageBot.prototype.findByJsxNameAndType = function(jsxname, jsxtype) {
/**
  * findByJsxNameAndType - find jsx object in body using its jsxname and its jsxtype
 *  @param jsxname (String) JSX object jsxname
 *  @param jsxtype (String) JSX object class type
 *  @return JSX object
  */
  window.top.jsx3 = null;
  window.top.jsx3 = this.getCurrentWindow(false).jsx3;
  //LOG.debug('jsx3 = ' + jsx3.getVersion());
  if (!selenium.jsxversion)
	selenium.jsxversion = jsx3.getVersion(); 
  
  var parentName = 'JSXBODY';
  var pdotc = this.getParentChild(jsxname);

  if ( typeof(pdotc) != 'string') {
      parentName=pdotc[0];
      jsxname=pdotc[1];
  }

  LOG.debug('findByJsxNameAndType jsxname=' + jsxname  + ',type='+ jsxtype + ',parent=' + parentName);
  if (this.jsxNamespace != null && this.getCurrentWindow()[this.jsxNamespace] != undefined) {
     LOG.debug('namespace defined='  + this.jsxNamespace);
     return   this.getCurrentWindow()[this.jsxNamespace].getServer().getJSXByName(parentName).findDescendants(
        function(objJSX) {
          return ((objJSX.getName() == jsxname) && objJSX.instanceOf(jsxtype) );
        }
     ,false,false,false,true);
   } else {
	  LOG.debug('using jsx3.GO() ... ' + parentName);
	  var objParent = jsx3.GO(parentName);
      return  (objParent) ? objParent.findDescendants(
              function(objJSX) {
                return ((objJSX.getName() == jsxname) && objJSX.instanceOf(jsxtype) );
              },
       false,false,false,true) : null;
    }
}

PageBot.prototype.findByJsxText = function(text) {
/**
 * findByJsxText - find jsx object in body using its jsxtext with glob or regexp pattern maching
 *  @param value (String) JSX object jsxtext
 *  @param root (String) Root block name
 *  @return JSX object
 */
  LOG.debug('findByJsxText =' + text  );
  window.top.jsx3 = null;
  window.top.jsx3 = this.getCurrentWindow(false).jsx3;
  if (!selenium.jsxversion)
	selenium.jsxversion = jsx3.getVersion(); 
  if (this.jsxNamespace != null && this.getCurrentWindow()[this.jsxNamespace] != undefined) {
       LOG.debug('namespace defined='  + this.jsxNamespace);
       return   this.getCurrentWindow()[this.jsxNamespace].getServer().getRootBlock().findDescendants(
          function(objJSX) {
              return (objJSX.getText() && PatternMatcher.matches(text, objJSX.getText())  );
          }
       ,false,false,false,true);
  } else {
	LOG.debug('using jsx3.GO() ... ');
        return jsx3.GO('JSXROOT').findDescendants(function(objJSX) {
            LOG.debug(objJSX.getText() + ' - ' + objJSX.getClass() );
            return (objJSX.getText() && PatternMatcher.matches(text, objJSX.getText())  );
        },false,false,false,true);
  }
}

PageBot.prototype.findByJsxTextAndType = function(text, jsxtype) {
/**
 * findByJsxTextAndType - find jsx object in body using its jsxtext with glob or regexp pattern maching
 *  @param text (String) JSX object jsxtext
 *  @param jsxtype (String) JSX object class type
 *  @return JSX object
 */
  LOG.debug('findByJsxTextAndType =' + text  + ',type='+ jsxtype );
  window.top.jsx3 = null;
  window.top.jsx3 = this.getCurrentWindow(false).jsx3;
  if (!selenium.jsxversion)
	selenium.jsxversion = jsx3.getVersion(); 

    if (this.jsxNamespace != null && this.getCurrentWindow()[this.jsxNamespace] != undefined) {
       LOG.debug('namespace defined='  + this.jsxNamespace);

       return   this.getCurrentWindow()[this.jsxNamespace].getServer().getRootBlock().findDescendants(
          function(objJSX) {
              return (objJSX.getText() && PatternMatcher.matches(text, objJSX.getText()) && objJSX.instanceOf(jsxtype) );
          }
       ,false,false,false,true);
    } else {
		LOG.debug('using jsx3.GO() ... '); // JSXROOT object always exist in GI application
		return jsx3.GO('JSXROOT').findDescendants(function(objJSX) {
         return (objJSX.getText() && PatternMatcher.matches(text, objJSX.getText()) && objJSX.instanceOf(jsxtype) );
       },false,false,false,true);
     }
};

PageBot.prototype.findByJsxValue = function(value) {
/**
 * findAllByJsxValue - find all jsx object in body using its jsxvalue with glob or regexp pattern maching
 *  @param value (String) JSX object jsxvalue
 *  @return JSX object
 */
  LOG.debug('findByJsxtype='+ jsxtype );
  window.top.jsx3 = null;
  window.top.jsx3 = this.getCurrentWindow(false).jsx3;
  if (!selenium.jsxversion)
	selenium.jsxversion = jsx3.getVersion(); 
  return jsx3.GO('JSXROOT').findDescendants(function(objJSX) {
      return (objJSX.getValue && PatternMatcher.matches(value, objJSX.getValue())
      );
   },false,false,false,true);
};

PageBot.prototype.locateElementByJsxLookup = function(text, inDocument, inWindow) {
/** Locate by actional element - This is a generic locator using jsxlookups.js
 *  @param text (String) jsxname of the object
 *  @param inDocument (document) current document object
 *  @param inWindow (document) current document object
 *  @return HTML element
 */
	var name;
	var type;
	if (text.indexOf(",") != -1) {
		var params = text.split(/,/);
		name = params[0].trim();
		type = params[1].trim();
	} else
		name = text.trim();
   
   var objJSX = this.findByJsxName(name);
   return getActionableObject(objJSX, type);
};
/* this locator is used as gi=jsxname,type */
PageBot.prototype.locateElementByJsxLookup.prefix = "gi";

PageBot.prototype.locateElementByJsxName = function(text, inDocument) {
/** Locate element by jsxname - This is a generic locator for all jsx components
 *  @param text (String) jsxname of the object
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug('locateElementByJsxName ' + text );
   var oJSX =  this.findByJsxName(text);

   var jsxElement = (oJSX != null) ? oJSX.getRendered() : null;
   //LOG.debug("jsx by name element = " + getOuterHTML(jsxElement));
   return jsxElement;
};

PageBot.prototype.locateElementByJsxText = function(text, inDocument) {
/** Locate element by jsxtext - This is a generic locator for all jsx components
 *  @param text (String) jsxtext of the object
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug('locateElementByJsxText ' + text );
   var oJSX =  this.findByJsxText(text);

   var jsxElement = (oJSX != null) ? oJSX.getRendered() : null;
   //LOG.debug("jsx by text element = " + getOuterHTML(jsxElement));
   return jsxElement;
};

PageBot.prototype.locateElementByJsxAlertCaption = function(text, inDocument) {
/**
 * Alerts
 *	Mixin interface allows implementors to show alerts, confirms, and prompts.
 * locateElementByJsxAlertCaption -- locate alert box by caption text
 * Caption ext can be glob, regexp, or exact text pattern.
 *  @param text (String) Text pattern in alert caption
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
      text = stripQuotes(text);
   LOG.debug("locateElementByJsxAlertCaption =" + text );
   // alert belong to system root, unless spawn from a dialog object, which is rare
   var oBlock = this.findByJsxTextAndType(text, jsx3.gui.WindowBar);

   LOG.debug("alert = " + oBlock.getParent()); // dialog should be immediate parent of caption bar

   return (oBlock != null) ? oBlock.getParent().getRendered() : null;
};

PageBot.prototype.locateElementByJsxAlertText = function(text, inDocument) {
/** Locate alert box by alert text in body
 * Alert text can be glob, regexp, or exact text pattern.
 *  @param text (String) Text pattern in Alert body
 *  @param inDocument (document) current document object
 *  @return HTML element *
 *
*/
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxAlertText =" + text );

   // alert belong to system root, unless spawn from a dialog object, which is rare
   var oBlock = this.findByJsxText(text);

   var alertbox = oBlock.getAncestorOfType('jsx3.gui.Dialog');

   return (oBlock != null) ? alertbox.getRendered() : null;

};



PageBot.prototype.locateElementByJsxButtonName = function(text, inDocument) {
/** Locate Button and ImageButton
 *	Provides a object-oriented interface for a standard command button.
 * ImageButton
 *	An object-oriented interface onto a GUI button made of various image files.
 *
 * jsx3.gui.Button and ImabeButton by name (exact name)
 */
   LOG.debug("locateElementByButton jsxname=" + text );
   text = stripQuotes(text);
   text = text.trim();

   var oButton = this.findByJsxNameAndType(text, "jsx3.gui.Button");
   if (oButton == null) // must be image button?
         oButton = this.findByJsxNameAndType(text, "jsx3.gui.ImageButton");
   if (oButton == null) // must be tbb button?
      oButton = this.findByJsxNameAndType(text, "jsx3.gui.ToolbarButton");

   //LOG.debug("jsx button = " + oButton);

   return (oButton != null) ? oButton.getRendered() : null;

};

PageBot.prototype.locateElementByJsxButtonText = function(text, inDocument) {
/**
 * Locate jsx3.gui.Button and ImageButton by label text by pattern (glob, regex, exact)
 *  @param text (String) Text pattern in Block
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug("locateElementByJsxButtonText text = " + text);

   text = stripQuotes(text);
   var oButton = this.findByJsxTextAndType(text, "jsx3.gui.Button");
   if (oButton == null) // must be tbb button?, image button have no text.
      oButton = this.findByJsxTextAndType(text, "jsx3.gui.ToolbarButton");

   //LOG.debug("jsxbutton = " + oButton);

   return (oButton != null) ? oButton.getRendered() : null;
};


PageBot.prototype.locateElementByJsxBlockName = function(name, inDocument) {
/**
 * Block
 *	This class provides a container-based, object-oriented approach to creating static html objects (basically this class creates "DIV" objects).
 * jsx3.gui.Block  (Same for Dialog) -- find by jsxname
 *
 *  @param name (String) Block jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 * note: can be located with locator = "//DIV[@label="+ name + "]";
 */
   name = stripQuotes(name);
   LOG.debug("locateElementByJsxBlockName jsxname =" + name );

   var oBlock = this.findByJsxNameAndType(name, "jsx3.gui.Block") ;

   return (oBlock != null) ? oBlock.getRendered() : null;
}

PageBot.prototype.locateElementByJsxDateName = function(name, inDocument) {
/**	Locate jsx.gui.DatePicker by jsxname
 *	A form element that allows for the selection of an arbitrary date by showing a navigable calendar.
 *  @param name (String) DatePicker jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   name = stripQuotes(name);
   LOG.debug("locateElementByJsxDateName jsxname =" + name );

   var oBlock = this.findByJsxNameAndType(name, "jsx3.gui.DatePicker") ;

   return (oBlock != null) ? oBlock.getRendered() : null;
};

PageBot.prototype.locateElementByJsxDateIcon = function(name, inDocument) {
/**	Locate jsx.gui.DatePicker icon by jsxname. New in 3.2.0
 *	A form element that allows for the selection of an arbitrary date by showing a navigable calendar
 * when the icon element is clicked.
 *  @param name (String) DatePicker jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   name = stripQuotes(name);
   LOG.debug("locateElementByJsxDateIcon jsxname =" + name );

   var objDatePicker = this.findByJsxNameAndType(name, "jsx3.gui.DatePicker") ;
   var elmIcon = null;
   if (objDatePicker) {
    LOG.debug("jsx3.gui.DatePicker = " + objDatePicker);
    elmIcon = getActionableObject(objDatePicker, 'icon');
   }

   return elmIcon;
};

PageBot.prototype.locateElementByJsxDateInput = function(name, inDocument) {
/**	Locate jsx.gui.DatePicker input box by jsxname. New 3.2.0
 *	A form element that allows for the selection of an arbitrary date by showing a navigable calendar
 * when the icon element is clicked.
 *  @param name (String) DatePicker jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    name = stripQuotes(name);
   LOG.debug("locateElementByJsxDateInput jsxname =" + name );

   var objDatePicker = this.findByJsxNameAndType(name, "jsx3.gui.DatePicker") ;
   var elmInput = null;
   if (objDatePicker) {
    LOG.debug("jsx3.gui.DatePicker = " + objDatePicker);
    elmInput = getActionableObject(objDatePicker, 'textbox');
    LOG.debug('date input =' + jsx3.html.getOuterHTML(elmInput));
   }
   return elmInput;
};

PageBot.prototype.locateElementByJsxDateDay = function(text, inDocument) {
/**	Locate day element of jsx.gui.DatePicker by 'jsxname,day'
 *	A form element that allows for the selection of an arbitrary date by showing a navigable calendar. <TD class=normal id=_jsx_testDatePicker_3_2006-0-1 >
 *  @param text (String) jsxname,day where 'today' is a special value to select current day date.
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug("locateElementByJsxDateDay text =" + text );
   text = stripQuotes(text);

   var params = text.split(",");
   var jsxName = params[0];
   var day = params[1];
   var today = new Date();

   var objCal = this.findByJsxNameAndType(jsxName, "jsx3.gui.DatePicker") ;
   LOG.debug("datepicker = " + objCal);
   if (objCal) {
    if (!objCal.getDate()) {
     objCal.setDate(today); // current date
    }

    if (day == 'today') {
       objCal.setDate(today); // current date
       day = today.getDay();
    }
    var year = objCal.getDate().getFullYear();
    var month = objCal.getDate().getMonth();//+1;
    var dateString = year.toString() + "-" + month.toString() + "-" + day;
    LOG.debug('date string = ' + dateString + ' actual month is =' + month);

    return getActionableObject(objCal, 'day', dateString);
   }
};

PageBot.prototype.locateElementByJsxDateNextYear = function(jsxName, inDocument) {
/**	Locate next year icon element of jsx.gui.DatePicker by 'jsxname'
 *  @param jsxname (String) jsxname of the DatePicker
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   jsxName = stripQuotes(jsxName);
   LOG.debug("locateElementByJsxDateNextYear jsxname =" + jsxName );

   var objCal = this.findByJsxNameAndType(jsxName, "jsx3.gui.DatePicker") ;

    return (objCal) ? getActionableObject(objCal, "upyear") : null;
};

PageBot.prototype.locateElementByJsxDatePrevYear = function(jsxName, inDocument) {
/**	Locate previous year icon element of jsx.gui.DatePicker by 'jsxname'
 *  @param jsxname (String) jsxname of the DatePicker
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    jsxName = stripQuotes(jsxName);

    LOG.debug("locateElementByJsxDatePrevYear jsxname =" + jsxName );
    var objCal = this.findByJsxNameAndType(jsxName, "jsx3.gui.DatePicker") ;

    return (objCal) ? getActionableObject(objCal, "downyear") : null;
};

PageBot.prototype.locateElementByJsxDateNextMonth = function(jsxName, inDocument) {
/**	Locate next month icon element of jsx.gui.DatePicker by 'jsxname'
 *  @param jsxname (String) jsxname of the DatePicker
 *  @param inDocument (document) current document object
 *  @return HTML element
 */

    jsxName = stripQuotes(jsxName);
    LOG.debug("locateElementByJsxDateNextMonth jsxjsxName =" + jsxName );

    var objCal = this.findByJsxNameAndType(jsxName, "jsx3.gui.DatePicker") ;

    return (objCal) ? getActionableObject(objCal, "upmonth") : null;
};

PageBot.prototype.locateElementByJsxDatePrevMonth = function(jsxName, inDocument) {
/**	Locate previous month icon element of jsx.gui.DatePicker by 'jsxname'
 *  @param jsxname (String) jsxname of the DatePicker
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    jsxName = stripQuotes(jsxName);
    LOG.debug("locateElementByJsxDatePrevMonth jsxjsxName =" + jsxName );

    var objCal = this.findByJsxNameAndType(jsxName, "jsx3.gui.DatePicker") ;

    return (objCal)  ? getActionableObject(objCal, "downmonth") : null;
};

PageBot.prototype.locateElementByJsxDialogCaption = function(text, inDocument) {
/** Locate  jsx3.gui.Dialog by CaptionText
 *	This class is used to generate a popup window/dialog box object.
 *   var locator = "//SPAN[text()="+ name + "]";
 *  @param text (String) Dialog caption text pattern
 *  @param inDocument (document) current document object
 *  @return HTML element
*/
   text = stripQuotes(text);
    LOG.debug("locateElementByJsxDialogCaption =" + text );

   var oBlock = this.findByJsxTextAndType(text, "jsx3.gui.WindowBar");
   var elmDialog = null;
   if (oBlock && oBlock.getParent().instanceOf("jsx3.gui.Dialog"))
     elmDialog = oBlock.getParent().getRendered();

   LOG.debug("jsx3.gui.Dialog caption = " + oBlock.getText()); // dialog is direct parent of caption

   return elmDialog;
 };

PageBot.prototype.locateElementByJsxDialogName = function(name, inDocument) {
/** Locate Dialog jsx3.gui.Dialog by jsxname
 *	This class is used to generate a popup window/dialog box object.
 *
 * note: can be located with locator = "//DIV[@label="+ name + "]";
 *  @param text (String) Dialog jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
*/

   LOG.debug("locateElementByJsxDialogName jsxname =" + name );

   if ((name.indexOf('"') == 0) || name.indexOf("'") == 0)
     name = name.slice(1, -1);

   var oBlock = this.findByJsxNameAndType(name, "jsx3.gui.Dialog" );

   LOG.debug("jsx3.gui.Dialog = " + oBlock);

   return (oBlock != null) ? oBlock.getRendered() : null;
};

PageBot.prototype.locateElementByJsxDialogBody = function(name, inDocument) {
/** Locate Dialog Body element
 *	This class is used to generate a popup window/dialog box object.
 * jsx3.gui.Dialog by jsxname
 *
 * note: can be located with locator = "//DIV[@label="+ name + "]";
 *  @param text (String) Dialog jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
*/

   LOG.debug("locateElementByJsxDialog body jsxname =" + name );
   if ((name.indexOf('"') == 0) || name.indexOf("'") == 0)
     name = name.slice(1, -1);

   var oBlock = this.findByJsxNameAndType(name, "jsx3.gui.Dialog" );

   LOG.debug("jsx3.gui.Dialog = " + oBlock);

   return (oBlock != null) ? oBlock.getRendered().childNodes[1] : null;
};

PageBot.prototype.locateElementByJsxGridCell = function(text, inDocument) {
/** Locate grid cell by - JsxGridCell=gridJsxName.jsxid.column
 *	The jsx3.gui.Grid class is a subclass of the jsx3.gui.List class.
 *
 *  @param text (String) gridJsxName.jsxid.column
 *  @param inDocument (document) current document object
 *  @return HTML element
 *
*/
   text = stripQuotes(text);
   LOG.debug("locateElementByJsxGridCell =" + text );

   var params = text.split('.');
   var jsxName = params[0];
   var jsxID = params[1];
   var gridCol = parseInt(params[2]);   // Column Index
   LOG.debug("jsxname = " + jsxName  );
   var jsxGrid = this.findByJsxNameAndType(jsxName, "jsx3.gui.Grid" );

   LOG.debug("grid found = " + jsxGrid);
   var gridRowId = jsxGrid.getId() + jsxID;
   var gridRowElement = inDocument.getElementById(gridRowId);

   var cell_item = gridRowElement.childNodes[gridCol];
   LOG.debug("cell [" + gridCol + "]=" + getOuterHTML(cell_item));

   return (cell_item != null && cell_item != undefined) ? cell_item : null ;

 };

PageBot.prototype.locateElementByJsxListName = function(text, inDocument) {
/** Locate List by jsxname
 *   The jsx3.gui.List class supports sorting, resizing, reordering, selection, discontinuous selection, key and mouse navigation, etc.
 * SPAN[class=jsx30list label=jsxname]
 *
 *  @param text (String) list jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxListName name = " + text);

   var jsxElement = null;
   var jsxList = this.findByJsxNameAndType(text, 'jsx3.gui.List');

   if (jsxList != null) {
    jsxElement = jsxList.getRendered();
   }
   return jsxElement;
};

PageBot.prototype.locateElementByJsxListHeaderIndex = function(text, inDocument) {
/* Locate List column header
 *
 *  @param text (String) list jsxname,column index
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   text = stripQuotes(text);
   LOG.debug("locateElementByJsxListName name = " + text);

   var params = text.split(",");
   var listJsxName = params[0];
   var listColumnIndex = parseInt(params[1]); // column index in integer

   var jsxElement = null;
   var jsxList = this.findByJsxNameAndType(listJsxName, 'jsx3.gui.List');

   if (jsxList != null) {
    LOG.debug('list = ' + jsxList);
    var col = jsxList.getChild(listColumnIndex);
    jsxElement = col.getRendered();
    LOG.debug('column=' + getOuterHTML(jsxElement));
   }
   return jsxElement;
};



PageBot.prototype.locateElementByJsxListRowId = function(text, inDocument) {
/** Locate jsx3.gui.List row with list jsxname,record jsxid
 * List row event : focus, blur
 *  @param text (String) list jsxname,record jsxid
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   text = stripQuotes(text);

   var params = text.split(",");
   var listJsxName = params[0];
   var listRecordJsxId = params[1];

   var jsxList = this.findByJsxNameAndType(listJsxName,'jsx3.gui.List');

   var listRowId = jsxList.getId() + listRecordJsxId;
   return inDocument.getElementById(listRowId);

};

PageBot.prototype.locateElementByJsxListRowText = function(text, inDocument) {
/** Locate jsx3.gui.List Row by row text
 *  @param text (String) some text in the list row.
 *  @param inDocument (document) current document object
 *  @return HTML element
*/
    text = stripQuotes(text);

    var params = text.split(",");
    var listJsxName = params[0];
    var listRecordText = params[1];

    var jsxList = this.findByJsxNameAndType(listJsxName,'jsx3.gui.List');
    // get all jsxids in the list
    var row = null;
    var recids  =  jsxList.getXML().selectNodes('//record');
    while (recids.hasNext() && (row == null)) {
        var listRecordJsxId = recids.next().getAttribute('jsxid');
        // find row element by listId+recordId
        var listRowId = jsxList.getId() + listRecordJsxId;
        var element = inDocument.getElementById(listRowId);
        var elementText = '';
        // check each cell text
        for (j=0; j < element.childNodes.length; j++) {
          elementText = getText(element.childNodes[j]);
          //LOG.debug(text +'=element text=' + elementText);
          if (PatternMatcher.matches(listRecordText, elementText) ) {
           row = element; // found the row with given text pattern
           break;
          }
        }//for j

    }//while

    return row;
};



PageBot.prototype.locateElementByJsxMatrixName = function(text, inDocument) {
/** Locate List by jsxname
 *   The jsx3.gui.List class supports sorting, resizing, reordering, selection, discontinuous selection, key and mouse navigation, etc.
 * SPAN[class=jsx30list label=jsxname]
 *
 *  @param text (String) list jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxMatrixName name = " + text);

   var jsxElement = null;
   var jsxMatrix = this.findByJsxNameAndType(text, 'jsx3.gui.Matrix');

   if (jsxMatrix != null) {
    jsxElement = getActionableObject(jsxMatrix);
   }
   return jsxElement;
};

PageBot.prototype.locateElementByJsxMatrixVScroller = function(text, inDocument) {
/** Locate List by jsxname
 *   The jsx3.gui.List class supports sorting, resizing, reordering, selection, discontinuous selection, key and mouse navigation, etc.
 * SPAN[class=jsx30list label=jsxname]
 *
 *  @param text (String) list jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxMatrixName name = " + text);

   var jsxElement = null;
   var jsxMatrix = this.findByJsxNameAndType(text, 'jsx3.gui.Matrix');

   if (jsxMatrix != null) {
    jsxElement = getActionableObject(jsxMatrix, 'vscroller');
   }
   return jsxElement;
};

PageBot.prototype.locateElementByJsxMatrixHScroller = function(text, inDocument) {
/** Locate List by jsxname
 *   The jsx3.gui.List class supports sorting, resizing, reordering, selection, discontinuous selection, key and mouse navigation, etc.
 * SPAN[class=jsx30list label=jsxname]
 *
 *  @param text (String) list jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxMatrixName name = " + text);

   var jsxElement = null;
   var jsxMatrix = this.findByJsxNameAndType(text, 'jsx3.gui.Matrix');

   if (jsxMatrix != null) {
    jsxElement = getActionableObject(jsxMatrix, 'hscroller');
   }
   return jsxElement;
};

PageBot.prototype.locateElementByJsxMatrixCellIndex = function(text, inDocument) {
/** Locate jsx3.gui.Matrix cell with  jsxname.rowIndex.columnIndex
 * List row event : focus, blur
 *  @param text (String) Matrix jsxname.rowindex.colindex
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   text = stripQuotes(text);
    LOG.debug("locateElementByJsxMatrixCellIndex name = " + text);

   var mtxJsxName;
   var rowIndex;
   var colIndex;

   var jsxElement = null;
   var params = text.split(".");
   if ( params.length == 3 ) {
    mtxJsxName = params[0];
    rowIndex = params[1];
    colIndex = params[2];
   } else if (params.length == 4 ) {
       mtxJsxName = params[0] + '.' + params[1]; // put the parent.childname back together
       rowIndex = params[2];
       colIndex = params[3];
   }

   LOG.debug('matrix is = ' + mtxJsxName + " rowIndex=" + rowIndex + " colIndex="+ colIndex);

   var jsxMatrix = this.findByJsxNameAndType(mtxJsxName,'jsx3.gui.Matrix');
   jsxElement = getActionableObject(jsxMatrix, 'cellbyindex', rowIndex, colIndex);
   //LOG.debug('matrix row = ' + getOuterHTML(jsxElement));
   return jsxElement;

};

PageBot.prototype.locateElementByJsxMatrixCellId = function(text, inDocument) {
/** Locate jsx3.gui.Matrix cell with Matrix jsxname.record_jsxid.column_index
 * List row event : focus, blur
 *  @param text (String) Matrix jsxname.record_jsxid.column_index
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);
    LOG.debug("locateElementByJsxMatrixCellId locator = " + text);

   var params = text.split(".");
   var mtxJsxName = params[0];
   var cellJsxid = params[1];
   var colIndex = params[2];
   if (params.length == 4 ) {
        mtxJsxName = params[0] + '.' + params[1]; // put the parent.childname back together
        cellJsxid = params[2];
        colIndex = params[3];
   }

   LOG.debug("mtxname = " + mtxJsxName + " jsxid= " + cellJsxid + " colindex = " + colIndex);

   var jsxMatrix = this.findByJsxNameAndType(mtxJsxName,'jsx3.gui.Matrix');
   //LOG.debug('matrix is = ' + jsxMatrix);
   var element = getActionableObject(jsxMatrix, 'cellbyjsxid', cellJsxid, colIndex);
   //LOG.debug('matrix row = ' + (element) ? getOuterHTML(element): "jsxid "+ cellJsxid + " not found!");
   return (element) ? element : null ; // cell is the selectable element

};

PageBot.prototype.locateElementByJsxMatrixCellText = function(text, inDocument) {
/** Locate jsx3.gui.Matrix cell  with jsxname,text_pattern
 *
 *  @param text (String) Matrix jsxname,text_pattern
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);

   LOG.debug('locateElementByJsxMatrixCellText text = "' + text +'"');

   var params = text.split(/,/);
   var jsxName = params[0];
   var cellText = stripQuotes(params[1]);
   var elmCell = null;
   var jsxList = this.findByJsxNameAndType(jsxName,'jsx3.gui.Matrix');
   LOG.debug('matrix is = ' + jsxList + ' jsxname=' + jsxName + ' celltext='+cellText);

   var matrixRows = getActionableObject(jsxList, 'rows');
   for (var i=0; matrixRows && (i < matrixRows.length); i++) {
       var currentRow = matrixRows[i];
       for (var j=0; j < currentRow.childNodes.length; j++) {
           var currentCell = currentRow.childNodes[j];
           var elementText = getText(currentCell);
            //LOG.debug(cellText +'=element text=' + elementText);
            if (PatternMatcher.matches(cellText, elementText) ) {
                 //LOG.debug('cell =  ' + getOuterHTML(currentCell));
                return currentCell;
            }
       }
   }

   return elmCell;
};

PageBot.prototype.locateElementByJsxMatrixHeaderIndex = function(text, inDocument) {
/* Locate Matrix column header by jsxname and column index
 *
 *  @param text (String) jsxname,column index
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxMatrixHeaderIndex = " + text);

   var params = text.split(",");
   var jsxName = params[0];
   var colIndex = parseInt(params[1]);

   var jsxElement = null;
   var jsxMatrix = this.findByJsxNameAndType(jsxName, 'jsx3.gui.Matrix');

   if (jsxMatrix != null) {
    LOG.debug('matrix = ' + jsxMatrix);
    jsxElement = getActionableObject(jsxMatrix, 'column', colIndex);
    //LOG.debug('column=' + getOuterHTML(jsxElement));
   }
   return jsxElement;
};

PageBot.prototype.locateElementByJsxMatrixRowIndex = function(text, inDocument) {
/** Locate jsx3.gui.Matrix row with list jsxname,record jsxid
 * List row event : focus, blur
 *  @param text (String) Matrix jsxname,record jsxid
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);

   var params = text.split(",");
   var mtxJsxName = params[0];
   var rowIndex = params[1] - 1; // row zero is actually 1

   if (rowIndex < 0)
     rowIndex = 1;

   var jsxMatrix = this.findByJsxNameAndType(mtxJsxName,'jsx3.gui.Matrix');
   //LOG.debug('matrix is = ' + jsxMatrix);
   var element = getActionableObject(jsxMatrix, 'cellbyindex', rowIndex, 0);
   //LOG.debug('matrix row = ' + element.innerHTML);
   return (element) ? element : null; // cell is the selectable element

};

PageBot.prototype.locateElementByJsxMatrixRowId = function(text, inDocument) {
/** Locate jsx3.gui.Matrix row with list jsxname,record jsxid
 * List row event : focus, blur
 *  @param text (String) Matrix jsxname,record jsxid
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);

   var params = text.split(",");
   var mtxJsxName = params[0];
   var jsxId = params[1];

   var jsxMatrix = this.findByJsxNameAndType(mtxJsxName,'jsx3.gui.Matrix');
   //LOG.debug('matrix is = ' + jsxMatrix);
   var element = getActionableObject(jsxMatrix, 'cellbyjsxid', jsxId, 0);
   //LOG.debug('matrix row = ' + jsx3.html.getOuterHTML(element));
   return (element) ? element : null;

};

PageBot.prototype.locateElementByJsxMatrixRowText = function(text, inDocument) {
/** Locate jsx3.gui.Matrix row with list jsxname,record jsxid
 * List row event : focus, blur
 *  @param text (String) Matrix jsxname,record jsxid
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   text = stripQuotes(text);

   var params = text.split(",");
   var mtxJsxName = params[0];
   var rowText = params[1];

   var jsxList = this.findByJsxNameAndType(mtxJsxName,'jsx3.gui.Matrix');
   LOG.debug('matrix is = ' + jsxList);
   var matrixRows = getActionableObject(jsxList, 'rows');
   for (var i=0; matrixRows && (i < matrixRows.length); i++) {
       var currentRow = matrixRows[i];
       //LOG.debug('matrix row = ' + currentRow.innerHTML);
       var elementText = getText(currentRow);
        LOG.debug(rowText +'=element text=' + elementText);
        if (PatternMatcher.matches(rowText, elementText) ) {
          // found the first row with given text pattern
          return currentRow.childNodes[0]; // matrix cell is the selectable element
        }
   }
   return null; // no matching text row found

};


PageBot.prototype.locateElementByJsxMatrixTreeItemText = function(text, inDocument) {
/** Locate jsx3.gui.Matrix TreeItem by text label.
 *  Tree item event : click
 *  @param text (String) Matrix jsxname,text
 *  @param inDocument (document) current document object
 *  @return HTML element (the text label node, functional equivalent with icon node)
 */
   text = stripQuotes(text);

   var params = text.split(",");
   var mtxJsxName = params[0];
   var nodeText = params[1];
   var row = null;

   var jsxList = this.findByJsxNameAndType(mtxJsxName,'jsx3.gui.Matrix');
   LOG.debug('matrix is = ' + jsxList);
   var matrixRows = getActionableObject(jsxList, 'rows');
   for (var i=0; matrixRows && (i < matrixRows.length); i++)
   {
       var objRow = matrixRows[i];
       var objGUI = objRow.childNodes[0]; // cell node
       while(objGUI && objGUI.getAttribute &&  objGUI.getAttribute("jsxtype") != "plusminus" &&
                objGUI.getAttribute("jsxtype") != "paged")
                objGUI = objGUI.childNodes[0];
       textNode = objGUI.parentNode.childNodes[2];
       //LOG.debug('matrix row = ' + currentRow.innerHTML);
       var elementText = getText(textNode);
        LOG.debug(nodeText +'=element text=' + elementText);
        if (PatternMatcher.matches(nodeText, elementText) ) {
          return textNode; // found tree item with matching text pattern
        }

   }
   //LOG.debug('row ' + jsx3.html.getOuterHTML(row));
   return null; // matrix cell is the selectable element
}

PageBot.prototype.locateElementByJsxMatrixTreeItemIndex = function(text, inDocument) {
/** Locate jsx3.gui.Matrix TreeItem by text label.
 *  Tree item event : click
 *  @param text (String) Matrix jsxname,text
 *  @param inDocument (document) current document object
 *  @return HTML element (the text label node, functional equivalent with icon node)
 */
   text = stripQuotes(text);

   var params = text.split(",");
   var jsxName = params[0].trim();  // matrix jsxname
   var jsxIndex = params[1].trim();    // matrix item index

   var row = null;
   var jsxList = this.findByJsxNameAndType(jsxName,'jsx3.gui.Matrix');
   LOG.debug('matrix is = ' + jsxList);
   var matrixRows = getActionableObject(jsxList, 'rows');
       var objRow = matrixRows[jsxIndex];
       var objGUI = objRow.childNodes[0]; // cell node
       while(objGUI && objGUI.getAttribute &&  objGUI.getAttribute("jsxtype") != "plusminus" &&
                objGUI.getAttribute("jsxtype") != "paged")
                objGUI = objGUI.childNodes[0];
       textNode = objGUI.parentNode.childNodes[2];
   //LOG.debug('row ' + jsx3.html.getOuterHTML(row));
   return textNode; // matrix cell is the selectable element
}

PageBot.prototype.locateElementByJsxMatrixTreeItemId = function(text, inDocument) {
/** Locate jsx3.gui.Matrix TreeItem with  jsxname,record jsxid
 * List row event : focus, blur
 *  @param text (String) Matrix jsxname,record jsxid
 *  @param inDocument (document) current document object
 *  @return HTML element (the icon node)
 */
    text = stripQuotes(text);
    var params = text.split(",");
    var jsxName = params[0].trim();  // matrix jsxname
    var jsxId = params[1].trim();    // matrix item id
    LOG.debug('locateElementByJsxMatrixTreeItemId jsxname=' + jsxName + ",jsxid="+jsxId);

    var jsxMtx = this.findByJsxNameAndType(jsxName,'jsx3.gui.Matrix');
    if (!jsxMtx)
      return null;
    else
        LOG.debug('matrix='+jsxMtx);

    var element = getActionableObject(jsxMtx, 'icon', jsxId);
    if (element != null)
      LOG.debug('item icon = ' + jsx3.html.getOuterHTML(element));
    return (element != undefined ) ? element : null;
 };

PageBot.prototype.locateElementByJsxMenuText = function(text, inDocument) {
/**
 * Locate jsx3.gui.Menu element by menu label text (glob|regex pattern)
 * @param (String) text Label text of the menu
 * @param inDocument (document) current document object
 * @return HTML element
 */
    text = stripQuotes(text);
   LOG.debug("locateElementByJsxMenuText text = " + text);

   var oBlock = this.findByJsxTextAndType(text, "jsx3.gui.Menu") ;

   LOG.debug("jsx3.gui.Menu caption = " + oBlock.getText());

   return  (oBlock != null) ? oBlock.getRendered() : null;
};

PageBot.prototype.locateElementByJsxMenuName = function(jsxname, inDocument) {
/**
 * Locate Menu by jsxname. Note xpath locator=//span[@class='jsx30toolbarbutton' and @label='imagemenu']
 * Menu - this class is used to create menus, similar in functionality to system menus used for by the OS.
 *  @param jsxname (String) jsxname of Menu
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   jsxname = stripQuotes(jsxname);
   LOG.debug("locateElementByJsxMenuName = " + jsxname);
   var jsxMenu = this.findByJsxNameAndType(jsxname, "jsx3.gui.Menu");

   LOG.debug("jsx3.gui.Menu caption = " + jsxMenu.getText() + " id = " + jsxMenu.getId());

   return (jsxMenu != null) ? jsxMenu.getRendered() : null;
};

PageBot.prototype.locateElementByJsxMenuWindowId = function (hwID, inDocument) {
/* Locate the actual drop down Menu Element By JsxHeavyWeightId (1,2,3,etc...).
 * Use this locator to verify that Menu expand properly
 */
   // IE bug trigger resize when there's none but dynamic element inserted to DOM
   //jsx3.gui.Event.unsubscribeAll(jsx3.gui.Event.RESIZE);

   var PREFIX = "jsx30curvisiblemenu_";
   return inDocument.getElementById(PREFIX + hwID);
}

PageBot.prototype.locateElementByJsxMenuItemText = function(text, inDocument) {
   LOG.debug("locateElementByMenuItem Text =" + text  );

  text = stripQuotes(text);

  var params = text.split(",");
  var jsxName = params[0].trim();  // menu jsxname
  var jsxText = params[1].trim();    // menu item text

  LOG.debug("jsxname = " + jsxName + " text = " + jsxText);
  var jsxMenu = this.findByJsxNameAndType(jsxName, "jsx3.gui.Menu");
  // get all jsxids in the list
  LOG.debug("menu = " + jsxMenu);
  //LOG.debug("menu items length ="+ getActionableConstants(jsxMenu));

  var elmItem = null;
  var subMenuItems = getActionableObject(jsxMenu, 'items');
  //LOG.debug("menu items length ="+ subMenuItems.length);
  for (var i = 0; i < subMenuItems.length && !elmItem ; i++) {
      //LOG.debug('item ['+ i + '] = ' + getOuterHTML(subMenuItems[i]));
      var elementText = getText(subMenuItems[i]);
      //LOG.debug(jsxText +'=element text=' + elementText);
      if (PatternMatcher.matches(jsxText, elementText) ) {
       elmItem = subMenuItems[i]; // found the row with given text pattern
      }
  }
  return elmItem;

};

PageBot.prototype.locateElementByJsxMenuItemIndex = function(nameId, inDocument) {
/** Locate Menu Item locator by Menu jsxname and Item index (1 based). This returns the outside DIV instead of TD element
 * @param text locator defined by jsxname,jsxid. For example "menu,1"
 * @param inDocument (document) current document object
 * @return HTML element
 */

   nameId = stripQuotes(nameId);
   var params = nameId.split(",");
   var jsxName = params[0];  // menu jsxname
   var jsxIndex = parseInt(params[1]) - 1;    // menu item jsxid

    LOG.debug("locateElementByJsxId name =" + jsxName + " id = "+ jsxIndex  );

    var jsxMenu = this.findByJsxNameAndType(jsxName, "jsx3.gui.Menu");

    LOG.debug("menu id = " + jsxMenu.getId() );

   var elmMenuItem = getActionableObject(jsxMenu, 'itembyindex', jsxIndex);
    if (elmMenuItem)
      LOG.debug("elm menu item =" + elmMenuItem);
   return elmMenuItem;
};

PageBot.prototype.locateElementByJsxMenuItemId = function(nameId, inDocument) {
/** Locate Menu Item locator by Menu jsxname and Item jsxid. This returns the outside DIV instead of TD element
 * @param text locator defined by jsxname,jsxid. For example "menu,1"
 * @param inDocument (document) current document object
 * @return HTML element
 */

   nameId = stripQuotes(nameId);
   var params = nameId.split(",");
   var jsxName = params[0];  // menu jsxname
   var jsxId = params[1];    // menu item jsxid

    LOG.debug("locateElementByJsxId name =" + jsxName + " id = "+ jsxId  );

    var jsxMenu = this.findByJsxNameAndType(jsxName, "jsx3.gui.Menu");

    LOG.debug("menu id = " + jsxMenu.getId() );

   var locator =  jsxMenu.getId() + jsxId; // 3.1.0 menu item id
    LOG.debug("3.1.x locator =" + locator  );
   var elmMenuItem = inDocument.getElementById(locator);
   if (!elmMenuItem) {
       LOG.debug ('getActionableObject on id=' + jsxId);
      elmMenuItem = getActionableObject(jsxMenu, 'itembyjsxid', jsxId);
   }
   return elmMenuItem;
};

PageBot.prototype.locateElementByJsxRadioName = function(text, inDocument) {
/** Locate RadioButton by the jsxname of Radio input
 *  @param text (String) Radio jsxname
 *  @param inDocument (document) current document object
 *  @return HTML element
 */

   LOG.debug("locateElementByJsxRadioName text = " + text);
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
     text = text.slice(1, -1);

   var jsxObj = this.findByJsxNameAndType(text, "jsx3.gui.RadioButton");

   LOG.debug("jsx3.gui.RadioButton = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;
};

PageBot.prototype.locateElementByJsxRadioText = function(text, inDocument) {
/** Locate RadioButton by the text label of the radio
 *  @param text (String) Radio jsxtext
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug("locateElementByJsxRadioText text = " + text);
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
     text = text.slice(1, -1);

   var jsxObj = this.findByJsxTextAndType(text, "jsx3.gui.RadioButton");

   LOG.debug("jsx3.gui.RadioButton = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;
};

PageBot.prototype.locateElementByJsxRadioValue = function(text, inDocument) {
/** Locate RadioButton by the value attribute of Radio input
 *  @param text (String) Radio jsxvalue
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug("locateElementByJsxRadioValue value = " + text);
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
     text = text.slice(1, -1);

   var jsxObj = this.findByJsxValue(text);

   LOG.debug("jsx3.gui.RadioButton = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;
};

/* Locate Select element by jsxname
 *	This class is used to create a DHTML version of the standard windows select box.
 *  @param text (String) jsxname of Select
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
PageBot.prototype.locateElementByJsxSelectName = function(text, inDocument) {
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxSelect name = " + text);
   // init jsx3 object in case this is first locator called

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Select');

   LOG.debug("select obj = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;
};

/* Locate Select element by jsxname
 *	This class is used to create a DHTML version of the standard windows select box.
 *  @param text (String) jsxname of Select
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
PageBot.prototype.locateElementByJsxComboInputName = function(text, inDocument) {
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxComboInput name = " + text);
   // init jsx3 object in case this is first locator called

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Select');

   LOG.debug("select obj = " + jsxObj);
   var inputElement = getActionableObject(jsxObj, 'textbox');
   return inputElement;
};

PageBot.prototype.locateElementByJsxSelectWindow = function(noop, inDocument) {
/*
 * Locate the drop down window of a select/combo control
 *   @param noop (string) Actually doesn't matter what select control you pass here.
 */
     var objHW = inDocument.getElementById("jsx30curvisibleoptions");
     //LOG.debug('select window ' + getOuterHTML(objHW)  );
     return objHW;
}


PageBot.prototype.locateElementByJsxSelectItemId = function(nameId, inDocument) {
/* Locate Select Item by select jsxname and select record jsxid
 *  @param nameId (String) jsxname,jsxid of select item
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   nameId = stripQuotes(nameId);
   var jsxnid = getNameId(nameId);
//   var params = nameId.split(",");
//   var jsxName = params[0];  // jsxname
//  var jsxId = params[1];    // item jsxid
   var jsxElement = null;

   LOG.debug("locateElementByJsxSelectItemId name =" + jsxnid.name + " id = "+ jsxnid.id  );

   var jsxObj = this.findByJsxNameAndType(jsxnid.name, "jsx3.gui.Select");
   if (jsxObj) {
    //LOG.debug("Select element id = " + jsxObj.getId() );
    var locator =  jsxObj.getId() + jsxnid.id; // old 3.1.x item id
   //LOG.debug("locator =" + locator  );
    jsxElement = inDocument.getElementById(locator);
    if (!jsxElement) {
         jsxElement = getActionableObject(jsxObj, 'itembyjsxid', jsxnid.id);
    }
   }
   return jsxElement;
};


PageBot.prototype.locateElementByJsxSelectItemIndex = function(nameId, inDocument) {
    /* Locate Select Item by select jsxname and select item index (1 based)
     *  @param nameId (String) jsxname,index of Select item
     *  @param inDocument (document) current document object
     *  @return HTML element
     */
   nameId = stripQuotes(nameId);

   var params = nameId.split(",");
   var jsxName = params[0];  // menu jsxname
   var index = params[1];    // menu item jsxid
   if (index > 0)
     index = index - 1;     // 0 based index
   LOG.debug("locateElementByJsxSelectItemIndex name =" + jsxName + " index = "+ index  );

   var jsxObj = this.findByJsxNameAndType(jsxName, "jsx3.gui.Select");
   LOG.debug("Select control= " + jsxObj.getId() );

   var jsxElement = getActionableObject(jsxObj, 'itembyindex', index);
   return jsxElement;
};

PageBot.prototype.locateElementByJsxSelectItemText = function(jsxname, inDocument) {
/* Locate Select Item by select jsxname and select item text
 *  @param jsxname (String) jsxname,text of Select item
 *  @param inDocument (document) current document object
 *  @return HTML element
 */

   jsxname = stripQuotes(jsxname);
   LOG.debug("locateElementBySelectItem Text =" + jsxname  );
   var params = jsxname.split(",");
   var jsxName = params[0];  // menu jsxname
   var jsxText = params[1];    // item label text

   LOG.debug(" name =" + jsxName + " text = "+ jsxText  );

   var jsxSelect = this.findByJsxNameAndType(jsxName, "jsx3.gui.Select");
   LOG.debug("select obj = " + jsxSelect);

  // get all jsxids in the Select
   var item = null;

    var recids  =  jsxSelect.getXML().selectNodes('//record');
    while (recids.hasNext() && (item == null) ) {
      var itemJsxId = recids.next().getAttribute('jsxid');
      // find row element by listId+recordId
      var itemId = jsxSelect.getId() +  itemJsxId;
      LOG.debug("itemId=" + itemId);
      var element = inDocument.getElementById(itemId);
      if (!element) // 3.2.0
          element = getActionableObject(jsxSelect, 'itembyjsxid', itemJsxId)
      // check each child element text
      var elementText = getText(element);//.childNodes[1]); // childNodes[0]=<img> childNodes[1]=<span>text</span>
      LOG.debug(jsxText +'=element text=' + elementText);
      if (PatternMatcher.matches(jsxText, elementText) ) {
         return element;
      }
    }//while

  return item;

};

PageBot.prototype.locateElementByJsxSliderName = function(text, inDocument) {
/**
 * Slider
 *	GUI control provides a draggable slider.
 *  @param text (String) jsxname of Slider
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxSlider name = " + text);
   // init jsx3 object in case this is first locator called

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Slider');
   //LOG.debug("slider obj = " + jsxObj);
   return (jsxObj != null) ? jsxObj.getRendered() : null;
}

PageBot.prototype.locateElementByJsxSliderHandle = function(text, inDocument) {
/**
 * Locate the handle of slider, a GUI control provides a draggable slider.
 *  @param text (String) jsxname of Slider
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxSlider handle = " + text);
   // init jsx3 object in case this is first locator called

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Slider');
   //LOG.debug("slider obj = " + jsxObj);
   return getActionableObject(jsxObj, 'handle');
 };

PageBot.prototype.locateElementByJsxSplitterName = function(text, inDocument) {
/*
 *	This class manages layouts by providing a container that will paint its first two child GUI objects
 *	 separated by a 'splitter' (either vertical or horizontal).
 *  @param text (String) jsxname of Splitter
 *  @param inDocument (document) current document object
 *  @return HTML element
*/   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsx Splitter name = " + text);

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Splitter' );

   LOG.debug("splitter obj = " + getOuterHTML(jsxObj.getRendered()));
   // actionable element is in a table row 0 cell 0
   var jsxElement = getActionableObject()
   return (jsxObj != null) ? jsxObj.getRendered() : null;

};

PageBot.prototype.locateElementByJsxStackText = function(text, inDocument) {
/** Locate jsx3.gui.Stack by stack text label text pattern(glob | regex | exact)
 *	This class is equivalent to a tab, but uses the stack metaphor; like a tab, it has one child—a block for its content; a jsx3.gui.Stack instance should only be contained by a jsx3.gui.StackGroup instance for proper rendering.
 *
 *  @param text (String) text label on the Stack
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxStack text = " + text);

   var jsxObj =  this.findByJsxTextAndType(text, 'jsx3.gui.Stack');

   LOG.debug("stack obj = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;
};

PageBot.prototype.locateElementByJsxStackName = function(text, inDocument) {
/** Locate jsx3.gui.Stack by stack jsxname (exact match)
 * --TODO, the actionable tag is not on top level div/span,
 *   it's actually under the first cell of child table element???
 *  @param text (String) jsxname of Stack
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxStack name = " + text);

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Stack' );

   LOG.debug("stack obj = " + jsxObj);
   // actionable element is in a table row 0 cell 0
   return (jsxObj != null) ? jsxObj.getRendered() : null;
};

PageBot.prototype.locateElementByJsxTabName = function(text, inDocument) {
/** Locate Tab by jsxname
 *	jsx3.gui.Tab instances are always bound to a parent "jsx3.gui.TabbedPane" instance that contains them.
 *  @param text (String) jsxname of Tab
 *  @param inDocument (document) current document object
 *  @return HTML element
*/
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxTab name = " + text);

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Tab' );
   LOG.debug("Tab obj = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;

};

PageBot.prototype.locateElementByJsxTabText = function(text, inDocument) {
/** Locate Tab by tab text label
 *	jsx3.gui.Tab instances are always bound to a parent "jsx3.gui.TabbedPane" instance that contains them.
 *  @param text (String) jsxname of Tab
 *  @param inDocument (document) current document object
 *  @return HTML element
*/

   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxTab text = " + text);

   var jsxObj =  this.findByJsxTextAndType(text, 'jsx3.gui.Tab');
   LOG.debug("Tab obj = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;

};

PageBot.prototype.locateElementByJsxTreeName = function(text, inDocument) {
/** Locate Tree, which is a DHTML-based navigational trees (similar to the tree structure used by Windows Explorer with folders and files).
 * jsx3.gui.Tree by jsxname
 *  @param text (String) jsxname of Tree
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);
   LOG.debug("locateElementByJsxTree name = " + text);

   var jsxObj =  this.findByJsxNameAndType(text, 'jsx3.gui.Tree');

   LOG.debug("tree obj = " + jsxObj);

   return (jsxObj != null) ? jsxObj.getRendered() : null;


}

PageBot.prototype.locateElementByJsxTreeItemText = function(text, inDocument) {
/** Locate jsx3.gui.Tree item by Record jsxid and Tree jsxname
 *  @param text (String) jsxname,jsxid of Tree item
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);

   var params = text.split(",");
   var jsxName = params[0];  // tree jsxname
   var jsxText = params[1];    // tree item jsxid

   LOG.debug("locateElementByJsxTreeItemText name =" + jsxName + " jsxid = "+ jsxText  );

    var jsxTree = this.findByJsxNameAndType(jsxName, 'jsx3.gui.Tree');

    LOG.debug("tree = " + jsxTree );

   var jsxItems = getActionableObject(jsxTree, 'items'); // get all tree items
   var jsxElement = null;
   for (var i = 0; (i < jsxItems.length) && (jsxElement == null); i++) {
       var itemLabel = getText(jsxItems[i].childNodes[2]);
       //LOG.debug("expected = "+ jsxText + " label=" + itemLabel);
       if (PatternMatcher.matches(jsxText, itemLabel))
         jsxElement = jsxItems[i];
   }
   return (jsxElement) ? jsxElement : null;

};

PageBot.prototype.locateElementByJsxTreeItemIndex = function(text, inDocument) {
/** Locate jsx3.gui.Tree item by Tree jsxname and index
 *  @param text (String) jsxname,index of Tree item
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   var params = text.split(",");
   var jsxName = params[0].trim();  // tree jsxname
   var jsxindex = params[1].trim();    // tree item jsxid

   LOG.debug("locateElementByJsxTreeItemId name =" + jsxName + " index = "+ jsxindex  );

    var jsxTree = this.findByJsxNameAndType(jsxName, 'jsx3.gui.Tree');

    LOG.debug("tree = " + jsxTree );

   var jsxElement = getActionableObject(jsxTree, 'itembyindex', jsxindex);

   return (jsxElement) ? jsxElement : null;

};

PageBot.prototype.locateElementByJsxTreeItemId = function(text, inDocument) {
/** Locate jsx3.gui.Tree item by Record jsxid and Tree jsxname
 *  @param text (String) jsxname,jsxid of Tree item
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
      text = text.slice(1, -1);


   var params = text.split(",");
   var jsxName = params[0];  // tree jsxname
   var jsxId = params[1];    // tree item jsxid

   LOG.debug("locateElementByJsxTreeItemId name =" + jsxName + " jsxid = "+ jsxId  );

    var jsxTree = this.findByJsxNameAndType(jsxName, 'jsx3.gui.Tree');

    LOG.debug("tree = " + jsxTree );

   var locator =  jsxTree.getId() + '_' + jsxId;
    LOG.debug("locator =" + locator  );
   var jsxElement = getActionableObject(jsxTree, 'itembyjsxid', jsxId);
   LOG.debug("tree item element = " + getOuterHTML(jsxElement));

   return jsxElement;

}


PageBot.prototype.locateElementByJsxTextboxName = function(text, inDocument) {
/** Locate jsx3.gui.TextBox by jsxname (exact).
 *	This jsx3.gui.TextBox class allows integration of a standard HTML text input into the JSX DOM.
 *  @param text (String) jsxname of textbox
 *  @param inDocument (document) current document object
 *  @return HTML input element
*/
   text = stripQuotes(text);
   LOG.debug("locateElementByJsxTextboxName = " + text);

   var jsxText =  this.findByJsxNameAndType( text, "jsx3.gui.TextBox" );

 return (jsxText != null) ? jsxText.getRendered() : null;


};

PageBot.prototype.locateElementByJsxTimePickerHours = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement = getActionableObject(jsxTPicker, 'hour');
    return inputElement;
}

PageBot.prototype.locateElementByJsxTimePickerMinutes = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement = getActionableObject(jsxTPicker, 'minute');
    return inputElement;

}
PageBot.prototype.locateElementByJsxTimePickerSeconds = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement= getActionableObject(jsxTPicker, 'second');

    return inputElement;
}

PageBot.prototype.locateElementByJsxTimePickerMillis = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement= getActionableObject(jsxTPicker, 'milli');

    return inputElement;
}

PageBot.prototype.locateElementByJsxTimePickerAmPm = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement= getActionableObject(jsxTPicker, 'ampm');

    return inputElement;
}

PageBot.prototype.locateElementByJsxTimePickerSpinUp = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement= getActionableObject(jsxTPicker, 'spinup');

    return inputElement;
}

PageBot.prototype.locateElementByJsxTimePickerSpinDown = function(text, inDocument) {
    text = stripQuotes(text);
    var jsxTPicker = this.findByJsxNameAndType(text, "jsx3.gui.TimePicker");
    var inputElement= getActionableObject(jsxTPicker, 'spindown');

    return inputElement;
}
PageBot.prototype.locateElementByJsxToolbarButtonName = function(text, inDocument) {
/**
 * ToolbarButton
 *	This class provides a standard interface for creating toolbar buttons.
 *  jsx3.gui.ToolbarButton (also used on dialog box min/max/close buttons )
 *  @param text (String) jsxname of ToolbarButton
 *  @param inDocument (document) current document object
 *  @return HTML element
 */
   LOG.debug("locateElementByJsxClickToolbarButton jsxname=" + text );
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
     text = text.slice(1, -1);

   var oButton = this.findByJsxNameAndType( text, "jsx3.gui.ToolbarButton" );

   LOG.debug("jsxtoolbarbutton = " + oButton);

   return (oButton != null) ? oButton.getRendered() : null;
};

PageBot.prototype.locateElementByJsxToolbarButtonText = function(text, inDocument) {
/**
 * toolbarButton by button text (pattern: glob, regexp)
 *  @param text (String) jsxname of ToolbarButton
 *  @param inDocument (document) current document object
 *  @return HTML element
*/

   LOG.debug("locateElementByJsxClickToolbarButton text=" + text );
   if ((text.indexOf('"') == 0) || text.indexOf("'") == 0)
     text = text.slice(1, -1);
   var oButton = this.findByJsxTextAndType(text, 'jsx3.gui.ToolbarButton');

   LOG.debug("jsxtoolbarbutton = " + oButton);

   return (oButton != null) ? oButton.getRendered() : null;

};

// Internal function used by typeJsxTextbox command
PageBot.prototype.replaceJsxText = function(jsxObj, jsxElement, text)
{
    if (jsxObj && jsxElement) {
        LOG.debug('obj =' + jsxObj.getName()  +'text = ' + text);
        if   (jsx3.gui.DatePicker && jsxObj.instanceOf(jsx3.gui.DatePicker)) {
            try {
                dateToSet = new Date(text);
                _triggerEvent(jsxElement, 'focus', false);
                _triggerEvent(jsxElement, 'select', false);
                jsxObj.setDate(dateToSet);
                _triggerEvent(jsxElement, 'change', false);
            } catch (ex) {
                this.replaceText(jsxElement, text);
            }
            _triggerEvent(jsxElement, 'blur', false);
            return;
        }
         this.replaceText(jsxElement, text);
        _triggerEvent(jsxElement, 'blur', false);
   }

}

/* You must obtain cssQuery-p.js library from openqa.org and update TestRunner.html (and/or hta) */
PageBot.prototype.locateElementByCss = function(locator, document) {
    try {
        var elements = cssQuery(locator, document);
        if (elements.length != 0)
            return elements[0];
    } catch (ex) {
        throw new SeleniumError("cssQuery not available in GITAK. Obtain the library from openqa.org and update TestRunner.html(and/or HTA)");
    }
    return null;
};

// Original -- $Id: includeCommand.js 166 2006-12-11 22:03:45Z rob $
/* Modified by TIBCO Software Inc., Copyright © 2007 */
/*extern document, window, XMLHttpRequest, ActiveXObject */
/*extern Selenium, htmlTestRunner, LOG, HtmlTestCaseRow, testFrame, storedVars, URLConfiguration */

/**
 * add the content of another test to the current test
 * target receives the page address (from selenium tests root)
 *
 * nested include works
 *
 * example of use
 * in the test :
 * | store            | 3445                | userId    |
 * | store            | joe                 | name      |
 * | // Third column contains time out value        |
 * |include           | testpiece.html      | 5000  |
 *
 * where * testpiece.html contains
 *
 * | this is a piece of test                     |
 * |open              | myurl?userId=${userId}|  |
 * |verifyTextPresent | ${name}               |  |

 * as selenium reach the include commande, it will load
 * testpiece.html into you current test and your test will become

 * | store            | 3445                | userId    |
 * | store            | joe                 | name      |
 * |included          | testpiece.html          |  |
 * |open              | myurl?userId=${userId}  |  |
 * |verifyTextPresent | ${name}                 |  |

 *
 * Original Authors
 * @author Alexandre Garel
 * @author Robert Zimmermann
 *  Version: 2.1

 * Modified 2007-08-15  -- GITAK, dhwang
 * - Removed variable replacement
 * - Removed show/hide feature
 * - Fixed IE7 XMLHttpRequest permission denied issue.
 * - Fixed HTA run issue
 * - Fixed Absolute path in test=C:/abs_path/blah/testsuite.html URL parameter issue
 * - Decorate include command with timeout
 */

Selenium.prototype.doIncluded = function(locator, paramString) {
    // do nothing, as rows are already included
};


function IncludeCommand() {
    this.targetRow = null;
}

IncludeCommand.EXPANDED   = "included"; // this was the old replacement in pre 2.1? --dhwang
IncludeCommand.LOG_PREFIX = "IncludeCommand: ";

IncludeCommand.prototype.postProcessIncludeCommandRow = function(includeCmdRow) {
    /**
     * Command name is changed from 'include' to 'included' to avoid another inclusion during a second pass
     *
     * @param includeCmdRow TR DOM-element, the source of the current execution
     */
    var lastInclRow = this.targetRow;
    (includeCmdRow.getElementsByTagName("td"))[0].firstChild.nodeValue = IncludeCommand.EXPANDED;

    // removed the fold/unfold trick -- dhwang
};

IncludeCommand.extendSeleniumExecutionStack = function(newRows) {
    /**
     * Put the new commands into the current position of the selenium execution stack
     *
     * @param newRows Array of HtmlTestCaseRows to be inserted in seleniums' execution stack
     */
    try {
        //(rz WEB.DE) changed to work with selenium 0.8.0
        // Leave previously run commands as they are
        var seleniumCmdRowsPrev = htmlTestRunner.currentTest.htmlTestCase.commandRows.slice(0, htmlTestRunner.currentTest.htmlTestCase.nextCommandRowIndex);
        var seleniumCmdRowsNext = htmlTestRunner.currentTest.htmlTestCase.commandRows.slice(htmlTestRunner.currentTest.htmlTestCase.nextCommandRowIndex);
        var newCommandRows = seleniumCmdRowsPrev.concat(newRows);
        htmlTestRunner.currentTest.htmlTestCase.commandRows = newCommandRows.concat(seleniumCmdRowsNext);
    } catch(e) {
        LOG.error(IncludeCommand.LOG_PREFIX + "Error adding included commandRows. exception=" + e);
        throw new Error("Error adding included commandRows. exception=" + e);
    }
};

IncludeCommand.prototype.injectIncludeTestrows = function(includeCmdRow, testDocument, testRows) {
    /**
     * Insert new (included) commad rows into current testcase (inject them)
     *
     * @param includeCmdRow TR Element of the include commad row wich called this include extension (from here the included rows have to be inserted)
     * @param testDocument DOM-document of the current testcase (needed to copy included command rows)
     * @param testRows prepared testrows to be included
     * @return newRows Array of HtmlTestCaseRow objects ready to be used by selenium
     */
    this.targetRow = includeCmdRow;
    var newRows = new Array();

    // TODO: use selenium methods to get to the inner test-rows (tr-elements) of an testcase.
    //       here it is the testcase to be included
    // first element is empty and first row is the title => let's begin at i=2
    for (var i = 2 ; i < testRows.length; i++) {
        var newRow = testDocument.createElement("tr");
        var newText = testRows[i];
        // inserting
        this.targetRow = this.targetRow.parentNode.insertBefore(newRow, this.targetRow.nextSibling);
        // innerHTML permits us not to interpret the rest of html code
        // note: innerHTML is to be filled after insertion of the element in the document
        // note2 : does not work with internet explorer
        try {
            this.targetRow.innerHTML = newText;
        } catch (e) {
            // doing it the hard way for ie
            // parsing column, doing column per column insertion
             LOG.debug(newText);
            // remove < td>
            newText = newText.replace(/<\s*td[^>]*>/ig,"");
            //Lance: remove </tbody>
            newText = newText.replace(/<\/*tbody*>|<br>/ig,"");
            // split on </td>
            var testCols = newText.split(/<\/\s*td[^>]*>/i);
            // first element is empty -> j=1
            for (var j = 0 ; j < testCols.length; j++) {
                var newCol = testDocument.createElement("td");
                var colText = testCols[j];
                newCol = this.targetRow.appendChild(newCol);
                newCol.innerHTML = colText;
            }
        }
        // TODO try to use original HtmlTestCase class instead copying parts of it
        if (newRow.cells.length >= 3) {
            var seleniumRow = new HtmlTestCaseRow(newRow);
            seleniumRow.addBreakpointSupport();
            newRows.push(seleniumRow);
        }
    }
    //LOG.debug(IncludeCommand.LOG_PREFIX + "end with some table magic");
    return newRows;
};


IncludeCommand.prepareTestCaseAsText = function(responseAsText) {
    /**
     * Prepare the HTML to be included in as text into the current testcase-HTML
     * Strip all but the testrows (tr)
     * Stripped will be:
     *  - whitespace (also new lines and tabs, so be careful wirt parameters relying on this),
     *  - comments (xml comments)
     * Replace variable according to include-parameters
     * note: the include-variables are replaced literally. selenium does it at execution time
     * also note: all selenium-variables are available to the included commands, so mostly no include-parameters are necessary
     *
     * @param responseAsText table to be included as text (string)
     * @return testRows array of tr elements (as string!) containing the commands to be included
     *
     * TODO:
     *  - selenium already can handle testcase-html. use selenium methods or functions instead
     *  - find better name for requester
     */
    // LOG.debug(IncludeCommand.LOG_PREFIX +
    //    "removing new lines, carret return and tabs from response in order to work with regexp");
    // removing new lines, carret return and tabs from response in order to work with regexp
    var pageText = responseAsText.replace(/\r|\n|\t/g,"");
    // remove comments
    // begin comment, not a dash or if it's a dash it may not be followed by -> repeated, end comment
    pageText = pageText.replace(/<!--(?:[^-]|-(?!->))*-->/g,"");
    // find the content of the test table = <[spaces]table[char but not >]>....< /[spaces]table[chars but not >]>
    var testText = pageText.match(/<\s*table[^>]*>(.*)<\/\s*table[^>]*>/i)[1];

    // removes all  < /tr>
    // in order to split on < tr>
    testText = testText.replace(/<\/\s*tr[^>]*>/ig,"");
    // split on <tr>
    var testRows = testText.split(/<\s*tr[^>]*>/i);
    // LOG.debug(IncludeCommand.LOG_PREFIX + "about to return testRows");
    return testRows;
};

IncludeCommand.responseIsSuccess = function(status) {
/* succuess status == 2XX or 0 or undefined */
    return status == undefined
        || status == 0
        || (status >= 200 && status < 300);
}

IncludeCommand.getIncludeDocumentBySynchronRequest = function(includeUri) {
    /**
     * Prepare and do the XMLHttp Request synchronous as selenium should not continue execution meanwhile
     *
     * note: the XMLHttp requester is returned (instead of e.g. its text) to let the caller decide to use xml or text
     *
     * selenium-dependency: uses extended String from htmlutils
     *
     * TODO - use a URL object for parameter and url handling instead of custom regexes
     *  //there is discussion about getting rid of prototype.js in developer forum.
     *  //the ajax impl in xmlutils.js is not active by default in 0.8.0 due tue no script-tag in TestRunner.html
     *  //TODO use Ajax from prototype like this:
     *  var sjaxRequest = new Ajax.Request(url, {asynchronous:false});
     *
     * @param includeUri URI to the include-document (document has to be from the same domain)
     * @return XMLHttp requester after receiving the response
     */
    var url = IncludeCommand.prepareUrl(includeUri, document.location);
    // the xml http requester to fetch the page to include
    var requester = IncludeCommand.newXMLHttpRequest();
    if (!requester) {
        throw new Error("XMLHttp requester object not initialized");
    }
    requester.open("GET", url, false); // synchron mode ! (we don't want selenium to go ahead)
    requester.send(null);

    //if ( requester.status != 200 && requester.status !== 0 ) {
    if (!this.responseIsSuccess(requester.status)) {
        throw new Error("Error while fetching " + url + " server response has status = " + requester.status + ", " + requester.statusText );
    }
    return requester;
};

/*
IncludeCommand.prepareUrl = function(includeUri, location) {
    // use composition instead of inheritance to keep dependency minimal
    var urlConfig = Class.create();
    Object.extend(urlConfig.prototype, URLConfiguration.prototype);
    Object.extend(urlConfig.prototype, {
        initialize: function() {
            this.queryString = location.search.substring(1, location.search.length);
            if (browserVersion.isHTA) { // fix for HTA runner -- dhwang
               this.queryString = htmlTestRunner.controlPanel.queryString;
            }
        },

        getQueryParameter: function(searchKey) {
            return this._getQueryParameter(searchKey);
        }
    });
    var uc = new urlConfig();
    var baseUrl = "";

    LOG.debug(IncludeCommand.LOG_PREFIX + "document.location='" + location + "'");
    // Windows absolute path scart with c:/ or [a-z]:/
    if (!includeUri.match(/^[a-z]:/) && !includeUri.match(/^\//) && !includeUri.match(/^http:/)) {
        var subdir = uc.getQueryParameter("test");

        if (subdir && subdir.indexOf("/") > -1) {
           var idx = subdir.lastIndexOf("/");
           subdir = subdir.substring(0, idx + 1);
        }

        //new RegExp("^([^?\n]+/).+$"))[1]; // base uri = char - / - chars other than /
        urlpat = /^([^?\n]+\/).+$/;

        baseUrl = location.href;
        baseUrl = baseUrl.match(urlpat)[1];
        // Fix absolute path in URL parameter. e.g. test=C:/gitak/tests/ or test=/abspath/test/ --dhwang
        if (subdir.match(/^[a-z]:/) || subdir.match(/^\//) ) {
            LOG.debug( "file:// + subdir =" + subdir);
            baseUrl = "file://" + subdir;// file url?
        } else if (subdir.match(/^http:/) || subdir.match(/^https:/) || subdir.match(/^file:/)) {
          //subdirLocation = parseUrl(subdir);
          baseUrl = subdir;
        }
        else
            baseUrl = baseUrl + subdir;

        LOG.debug(IncludeCommand.LOG_PREFIX +
            "include URL seems to be relative determined baseUrl='" + baseUrl + "'");
    }


    LOG.debug(IncludeCommand.LOG_PREFIX + "include document url='" + baseUrl + includeUri + "'");
    return baseUrl + includeUri;
};
*/
// include 2.3 prepareUrl
IncludeCommand.prepareUrl = function(includeUrl) {
    // Construct absolute URL to get include document
     // using selenium-core handling of urls (see absolutify in htmlutils.js)

    var prepareUrl;
    // htmlSuite mode of SRC? TODO is there a better way to decide whether in SRC mode?
    if (window.location.href.indexOf("selenium-server") >= 0) {
        LOG.debug(IncludeCommand.LOG_PREFIX + "we seem to run in SRC, do we?");
        preparedUrl = absolutify(includeUrl, htmlTestRunner.controlPanel.getTestSuiteName());
    } else {
        preparedUrl = absolutify(includeUrl, selenium.browserbot.baseUrl);
    }
    LOG.info(IncludeCommand.LOG_PREFIX + "using url to get include '" + preparedUrl + "'");
    return preparedUrl;
};

IncludeCommand.newXMLHttpRequest = function() {
    // TODO -- should be replaced by impl. in prototype.js or xmlextras.js?
    var requester = 0;
    var exception = '';
    // see http://developer.apple.com/internet/webcontent/xmlhttpreq.html
    try {
        // Check for IE/ActiveX first
        if(window.ActiveXObject) {
            try {
                requester = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch(e) {
                requester = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } // Reorder to avoid using Native XMLHTTP on IE7, which is more restrictive -- dhwang
        // native XMLHttpRequest object
        else if(window.XMLHttpRequest) {
            requester= new XMLHttpRequest();
        }

    }
    catch(e) {
        throw new Error("Your browser has to support XMLHttpRequest in order to use include \n" + e);
    }
    return requester;
};


IncludeCommand.prototype.doInclude = function(fileName) {
    // ask selenium for the current row (<tr> Element of the include command)

    var currentSelHtmlTestcase = testFrame.getCurrentTestCase(); //htmlTestRunner.currentTest.htmlTestCase; --dhwang
    var includeCmdRow = currentSelHtmlTestcase.commandRows[currentSelHtmlTestcase.nextCommandRowIndex - 1].trElement;

    if (!includeCmdRow) {
        throw new Error("includeCommand: failed to find include-row in source test table");
    }

    var reqResponse = IncludeCommand.getIncludeDocumentBySynchronRequest(fileName);

    // removed paramsArray -- dhwang
    var includedTestCaseHtml = IncludeCommand.prepareTestCaseAsText(reqResponse.responseText);
    var testDocument = testFrame.getDocument();

    // member method? because targetRow member is set
    var newRows = this.injectIncludeTestrows(includeCmdRow, testDocument, includedTestCaseHtml);

    IncludeCommand.extendSeleniumExecutionStack(newRows);

    // member method? because targetRow member is accessed
    this.postProcessIncludeCommandRow(includeCmdRow);
};


Selenium.prototype.doInclude = function(fileName, timeout) {
    //LOG.debug(IncludeCommand.LOG_PREFIX + "modified from v2.1 -- dhwang");
    var includeCommand = new IncludeCommand();
    return Selenium.decorateFunctionWithTimeout(includeCommand.doInclude(fileName), timeout);
};