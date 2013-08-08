/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.Request", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.Request", "jsx3.xml.Document");
  var t = new _jasmine_test.TestSuite("jsx3.net.Request");
  var ACTION = _jasmine_test.HTTP_BASE + "/formdata.cgi";

  it("should get the content of the response as an XML document", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var x = r.getResponseXML();
    expect(x).not.toBeNull();
    expect(x).not.toBeUndefined();
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.getAttribute("jsxid")).toEqual("jsxroot");
  });

  it("should return null when the response is not a valid XML document", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.txt"));
    r.send();
    expect(r.getResponseXML()).toBeNull();
  });

  it("should get the content of the response as string", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.txt"));
    r.send();
    var text = r.getResponseText();
    expect(text).not.toBeNull();
    expect(text).not.toBeUndefined();
    expect(text).toBeTypeOf("string");
    expect(text).toMatch(/^File data\.[\r\n]+$/);
  });

  it("should get the content of the response as string 1", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var text = r.getResponseText();
    expect(text).not.toBeNull();
    expect(text).not.toBeUndefined();
    expect(text).toBeTypeOf("string");
    expect(text).toMatch(/^<data jsxid="jsxroot">[\r\n]+ +<record a1="v1"\/>[\r\n]+<\/data>[\r\n]+$/);
  });

  it("should get the HTTP response status code", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    expect(r.getStatus()).toEqual(jsx3.net.Request.STATUS_OK)
  });

  it("should detect a nonexistent of bad xml", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"));
    r.send();
    expect(r.getStatus() >= 400 && r.getStatus() < 500).toBeTruthy();
  });

  it("should get  the HTTP response line status", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var s = r.getStatusText();
    expect(s).toBeTypeOf("string");
  });

  it("should test if an async request is async even on local file system", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"), true);
    var responded = false;
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      responded = true;
    });
    r.send();
    expect(responded).toBeFalsy();
  });

  it("should asynchronously test an async request on a local file system", function () {
    var r = new jsx3.net.Request();
    var objEvent = {};
    r.open("GET", t.resolveURI("data/req.xml"), true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (evt) {
      objEvent = evt;
    });
    r.send();
    waitsFor(function () {
      return objEvent.target != null;
    }, "wait until we have a real objEvent object", 5000);
    runs(function () {
      expect(objEvent.target).toBeInstanceOf(jsx3.net.Request)
      expect(r).toEqual(objEvent.target);
      var x = r.getResponseXML();
      expect(x.getAttribute("jsxid")).toEqual("jsxroot");
    });
  });

  it("Test that a synchronous request doesn't cause async requests to return synchronously", function () {
    var r1 = new jsx3.net.Request();
    var asyncReturned = false;
    r1.open("GET", t.resolveURI("data/rule1.xml"), true);
    r1.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      asyncReturned = true;
    });
    r1.send();
    var r2 = new jsx3.net.Request();
    r2.open("GET", t.resolveURI("data/rule2.xml"), false);
    r2.send();
    expect(asyncReturned).toBeFalsy()
  });

  it("should fail to get response, asynch request should be asynch even on local file system", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"), true);
    var responded = false;
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      responded = true;
    });
    r.send();
    expect(responded).toBeFalsy();
  });

  // NOTE: Fails on Safari, http://bugs.webkit.org/show_bug.cgi?id=12307
  //if (gi.test.browser != "SAF")
  it("should fail to retrieve a non-existent file, status code 4XX", function () {
    var r = new jsx3.net.Request();
    var evt = {};
    r.open("GET", t.resolveURI("data/req__.xml"), true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE
      , function (objEvent) {
        evt = objEvent;
      });
    r.send();
    waitsFor(function () {
      return evt.target == r;
    }, "wait until there's a real evt.target", 5000);
    runs(function () {
      expect(r).toEqual(evt.target);
      var status = evt.target.getStatus();
      expect(status >= 400 && status < 500).toBeTruthy()
    });
  });

  it("should get the content of the response as an XML document for a remote xml", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml");
    r.send();
    var x = r.getResponseXML();
    expect(x).not.toBeNull();
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.getNodeName()).toEqual("data");
  });
  //t.testRemoteXml._skip_unless = "NETWORK";
  it("should get the content of the response as string.", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/text1.txt");
    r.send();
    var text = r.getResponseText();
    expect(text).not.toBeNull()
    expect(text).not.toBeUndefined()
    expect(text).toBeTypeOf("string")
    expect(text).toMatch(/^File data\.[\r\n]+$/);
  });
  //t.testRemoteText._skip_unless = "NETWORK";

  it("should get an error loading a non existent 404.xml file", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/404.xml");
    r.send();
    var s = r.getStatus();
    expect(s >= 400).toBeTruthy()
    expect(s < 500).toBeTruthy()
  });
  // t.testRemote404._skip_unless = "NETWORK";

  it("should be able to load xml file asynchronously", function () {
    var r = new jsx3.net.Request();
    var evt = {};
    r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml", true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      evt = objEvent;
    });
    r.send();
    waitsFor(function () {
      return evt.target == r;
    }, "wait until there's a real evt.target", 5000);
    runs(function () {
      expect(evt.target).toBeInstanceOf(jsx3.net.Request)
      expect(r).toEqual(evt.target)
      var x = r.getResponseXML();
      expect(x.getNodeName()).toEqual("data")
    });
  });

  //t.testRemoteAsync._skip_unless = "NETWORK";
  it("should get an error loading nonexistant xml file asynchronously", function () {
    var r = new jsx3.net.Request();
    var objEvent = {};
    r.open("GET", _jasmine_test.HTTP_BASE + "/404.xml", true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (evt) {
      objEvent = evt;
    });
    r.send();
    waitsFor(function () {
      return objEvent.target == r;
    }, "wait until there's a real objevent.target", 5000);
    runs(function () {
      expect(objEvent.target).toBeInstanceOf(jsx3.net.Request)
      expect(r).toEqual(objEvent.target)
      var s = r.getStatus();
      expect(s >= 400 && s < 500).toBeTruthy()

    });
  });
  //t.testRemoteAsync404._skip_unless = "NETWORK";

  it("should get  the value of a specific HTTP response header.", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml");
    r.send();
    var h1 = r.getResponseHeader("Content-Type");
    expect(h1).toBeTypeOf("string");
    expect(h1.indexOf("xml") >= 0).toBeTruthy();
    var h2 = r.getResponseHeader("Last-Modified");
    if (h2) { // Chrome in Selenium grid doesn't get this header due to the proxy
      expect(h2).toBeTypeOf("string");
      var d = new Date(h2);
      expect(d.getFullYear() >= 2007).toBeTruthy();
    }
    var h3 = r.getResponseHeader("XXX-Not-Provided");
    expect(h3 == null || h3 === "").toBeTruthy()
  });

  // t.testResponseHeader._skip_unless = "NETWORK";

  it("should get the value of all the HTTP headers 1", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml");
    r.send();
    var headers = r.getAllResponseHeaders();
    expect(headers).toBeTypeOf("string");
    expect(headers).toMatch(/\bContent\-Type:/);
    expect(headers).toMatch(/\bContent\-Length:/);
  });

  //t.testAllResponseHeaders._skip_unless = "NETWORK";
  it("should get  the value of all the HTTP headers", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var headers = r.getAllResponseHeaders();
    expect(headers == null || headers === "").toBeTruthy();
  });

  //t.testAllResponseHeadersLocal._skip_unless = "FILE_SCHEME";
  it("should test if timeout occurs when subscribing to event calls asynchronously", function () {
    var r = new jsx3.net.Request();
    var evt = {};
    var status = null;
    r.open("GET", _jasmine_test.HTTP_BASE + "/timeout.cgi", true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      evt = objEvent;
    });
    r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function (objEvent) {
      evt = objEvent;
      status = r.getStatus();
    });
    r.send(null, 100);
    waitsFor(function () {
      return evt.target != null;
    }, "wait until there's a real evt.target", 5000);
    runs(function () {
      expect(status).toEqual(408)
    });
  });
  //t.testTimeoutAsync._skip_unless = "NETWORK";
  it("should test if timeout occurs when subscribing to event calls asynchronously 1", function () {
    var abort = null, objEvent = null;
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/timeout.cgi", true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (evt) {
      objEvent = evt;
    });
    r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function (evt) {
      objEvent = evt;
    });
    r.send(null, 2000);
    var onDone = function () {
      abort = "called";
    };
    runs(function () {
      window.setTimeout(function () {
        abort = "called";
        r.abort();
      }, 100);
      window.setTimeout(function () {
        onDone();
      }, 300);
    });
    waitsFor(function () {
      return abort == "called";
    }, "wait until abort is called", 750);
    runs(function () {
      expect(objEvent).toBeNull();
    });
  });
  //t.testAbort._async = true;
  //t.testAbort._skip_unless = "NETWORK";
  it("should receive no event object when Form.abort() is called before response is received.", function () {
    var r = new jsx3.net.Request();
    var evt = {};
    var abort = null;
    r.open("GET", _jasmine_test.HTTP_BASE + "/timeout.cgi", true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      evt = objEvent;
    });
    r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function (objEvent) {
      evt = objEvent;
    });
    r.send(null, 2500);
    waitsFor(function () {
      return r.getStatus() != null;
    }, "wait until response event is returned", 5000);

    var onDone = function () {
      abort = "called";
    };
    runs(function () {
      window.setTimeout(function () {
        abort = "called";
        r.getNative().abort();
      }, 100);
      window.setTimeout(function () {
        onDone();
      }, 300);
    });
    waitsFor(function () {
      return abort == "called";
    }, "The Value should be incremented", 750);
    runs(function () {
      expect(r.getStatus()).toEqual(13030);
      expect(r.getAllResponseHeaders()).toBeNull();
      expect(r.getResponseHeader("Date")).toBeNull();
      expect(r.getStatusText()).toBeNull();
    });
  });
  //t.testNetworkError._async = true;
  // t.testNetworkError._skip_unless = "NETWORK";


  it("should set value of specified HTTP request header", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()));
    r.setRequestHeader("jsxheader1", "jsxvalue1");
    r.send();
    var d = r.getResponseXML();
    expect(d).not.toBeNull()
    expect(d).toBeUndefined()
    expect(d).toBeInstanceOf(jsx3.xml.Document);
    var rec = d.selectSingleNode("//record[@jsxid='HTTP_JSXHEADER1']");
    expect(rec).not.toBeNull()
    expect(rec).toBeUndefined()
    expect("jsxvalue1").toEqual(rec.getValue());
  });
  //t.testRequestHeader._skip_unless = "NETWORK";

  it("should be able to get a response when  using an interface to get xml content from the server", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/auth/data1.xml", false, "gi", "gi");
    r.send();
    expect(r.getStatus()).toEqual(200);
    var x = r.getResponseXML();
    expect(x).not.toBeNull()
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.getNodeName()).toEqual("data");
  });
  //t.testAuth._skip_unless = "NETWORK";

  // NOTE: fails on Safari http://bugs.webkit.org/show_bug.cgi?id=13075
  it("should indicate that authentication information for the request is incorrect", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data2.xml", false);
    r.send();
    expect(r.getStatus()).toEqual(401);
  });
  //t.testAuthFail1._skip = "NOINTERACTIVE NONETWORK";

  it("should  indicate that authorization has been refused", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data3.xml", false, "gi", "wrong");
    r.send();
    expect(r.getStatus()).toEqual(401);
  });
  //t.testAuthFail2._skip = "NOINTERACTIVE NONETWORK";

  // NOTE: fails on Safari http://bugs.webkit.org/show_bug.cgi?id=13075
  it("should get an HTTP response for a successful request  indicating that authorization has been accepted", function () {
    var r = new jsx3.net.Request(), status;
    r.open("GET", _jasmine_test.HTTP_BASE + "/auth/data4.xml", true, "gi", "gi");
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      status = r.getStatus();
    });
    r.send();
    waitsFor(function () {
      return status != null;
    }, "wait until we  get some response status", 750);
    runs(function () {
      expect(status).toEqual(200);
      var x = r.getResponseXML();
      expect(x).not.toBeNull()
      expect(x).toBeInstanceOf(jsx3.xml.Document);
      expect(x.getNodeName()).toEqual("data");
    });

  });
  //t.testAuthAsync._async = true;

  it("should get a response asynchronously  indicating that authorization has been refused for those credentials", function () {
    var r = new jsx3.net.Request(), status;
    r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data5.xml", true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      status = r.getStatus();
    });
    r.send();
    waitsFor(function () {
      return status != null;
    }, "Wait until you get some response status", 750);
    runs(function () {
      expect(status).toEqual(401);
    });
  });
  //t.testAuthAsyncFail1._skip = "NOINTERACTIVE NONETWORK";

  it("should get a response asynchronously indicating that authorization has been refused for those credentials 1", function () {
    var r = new jsx3.net.Request(), status;
    r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data6.xml", true, "gi", "wrong");
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      status = r.getStatus();
    });
    r.send();
    waitsFor(function () {
      return status != null;
    }, "Wait until you get some response status", 750);
    runs(function () {
      expect(status).toEqual(401);
    });
  });
  //t.testAuthAsyncFail2._skip = "NOINTERACTIVE NONETWORK";

  it("should be able to post xml content to server", function () {
    var r = new jsx3.net.Request();
    var data = "<request><stuff/></request>";
    r.open("POST", _jasmine_test.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()), false);
    r.send(data);
    var x = r.getResponseXML();
    expect(x).not.toBeNull();
    expect(x).not.toBeUndefined();
    var cl = x.selectSingleNode("//record[@jsxid='CONTENT_LENGTH']");
    expect(cl).not.toBeNull();
    expect(cl).not.toBeUndefined();
    expect(data.length).toEqual(parseInt(cl.getValue()));
    var pd = x.selectSingleNode("//postdata");
    expect(pd).not.toBeNull();
    expect(pd).not.toBeUndefined();
    expect(data).toEqual(pd.getValue());
  });
  // t.testSendData._skip_unless = "NETWORK";

  it("should be able to post xml content to server asynchronously", function () {
    var r = new jsx3.net.Request();
    var data = "<request><stuff/></request>";
    r.open("POST", _jasmine_test.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()), true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
    });
    r.send(data);
    waitsFor(function () {
      return r.getResponseXML() != null;
    }, "Wait until you get the content of the response", 750);
    runs(function () {
      var x = r.getResponseXML();
      expect(x).not.toBeNull();
      expect(x).not.toBeUndefined()
      var cl = x.selectSingleNode("//record[@jsxid='CONTENT_LENGTH']");
      expect(cl).not.toBeNull();
      expect(cl).not.toBeUndefined()
      expect(data.length).toEqual(parseInt(cl.getValue()));
      var pd = x.selectSingleNode("//postdata");
      expect(pd).not.toBeNull();
      expect(pd).not.toBeUndefined()
      expect(data).toEqual(pd.getValue());
    });
  });
  //t.testSendDataAsync._skip_unless = "NETWORK";

});
