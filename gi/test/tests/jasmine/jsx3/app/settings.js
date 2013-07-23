/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.app.Settings", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Settings");
  var t = new _jasmine_test.TestSuite("jsx3.app.Settings");

  beforeEach(function () {
    this.addMatchers(gi.test.jasmine.matchers);
    t._server = null;
  });

  it("testNew", function () {
    var s = new jsx3.app.Settings();
    expect(s).toBeInstanceOf(jsx3.app.Settings);
  });

  it("testEmpty", function () {
    var s = new jsx3.app.Settings();
    expect(s.get("foo")).toBeUndefined();
  });

  it("testGetNumber", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("number");
    expect(v).toBeTypeOf("number");
    expect(v).toEqual(123);
  });

  it("testGetNaN", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("numberNaN");
    expect(v).toBeTypeOf("number");
    expect(isNaN(v)).toBeTruthy();
  });

  it("testGetString", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("string");
    expect(v).toBeTypeOf("string");
    expect(v).toEqual("aString");
  });

  it("testGetBoolean", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("boolean");
    expect(v).toBeTypeOf("boolean");
    expect(v).toEqual(true);
    v = s.get("booleanFalse");
    expect(v).toBeTypeOf("boolean");
    expect(v).toEqual(false);
  });

  it("testGetNull", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("null");
    expect(v).toBeNull();
  });

  it("testGetArray", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("anArray");
    expect(v).toBeInstanceOf(Array);
    expect(v.length).toEqual(3);
    expect(v[0]).toEqual("one");
    expect(v[1]).toEqual("two");
    expect(v[2]).toEqual("three");
  });

  it("testGetMap", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("anObject");
    expect(v).not.toBeUndefined();
    expect(v).not.toEqual(null);
    expect(v).toBeTypeOf("object");
    expect(v.string1).toEqual("one");
    expect(v.string2).toEqual("two");
    expect(v.string3).toEqual("three");

  });

  it("testGetMapProp", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("anObject", "string1");
    expect(v).toBeTypeOf("string");
    expect(v).toEqual("one");
    v = s.get("anObject", "stringx");
    expect(v).toBeUndefined();
  });

  it("testRemove", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.remove("number");
    expect(s.get("number")).toBeUndefined();
    s.remove("anObject", "string2");
    var v = s.get("anObject");
    expect(v).not.toBeUndefined();
    expect(v).not.toEqual(null);
    expect(v).toBeTypeOf("object");
    expect(v.string1).toEqual("one");
    expect(v.string2).toBeUndefined();
  });

  it("testRemoveCache", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.get("number");
    s.remove("number");
    expect(s.get("number")).toBeUndefined();
    s.get("anObject");
    s.remove("anObject", "string2");
    var v = s.get("anObject");
    expect(v).not.toBeUndefined();
    expect(v).not.toEqual(null);
    expect(v).toBeTypeOf("object");
    expect(v.string1).toEqual("one");
    expect(v.string2).toBeUndefined();
  });

  it("testSetNumber", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.set("newNumber", 1979);
    var v = s.get("newNumber");
    expect(s.getNode().toString()).toBeTypeOf("string");
    expect(v).toBeTypeOf("number");
    expect(s.get("newNumber").toString()).toEqual('1979');
    expect(v).toEqual(1979);
  });

  it("testSetNumberCache", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.get("newNumber");
    s.set("newNumber", 1979);
    var v = s.get("newNumber");
    expect(s.getNode().toString()).toBeTypeOf("string");
    expect(v).toBeTypeOf("number");
    expect(s.get("newNumber").toString()).toEqual('1979');
    expect(v).toEqual(1979);
  });

  it("testSetString", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.set("newString", "2010");
    var v = s.get("newString");
    expect(s.getNode().toString()).toBeTypeOf("string");
    expect(v).toBeTypeOf("string");
    expect(s.get("newString").toString()).toEqual('2010');
  });

  afterEach(function () {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }
  });
});


