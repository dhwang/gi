/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.xml.Cacheable", function() {
    var _jasmine_test = gi.test.jasmine;
    _jasmine_test.require("jsx3.xml.Cacheable", "jsx3.app.Server", "jsx3.app.Model");
    var t = new _jasmine_test.TestSuite("jsx3.xml.Cacheable");


    beforeEach(function () {
        jsx3.Class.defineClass("gi.test.CacheTest", jsx3.app.Model, [jsx3.xml.Cacheable], function(CacheTest, CacheTest_prototype) {
        });

        jsx3.Class.defineClass("gi.test.CacheCDFTest", jsx3.app.Model, [jsx3.xml.Cacheable, jsx3.xml.CDF],
            function(CacheCDFTest, CacheCDFTest_prototype) {
            });

        t._server = t.newServer(null, "JSXAPPS/testCacheableServer", false, {namespace:"testCacheableServer"});
        this.addMatchers(gi.test.jasmine.matchers);

    });


    it("testServer", function() {
    var s = t._server;
        expect(s).toBeInstanceOf(jsx3.app.Server);
        expect(s.getEnv("namespace")).toEqual("testCacheableServer");

  });

    it("testClass", function() {


       expect(gi.test.CacheTest).not.toBeUndefined()
        expect(gi.test.CacheTest.jsxclass).toBeInstanceOf(jsx3.lang.Class);
      expect(jsx3.xml.Cacheable.jsxclass.isAssignableFrom(gi.test.CacheTest.jsxclass)).toBeTruthy()

  });

        it("testXmlId", function() {
    var c = new gi.test.CacheTest();
    var id = c.getXMLId();
   expect(id).toBeTypeOf("string");
 expect(id.length > 0).toBeTruthy()
 c.setXMLId("myxmlid");
 expect(c.getXMLId()).toEqual("myxmlid")
  });

 it("testXmlString", function() {
    var c = new gi.test.CacheTest();
                //expect(c.getXMLString()).toBeNull()
                expect(c.getXMLString()).toBeUndefined()

    c.setXMLString("<xml/>");
                expect(c.getXMLString()).toEqual("<xml/>")  ;

  });

                it("testXmlUrl", function() {

    var c = new gi.test.CacheTest();
                   // expect(c.getXMLURL()).toBeNull()
                    expect(c.getXMLURL()).toBeUndefined()

    c.setXMLURL("doc.xml");
                    expect(c.getXMLURL()).toEqual("doc.xml")

  });

                    it("testXmlFromDefault", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    var x = c.getXML();
               // expect(jsx3.xml._document).toBeInstanceOf(x);
                 //       expect(x.getNodeName()).toEqual(x)
                        expect(x.testGetChildNodes().size()).toEqual(0);

  });

  it("testXmlFromId",function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLId("myxmlid");
    var cache = c.getServer().getCache();
    var x = new jsx3.xml.Document().loadXML("<data><record/></data>");
    cache.setDocument("myxmlid", x);

       expect(c.getXML()).toEqual(x);


  });

                        it("testXmlFromString", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString('<data><record jsxid="1"/><record jsxid="2"/></data>');
    var x = c.getXML();
                            expect(x.getNodeName()).toEqual("data")
                            expect(x.getChildNodes().size()).toEqual(2);
                             expect(x.selectSingleNode("//record[@jsxid='2']")).not.toBeNull()
                            expect(x.selectSingleNode("//record[@jsxid='2']")).not.toBeUndefined()


  });
it("testXmlFromUrl", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data")
  expect(x.getChildNodes().size()).toEqual(5);
  expect(x.selectSingleNode("//record[@jsxid='4']")).not.toBeNull()
  expect(x.selectSingleNode("//record[@jsxid='4']")).not.toBeUndefined()

  });

   it("testXmlFromError", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString('<data>');
    var x = c.getXML();
    expect(x).toBeInstanceOf(jsx3.xml.Document)  ;
    expect(x.hasError()).toBeTruthy()

  });

 it("testXmlFromPrecidence1", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLId("myxmlid");
    c.setXMLString('<data><record jsxid="1"/></data>');
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var cache = c.getServer().getCache();
    var x = new jsx3.xml.Document().loadXML("<data><record/></data>");
    cache.setDocument("myxmlid", x);
    expect(x).toEqual(c.getXML());

  });

    it("testXmlFromPrecidence2", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString('<data><record jsxid="1"/></data>');
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var x = c.getXML();
    expect(x.getChildNodes().size()).toEqual(1);


  });

  it("testShareShare", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setShareResources(jsx3.xml.Cacheable.SHARERESOURCES);
    var x = c.getXML();
    var id = c.getXMLId();
    t._server.getBodyBlock().removeChild(c);
    var cache = t._server.getCache();
    expect(x).toEqual(t._server.getCache().getDocument(id));
  });

   it("testShareCleanup", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setShareResources(jsx3.xml.Cacheable.CLEANUPRESOURCES);
    var x = c.getXML();
    var id = c.getXMLId();
    t._server.getBodyBlock().removeChild(c);
    var cache = t._server.getCache();
       expect(c.getParent()).toBeNull();
      // expect(c.getParent()).toBeUndefined();
       expect(c.getServer()).toBeNull();
       //expect(c.getServer()).toBeUndefined();
       expect(cache.getDocument(id)).toBeNull();
      // expect(cache.getDocument(id)).toBeUndefined();

  });

 it("testTransformerUrl", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");


  });

