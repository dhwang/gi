describe("jsx3.app.Server", function() {
  var _jasmine = gi.test.jasmine;
  _jasmine.require("jsx3.app.Server");
  var _server, t = new _jasmine.TestSuite("jsx3.app.Server");


  beforeEach(function () {
  });

  it("should be able to find the Namespace of jsx3.app.Server", function() {
    var s = _server = t.newServer("data/server1.xml", ".");

    expect(s.getEnv("namespace")).toBe("gi.test.App1");
    expect(s).toEqual(gi.test.App1);

  });

  afterEach(function() {
    if (_server) {
      if (_server instanceof Array) {
        for (var i = 0; i < _server.length; i++)
          _server[i].destroy();
      } else {
        _server.destroy();
      }
      delete _server;
    }
  })
});

