/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.app.DOM", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.DOM", "jsx3.app.Model", "jsx3.util.List");
  var t = new _jasmine_test.TestSuite("jsx3.app.DOM");

  beforeEach(function () {
  });

  it("should create a new unique system id", function () {
    var id1 = jsx3.app.DOM.newId("ns1");
    var id2 = jsx3.app.DOM.newId("ns1");
    var id3 = jsx3.app.DOM.newId("ns2");
    expect(id1).toBeTypeOf("string");
    expect(id1).not.toEqual(id2);
    expect(id1).not.toEqual(id3);
  });

  it("testGetNamespaceForId", function () {
    var ns = "nsx";
    var id = jsx3.app.DOM.newId(ns);
    expect(ns).toEqual(jsx3.app.DOM.getNamespaceForId(id));
  });

  it("should add a JSX object to this DOM and indexes it by its id and name", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.destroy();
    var func = function () {
      d.add(m);
    };
    expect(func).toThrow();
  });

  it("should look up a DOM object contained in this DOM by id", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);
    expect(m).toEqual(d.get(m._jsxid))
    expect(m).toEqual(d.getById(m._jsxid));
    expect(d.get(jsx3.app.DOM.newId("ns1"))).toBeNull();
    expect(d.getById("anyOldId")).toBeUndefined();
  });

  it("should look up a DOM object contained in this DOM by name", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);
    expect(m).toEqual(d.get("name"))
    expect(m).toEqual(d.getByName("name"));
    expect(d.get("aname")).toBeNull();
    expect(d.getByName("aname")).toBeNull();
  });

  it("should return all the DOM nodes in this DOM with a name of 'name'", function () {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    var m2 = new jsx3.app.Model("name");
    m2._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    d.add(m2);
    var m = d.getAllByName("name");
    expect(m).toBeInstanceOf(Array);
    expect(m.length).toEqual(2);
    var l = jsx3.util.List.wrap(m);
    expect(l.contains(m1)).toBeTruthy();
    expect(l.contains(m2)).toBeTruthy();
  });

  it("testRemove1", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);
    expect(m).toEqual(d.get(m._jsxid));
    d.remove(m);
    expect(d.get(m._jsxid)).toBeNull();
  });

  it("testCollision", function () {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    var m2 = new jsx3.app.Model("name");
    m2._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    d.add(m2);
    var m = d.get("name");
    expect(m1.equals(m) || m2.equals(m)).toBeTruthy();
    d.remove(m1);
    expect(m2).toEqual(d.get("name"));
  });

  it("should test if  the name index is updated appropriately after changing the name of a contained DOM node", function () {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    expect(m1).toEqual(d.get("name"));
    m1.setName("name2");
    d.onNameChange(m1, "name");
    expect(d.get("name")).toBeUndefined();
    expect(m1).toEqual(d.get("name2"));
  });

  it("should publish an event object with names properties", function () {
    var d = new jsx3.app.DOM();
    var eventCount = 0;
    var eventType = null;
    d.subscribe(jsx3.app.DOM.EVENT_CHANGE, function (objEvent) {
      eventCount++;
      eventType = objEvent.type;
    });
    d.onChange(jsx3.app.DOM.TYPEADD);
    expect(1).toEqual(eventCount);
    expect(jsx3.app.DOM.TYPEADD).toEqual(eventType);
    d.onChange(jsx3.app.DOM.TYPEREMOVE);
    expect(2).toEqual(eventCount);
    expect(jsx3.app.DOM.TYPEREMOVE).toEqual(eventType);
  });
});
