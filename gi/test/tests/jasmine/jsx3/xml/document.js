/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.xml.Document", function() {
    var _jasmine_test = gi.test.jasmine;
    _jasmine_test.require("jsx3.xml.Document", "jsx3.net.Request");
    var t = new _jasmine_test.TestSuite("jsx3.xml.Document");

    beforeEach(function () {
        this.addMatchers(gi.test.jasmine.matchers);
        t._server = null;
    });



    t.testDefined = function() {
        expect(jsx3.lang.Class.forName("jsx3.xml.Document")).not.toBeNull();
        expect(jsx3.lang.Class.forName("jsx3.xml.Document")).not.toBeUndefined();
  };

    it("testNew", function() {

    var d = new jsx3.xml.Document();
      expect(d.hasError()).toBeFalsy();

  });


      it("testNativeDocument", function() {
    var d = new jsx3.xml.Document();
      expect(d.getNativeDocument()).not.toBeNull();
      expect(d.getNativeDocument()).not.toBeUndefined();


    d = new jsx3.xml.Document();
    d.loadXML("<data/>");
      expect(d.getNativeDocument()).not.toBeNull();
      expect(d.getNativeDocument()).not.toBeUndefined();
  });

  it("testLoad" ,function() {
    var d = new jsx3.xml.Document();
    var retVal = d.load(t.resolveURI("data/test1.xml"));

      expect(d === retVal).toBeTruthy();
      expect(d.hasError()).toBeFalsy();

  });

  it("testLoadBadUrl" , function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/testy1.xml"));
       expect(d.hasError()).toBeTruthy();


  });

  it("testLoadBadXml" , function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/bad.xml"));
      expect(d.hasError()).toBeTruthy();
  });

  it("testVersion" , function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test1.xml"));
      expect(d.getXmlVersion()).toEqual("1.0");


  });

  it("testEncoding" , function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test1.xml"));
      expect(d.getXmlEncoding().toString()).toBeTypeOf("string");
       expect( d.getXmlEncoding().toUpperCase()).toEqual("UTF-8");


  });

  it("testStandalone" , function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test1.xml"));
      expect(d.hasError()).toBeFalsy();
      expect(d.getXmlStandalone()).toBeFalsy();

    d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test2.xml"));
      expect(d.hasError()).toBeFalsy();
      expect(d.getXmlStandalone()).toBeFalsy();
  });

  it("testLoadAsync1" ,function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.load(t.resolveURI("data/test1.xml"));

    // should not be loaded yet
   //   expect(d.getNative()).toBeNull();
      expect(d.getNative()).toBeUndefined();
       expect(d.hasError()).toBeFalsy();
  });

