/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Cache", function(t, jsunit) {

  jsunit.require("jsx3.app.Cache", "jsx3.xml.Document", "jsx3.xml.CDF", "jsx3.util.List");

  t.testNew = function() {
    var c = new jsx3.app.Cache();
    jsunit.assertInstanceOf(c, jsx3.app.Cache);
  };

  t.testNoDoc = function() {
    var c = new jsx3.app.Cache();
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testSetRetrieve = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    jsunit.assertNull(c.getDocument("docId"));
    c.setDocument("docId", doc);
    jsunit.assertEquals(doc, c.getDocument("docId"));
    jsunit.assertNull(c.getDocument("docId2"));
  };

  t.testGetTimestamp = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();
    var ts = c.getTimestamp("docId");

    jsunit.assertTypeOf(ts, "number");
    jsunit.assert(ts >= t1.getTime());
    jsunit.assert(ts <= t2.getTime());

    c.setDocument("docId", doc);
    var t3 = new Date();
    ts = c.getTimestamp("docId");
    jsunit.assert(ts >= t2.getTime());
    jsunit.assert(ts <= t3.getTime());
  };

  t.testOverwrite = function() {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();

    c.setDocument("docId", doc1);
    jsunit.assertEquals(doc1, c.getDocument("docId"));

    c.setDocument("docId", doc2);
    jsunit.assertEquals(doc2, c.getDocument("docId"));

    c.clearById("docId");
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testOpenDocument1 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");

    jsunit.assertInstanceOf(doc1, jsx3.xml.Document);
    jsunit.assertFalse(doc1.hasError());
    jsunit.assert(doc1 === c.getDocument("docId"));
  };

  t.testOpenDocument2 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");
    var doc2 = c.openDocument(url, "docId");
    jsunit.assertFalse(doc1 === doc2);
  };

  t.testOpenDocument3 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url);
    jsunit.assertEquals(doc1, c.getDocument(url));
  };

  t.testOpenDocument4 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId", jsx3.xml.CDF.Document.jsxclass);
    jsunit.assertInstanceOf(doc1, jsx3.xml.CDF.Document);
    jsunit.assertInstanceOf(c.getDocument("docId"), jsx3.xml.CDF.Document);
  };

  t.testOpenAsync1 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc = c.openDocumentAsync(url, "docId");
    jsunit.assertUndefined(doc);
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testOpenAsync2 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");

    c.openDocumentAsync(url, "docId", null, t.asyncCallback(function(objDoc) {
      jsunit.assertNotNullOrUndef(objDoc);
      jsunit.assertInstanceOf(objDoc, jsx3.xml.Document);
      jsunit.assertFalse("Shouldn't have error: " + objDoc.getError(), objDoc.hasError());
      jsunit.assertEquals("data", objDoc.getNodeName());
    }));
  };
  t.testOpenAsync2._async = true;

  t.testOpenAsync3 = function() {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");

    var d = c.openDocument(url1, "docId");
    c.openDocumentAsync(url2, "docId");
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testOpenAsync4 = function() {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");

    var d = null;

    c.openDocumentAsync(url2, "docId", null, t.asyncCallback(function(objDoc) {
      jsunit.assertNotNullOrUndef(objDoc);
      jsunit.assertNotNullOrUndef(d);
      jsunit.assertNotEquals(d, objDoc);
      jsunit.assertEquals(d, c.getDocument("docId"));
    }));

    d = c.openDocument(url1, "docId");
  };
  t.testOpenAsync4._async = true;

  t.testKeys = function() {
    var c = new jsx3.app.Cache();
    var keys = c.keys();
    var doc = new jsx3.xml.Document();

    jsunit.assertInstanceOf(keys, Array);
    jsunit.assertEquals(0, keys.length);

    c.setDocument("strId1", doc);
    c.setDocument("strId2", doc);

    keys = jsx3.util.List.wrap(c.keys());
    jsunit.assertEquals(2, keys.size());
    jsunit.assert(keys.indexOf("strId1") >= 0);
    jsunit.assert(keys.indexOf("strId2") >= 0);

    c.clearById("strId1");
    keys = jsx3.util.List.wrap(c.keys());
    jsunit.assertEquals(1, keys.size());
    jsunit.assert(keys.indexOf("strId1") < 0);
    jsunit.assert(keys.indexOf("strId2") >= 0);
  };

  t.testHierarchy = function() {
    var c1 = new jsx3.app.Cache();
    var c2 = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();

    c1.addParent(c2);
    c1.setDocument("docId1", doc1);
    c2.setDocument("docId2", doc2);

    jsunit.assertEquals(doc1, c1.getDocument("docId1"));
    jsunit.assertEquals(doc2, c1.getDocument("docId2"));
    jsunit.assertEquals(doc2, c2.getDocument("docId2"));
    jsunit.assertNull(c2.getDocument("docId1"));

    c1.clearById("docId2");
    jsunit.assertEquals(doc2, c1.getDocument("docId2"));
    c2.clearById("docId2");
    jsunit.assertNull(c1.getDocument("docId2"));
  };

  t.testEvents = function() {
    var c = new jsx3.app.Cache();
    var eventCount = 0;
    c.subscribe(jsx3.app.Cache.EVENT_CHANGE, function() { eventCount++; });

    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);
    jsunit.assertEquals(1, eventCount);

    c.setDocument("docId", doc);
    jsunit.assertEquals(2, eventCount);

    c.clearById("docId");
    jsunit.assertEquals(3, eventCount);

    doc = c.openDocument(t.resolveURI("data/props1.xml"), "docId");
    jsunit.assertEquals(4, eventCount);
  };

  t.testGetOrOpen = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.getOrOpenDocument(url, "docId");

    jsunit.assertInstanceOf(doc1, jsx3.xml.Document);
    jsunit.assertFalse(doc1.hasError());
    jsunit.assert(doc1 === c.getOrOpenDocument(url, "docId"));
    jsunit.assert(doc1 === c.getOrOpenDocument("nowhere", "docId"));
  };

  t.testDestroy = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);

    c.destroy();
    jsunit.assertThrows(function(){
      return c.getDocument("docId");
    });
  };

  t.testClearByTimestamp = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();

    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();

    c.clearByTimestamp(t1);
    jsunit.assertEquals(doc, c.getDocument("docId"));

    c.clearByTimestamp(t2.getTime() + 1);
    jsunit.assertNull(c.getDocument("docId"));
  };

});