it("testTransformerId", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers("trans1");
    var trans = new jsx3.xml.Document().load(t.resolveURI("data/trans.xsl"));
    t._server.getCache().setDocument("trans1", trans);
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
  });

                                                            it("testXmlBindEvent", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlBind(1);

    var event = 0;

    c.subscribe("xmlbind", function() {
      event++;
    });

    var doc = new jsx3.xml.Document().loadXML("<object><field/></object>");
    t._server.getCache().setDocument(c.getXMLId(), doc);
          expect(event).toEqual(1);

  });

                                                                it("testXmlBindNoTrans", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlBind(1);
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));

    var doc = new jsx3.xml.Document().loadXML("<object><field/></object>");
    t._server.getCache().setDocument(c.getXMLId(), doc);

    var x = c.getXML();
                                                                    expect(x.getNodeName()).toEqual("object");
                                                                     expect(x.getChildNodes().get(0).getNodeName()).toEqual("field");

  });

                                                                    it("testXmlBindNoPropReplace", function() {

    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlBind(1);

    var props = c.getServer().JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");

    var doc = new jsx3.xml.Document().loadXML('<data><record jsxtext="{k1}" jsxtip="{k2}"/></data>');
    t._server.getCache().setDocument(c.getXMLId(), doc);

    var x = c.getXML();
    var r = x.selectSingleNode("//record");

                                                                        expect(r).not.toBeNull() ;
                                                                        expect(r).not.toBeUndefined() ;
                                                                         expect(r.getAttribute("jsxtext")).toEqual("{k1}");
                                                                        expect(r.getAttribute("jsxtip")).toEqual("{k2}")


  });

                                                                        it("testTransformerAsync", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/noncdf.xml"));
    c.setXMLTransformers("trans1");

    var trans = new jsx3.xml.Document().load(t.resolveURI("data/trans.xsl"));
    t._server.getCache().setDocument("trans1", trans);

                                                                            runs(function() {
                                                                                flag = false;
                                                                                value = 0;
                                                                                c.subscribe("xmlbind",  function() {
                                                                                    flag = true;

                                                                                }, 500);
                                                                            });

                                                                            waitsFor(function() {
                                                                                value++;
                                                                                return flag;
                                                                            }, "The Value should be incremented", 750);

                                                                            runs(function() {
                                                                                var x = c.getXML();
                                                                                expect(x.getNodeName()).toEqual("data");
                                                                                expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
                                                                            });




    c.doTransform();
  });
  //t.testTransformerAsync._async = true;

                                                                            it("testTransformerAsyncURL", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/noncdf.xml"));
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));


                                                                                runs(function() {
                                                                                    flag = false;
                                                                                    value = 0;
                                                                                    c.subscribe("xmlbind",  function() {
                                                                                        flag = true;

                                                                                    }, 500);
                                                                                });

                                                                                waitsFor(function() {
                                                                                    value++;
                                                                                    return flag;
                                                                                }, "The Value should be incremented", 750);

                                                                                runs(function() {
                                                                                    var x = c.getXML();
                                                                                    expect(x.getNodeName()).toEqual("data");
                                                                                    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
                                                                                });



    c.doTransform();
  });
                                                                                it("testPropReplace", function() {
  //t.testTransformerAsyncURL._async = true;


    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLURL(t.resolveURI("data/test3.xml"));

    var props = c.getServer().JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");

    var x = c.getXML();
    var r = x.selectSingleNode("//record");

                                                                                    expect(r).not.toBeNull() ;
                                                                                    expect(r).not.toBeUndefined() ;
                                                                                    expect(r.getAttribute("jsxtext")).toEqual("dv1");
                                                                                    expect(r.getAttribute("jsxtip")).toEqual("dv2")



  });

                                                                                    it("testPropReplaceAsync", function() {

    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/test3.xml"));

    var props = t._server.JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");

                                                                                        runs(function() {
                                                                                            flag = false;
                                                                                            value = 0;
                                                                                            c.subscribe("xmlbind",  function() {
                                                                                                flag = true;


                                                                                            }, 500);
                                                                                        });

                                                                                        waitsFor(function() {
                                                                                            value++;
                                                                                            return flag;
                                                                                        }, "The Value should be incremented", 750);

                                                                                        runs(function() {
                                                                                            var x = c.getXML();
                                                                                            var r = x.selectSingleNode("//record");
                                                                                            expect(r).not.toBeNull() ;
                                                                                            expect(r).not.toBeUndefined() ;
                                                                                            expect(r.getAttribute("jsxtext")).toEqual("dv1");
                                                                                            expect(r.getAttribute("jsxtip")).toEqual("dv2")
                                                                                        });





    c.doTransform();
  });
  //t.testPropReplaceAsync._async = true;
                                                                                        it("testSetParam", function() {

    var c = new gi.test.CacheTest();

    var o = c.getXSLParams();

                                                                                            //expect(o.xslparam1).toBeNull() ;
                                                                                            expect(o.xslparam1).toBeUndefined() ;


    c.setXSLParam("xslparam1", "value1");
    o = c.getXSLParams();

                                                                                            expect( o.xslparam1).toEqual("value1");

  });

                                                                                            it("testRemoveParams", function() {

    var c = new gi.test.CacheTest();

    c.setXSLParam("xslparam1", "value1");
    c.setXSLParam("xslparam2", "value2");

    var o = c.getXSLParams();
                                                                                                expect(o.xslparam1).toEqual("value1");
                                                                                                expect(o.xslparam2).toEqual("value2");


    c.removeXSLParam("xslparam1");

    o = c.getXSLParams();
                                                                                               // expect(o.xslparam1).toBeNull();
                                                                                                expect(o.xslparam1).toBeUndefined();
                                                                                               // expect(o.xslparam2).toBeNull();
                                                                                               // expect(o.xslparam2).toBeUndefined();


    c.removeXSLParams();
    o = c.getXSLParams();

                                                                                                expect(o.xslparam2).toBeUndefined();
                                                                                              //  expect(o.xslparam2).toBeNull();

  });

                                                                                                it("testParams", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    c.setXSLParam("xslparam1", "value1");

    var x = c.getXML();
                                                                                                    expect(x.getNodeName()).toEqual("data");
                                                                                                     expect( x.getAttribute("param")).toEqual("value1");

  });

                                                                                                    it("testGetXsl", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    var x = c.getXSL();
                                                                                                        expect(x).toBeInstanceOf(jsx3.xml.Document);
                                                                                 //                       expect(x.getError()).toBeFalsy();
                                                                                                        expect(x.hasError()).toBeFalsy();


  });

                                                                                                        it("testResetCache", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();



expect(cache.getDocument(c.getXMLId())).toBeNull();
//expect(cache.getDocument(c.getXMLId())).toBeUndefined();
                                                                                                            expect(cache.getDocument(c.getXSLId())).toBeNull();
                                                                                               //             expect(cache.getDocument(c.getXSLId())).toBeUndefined();
    var xml = c.getXML();
 expect(cache.getDocument(c.getXMLId())).not.toBeNull();
expect(cache.getDocument(c.getXMLId())).not.toBeUndefined();
    var xsl = c.getXSL();
expect(cache.getDocument(c.getXSLId())).not.toBeNull();
expect(cache.getDocument(c.getXSLId())).not.toBeUndefined();


    c.resetCacheData();
   expect(cache.getDocument(c.getXMLId())).toBeNull();
  // expect(cache.getDocument(c.getXMLId())).toBeUndefined();
                                                                                                            expect(cache.getDocument(c.getXSLId())).toBeNull();
                                                                            //                                expect(cache.getDocument(c.getXSLId())).toBeUndefined();

  });

                                                                                                            it("testResetCacheXml", function() {

    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();

    var xml = c.getXML();
    var xsl = c.getXSL();

    c.resetXmlCacheData();
expect(cache.getDocument(c.getXMLId())).toBeNull();
 //expect(cache.getDocument(c.getXMLId())).toBeUndefined();

  });

 it("testResetCacheXsl", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();
    var xml = c.getXML();
    var xsl = c.getXSL();
    c.resetXslCacheData();
      // expect(cache.getDocument(c.getXMLId())).toBeNull();
    // expect(cache.getDocument(c.getXMLId())).toBeUndefined();

     expect(cache.getDocument(cache.getDocument(c.getXSLId()))).toBeNull();
     //expect(cache.getDocument(cache.getDocument(c.getXSLId()))).toBeUndefined();


  });

  it("testSetSourceXml", function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var x = new jsx3.xml.Document().loadXML("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    x = c.setSourceXML(x);
    expect( x.getNodeName()).toEqual("data")
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record")
  });

    afterEach(function() {
        if (t._server) {
            t._server.destroy();
            delete t._server;
        }
    });
});

