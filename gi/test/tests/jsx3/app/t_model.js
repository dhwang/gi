/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Model", function(t, jsunit) {

  jsunit.require("jsx3.app.Model", "jsx3.gui.Painted");

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

  t.testLoad = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    jsunit.assertInstanceOf(root, jsx3.app.Model);
  };
  
  t.testGetChildInt = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var c1 = root.getChild(0);
    jsunit.assertInstanceOf(c1, jsx3.app.Model);
    jsunit.assertEquals("child1", c1.getName());

    jsunit.assertNullOrUndef(root.getChild(10));
    jsunit.assertNullOrUndef(root.getChild(11));
  };

  t.testGetChildStr = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var c1 = root.getChild("child1");
    jsunit.assertInstanceOf(c1, jsx3.app.Model);
    jsunit.assertEquals("child1", c1.getName());

    jsunit.assertNullOrUndef(root.getChild("childX"));
    jsunit.assertNullOrUndef(root.getChild("0"));
  };

  t.testChildIndex1 = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var children = root.getChildren();
    for (var i = 0; i < children.length; i++)
      jsunit.assertEquals(i, children[i].getChildIndex());
  };

  t.testChildIndex2 = function() {
    var o = new jsx3.app.Model("abandoned");
    jsunit.assertEquals(-1, o.getChildIndex());
  };

  t.testFirstChild = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("child1", root.getFirstChild().getName());
    jsunit.assertEquals(root.getChildren()[0], root.getFirstChild());
    jsunit.assertNullOrUndef(root.getChildren()[0].getFirstChild());
  };

  t.testLastChild = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("lastChild", root.getLastChild().getName());
    jsunit.assertEquals(root.getChildren()[root.getChildren().length - 1], root.getLastChild());
    jsunit.assertNullOrUndef(root.getChildren()[0].getLastChild());
  };

  t.testNextSibling = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertNullOrUndef(root.getNextSibling());

    var children = root.getChildren();
    jsunit.assertEquals(children[1], children[0].getNextSibling());
    jsunit.assertNullOrUndef(children[children.length-1].getNextSibling());
  };

  t.testPreviousSibling = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertNullOrUndef(root.getPreviousSibling());

    var children = root.getChildren();
    jsunit.assertEquals(children[0], children[1].getPreviousSibling());
    jsunit.assertNullOrUndef(children[0].getPreviousSibling());
  };

  t.testGetChildren1 = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var children = root.getChildren();
    jsunit.assertInstanceOf(children, Array);
    jsunit.assertEquals(4, children.length);

    var grandchildren = children[0].getChildren();
    jsunit.assertInstanceOf(grandchildren, Array);
    jsunit.assertEquals(0, grandchildren.length);
  };

  t.testGetChildren2 = function() {
    var o = new jsx3.app.Model("abandoned");
    var children = o.getChildren();
    jsunit.assertInstanceOf(children, Array);
    jsunit.assertEquals(0, children.length);
  };

  t.testGetParent1 = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var children = root.getChildren();
    jsunit.assertEquals(root, children[0].getParent());
  };

  t.testGetParent2 = function() {
    var o = new jsx3.app.Model("abandoned");
    jsunit.assertNullOrUndef(o.getParent());
  };

  t.testGetNs = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals(s.getEnv("namespace"), root.getNS());
    jsunit.assertEquals(s.getEnv("namespace"), root.getChild(0).getNS());
  };

  t.testGetMeta = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("Component 1", root.getMetaValue("name"));
    jsunit.assertEquals("icon.gif", root.getMetaValue("icon"));
    jsunit.assertEquals("Component Description", root.getMetaValue("description"));
    jsunit.assertThrows(function() { root.getMetaValue("foobar"); }, jsx3.Exception);
    jsunit.assertEquals("", root.getChild(0).getMetaValue("name"));
  };

  t.testVariants = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals(1, root.v1);
    jsunit.assertEquals(2, root.v2);
    jsunit.assertNullOrUndef(root.v3);
  };

  t.testArrayVariants = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var a = root.a1;
    jsunit.assertInstanceOf(a, Array);
    jsunit.assertEquals(4, a.length);
    jsunit.assertEquals(1, a[0]);
    jsunit.assertEquals(4, a[3]);
  };

  t.testStrings = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("1", root.s1);
    jsunit.assertEquals("2", root.s2);
    jsunit.assertNullOrUndef(root.s3);
  };

  t.testFindDescendants = function() {

  };

  t.testFindAncestor = function() {

  };

  t.testGetAncestorOfName = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getChild(1).getChild(0).getChild(0);
    jsunit.assertEquals("nestedChild", o.getName());

    var a = o.getAncestorOfName("child2");
    jsunit.assertNotNullOrUndef(a);
    jsunit.assertEquals(2, a.f1);

    a = o.getAncestorOfName("root");
    jsunit.assertEquals(root, a);

    a = o.getAncestorOfName("foobar");
    jsunit.assertNullOrUndef(a);
  };

  t.testGetAncestorOfType = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getChild(1).getChild(0).getChild(0);
    jsunit.assertEquals("nestedChild", o.getName());

    var a = o.getAncestorOfType(jsx3.app.Model);
    jsunit.assertNotNullOrUndef(a);
    jsunit.assertEquals(2, a.f1);

    o = root.getChild(1).getChild(0);
    a = o.getAncestorOfType(jsx3.gui.Painted);
    jsunit.assertEquals(1, a.f1);
    a = o.getAncestorOfType(jsx3.app.Model);
    jsunit.assertEquals(1, a.f1);

    o = root.getChild(1);
    jsunit.assertEquals(root, a.getAncestorOfType(jsx3.app.Model));
    jsunit.assertEquals(root, a.getAncestorOfType("jsx3.app.Model"));
    jsunit.assertEquals(root, a.getAncestorOfType(jsx3.app.Model.jsxclass));
    jsunit.assertThrows(function() { a.getAncestorOfType("foobar"); }, jsx3.Exception);
  };

  t.testGetDescendantOfName = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getChild(1).getChild(0);
    var d = o.getDescendantOfName("nestedChild");
    jsunit.assertNotNullOrUndef(d);
    jsunit.assertEquals(3, d.f1);

    jsunit.assertNullOrUndef(root.getDescendantOfName("foobar"));
  };

  t.testGetDescendantsOfType = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getDescendantsOfType(jsx3.app.Model, true);
    jsunit.assertInstanceOf(o, Array);
    jsunit.assertEquals(4, o.length);
    jsunit.assertEquals(root.getChild(0), o[0]);

    o = root.getDescendantsOfType(jsx3.app.Model);
    jsunit.assertInstanceOf(o, Array);
    jsunit.assert(4 < o.length);

    o = root.getDescendantsOfType(jsx3.gui.Painted);
    jsunit.assertInstanceOf(o, Array);
    jsunit.assertEquals(1, o.length);
    jsunit.assertEquals(1, o[0].f1);
  };

  t.testGetFirstChildOfType = function() {

  };

  t.testSetChild = function() {

  };

  t.testRemoveChild = function() {

  };

  t.testRemoveChildren = function() {

  };

});
