/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

/*
 * % openConsoleWindow()  --alias for the JavaScript method, window.open
 */
openConsoleWindow: function(strURL, strPopupName, intWidth, intHeight, yesnoScrollbar,
    yesnoMenuBar, yesnoStatus, yesnoLocation, yesnoToolbar, intLeft, intTop) {

  if (this.CONSOLES == null) this.CONSOLES = {};

  if (strPopupName) {
    try {
      var console = this.CONSOLES[strPopupName];
      if (console && ! console.closed) {
        // timeout because closing a menu focuses the GI app again
        jsx3.sleep(function(){console.focus();});
        return;
      }
    } catch (e) {}
  }

  var strScrollbar = yesnoScrollbar ? "scrollbars=" + yesnoScrollbar + "," : "";
  var strMenuBar = yesnoMenuBar ? "menubar=" + yesnoMenuBar + "," : "";
  var strStatus = yesnoStatus ? "status=" + yesnoStatus + "," : "";
  var strLocation = yesnoLocation ? "location=" + yesnoLocation + "," : "";
  var strToolbar = yesnoToolbar ? "toolbar=" + yesnoToolbar + "," : "";
  var strWidth = intWidth ? "width=" + intWidth + "," : "";
  var strHeight = intHeight ? "height=" + intHeight + "," : "";
  var strLeft = intLeft ? "left=" + intLeft + "," : "";
  var strTop = intTop ? "top=" + intTop + "," : "";

  this.CONSOLES[strPopupName] = window.open(strURL, strPopupName, "directories=no,resizable=yes," +
      strScrollbar +  strMenuBar + strStatus + strLocation + strToolbar + strWidth + strHeight + strLeft + strTop);
  jsx3.sleep(function(){jsx3.ide.CONSOLES[strPopupName].focus();});
  return this.CONSOLES[strPopupName];
},

/*
scriptTypeAheadSpy: function(objMenu, strRecordId) {
  // UGH: it's too difficult to get this spy to work in Fx
  if (! jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
    return false;
  
  var objNode = objMenu.getRecordNode(strRecordId);
  var type = objNode.getAttribute("type");

  if (type) {
    var jsxidfk = objNode.getAttribute("jsxidfk");
    if (jsxidfk == null)
      jsxidfk = objNode.getAttribute("oldid");

    var src = null;
    while (objNode != null && src == null) {
      src = objNode.getAttribute('src');
      objNode = objNode.getParent();
    }

    if (src != null) {
      var blockX = jsx3.IDE.getJSXByName("jsxblockx_typeaheadscriptspy");
      var strURL = src;
      if (blockX.getXMLURL() != strURL) {
        blockX.setXMLURL(strURL);
        blockX.getServer().getCache().clearById(blockX.getXMLId());
      }

      var objMemberNode = blockX.getXML().selectSingleNode("//record[@jsxid='"+jsxidfk+"']");

      if (objMemberNode) {
        blockX.setXSLParam("membertype", type);
        blockX.setXSLParam("memberid", jsxidfk);
        return blockX.repaint();
      }
    }
  }
  return false;
},
*/

/* @jsxobf-clobber */
_SOUNDS: {},

registerSound: function(strName, strURI) {
  jsx3.require("jsx3.gui.Sound");
  if (this._SOUNDS[strName] == null) {
    this._SOUNDS[strName] = new jsx3.gui.Sound("idesound_" + strName, strURI);
  }
},

playSound: function(strName, intVolume) {
  var sound = this._SOUNDS[strName];
  if (sound) {
    sound.setVolume(intVolume != null ? intVolume : 100);

    if (sound.getParent() == null) {
      var body = jsx3.IDE.getBodyBlock();
      body.setChild(sound);
      body.paintChild(sound);
      jsx3.sleep(function(){ sound.play(); }); // timeout seems to work in IE, not Fx
    } else {
      sound.play();
    }
  }
},

onContextHelp: function(objEvent) {
  jsx3.ide.LOG.debug("Open context sensitive help: " + objEvent.helpid);

  var xml = new jsx3.xml.CDF.Document().load("jsx:///../doc/html/ctx/context.xml");
  if (! xml.hasError()) {
    var rec = xml.getRecord(objEvent.helpid);
    if (! rec) {
      if (! w) jsx3.ide.LOG.warn("No context help entry for " + objEvent.helpid + ". Falling back to ide.");
      rec = xml.getRecord("ide");
    }

    if (rec) {
      var path = rec.jsxtext;
      var w = window.open(path, "jsxidectxhelp");
      if (! w) jsx3.ide.LOG.warn("A pop-up blocker may have prevented context help from opening.");
    }
  } else {
    jsx3.ide.LOG.info(xml.getError());
    var url = jsx3.IDE.getDynamicProperty("builder_url");
    jsx3.IDE.alert("Documentation Not Installed",
        "You have invoked the context help system but the documentation that this depends on is not installed. " +
        "Please <a href='" + url + "' target='_blank'>download the General Interface&#8482; documentation</a> and make sure that it is installed in the doc/ directory.");
  }
},

doOpenSettings: function(intPane) {
  var plugin = jsx3.ide.getPlugIn("jsx3.ide.settings.ide");
  if (plugin)
    plugin.load().when(function() {
      plugin.showPane(intPane);
    });
}

});