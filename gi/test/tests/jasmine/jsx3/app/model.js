/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.app.Model", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Model", "jsx3.gui.Painted");
  var t = new _jasmine_test.TestSuite("jsx3.app.Model");

  beforeEach(function () {
  });

  it("should deserialize the file and append the deserialized objects as children of this DOM node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root).toBeInstanceOf(jsx3.app.Model);
  });

  it("should return the child DOM node of this node at the given Int", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var c1 = root.getChild(0);
    expect(c1).toBeInstanceOf(jsx3.app.Model);
    expect("child1").toEqual(c1.getName());
    expect(root.getChild("11")).toBeUndefined();
  });

  it("should return the child DOM node of this node at the given string", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var c1 = root.getChild("child1");
    expect(c1).toBeInstanceOf(jsx3.app.Model);
    expect("child1").toEqual(c1.getName());
    expect(root.getChild("childX")).toBeUndefined();
    expect(root.getChild("0")).toBeUndefined();
  });

  it("should return an array containing all the child DOM nodes of this object", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var children = root.getChildren();
    for (var i = 0; i < children.length; i++)
      expect(i).toEqual(children[i].getChildIndex());
  });

  it("should return the zero-based index for this DOM node in relation to its siblings.", function () {
    var o = new jsx3.app.Model("abandoned");
    expect(-1).toEqual(o.getChildIndex());
  });

  it("should return the first child of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect("child1").toEqual(root.getFirstChild().getName());
    expect(root.getChildren()[0]).toEqual(root.getFirstChild());
    expect(root.getChildren()[0].getLastChild()).toBeNull();
  });

  it("should return the last child of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect("lastChild").toEqual(root.getLastChild().getName());
    expect(root.getChildren()[root.getChildren().length - 1]).toEqual(root.getLastChild());
    expect(root.getChildren()[0].getLastChild()).toBeNull();
  });

  it("should return the Next Sibling of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getNextSibling()).toBeNull();
    var children = root.getChildren();
    expect(children[1]).toEqual(children[0].getNextSibling());
    expect(children[children.length - 1].getNextSibling()).toBeNull();
  });

  it("should return the Previous Sibling of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getPreviousSibling()).toBeNull();
    var children = root.getChildren();
    expect(children[0]).toEqual(children[1].getPreviousSibling());
    expect(children[0].getPreviousSibling()).toBeNull();
  });

  it("should return an array containing all the child DOM nodes of this object", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var children = root.getChildren();
    expect(children).toBeInstanceOf(Array);
    expect(4).toEqual(children.length);
    var grandchildren = children[0].getChildren();
    expect(grandchildren).toBeInstanceOf(Array);
    expect(0).toEqual(grandchildren.length);
  });

  it("testGetChildren2", function () {
    var o = new jsx3.app.Model("abandoned");
    var children = o.getChildren();
    expect(children).toBeInstanceOf(Array);
    expect(0).toEqual(children.length);
  });

  it("should return the parent DOM node of this object", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var children = root.getChildren();
    expect(root).toEqual(children[0].getParent());
  });

  it("testGetParent2", function () {
    var o = new jsx3.app.Model("abandoned");
    expect(o.getParent()).toBeNull();
  });

  it("should return the namespace that distinguishes this object's server (owner) from other server instances", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(s.getEnv("namespace")).toEqual(root.getNS());
    expect(s.getEnv("namespace")).toEqual(root.getChild(0).getNS());
  });

  it("should return  one of the meta data values stored at the top of the serialization file that this object was loaded from", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect("Component 1").toEqual(root.getMetaValue("name"));
    expect("icon.gif").toEqual(root.getMetaValue("icon"));
    expect("Component Description").toEqual(root.getMetaValue("description"));
    var func = function () {
      root.getMetaValue("foobar");
    };
    expect(func).toThrow();
    expect("").toEqual(root.getChild(0).getMetaValue("name"));
  });

  it("testVariants", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(1).toEqual(root.v1);
    expect(2).toEqual(root.v2);
    expect(root.s3).toBeUndefined();
  });

  it("testArrayVariants", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var a = root.a1;
    expect(a).toBeInstanceOf(Array);
    expect(4).toEqual(a.length);
    expect(1).toEqual(a[0]);
    expect(4).toEqual(a[3]);
  });

  it("testStrings", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect("1").toEqual(root.s1);
    expect("2").toEqual(root.s2);
    expect(root.s3).toBeUndefined();
  });

  it("should find all DOM nodes descending from this DOM node that pass the given test function.", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match = root.findDescendants(function (x) {
      return x.getName() == "nestedChild";
    });
    expect("nestedChild").toEqual(match.getName());
    expect(3).toEqual(match.f1);
  });

  it("should find all DOM nodes descending from this DOM node and returns an array of matches", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var matches = root.findDescendants(function (x) {
      return x.getName() == "nestedChild";
    }, null, true);
    expect("nestedChild").toEqual(matches[0].getName());
    expect("nestedChild").toEqual(matches[1].getName());
    expect(matches[0]).not.toEqual(matches[1]);
  });

  it("should find all DOM nodes descending from this DOM node by doing breath first search and then depth first search", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.findDescendants(function (x) {
      return x.f1 == 3;
    });
    expect("10").toEqual(match1.getName());
    var match2 = root.findDescendants(function (x) {
      return x.f1 == 3;
    }, true);
    expect("nestedChild").toEqual(match2.getName());
  });

  it("should search direct children of the DOM Nodes descending from this DOM node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var matches = root.findDescendants(function (x) {
      return x.f1 == 3;
    }, null, true, true);
    expect(1).toEqual(matches.length);
    expect("10").toEqual(matches[0].getName());
  });

  it("should find all DOM nodes including self node descending from this DOM node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.findDescendants(function (x) {
      return true;
    }, false, false, false, true);
    expect("root").toEqual(match1.getName());

    var match2 = root.findDescendants(function (x) {
      return true;
    }, false, false, false, false);
    expect("child1").toEqual(match2.getName());
  });

  it("should return the first ancestor ", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.findAncestor(function (x) {
      return true;
    });
    expect(root.getParent()).toEqual(match1);
    var match2 = root.findAncestor(function (x) {
      return x.getName() == "JSXROOT";
    });
    expect(root.getServer().getRootBlock()).toEqual(match2);
  });

  it("should select objects from the DOM whose name equals ID specified with #", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#child1");
    expect(1).toEqual(match1.length);
    var match2 = root.selectDescendants("#nestedChild");
    expect(2).toEqual(match2.length);
    var match3 = root.selectDescendants("#none");
    expect(0).toEqual(match3.length);
  });

  it("testSelectDescendant", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#child2 #child2");
    expect(1).toEqual(match1.length);
    expect(2).toEqual(match1[0].f1);
    var match2 = root.selectDescendants("#child2 #lastChild");
    expect(0).toEqual(match2.length);
    var match3 = root.selectDescendants("#none #child2");
    expect(0).toEqual(match3.length);
    // Test the optimized code for selecting from root
    var match4 = s.getRootBlock().selectDescendants("#none #child2");
    expect(0).toEqual(match4.length);
  });

  it("should select objects from the DOM matching immediate children of objects matching A that match B (A >B)", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#root > #lastChild");
    expect(1).toEqual(match1.length);
    var match2 = root.selectDescendants("#root > #nestedChild");
    expect(0).toEqual(match2.length);
  });

  it("should select objects from the DOM matching any object(*)", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#child2 *");
    expect(3).toEqual(match1.length);
  });

  it("should select objects from the DOM matching objects that are their parents' first and last children and matching objects whose child index is equal to n", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#root > :first");
    expect(1).toEqual(match1.length);
    expect("child1").toEqual(match1[0].getName());
    var match2 = root.selectDescendants("#root > :last");
    expect(1).toEqual(match2.length);
    expect("lastChild").toEqual(match2[0].getName());
    var match3 = root.selectDescendants("#root > :nth(1)");
    expect(1).toEqual(match3.length);
    expect("child2").toEqual(match3[0].getName());
  });

  it("should select objects from the DOM matching objects that are instances of the class or interface jsx3.app.Model", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#root > jsx3_app_Model");
    expect(3).toEqual(match1.length);
    var match2 = root.selectDescendants("#root > :instanceof(jsx3.app.Model)");
    expect(4).toEqual(match2.length);
  });

  it("should select objects from the DOM that matches objects whose value for field f1 equals value", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("[f1=3]");
    expect(2).toEqual(match1.length);
  });

  it("should select objects from the DOM that matches objects whose return value for method getName() equals value", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("[getName()=lastChild]");
    expect(1).toEqual(match1.length);
    expect("lastChild").toEqual(match1[0].getName());
    var match2 = root.selectDescendants('[getName()="lastChild"]');
    expect(1).toEqual(match2.length);
    expect("lastChild").toEqual(match2[0].getName());
  });

  it("should return the first ancestor with the given name.", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getChild(1).getChild(0).getChild(0);
    expect("nestedChild", o.getName());
    var a = o.getAncestorOfName("child2");
    expect(a).not.toBeNull();
    expect(a).not.toBeUndefined();
    expect(2).toEqual(a.f1);
    a = o.getAncestorOfName("root");
    expect(root).toEqual(a);
    a = o.getAncestorOfName("foobar");
    expect(a).toBeNull();
  });

  it("should return the first ancestor of the given type", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getChild(1).getChild(0).getChild(0);
    expect("nestedChild").toEqual(o.getName());
    var a = o.getAncestorOfType(jsx3.app.Model);
    expect(a).not.toBeNull();
    expect(a).not.toBeUndefined();
    expect(a.f1).toEqual(2);
    o = root.getChild(1).getChild(0);
    a = o.getAncestorOfType(jsx3.gui.Painted);
    expect(1).toEqual(a.f1);
    a = o.getAncestorOfType(jsx3.app.Model);
    expect(1).toEqual(a.f1);
    o = root.getChild(1);
    expect(root).toEqual(a.getAncestorOfType(jsx3.app.Model));
    expect(root).toEqual(a.getAncestorOfType("jsx3.app.Model"));
    expect(root).toEqual(a.getAncestorOfType(jsx3.app.Model.jsxclass));
    var func = function () {
      a.getAncestorOfType("foobar");
    };
    expect(func).toThrow();
  });

  it("should find the first descendant of this DOM node with a the given name", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getChild(1).getChild(0);
    var d = o.getDescendantOfName("nestedChild");
    expect(d).not.toBeNull();
    expect(d).not.toBeUndefined();
    expect(3).toEqual(d.f1);
    expect(root.getDescendantOfName("foobar")).toBeNull();
  });

  it("should find all descendants of the given type", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getDescendantsOfType(jsx3.app.Model, true);
    expect(o).toBeInstanceOf(Array);
    expect(4).toEqual(o.length);
    expect(root.getChild(0)).toEqual(o[0]);
    o = root.getDescendantsOfType(jsx3.app.Model);
    expect(o).toBeInstanceOf(Array);
    expect(4 < o.length).toBeTruthy();
    o = root.getDescendantsOfType(jsx3.gui.Painted);
    expect(o).toBeInstanceOf(Array);
    expect(1).toEqual(o.length);
    expect(1).toEqual(o[0].f1);
  });

  it("should append a child DOM node to this parent DOM node", function () {
    var parent = new jsx3.app.Model("m1");
    var child = new jsx3.app.Model("m2");
    parent.setChild(child);
    expect(1).toEqual(parent.getChildren().length);
    expect(child).toEqual(parent.getChildren()[0]);
  });

  it("should remove a DOM child from this object", function () {
    var parent = new jsx3.app.Model("m1");
    var child = new jsx3.app.Model("m2");
    parent.setChild(child);
    expect(1).toEqual(parent.getChildren().length);
    parent.removeChild(child)
    expect(0).toEqual(parent.getChildren().length);
  });

  it("should append a DOM node to this object after removing the node from its former parent reference", function () {
    var p1 = new jsx3.app.Model("p1");
    var p2 = new jsx3.app.Model("p2");
    var child = new jsx3.app.Model("c1");
    p1.setChild(child);
    p2.adoptChild(child);
    expect(0).toEqual(p1.getChildren().length);
    expect(1).toEqual(p2.getChildren().length);
  });

  it("should create and returns an exact replica of the object", function () {
    var parent = new jsx3.app.Model("p1");
    var child = new jsx3.app.Model("c1");
    parent.setChild(child);
    var clone = child.doClone();
    expect(2).toEqual(parent.getChildren().length);
    expect(child).toEqual(parent.getChildren()[0]);
    expect(clone).toEqual(parent.getChildren()[1]);
  });

  it("should assign c2 as the previousSibling of c1", function () {
    var parent = new jsx3.app.Model("p1");
    var c1 = new jsx3.app.Model("c1");
    var c2 = new jsx3.app.Model("c2");
    parent.setChild(c1);
    parent.insertBefore(c2, c1, false);
    expect(2).toEqual(parent.getChildren().length);
    expect(c2).toEqual(parent.getChildren()[0]);
    expect(c1).toEqual(parent.getChildren()[1]);
  });

  it("should remove some or all children of this object", function () {
    var parent = new jsx3.app.Model("p1");
    var c1 = new jsx3.app.Model("c1");
    var c2 = new jsx3.app.Model("c2");
    parent.setChild(c1);
    parent.setChild(c2);
    parent.removeChildren();
    expect(0).toEqual(parent.getChildren().length);
  });

//  t.testGetFirstChildOfType = function() {
//    // TODO:
//  };
//
//  t.testSetChild = function() {
//    // TODO:
//  };
//
//  t.testRemoveChild = function() {
//    // TODO:
//  };
//
//  t.testRemoveChildren = function() {
//    // TODO:
//  };

  afterEach(function () {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }
  });

});
