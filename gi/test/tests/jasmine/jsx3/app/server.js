/*
* Copyright (c) 2001-2013, TIBCO Software Inc.
* Use, modification, and distribution subject to terms of license.
*/

describe("jsx3.app.Server", function() {
  var _jasmine = gi.test.jasmine;
  _jasmine.require("jsx3.app.Server", "jsx3.System");
  var _server, t = new _jasmine.TestSuite("jsx3.app.Server");


  beforeEach(function () {
  });

  it("should be able to find the app.server namespace.", function() {
    var s = _server = t.newServer("data/server1.xml", ".");

    expect(s.getEnv("namespace")).toBe("gi.test.App1");
    expect(s).toEqual(gi.test.App1); // gi.test.App1 is available globally

  });

  it("should retrieve the environment value stored in app.server.", function () {
    var s = _server = t.newServer("data/server1.xml", ".", null, {testkey:"testvalue"});

    expect(s.getEnv("testkey")).toBe("testvalue");
    expect(s.getEnv("TestKey")).toBe("testvalue");// case insensitive
  });

  afterEach(function() {
    _server.destroy();
    delete _server;
  });
});

