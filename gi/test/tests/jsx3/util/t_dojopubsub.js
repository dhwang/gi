/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.EventDispatcher", function(t, jsunit) {

  jsunit.require("jsx3.util.DojoPubSub");

  var hub = jsx3.util.DojoPubSub.hub;

  t.testObjectFunction = function() {
    var o = new Object();
    var f = function() {
      this._called = true;
    };

    hub.subscribe("eventId", o, f);
    jsunit.assertUndefined(hub._called);
    hub.publish({subject:"ignoredId"});
    jsunit.assertUndefined(hub._called);
    hub.publish({subject:"eventId"});
    jsunit.assertTrue(hub._called);
  };

  t.testObjectString = function() {
    var ed = newED();
    var o = new Object();
    o.f = function() {
      this._called = true;
    };

    ed.subscribe("eventId", o, "f");
    jsunit.assertUndefined(o._called);
    ed.publish({subject:"eventId"});
    jsunit.assertTrue(o._called);
  };

  t.testFunction = function() {
    var count = 0;
    var f = function(param) {
      count++;
    };

    hub.subscribe("eventId", f);
    jsunit.assertEquals(0, count);
    hub.publish({subject:"eventId"});
    jsunit.assertEquals(1, count);
  };
  t.testDojoPublish = function() {
    var count = 0;
    var message;
    var f = function(param) {
      message = param;
      count++;
    };

    hub.subscribe("eventId", f);
    jsunit.assertEquals(0, count);
    dojo.publish("eventId","hello");
    jsunit.assertEquals(1, count);
    jsunit.assertEquals(message[0], "hello");
  };
  t.testDojoSubscribe = function() {
    var count = 0;
    var message;
    var f = function(param) {
      message = param;
      count++;
    };

    dojo.subscribe("eventId", null, f);
    jsunit.assertEquals(0, count);
    hub.publish({subject:"eventId", foo:"bar"});
    jsunit.assertEquals(1, count);
    jsunit.assertEquals(message.foo, "bar");
  };
});
