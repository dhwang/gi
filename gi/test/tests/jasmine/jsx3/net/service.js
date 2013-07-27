/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.Service", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Server", "jsx3.net.Service");
  var t = new _jasmine_test.TestSuite("jsx3.net.Service");
  var ACTION = jasmine.HTTP_BASE + "/formdata.cgi";

  beforeEach(function () {

    t._server = null;
    var s = t._server = t.newServer("data/server1.xml", ".");
  });

  it("should initialize the service and its transport", function () {
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule1.xml"), "ReturnCityState");
    s.setNamespace(t._server);
    expect(s.getServer()).toBeInstanceOf(jsx3.app.Server)
  });

  it("should ensure static data stored in the rules file is accessible", function () {
    var s = t._service;
    expect(s.getServer()).toBeInstanceOf(jsx3.app.Server)
    expect("ReturnCityState").toEqual(s.getOperation());
    expect("http://test.example.com").toEqual(s.getEndpointURL());
    expect("GET").toEqual(s.getMethod());
  });

  it("should get message using soap envelope,test message stub exists and that message was appended to correct stub location", function () {
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/soap.xml"));
    var s = t._service;
    s.setOutboundStubDocument(o);
    var d = t._service.getServiceMessage("output");
    var b = d.selectSingleNode("//soap:Body", 'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    var n = b.selectSingleNode("jsx1:ReturnCityState", 'xmlns:jsx1="http://ws.cdyne.com/"');
    expect(n).not.toBeNull();
    expect(n).not.toBeUndefined();
    //are arrays also generated correctly if using a namespace prefix
    var a = n.selectSingleNode("@jsx1:LicenseKey", 'xmlns:jsx1="http://ws.cdyne.com/"');
    expect(a).not.toBeNull();
    expect(a).not.toBeUndefined();
    expect(a.getValue()).toEqual("attValue")
  });

  it("should test recursive (named templates) for generating XML (outbound message creating)", function () {
    //make sure both service and its transport are initialized
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule2.xml"), "");
    s.setNamespace(t._server);
    //add a CDF document to the cache; this will be converted to an outbound (input) message using a recursive ruleset (data/rule2.xml)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/cdf.xml"));
    t._server.getCache().setDocument("abc_xml", o);
    //run the rule
    var d = t._service.getServiceMessage();
    expect(d).not.toBeNull();
    expect(d).not.toBeUndefined();
    //test the generic structure
    var b = d.selectSingleNode("/dogs/dog/name");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test that specific CDF structures were converted (deepest node and following sibling node)
    b = d.selectSingleNode("//dog[name='a.a.b.a.a']");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    b = d.selectSingleNode("//dog[name='a.a.a.b']");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test that all CDF structures were converted to the XML format defined in the rule (get the count)
    b = d.selectNodes("//name");
    expect(b.size()).toEqual(8);
  });

  it("should tests recursive (named templates) for creating CDF (inbound message mapping)", function () {
    //loads a sample CDF document. This will represent the server's response (arbitrary XML which happens to be CDF)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/cdf.xml"));
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule2.xml"), "");
    s.setNamespace(t._server);
    s.setInboundDocument(o);
    s.doInboundMap();
    //see if a new CDF document was added to the cache (def_xml)
    var d = t._server.getCache().getDocument("def_xml");
    expect(d).not.toBeNull();
    expect(d).not.toBeUndefined();
    //test the generic structure
    var b = d.selectSingleNode("/data/record/@jsxtext");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test that specific CDF structures were converted properly
    b = d.selectSingleNode("//record[@jsxtext='a.a.b.a.a']");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    b = d.selectSingleNode("//record[@jsxtext='a.a.a.b']");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test that all CDF structures were converted to the XML format defined in the rule (get the count)
    b = d.selectNodes("//record[@jsxid]");
    expect(b.size()).toEqual(8);
  });

  it("testRequestJSON", function () {
    var Service = jsx3.net.Service;
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/travel_map.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(gi.test.jasmine.HTTP_BASE + "/webservice.php?status=200&json=true");
    s.setOperationName("");
    var objEvent;
    var flag, value;
    flag = false;
    value = 0;
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], function (evt) {
      objEvent = evt;
      flag = true;
    }, 500);
    s.doCall();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 800);
    runs(function () {
      if (objEvent.subject == jsx3.net.Service.ON_SUCCESS) {
        var req = objEvent.target.getRequest();
        expect(200).toEqual(req.getStatus());
        expect("Response text converts to XML doc.", s.getInboundDocument()).not.toBeNull();
      } else {
        expect("Should not receive this event from service: " + objEvent.subject, false).toBeTruthy();
      }
    });
  });

  // t.testRequestJSON._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);
  it("testRequestJSONfault", function () {
    var Service = jsx3.net.Service;
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/travel_map.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(gi.test.jasmine.HTTP_BASE + "/webservice.php?status=503&json=true");
    s.setOperationName("");
    var objEvent;
    var flag, value;
    flag = false;
    value = 0;
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], function (evt) {
      objEvent = evt;
      flag = true;
    }, 500);
    s.doCall();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 800);
    runs(function () {
      if (objEvent.subject == jsx3.net.Service.ON_SUCCESS) {
        var req = objEvent.target.getRequest();
        expect(503).toEqual(req.getStatus());
        expect(s.getInboundDocument()).toBeNull();
      } else {
        expect("Should not receive this event from service: " + objEvent.subject, false).toBeTruthy();
      }
    });
  });

  // t.testRequestJSONfault._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);
  it("testRequestService", function () {
    var Service = jsx3.net.Service;
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/wsdl2rule.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(gi.test.jasmine.HTTP_BASE + "/webservice.php?status=200");
    s.setOperationName("GetHistoricalQuotes");
    var objEvent;
    var flag, value;
    flag = false;
    value = 0;
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], function (evt) {
      objEvent = evt;
      flag = true;
    }, 500);
    s.doCall();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 800);
    runs(function () {
      if (objEvent.subject == jsx3.net.Service.ON_SUCCESS) {
        var req = objEvent.target.getRequest();
        expect(200).toEqual(req.getStatus());
      } else {
        expect("Should not receive this event from service: " + objEvent.subject, false).toBeTruthy();
      }
    });
  });

  //t.testRequestService._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);

  it("testRequestServiceFail", function () {
    var Service = jsx3.net.Service;
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/wsdl2rule.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(gi.test.jasmine.HTTP_BASE + "/webservice.php?status=500");
    s.setOperationName("GetHistoricalQuotes");
    var objEvent;
    var flag, value;
    flag = false;
    value = 0;
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], function (evt) {
      objEvent = evt;
      flag = true;
    }, 500);
    s.doCall();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 800);
    runs(function () {
      if (objEvent.subject == jsx3.net.Service.ON_SUCCESS) {
        var req = objEvent.target.getRequest();
        expect(500).toEqual(req.getStatus());
      } else {
        expect("Should not receive this event from service: " + objEvent.subject, false).toBeTruthy();
      }
    });
  });
  //t.testRequestServiceFail._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);

  it("should test recursive (named templates) for creating CDF (inbound message mapping) using XSLT (compiled mode)", function () {
    //loads a sample CDF document. This will represent the server's response (arbitrary XML which happens to be CDF)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/cdf.xml"));
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule2.xml"), "");
    s.setNamespace(t._server);
    s.setInboundDocument(o);
    s.compile();
    s.doInboundMap();
    //see if a new CDF document was added to the cache (def_xml)
    var d = t._server.getCache().getDocument("def_xml");
    expect(d).not.toBeNull();
    expect(d).not.toBeUndefined();
    //test the generic structure
    var b = d.selectSingleNode("/data/record/@jsxtext");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test that specific CDF structures were converted properly
    b = d.selectSingleNode("//record[@jsxtext='a.a.b.a.a']");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    b = d.selectSingleNode("//record[@jsxtext='a.a.a.b']");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test that all CDF structures were converted to the XML format defined in the rule (get the count)
    b = d.selectNodes("//record[@jsxid]");
    expect(b.size()).toEqual(8);
  });

  it("should test to see the accuracy of the namespaces used in the generated document", function () {
    //1) message with no stub (envelope)
    //2) message with namespace on the root node
    //3) message with attribute on the root node where the attribute also has a namespace
    //4) message node that belongs to the default xml namespace (reserved xml/1998)
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule3.xml"), "");
    s.setNamespace(t._server);
    //run the rule
    var d = t._service.getServiceMessage();
    expect(d).not.toBeNull();
    expect(d).not.toBeUndefined();
    //test root node has correct namespace
    var b = d.selectSingleNode("/abc:RDF", 'xmlns:abc="http://www.w3.org/1999/02/22-rdf-syntax-ns#"');
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test for child attribute on the root node; make sure both namespaces resolve to appropriate declarations
    b = d.selectSingleNode("/abc:RDF/@def:schemaLocation", 'xmlns:abc="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:def="http://www.w3.org/2001/XMLSchema-instance"');
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
    //test for node belonging to xml namespace
    b = d.selectSingleNode("//@xml:lang");
    expect(b).not.toBeNull();
    expect(b).not.toBeUndefined();
  });
  afterEach(function () {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }
  });
});
