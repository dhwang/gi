/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3", function(t, jsunit) {

  jsunit.require("jsx3.jsxpackage", "jsx3.app.Cache");

  t.testSharedCache = function() {
    var c = jsx3.getSharedCache();
    jsunit.assertInstanceOf(c, jsx3.app.Cache);
  };

  t.testSystemCache = function() {
    var c = jsx3.getSystemCache();
    jsunit.assertInstanceOf(c, jsx3.app.Cache);
  };

  t.testSleep1 = function() {
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assert(true);
    }));
  };
  t.testSleep1._async = true;

  t.testSleep2 = function() {
    var obj = {};
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assertNotNullOrUndef(this);
      jsunit.assertEquals(obj, this);
    }), null, obj);
  };
  t.testSleep2._async = true;

  t.testSleep3 = function() {
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assert(true);
    }), "dupId");
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assert(false);
    }), "dupId");
  };
  t.testSleep3._async = true;

  t.testSleep4 = function() {
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assert(false);
    }), "dupId");
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assert(true);
    }), "dupId", null, true);
  };
  t.testSleep4._async = true;

  t.testRequire1 = function() {
    if (jsx3.app && jsx3.app.UserSettings) delete jsx3.app.UserSettings;

    if (jsx3.util)
      jsunit.assertUndefined(jsx3.app.UserSettings);

    jsx3.require("jsx3.app.UserSettings");

    jsunit.assertNotUndefined(jsx3.app.UserSettings);
    jsunit.assertInstanceOf(jsx3.app.UserSettings.jsxclass, jsx3.lang.Class);
  };

  t.testRequire2 = function() {
    var e = null;
    if (jsx3.app && jsx3.app.UserSettings) delete jsx3.app.UserSettings;

    if (jsx3.app)
      jsunit.assertUndefined(jsx3.app.UserSettings);

    jsx3.sleep(function() {
      jsx3.require("jsx3.app.UserSettings");
      try {
        jsunit.assertNotUndefined("Class jsx3.app.UserSettings should not be undefined (1): " + jsx3.app.UserSettings, jsx3.app.UserSettings);
        jsunit.assertInstanceOf(jsx3.app.UserSettings.jsxclass, jsx3.lang.Class);
      } catch (ex) {
        e = ex;
      }
    });

    if (e == null) {
      jsx3.sleep(function() {
        try {
          jsunit.assertNotUndefined("Class jsx3.app.UserSettings should not be undefined (2): " + jsx3.app.UserSettings, jsx3.app.UserSettings);
          jsunit.assertInstanceOf(jsx3.app.UserSettings.jsxclass, jsx3.lang.Class);
        } catch (ex) {
          e = ex;
        }

        if (e == null) {
          try {
            jsx3.require("jsx3.app.UserSettings");
          } catch (ex) {
            e = ex;
          }
        }
      });
    }
    
    jsx3.sleep(t.asyncCallback(function() {
      if (e) throw e;
    }));
  };
  t.testRequire2._async = true;

});