it("testLoadAsync2", function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);

      var objEvent;
      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_RESPONSE,  function(evt) {
              objEvent = evt;
              flag = true;

          }, 500);
      });

      waitsFor(function() {
          value++;
          return flag;
      }, "The Value should be incremented",800);

      runs(function() {
          expect(d).toEqual(objEvent.target);
          expect( objEvent.target.hasError()).toBeFalsy();
          expect("data").toEqual(d.getNodeName());


      });



    d.load(t.resolveURI("data/test1.xml"));
  });
 // t.testLoadAsync2._async = true;

 it("testLoadAsyncError1" , function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.load(t.resolveURI("data/testy1.xml"));

    // should not be loaded yet
    //  expect(d.getNative()).toBeNull();
      expect(d.getNative()).toBeUndefined();
      expect(d.hasError()).toBeFalsy();


  });

  it("testLoadAsyncError2" , function() {
    var d = new jsx3.xml.Document();
   d.setAsync(true);

      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_RESPONSE,function(objEvent) {
              expect(objEvent.target.hasError()).toBeFalsy();

              flag = true;

          }, 500);
      });


      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_ERROR, function(objEvent) {
              expect( objEvent.target.hasError()).toBeTruthy();

              flag = true;

          }, 500);
      });




    d.load(t.resolveURI("data/testy1.xml"));
  });

  //t.testLoadAsyncError2._async = true;

  it("testLoadBadXmlAsync" ,function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);

      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
              expect( objEvent.target.hasError()).toBeFalsy();

              flag = true;

          }, 500);
      });



      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_ERROR, function(objEvent) {
              expect( objEvent.target.hasError()).toBeTruthy();

              flag = true;

          }, 500);
      });




    d.load(t.resolveURI("data/bad.xml"));
  });
  //t.testLoadBadXmlAsync._async = true;


  it("testAbort" , function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);

    var evtCount = 0;
      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
              evtCount++;
              flag = true;

          }, 500);
      });

      runs(function() {
          flag = false;
          value = 0;

          setTimeout(function() {
              expect(evtCount).toEqual(0);
              expect(d.hasError()).toBeFalsy();
          },2000);
      });

    d.load(t.resolveURI("data/test1.xml"));
    d.abort();
    

  });
 // t.testAbort._async = true;

 it("testLoadRemote" , function() {
    var d = new jsx3.xml.Document();
    d.load(jasmine.HTTP_BASE + "/data1.xml");
      expect(d.hasError()).toBeFalsy();
       expect(d.getNodeName()).toEqual("data");
        expect(d.getChildNodes().get(0).getNodeName()).toEqual("record");

  });
  //t.testLoadRemote._skip_unless = "NETWORK";

  t.testLoadRemoteBadUrl = function() {
    var d = new jsx3.xml.Document();
    d.load(jasmine.HTTP_BASE + "/404.xml");
      expect(d.hasError()).toBeTruthy();

  };
  //t.testLoadRemoteBadUrl._skip_unless = "NETWORK";

  t.testLoadRemoteBadXml = function() {
    var d = new jsx3.xml.Document();
    d.load(jasmine.HTTP_BASE + "/bad1.xml");
     expect(d.hasError()).toBeTruthy();

  };
  t.testLoadRemoteBadXml._skip_unless = "NETWORK";

  it("testLoadRemoteAsync" , function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {

              expect(objEvent.target).toEqual(d);
               expect( objEvent.target.hasError()).toBeFalsy();
                 expect(d.getNodeName()).toEqual("data");


              flag = true;

          }, 500);
      });


      runs(function() {
          flag = false;
          value = 0;
          d.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {

              expect(objEvent.target).toEqual(d);
              expect( objEvent.target.hasError()).toBeFalsy();
              expect(d.getNodeName()).toEqual("data");


              flag = true;

          }, 500);
      });

      runs(function() {
          flag = false;
          value = 0;
          d.subscribe([jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT], function(objEvent) {

             expect(objEvent.target.getError()).toBeFalsy();


              flag = true;

          }, 500);
      });



    d.load(jasmine.HTTP_BASE + "/data1.xml", 5000);
  });

  //t.testLoadRemoteAsync._async = true;
  //t.testLoadRemoteAsync._skip_unless = "NETWORK";

  it("testLoadRemoteAsyncBadUrl" , function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);


      runs(function() {
          d.subscribe([jsx3.xml.Document.ON_RESPONSE,jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT], function(objEvent) {
              expect(objEvent.target.hasError()).toBeFalsy();

          }, 500);
      });


    d.load(jasmine.HTTP_BASE + "/404.xml", 5000);
  });
 // t.testLoadRemoteAsyncBadUrl._async = true;
  //t.testLoadRemoteAsyncBadUrl._skip_unless = "NETWORK";

 it("testLoadRemoteAsyncBadXml" , function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);

      runs(function() {
          d.subscribe([jsx3.xml.Document.ON_RESPONSE,jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT], function(objEvent) {
              expect(objEvent.target.hasError()).toBeFalsy();

          }, 500);
      });



    d.load(jasmine.HTTP_BASE + "/bad1.xml", 5000);
  });
  //t.testLoadRemoteAsyncBadXml._async = true;
  t.testLoadRemoteAsyncBadXml._skip_unless = "NETWORK";

  it("testSourceUrl" , function() {
    var url = t.resolveURI("data/test1.xml");
    var d = new jsx3.xml.Document();
    d.load(url);
      expect(url).toEqual(d.getSourceURL());



    d.load("nowhere.xml");
      expect(d.getSourceURL()).toEqual("nowhere.xml")


    d.loadXML("<data/>");
      expect(d.getSourceURL()).toBeNull();
      expect(d.getSourceURL()).toBeUndefined();

  });
