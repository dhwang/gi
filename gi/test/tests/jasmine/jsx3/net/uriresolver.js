/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.net.URIResolver is an interface specifying the methods necessary to define a context against which URIs are resolved.", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.URIResolver.jsxclass", "jsx3.app.Browser");

  beforeEach(function () {

  });

  it("should resolve the URI  against the base context of this resolver.", function () {
    var u = ["file.html", "../dir/file.html", "http://www.example.com", "file.html?q=v", "file.html#frag",
      "file.html?q=v#frag", "/dir/file.html"];
    for (var i = 0; i < u.length; i++)
      expect(u[i]).toEqual(jsx3.resolveURI(u[i]));
  });

  it("should resolve all relative URIs  relative to the JSX/ directory.", function () {
    expect(gi.test.jasmine.JSX_BASE + "JSX/file.html").toEqual(jsx3.resolveURI("jsx:///file.html"));
    expect(gi.test.jasmine.JSX_BASE + "JSX/file.html").toEqual(jsx3.resolveURI("jsx:/file.html"));
    expect(gi.test.jasmine.JSX_BASE + "JSX/file.html").toEqual(jsx3.resolveURI("JSX/file.html"));
    expect(gi.test.jasmine.JSX_BASE + "file.html").toEqual(jsx3.resolveURI("jsx:///../file.html"));
    expect(gi.test.jasmine.JSX_BASE + "JSX/file.html?q=val").toEqual(jsx3.resolveURI("jsx:///file.html?q=val"));
    expect(gi.test.jasmine.JSX_BASE + "JSX/file.html#frag").toEqual(jsx3.resolveURI("jsx:///file.html#frag"));
    expect(gi.test.jasmine.JSX_BASE + "JSX/file.html?q=val#frag").toEqual(jsx3.resolveURI("jsx:///file.html?q=val#frag"));
  });

  it("should resolve all relative URIs  relative to the user directory or JSXAPPS/.", function () {
    jsx3.setEnv("jsxhomepath", "../");
    var base = jsx3.getEnv("jsxhomepath");
    expect(base + "JSXAPPS/app1/config.xml").toEqual(jsx3.resolveURI("jsxuser:///JSXAPPS/app1/config.xml"));
    expect(base + "JSXAPPS/app1/config.xml").toEqual(jsx3.resolveURI("jsxuser:/JSXAPPS/app1/config.xml"));
    expect(base + "JSXAPPS/app1/config.xml").toEqual(jsx3.resolveURI("JSXAPPS/app1/config.xml"));
  });

});
