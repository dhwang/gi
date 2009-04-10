/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Server", function(t, jsunit) {

  jsunit.require("jsx3.app.Server");

  t._tearDown = function() {
    if (t._server) {
      if (t._server instanceof Array) {
        for (var i = 0; i < t._server.length; i++)
          t._server[i].destroy();
      } else {
        t._server.destroy();
      }
      delete t._server;
    }
  };

  t.testNamespace = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");

    jsunit.assertEquals("gi.test.App1", s.getEnv("namespace"));
    jsunit.assertEquals(s, gi.test.App1);

    s.destroy();
    delete t._server;
    jsunit.assertUndefined(gi.test.app1);
  };

  t.testGetAppPath = function() {

  };

  t.testGetCache = function() {

  };

  t.testGetBodyBlock = function() {

  };

  t.testGetRootBlock = function() {

  };

  t.testDefaultLocale = function() {

  };

  t.testGetDOM = function() {

  };

  t.testGetDynamicProperty = function() {

  };

  t.testSetDynamicProperty = function() {

  };

});
