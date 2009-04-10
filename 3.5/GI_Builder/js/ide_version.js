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

jsx3.ide.newVersionCheck = function(bForce) {
  // only perform check on compiled build
  if (!"@build.gi.version@".match(/\d/)) return;

  var settings = jsx3.ide.getIDESettings();
  if (bForce)
    settings.set("prefs", "versioncheck", "ignore", null);

  var doc = new jsx3.xml.Document();
  doc.setAsync(true);
  doc.subscribe(jsx3.xml.Document.ON_RESPONSE, jsx3.ide, function(objEvent) {
    var newVersion = objEvent.target.getValue();

    if (newVersion) {
      var ignoreVersion = settings.get("prefs", "versioncheck", "ignore");
      var myVersion = jsx3.getVersion();

      jsx3.ide.LOG.debug("VERSION CHECK -- latest version: " + newVersion + ", ignore version: " + ignoreVersion);

      // let the user ignore a version:
      if (ignoreVersion != newVersion) {
        if (jsx3.util.compareVersions(newVersion, myVersion) > 0)
          jsx3.IDE.confirm(
            "New Version Available", "A new version (" + newVersion + ") of TIBCO General Interface&#8482; is available.",
            function() { window.open("http://power.tibco.com/gi/builderlink/power/", "jsxide_newversion"); }, null,
            "Download", "Later", 1,
            function(d) { d.doClose(); settings.set("prefs", "versioncheck", "ignore", newVersion); }, "Ignore Version",
            {nonModal:1}
          );
        else if (bForce)
          jsx3.IDE.alert("Up-To-Date", "Your version (" + myVersion + ") of TIBCO General Interface&#8482; is up-to-date.",
              null, null, {nonModal:1});
      }
    }
  });

  doc.load("http://gi.tibco.com/versioncheck/gi.xml");
};

// for better stack traces
jsx3.Package.definePackage("jsx3.ide", function(){});

if (! jsx3.app.Browser.win32) {
  jsx3.ide.LOG.warn("@gi.ide.notsupported@");
}
