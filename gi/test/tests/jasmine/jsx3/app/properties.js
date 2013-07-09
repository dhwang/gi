/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.app.Properties", function() {
    var _jasmine_test = gi.test.jasmine;
    _jasmine_test.require("jsx3.app.Properties", "jsx3.util.List","jsx3.app.PropsBundle", "jsx3.util.Locale", "jsx3.app.Cache");
    var t = new _jasmine_test.TestSuite("jsx3.app.Properties");


    beforeEach(function () {
        this.addMatchers(gi.test.jasmine.matchers);
        t._server = null;
    });



    it("testNew", function() {

    var p = new jsx3.app.Properties();
        expect(p).toBeInstanceOf(jsx3.app.Properties);

  });

    it("testGetSet", function() {
    var p = new jsx3.app.Properties();
        expect(p.get("key")).toBeUndefined();

    p.set("key", "value");
        expect(p.get("key")).toEqual("value");


    p.remove("key");

        expect(p.get("key")).toBeUndefined();
  });

    it("testNull", function() {
        var p = new jsx3.app.Properties();
        expect(p.get("key")).toBeUndefined();

    p.set("key", null);
        expect(p.get("key")).toBe(null);


        var func =function(){
            return p.set("key", t._undefined);
        }

        expect(func).toThrow();


    
    p.remove("key");
        expect(p.get("key")).toBeUndefined();

  });

    it("testKeys", function() {
    var p = new jsx3.app.Properties();
    p.set("key1", "value1");
    p.set("key2", "value2");
    var p2 = new jsx3.app.Properties();
    p2.set("key3", "value3");
    p.addParent(p2);

    var keys = p.getKeys();
        expect(keys).toBeInstanceOf(Array);

        expect(keys.length).toEqual(2);

    var l = jsx3.util.List.wrap(keys);
        expect(l.contains("key1")).toBeTruthy();
        expect(l.contains("key2")).toBeTruthy();
        expect(l.contains("key3")).toBeFalsy();
  });

    it("testContainsKey", function() {
    var p = new jsx3.app.Properties();
    p.set("key1", "value1");
    p.set("key2", "value2");
    var p2 = new jsx3.app.Properties();
    p2.set("key3", "value3");
    p.addParent(p2);

        expect(p.contains("key1")).toBeTruthy();
        expect(p.contains("key2")).toBeTruthy();

        expect(p.containsKey("key3")).toBeFalsy();
        expect(p2.containsKey("key3")).toBeTruthy();


  });

    it("testParentsGet", function() {
    var p = new jsx3.app.Properties();
    p.set("key1", "value1");
    var p2 = new jsx3.app.Properties();
    p2.set("key2", "value2");
    p.addParent(p2);

        expect(p.get("key1")).toEqual("value1");
        expect(p.get("key2")).toEqual("value2");

  });

    it("testParentsSet", function() {
    var p = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    p2.set("key2", "value2");
    p.addParent(p2);

        expect(p.get("key2")).toEqual("value2");
        expect(p2.get("key2")).toEqual("value2");



    p2.set("key2", "value3");

        expect(p.get("key2")).toEqual("value3");
        expect(p2.get("key2")).toEqual("value3");


    p.set("key2", "value4");
        expect(p.get("key2")).toEqual("value4");
        expect(p2.get("key2")).toEqual("value3");
  });

    it("testParentsRemove", function() {

    var p = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    p2.set("key2", "value2");
    p.addParent(p2);

        expect(p.get("key2")).toEqual("value2");


    p.removeParent(p2);

        expect(p.get("key2")).toBeUndefined();

  });

    it("testGrandparentSet", function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key2", "value2");

        expect(p1.get("key2")).toEqual("value2");
        expect(p2.get("key2")).toEqual("value2");




    p3.set("key2", "value3");

        expect(p1.get("key2")).toEqual("value3");
        expect(p2.get("key2")).toEqual("value3");



    p3.remove("key2");

        expect(p1.get("key2")).toBeUndefined();
        expect(p2.get("key2")).toBeUndefined();


    p1.set("key2", "value4");
        expect(p1.get("key2")).toEqual("value4");

  });

    it("testGrandparentSetPrec", function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key1", "value1");
        expect(p3.get("key1")).toEqual("value1");
        expect(p2.get("key1")).toEqual("value1");
        expect(p1.get("key1")).toEqual("value1");



    p2.set("key1", "value2");

        expect(p3.get("key1")).toEqual("value1");
        expect(p2.get("key1")).toEqual("value2");
        expect(p1.get("key1")).toEqual("value2");



    p1.set("key1", "value3");

        expect(p3.get("key1")).toEqual("value1");
        expect(p2.get("key1")).toEqual("value2");
        expect(p1.get("key1")).toEqual("value3");


    p1.remove("key1");

        expect(p3.get("key1")).toEqual("value1");
        expect(p2.get("key1")).toEqual("value2");
        expect(p1.get("key1")).toEqual("value2");

    p2.remove("key1");

        expect(p3.get("key1")).toEqual("value1");
        expect(p2.get("key1")).toEqual("value1");
        expect(p1.get("key1")).toEqual("value1");



    p3.remove("key1");

        expect(p3.get("key1")).toBeUndefined();


        expect(p2.get("key1")).toBeUndefined();


        expect(p1.get("key1")).toBeUndefined();




    // reverse check order
    p3.set("key1", "value1");

        expect(p1.get("key1")).toEqual("value1");
        expect(p2.get("key1")).toEqual("value1");
        expect(p3.get("key1")).toEqual("value1");



    p3.remove("key1");

        expect(p1.get("key1")).toBeUndefined();


        expect(p2.get("key1")).toBeUndefined();


        expect(p3.get("key1")).toBeUndefined();




  });

    it("testGrandparentRemove", function() {

    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key2", "value2");
        expect(p1.get("key2")).toEqual("value2");


    p2.removeParent(p3);
        expect(p1.get("key2")).toBeUndefined();



  });

    it("testGrandparentRemoveAll", function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key", "value1");
        expect(p1.get("key")).toEqual("value1");


    p2.removeAllParents();
        expect(p1.get("value1")).toBeUndefined();



    p3 = new jsx3.app.Properties();
    p2.addParent(p3);

    p3.set("key", "value2");

        expect(p1.get("key")).toEqual("value2");




    // try without the interim check for undefined
    p2.removeAllParents();
    p3 = new jsx3.app.Properties();
    p2.addParent(p3);
    p3.set("key", "value3");

        expect(p1.get("key")).toEqual("value3");

  });

    it("testParentsPrecedence", function() {
    var p = new jsx3.app.Properties();
    var p1 = new jsx3.app.Properties();
    p1.set("key1", "value1");
    var p2 = new jsx3.app.Properties();
    p2.set("key1", "value2");

        expect(p.get("key1")).not.toBeDefined();

    p.addParent(p1);
        expect(p.get("key1")).toEqual("value1");

    p.addParent(p2);
        expect(p.get("key1")).toEqual("value2");

    p.removeParent(p2);
        expect(p.get("key1")).toEqual("value1");

  });


    it("testLoadXml", function() {
    var d = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d);

        expect(p.get("key1")).toEqual("value1");
        expect(p.get("key2")).toEqual("value2");
        expect(p.get("key3")).toEqual("value3");
        expect(p.get("key4")).not.toBeDefined();
  });

    it("testLoadEval", function() {
    var d = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d);

        expect(p.get("eval1")).toEqual(18);

    expect(p.get("eval2")).toEqual("2n * 9");
  });

        it("testSpaces1", function() {

    var d1 = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var d2 = (new jsx3.xml.Document()).load(t.resolveURI("data/props2.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d1);
            expect(p.get("key1")).toEqual("value1");

    p.loadXML(d2);
            expect(p.get("key1")).toEqual("valueA");

    p.loadXML(d1);
            expect(p.get("key1")).toEqual("value1");

  });

            it("testSpaces2", function() {

    var d1 = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var d2 = (new jsx3.xml.Document()).load(t.resolveURI("data/props2.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d1);
                expect(p.get("key1")).toEqual("value1");

    p.loadXML(d2, "space2");
                expect(p.get("key1")).toEqual("value1");

    p.loadXML(d1);
                expect(p.get("key1")).toEqual("value1");
                expect(p.get("key2")).toEqual("value2");

    p.loadXML(d2);
                expect(p.get("key1")).toEqual("valueA");
                expect(p.get("key2")).toEqual("value2");

  });

                it("testSpaces2", function() {
    var d1 = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var d2 = (new jsx3.xml.Document()).load(t.resolveURI("data/props2.xml"));
    var p = new jsx3.app.Properties();

    p.loadXML(d1, "space1");
                    expect(p.get("key1")).toEqual("value1");

    p.loadXML(d2, "space2");
                    expect(p.get("key1")).toEqual("valueA");

    p.loadXML(d1, "space1");
                    expect(p.get("key1")).toEqual("valueA");

    p.loadXML(d1, "space2");
                    expect(p.get("key1")).toEqual("value1");

  });

                    it("testLocaleLocale", function() {
    jsx3.app.PropsBundle.clearCache();

    var l1 = new jsx3.util.Locale();
    var l2 = new jsx3.util.Locale("en");

    var p1 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), l1);
    var p2 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), l2);


                        expect(p1).not.toEqual(p2);
                        expect(p1.getLocale()).toEqual(l1);
                        expect(p2.getLocale()).toEqual(l2);
  });

    it("testLocaleDefault", function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale());

        expect(p).toBeInstanceOf(jsx3.app.Properties);
        expect(p.get("key1")).toEqual("key1_default");
        expect(p.get("key2")).toEqual("key2_default");
        expect(p.get("key3")).toEqual("key3_default");
  });

        it("testLocaleUnavailable", function() {

    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("es"));

            expect(p).toBeInstanceOf(jsx3.app.Properties);
            expect(p.get("key1")).toEqual("key1_default");
            expect(p.get("key2")).toEqual("key2_default");
            expect(p.get("key3")).toEqual("key3_default");
  });

    it("testLocaleFallThrough1", function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en"));

        expect(p).toBeInstanceOf(jsx3.app.Properties);
        expect(p.get("key1")).toEqual("key1_en");
        expect(p.get("key2")).toEqual("key2_en");
        expect(p.get("key3")).toEqual("key3_default");
        expect(p.get("key4")).toEqual("key4_default");


  });

        it("testLocaleFallThrough2", function() {

    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en", "US"));
            expect(p).toBeInstanceOf(jsx3.app.Properties);
            expect(p.get("key1")).toEqual("key1_en");
            expect(p.get("key2")).toEqual("key2_en_US");
            expect(p.get("key3")).toEqual("key3_en_US");
            expect(p.get("key4")).toEqual("key4_default");
  });

    it("testLocaleCache1", function() {
    jsx3.app.PropsBundle.clearCache();

    var p1 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en"));
    var p2 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en"));
        expect(p1).toEqual(p2);
  });

        it("testLocaleCache2", function() {
    jsx3.app.PropsBundle.clearCache();

    var cache = new jsx3.app.Cache();
    var url = t.resolveURI("data/lprops.xml");
    var p1 = jsx3.app.PropsBundle.getProps(url, new jsx3.util.Locale("en"), cache);

    var doc = cache.getDocument(url);
            expect(doc).not.toBeNull();
            expect(doc).toBeInstanceOf(jsx3.xml.Document);
  });

            it("testSingleFile", function() {
    jsx3.app.PropsBundle.clearCache();

    var uri = t.resolveURI("data/lprops2.xml");
    var p = null;

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale());

                expect(p.get("key1")).toEqual("value_default");

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("en"));

                expect(p.get("key1")).toEqual("value_default");

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("en", "US"));

                expect(p.get("key1")).toEqual("value_en_US");

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("en", "UK"));

                expect(p.get("key1")).toEqual("value_en_UK");

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("es"));

                expect(p.get("key1")).toEqual("value_es");

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("es", "ES"));
                expect(p.get("key1")).toEqual("value_es_ES");

  });

    it("testLocaleError", function() {
    jsx3.app.PropsBundle.clearCache();

        var func =function() {
            jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("de"));
        }

        expect(func).toThrow();

  });

                it("testLocalegetPropsFT", function() {

    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getPropsFT(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("de"));
                    expect(p.get("key1")).toEqual("key1_default");
                    expect(p.get("key2")).toEqual("key2_default");
                    expect(p.get("key3")).toEqual("key3_default");

  });
    afterEach(function() {
        if (t._server) {
            t._server.destroy();
            delete t._server;
        }
    });
});