/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.showLicenseAgreement = function() {
  jsx3.ide.QUEUE.pause();

  var dialog = jsx3.IDE.getRootBlock().load('components/license/license.xml');
  jsx3.sleep(function(){dialog.focus();});
};

jsx3.ide.agreeLicenseAgreement = function(objDialog) {
  objDialog.doClose();
  jsx3.ide.QUEUE.start();
};

jsx3.ide.disagreeLicenseAgreement = function(objDialog) {
  window.onbeforeunload = null;
  window.location.href = "http://power.tibco.com/gi/builderlink/power/";
};

// for better stack traces
jsx3.Package.definePackage("jsx3.ide", function(){});

if (! jsx3.app.Browser.win32) {
  jsx3.ide.LOG.warn("@gi.ide.notsupported@");
}