it("testLoadXml" ,function() {
    var d = new jsx3.xml.Document();
    var retVal = d.loadXML("<data><record/></data>");
      expect(d === retVal).toBeTruthy();
       expect(d.hasError()).toBeFalsy();
      expect(d.hasError()).toBeFalsy();
        expect(d.getNodeName()).toEqual("data");

  });

  it("testLoadXmlError",function() {
    var d = new jsx3.xml.Document();
    d.loadXML("<data><record/></data>");
      expect(d.hasError()).toBeTruthy();


    d.loadXML("<data><record/></data>");
      expect(d.hasError()).toBeFalsy();

  });

  it("testToString" , function() {
    var d = new jsx3.xml.Document();
    var src = "<data><record/></data>";
    d.loadXML(src);
      expect(src).toEqual(d.toString());

    d.loadXML("<data><record/></data>");
      expect(d.hasError()).toBeTruthy();
       expect( d.toString().indexOf(d.getError().description) >= 0).toBeTruthy();
  });

 it("testCloneDocument" , function() {
    var d = new jsx3.xml.Document();
    var src = "<data><record/></data>";
    d.loadXML(src);
    var d2 = d.cloneDocument();
      expect(src).toEqual(d.toString());
      expect(d).not.toEqual(d2);
      expect(src).toEqual(d2.toString());
  });

  it("testAsync",function() {
    var d = new jsx3.xml.Document();
      expect(d.getAsync()).toBeFalsy();


    d.setAsync(true);
      expect(d.getAsync()).toBeTruthy();


    d.setAsync(false);
      expect(d.getAsync()).toBeFalsy();


  });

 it("testSerialize" , function() {
    var d = new jsx3.xml.Document();
    d.loadXML("<data/>");

     expect(d.serialize()).toEqual('<data/>');
      expect(d.serialize("1.0", "utf-8").toEqual('<?xml version="1.0" encoding="utf-8"?>\n<data/>'));
     d.loadXML('<?xml version="1.0" encoding="utf-16"?><data/>');
     expect(d.serialize("1.0", "utf-8").toEqual('<?xml version="1.0" encoding="utf-8"?>\n<data/>'));


  });

  it("testCreateDocumentElm" , function() {
    var d = new jsx3.xml.Document();
    expect(d.getNative()).toBeNull();
      expect(d.getNative()).toBeUndefined();
    d.createDocumentElement("data");
      expect(d.getNodeName()).toEqual("data");
          expect(d.getChildNodes().size()).toEqual(0);


  });

  it("testSelectionNamespaces" , function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><a><r a="1"/><ns:r a="2"/></a></data>');

    var n = d.selectSingleNode("//r");
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
       expect(n.getAttribute("a")).toEqual(1);



    d.setSelectionNamespaces('xmlns:foo="uri"');
    n = d.selectSingleNode("//foo:r");
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
      expect(n.getAttribute("a")).toEqual(2);

    n = d.getFirstChild().selectSingleNode("//foo:r");
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
      expect(n.getAttribute("a")).toEqual(2);

  });

//  t.testDeclaredNamespaces = function() {
//    // TODO: Luke
//  };
//
//  t.testNamespaceAxis = function() {
//    // TODO: Luke
//  };

  /**
   * Tests a bug revealed in IE. A synchronous request issued after an asynchronous document load will cause the
   * document's callback function to be executed in the same stack as the the native send() method. This was only
   * exposed when deployed over HTTP.  ... can't actually get this to fail on 3.3.0_v1.
   */

  it("testAsyncOrdering" ,function() {
    var order = [];
    var js = "";
      runs(function() {
          flag = false;
          value = 0;
          expect(js.indexOf("nothingSpecial") >= 0).toBeTruthy();
            expect(order.length).toEqual(1);
              expect(order[0]).toEqual("request");
          //expect(order[1]).toEqual("document");


      });

    var d1 = new jsx3.xml.Document();
    d1.setAsync(true);


      runs(function() {
          flag = false;
          value = 0;
          expect(js.indexOf("nothingSpecial") >= 0).toBeTruthy();
          expect(order.length).toEqual(1);
          expect(order[0]).toEqual("request");
         // expect(order[1]).toEqual("document");


      });


      var objEvent;
      runs(function() {
          flag = false;
          value = 0;
          d1.subscribe(jsx3.xml.Document.ON_RESPONSE,  function(evt) {
              objEvent = evt;
              order.push("document");
              if (order.length == 2)
              {
                  expect(js.indexOf("nothingSpecial") >= 0).toBeTruthy();
                  expect(order.length).toEqual(2);
                  expect(order[0]).toEqual("request");
                 // expect(order[1]).toEqual("document");

              }

          }, 500);
      });


    d1.load(t.resolveURI("data/test1.xml"), 1000);

    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/test.js"), false);
    r.send();
    js = r.getResponseText();
    order.push("request");

    if (order.length == 2) callback();
  });
  //t.testAsyncOrdering._async = true;

    afterEach(function() {
        if (t._server) {
            t._server.destroy();
            delete t._server;
        }
    });
});

