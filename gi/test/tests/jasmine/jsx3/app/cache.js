/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.app.Cache", function() {
    var _jasmine_test = gi.test.jasmine;
    _jasmine_test.require("jsx3.app.Cache", "jsx3.xml.Document", "jsx3.xml.CDF", "jsx3.util.List");
    var t = new _jasmine_test.TestSuite("jsx3.app.Cache");

  /*jasmine.require("jsx3.app.Cache", "jsx3.xml.Document", "jsx3.xml.CDF", "jsx3.util.List");    */


    beforeEach(function () {
        this.addMatchers(gi.test.jasmine.matchers);
        t._server = null;
    });


    it("testNew", function() {
    var c = new jsx3.app.Cache();
    expect(c).toBeInstanceOf(jsx3.app.Cache);

    });

    it("testNoDoc", function() {
    var c = new jsx3.app.Cache();
      expect(c.getDocument("docId")).toBe(null);

  });

    it("testSetRetrieve", function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    expect(c.getDocument("docId")).toBe(null);
    c.setDocument("docId", doc);
    expect(doc).toEqual(c.getDocument("docId"));
    expect(c.getDocument("docId2")).toBe(null);

  });


    it("testGetTimestamp", function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();
    var ts = c.getTimestamp("docId");
    expect(ts).toBeTypeOf("number");
     expect(ts >= t1.getTime()).toBeTruthy();
     expect(ts <= t2.getTime()).toBeTruthy();
    c.setDocument("docId", doc);
    var t3 = new Date();
    ts = c.getTimestamp("docId");

     expect(ts >= t2.getTime()).toBeTruthy();
     expect(ts <= t3.getTime()).toBeTruthy();



  });


    it("testOverwrite", function() {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();
    c.setDocument("docId", doc1);
    expect(doc1).toEqual(c.getDocument("docId"));
    c.setDocument("docId", doc2);
   expect(doc2).toEqual(c.getDocument("docId"));
    c.clearById("docId");
    expect(c.getDocument("docId")).toBe(null);

  });

    it("testClearById", function() {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    c.setDocument("docId", doc1);
      expect(doc1).toEqual(c.getDocument("docId"));
    var retVal = c.clearById("docId");
      expect(doc1).toEqual(retVal);
     expect(c.getDocument("docId")).toBe(null);

  });

    it("testOpenDocument1", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");
     expect(doc1).toBeInstanceOf(jsx3.xml.Document);
      expect(doc1.hasError()).toBeFalsy();
      expect(doc1).toEqual(c.getDocument("docId"));

  });

    it("testOpenDocument2", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");
    var doc2 = c.openDocument(url, "docId");
   expect(doc1 === doc2).toBeFalsy();

  });

    it("testOpenDocument3", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url);
    expect(doc1).toEqual(c.getDocument(url));

  });

    it("testOpenDocument4", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId", jsx3.xml.CDF.Document.jsxclass);
      expect(doc1).toBeInstanceOf(jsx3.xml.CDF.Document);
      expect(c.getDocument("docId")).toBeInstanceOf( jsx3.xml.CDF.Document);

  });

    it("testOpenAsync1", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc = c.getOrOpenAsync(url, "docId");


     expect(doc).not.toBeUndefined();
      expect(doc).not.toEqual(null);
      expect(doc).toBeInstanceOf(jsx3.xml.Document);

     expect(doc.getNamespaceURI()).toEqual(jsx3.app.Cache.XSDNS);
      expect(doc.getNodeName()).toEqual("loading");

  });


    it("testOpenAsync2", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");

    c.getOrOpenAsync(url, "docId");

        /*async call start */

        var objEvent;

        runs(function() {
            flag = false;
            value = 0;
            c.subscribe("docId",  function(evt) {
                flag = true;
                objEvent = evt;
            }, 500);
        });

        waitsFor(function() {
            value++;
            return flag;
        }, "The Value should be incremented", 750);

        runs(function() {
            expect(objEvent.subject).toEqual("docId");
            expect(objEvent.action).toEqual(jsx3.app.Cache.CHANGE);
            expect(objEvent.target).toEqual(c);



            var objDoc = objEvent.target.getDocument("docId");
            expect(objDoc).toBeInstanceOf(jsx3.xml.Document);
            //expect(objDoc.getError()).toBeUndefined()
            expect(objDoc.hasError()).toBeFalsy();
            expect(objDoc.getNodeName()).toEqual("data");
        });

        /*async call end */


    /*c.subscribe("docId", t.asyncCallback(function(objEvent) {

        expect(objEvent.subject).toEqual("docId");
        expect(objEvent.action).toEqual(jsx3.app.Cache.CHANGE);
       expect(objEvent.target).toEqual(c);



      var objDoc = objEvent.target.getDocument("docId");
        expect(objDoc).toBeInstanceOf(jsx3.xml.Document);
        expect(objDoc.getError()).toBeFalsy();
        expect(objDoc.hasError()).toBeFalsy();
        expect(objDoc.getNodeName()).toEqual("data");

    }));  */
  });
  //t.testOpenAsync2._async = true;

    it("testOpenAsync3", function() {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");

    var d = c.openDocument(url1, "docId");
    c.getOrOpenAsync(url2, "docId");

    var doc = c.getDocument("docId");

     expect(doc).not.toBeUndefined();
      expect(doc).not.toEqual(null);
      expect(d).toEqual(doc);

  });

    it("testOpenAsync4", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1_foo.xml");

    c.getOrOpenAsync(url, "docId");

        /*async call start */

        var objEvent;

        runs(function() {
            flag = false;
            value = 0;
            c.subscribe("docId",  function(evt) {
                flag = true;
                objEvent = evt;
            }, 500);
        });

        waitsFor(function() {
            value++;
            return flag;
        }, "The Value should be incremented", 750);

        runs(function() {
            expect(objEvent.subject).toEqual("docId");
            expect(objEvent.action).toEqual(jsx3.app.Cache.CHANGE);
            expect(objEvent.target).toEqual(c);



            var objDoc = objEvent.target.getDocument("docId");
            expect(objDoc).toBeInstanceOf(jsx3.xml.Document);
            expect(objDoc).not.toBeUndefined();
            expect(objDoc).not.toEqual(null);
            expect(objDoc.getNamespaceURI()).toEqual(jsx3.app.Cache.XSDNS);
            expect(objDoc.getNodeName()).toEqual("error");
        });

        /*async call end */

  });
 // t.testOpenAsync4._async = true;

    it("testKeys", function() {
    var c = new jsx3.app.Cache();
    var keys = c.keys();
    var doc = new jsx3.xml.Document();

     expect(keys).toBeInstanceOf(Array);
     expect(keys.length).toEqual(0);


    c.setDocument("strId1", doc);
    c.setDocument("strId2", doc);

    keys = jsx3.util.List.wrap(c.keys());

     expect(keys.size()).toEqual(2);
      expect(keys.indexOf("strId1") >= 0).toBeTruthy()
      expect(keys.indexOf("strId2") >= 0).toBeTruthy()



    c.clearById("strId1");
    keys = jsx3.util.List.wrap(c.keys());

      expect(keys.size()).toEqual(1);
     expect(keys.indexOf("strId1") < 0).toBeTruthy()
     expect(keys.indexOf("strId2") >= 0).toBeTruthy()


  });


    it("testHierarchy", function() {
    var c1 = new jsx3.app.Cache();
    var c2 = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();

    c1.addParent(c2);
    c1.setDocument("docId1", doc1);
    c2.setDocument("docId2", doc2);

     expect(doc1).toEqual(c1.getDocument("docId1"));
      expect(doc2).toEqual(c1.getDocument("docId2"));
      expect(doc2).toEqual(c2.getDocument("docId2"));

      expect(c2.getDocument("docId1")).toBeNull();


    c1.clearById("docId2");

     expect(doc2).toEqual(c1.getDocument("docId2"));


    c2.clearById("docId2");
     expect(c1.getDocument("docId2")).toBeNull();

  });

    it("testEvents", function() {
    var c = new jsx3.app.Cache();
    var eventCount = 0;
    c.subscribe(jsx3.app.Cache.CHANGE, function() { eventCount++; });

    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);
     expect(1).toEqual(eventCount);


    c.setDocument("docId", doc);
      expect(2).toEqual(eventCount);


    c.clearById("docId");
      expect(3).toEqual(eventCount);


    doc = c.openDocument(t.resolveURI("data/props1.xml"), "docId");
      expect(4).toEqual(eventCount);

  });

    it("testGetOrOpen", function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.getOrOpenDocument(url, "docId");

        expect(doc1).toBeInstanceOf(jsx3.xml.Document);
        expect(doc1.hasError()).toBeFalsy();


      expect(doc1).toBe(c.getOrOpenDocument(url, "docId"));
     expect(doc1).toBe(c.getOrOpenDocument("nowhere", "docId"));

  });

    it("testDestroy", function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);

    c.destroy();

      var func = function() {
          return c.getDocument("docId");
      };
      expect(func).toThrow();


  });

    it("testClearByTimestamp", function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();

    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();

    c.clearByTimestamp(t1);
     expect(doc).toEqual(c.getDocument("docId"));


    c.clearByTimestamp(t2.getTime() + 1);
      expect(c.getDocument("docId")).toBeNull();

  });

    it("testAsyncAbortClear", function() {
        var c = new jsx3.app.Cache();
        var url = t.resolveURI("data/props1.xml");

        var evtCount = 0;

        c.subscribe("docId", function(objEvent) {
            if (objEvent.action != "remove" && c.getDocument("docId").getNamespaceURI() != jsx3.app.Cache.XSDNS)
                evtCount++;
        });

        c.getOrOpenAsync(url, "docId");
        c.clearById("docId");

        runs(function() {
            flag = false;
            value = 0;

            setTimeout(function() {
                expect(evtCount).toEqual(0);
            },2000);
        });


  });
 // t.testAsyncAbortClear._async = true;

    it("testAsyncAbortClobber", function() {
        var c = new jsx3.app.Cache();
        var url1 = t.resolveURI("data/props1.xml");
        var url2 = t.resolveURI("data/props2.xml");

        var evtCount = 0;

        c.subscribe("docId", function(objEvent) {
            if (objEvent.action != "remove" && c.getDocument("docId").getNamespaceURI() != jsx3.app.Cache.XSDNS)
                evtCount++;
        });

        c.getOrOpenAsync(url1, "docId");
        c.clearById("docId");
        c.getOrOpenAsync(url2, "docId");

        runs(function() {
            flag = false;
            value = 0;

            setTimeout(function() {
                expect(evtCount).toEqual(1);
                expect(c.getDocument("docId").selectSingleNode("//record").getAttribute("jsxtext")).toEqual("valueA");
            },2000);
        });


  });
 // t.testAsyncAbortClobber._async = true;
    afterEach(function() {
        if (t._server) {
            t._server.destroy();
            delete t._server;
        }
    });
});


