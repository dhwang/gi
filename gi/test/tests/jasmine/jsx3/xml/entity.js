/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Entity", function() {
    var _jasmine_test = gi.test.jasmine;
    _jasmine_test.require("jsx3.xml.Entity", "jsx3.xml.Document");
    var t = new _jasmine_test.TestSuite("jsx3.xml.Entity");

    beforeEach(function () {
        this.addMatchers(gi.test.jasmine.matchers);
        t._server = null;
    });


  it("testDefined" , function() {
      expect(jsx3.lang.Class.forName("jsx3.xml.Entity")).not.toBeNull();

  });

  it("testConstructor", function() {
      var func = function() {
          return new jsx3.xml.Entity();
      };
      expect(func).toThrow();

  });

  it("testDocumentElementEquivalence" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
      expect(d.getNodeName()).toEqual("data");

  });

  it("testRootNode" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var n = d.getRootNode();
      expect(n instanceof jsx3.xml.Entity).toBeTruthy();
      expect(n instanceof jsx3.xml.Document).toBeFalsy();
      expect(n.getNodeName()).toEqual("data");

  });

  it("testCreateNodeElement" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "element");
      expect(ne.getNodeName()).toEqual("element");
  });


  it("testCreateNodeElementNs" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "el:element","http://namespace");
      expect(ne.getBaseName()).toEqual("element");
       expect(ne.getPrefix()).toEqual("el");
         expect(ne.getNamespaceURI()).toEqual("http://namespace");

  });

  it("testCreateNodeAttribute" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var na = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "attribute");
      expect(na.getNodeName()).toEqual("attribute");
  });

 it("testCreateNodeAttributeNs" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "at:attribute","http://namespace");
     expect(ne.getBaseName()).toEqual("attribute");
        expect(ne.getPrefix()).toEqual("at");
        expect(ne.getNamespaceURI()).toEqual("http://namespace");
  });

  it("testGetXml" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "element");
      expect(ne.getXML()).toEqual("<element/>");

  });

 it("testGetXmlNs", function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "el:element","http://namespace");
     expect(ne.getXML()).toEqual("<el:element xmlns:el=\"http://namespace\"/>")

  });

  it("testCreateNodeText" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nt = d.createNode(jsx3.xml.Entity.TYPETEXT, "text");
      expect( nt.getValue()).toEqual("text");

  });

 it("testCreateNodeCdata" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nd = d.createNode(jsx3.xml.Entity.TYPECDATA, "cdata");
      expect(nd.getValue()).toEqual("cdata");

  });

 it("testCreateNodeComment" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nc = d.createNode(jsx3.xml.Entity.TYPECOMMENT, "comment");
      expect(nc.getValue()).toEqual("comment")

  });

  it("testGetNodeType" , function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val">poo</data>');
      expect(d.getNodeType()).toEqual(jsx3.xml.Entity.TYPEELEMENT);
         expect(d.getChildNodes(true).get(0).getNodeType()).toEqual(jsx3.xml.Entity.TYPETEXT);
           expect(d.getAttributeNode("att").getNodeType()).toEqual(jsx3.xml.Entity.TYPEATTRIBUTE);


  });

  it("testGetNodeName" , function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val"/>');
      expect( d.getNodeName()).toEqual("data");

    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
      expect(d.getNodeName()).toEqual("foo:data")

  });

  it("testGetNamespaceUri1" , function() {
    var ns = "http://foo.example.com";
    var d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="' + ns + '"><foo:record/><record/></foo:data>');
      expect(d.getNamespaceURI()).toEqual(ns);
       expect(d.getChildNodes().get(0).getNamespaceURI()).toEqual(ns);
       expect(d.getChildNodes().get(1).getNamespaceURI()).toEqual("");

  });

  it("testGetNamespaceUri2" , function() {
    var ns = "http://foo.example.com";
    var d = new jsx3.xml.Document().loadXML('<data xmlns="' + ns + '"><record/></data>');
      expect(d.getNamespaceURI()).toEqual(ns);
      expect(d.getChildNodes().get(0).getNamespaceURI()).toEqual(ns);


  });

  it("testGetBaseName" , function() {
    var d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
      expect(d.getBaseName()).toEqual("data");
  });

  it("testGetPrefix" , function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val"/>');
      expect(d.getPrefix()).toEqual("");

    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
      expect(d.getPrefix()).toEqual("foo");

    d = new jsx3.xml.Document().loadXML('<data xmlns="http://foo.example.com"/>');
      expect(d.getPrefix()).toEqual("");

  });

  it("testAppendChild" , function() {
    var d = new jsx3.xml.Document().loadXML('<data/>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r2");
    d.appendChild(n1);
    d.appendChild(n2);
       expect(d.getChildNodes().get(0)).toEqual(n1);
      expect(d.getChildNodes().get(1)).toEqual(n2);


  });

  it("testInsertBefore" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r2/></data>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.getChildNodes().get(0);
    d.insertBefore(n1, n2);

      expect(d.getChildNodes().get(0)).toEqual(n1);
      expect(d.getChildNodes().get(1)).toEqual(n2);


  });

 it("testReplaceNode" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r2/></data>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.getChildNodes().get(0);
    d.replaceNode(n1, n2);

     expect(d.getChildNodes().get(0)).toEqual(n1);
     expect(d.getChildNodes().size()).toEqual(1);


  });

  it("testRemoveChild" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/></data>');
    var n1 = d.getChildNodes().get(0);
    var n2 = d.getChildNodes().get(1);
    d.removeChild(n1);

      expect(d.getChildNodes().get(0)).toEqual(n2);
      expect(d.getChildNodes().size()).toEqual(1);


  });

 it("testRemoveChildren" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/></data>');
    d.removeChildren();
     expect(d.getChildNodes().size()).toEqual(0);

  });

  it("testGetAttribute" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
      expect(d.getAttribute("a1")).toEqual("v1");
       expect(d.getAttribute("n1")).toBeNull();


    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com" foo:a1="v1"/>');
      expect(d.getAttribute("a1")).toBeNull();
      expect(d.getAttribute("foo:a1")).toEqual("v1");

  });

  it("testSetAttribute" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');

      expect(d.getAttribute("a1")).toEqual("v1");


    d.setAttribute("a1", "v1d");
      expect(d.getAttribute("a1")).toEqual("v1d");


    d.setAttribute("a1", null);
      expect(d.getAttribute("a1")).toBeNull();

  });

  it("testGetAttributeNode" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var n = d.getAttributeNode("a1");
      expect(n).toBeInstanceOf(jsx3.xml.Entity);
        expect(n.getNodeType()).toEqual(jsx3.xml.Entity.TYPEATTRIBUTE);
         expect(n.getNodeName()).toEqual("a1");
           expect(n.getValue()).toEqual("v1");
          // expect(d.getAttributeNode("n1")).toBeNull();
      expect(d.getAttributeNode("n1")).toBeUndefined();

  });

  it("testSetAttributeNode" , function() {
    var d = new jsx3.xml.Document().loadXML('<data/>');
    var n = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "a1");
    n.setValue("v1");
    d.setAttributeNode(n);
      expect(d.getAttribute("a1")).toEqual("v1");


  });

  it("testGetAttributes" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var a = d.getAttributes();
      expect(a).toBeInstanceOf(jsx3.util.List);
      expect(a.size()).toEqual(2);
      expect(a.get(0).getNodeName()).toEqual("a1");
      expect(a.get(1).getNodeName()).toEqual("a2");
      expect(a.get(0).getNodeType()).toEqual(jsx3.xml.Entity.TYPEATTRIBUTE);
  });

  it("testGetAttributeNames" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var a = d.getAttributeNames();
      expect(a.length).toEqual(2);
       expect(a[0]).toEqual("a1");
      expect(a[01]).toEqual("a2");

  });

  it("testRemoveAttribute" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1"/>');
    jsunit.assertEquals("v1", d.getAttribute("a1"));

    d.removeAttribute("a1");
    expect(d.getAttribute("a1")).toBeNull();
  });

 it("testRemoveAttributeNode" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1"/>');
     expect(d.getAttribute("a1")).toEqual("v1");
    d.removeAttributeNode(d.getAttributeNode("a1"));
   expect(d.getAttribute("a1")).toBeNull();

  });

  it("testGetParent" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><record/></data>');
      expect(d.getParent()).toBeNull();
       expect( d.getChildNodes().get(0).getParent()).toEqual(d);

  });

  it("testOwnerDocument" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><record/></data>');
    var n = d.getChildNodes().get(0);
      expect(d.getOwnerDocument()).toEqual(d);
      expect(n.getOwnerDocument()).toEqual(d);

  });

  it("testGetChildNodes" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var c = d.getChildNodes();

      expect(c).toBeInstanceOf(jsx3.util.List);
       expect(c.size()).toEqual(3);
      expect(c.get(0).getNodeName()).toEqual("r1");
      expect(c.get(1).getNodeName()).toEqual("r2");
      expect(c.get(2).getNodeName()).toEqual("r3");
  });

  it("testGetChildNodesText" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/>   <r2/></data>');
    var c = d.getChildNodes();
      expect(c.size()).toEqual(2);
      expect(c.get(1).getNodeName()).toEqual("r2");


    d = new jsx3.xml.Document().loadXML('<data><r1/>   <r2/></data>');
    c = d.getChildNodes(true);
      expect(c.size()).toEqual(3);
      expect(c.get(1).getNodeType()).toEqual(jsx3.xml.Entity.TYPETEXT);
      expect(c.get(2).getNodeName()).toEqual("r2");



  });

  it("testChildIterator" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var i = d.getChildIterator();
      expect(i.hasNext()).toBeTruthy();
       expect(i.next().getNodeName()).toEqual("r1");
      expect(i.hasNext()).toBeTruthy();
      expect(i.next().getNodeName()).toEqual("r2");
      expect(i.hasNext()).toBeTruthy();
      expect(i.next().getNodeName()).toEqual("r3");
      expect(i.hasNext()).toBeFalsy();
  });

  it("testChildIteratorRomain" , function() {
    var d = new jsx3.xml.Document().loadXML('<record jsxid="1" jsxtext="Service 1" serviceProvider="Svc Prov 1" identification="TO_FILL" status="INACTIVE" ad=" xcxcxc"><record jsxid="jsx_lf" interactID="1" jsxtext="Interact1" interactivity="Interact1"><record jsxid="jsx_lg" text="ddfd" url="fdff" advertising=" xcxcxc"/></record><record jsxid="jsx_lh" interactID="6" jsxtext="gg" interactivity="gg"/><record jsxid="jsx_li" constraintTypeID="4" jsxtext="contentType" constraintsType="contentType"><record jsxid="jsx_lj" constraintID="7" jsxtext="movies" value="movies"/><record jsxid="jsx_lk" constraintID="6" jsxtext="news" value="news"/><record jsxid="jsx_ll" constraintID="5" jsxtext="sport" value="sport"/></record><record jsxid="jsx_lm" constraintTypeID="3" jsxtext="Channel" constraintsType="Channel"><record jsxid="jsx_ln" constraintID="4" jsxtext="fr2" value="fr2"/><record jsxid="jsx_lo" constraintID="3" jsxtext="tf1" value="tf1"/></record></record>');
    var i = d.getChildIterator();
      expect(i.hasNext()).toBeTruthy();
       expect(i.next().getAttribute('jsxid')).toEqual("jsx_lf");
      expect(i.hasNext()).toBeTruthy();
      expect(i.next().getAttribute('jsxid')).toEqual("jsx_lh");
      expect(i.hasNext()).toBeTruthy();
      expect(i.next().getAttribute('jsxid')).toEqual("jsx_li");
      expect(i.hasNext()).toBeFalsy();

  });

 it("testFirstChild" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
     expect(d.getFirstChild().getNodeName()).toEqual("r1");
     expect(d.getFirstChild().getFirstChild()).toBeNull();
  });

  it("testLastChild" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
      expect(d.getLastChild().getNodeName()).toEqual("r3");
      expect(d.getLastChild().getLastChild()).toBeNull();

  });

  it("testPreviousSibling" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var r1 = d.getChildNodes().get(0);
    var r2 = d.getChildNodes().get(1);
      expect(r1.getPreviousSibling()).toBeNull();
        expect(r2.getPreviousSibling()).toEqual(r1);


  });

  it("testNextSibling" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var r2 = d.getChildNodes().get(1);
    var r3 = d.getChildNodes().get(2);
      expect(r3.getNextSibling()).toBeNull();
      expect(r2.getNextSibling()).toEqual(r3);

  });

  it("testEquals", function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/></data>');
      expect(d.getFirstChild().equals(d.getChildNodes().get(0))).toBeTruthy();
      expect(d.getFirstChild().equals(null)).toBeFalsy();

  });

 it("testSelectSingleNode" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectSingleNode("//r");
     expect(n).toBeInstanceOf(jsx3.xml.Entity);
     expect(n.getAttribute("a")).toEqual("1");
  });

  t.testSelectNodes = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectNodes("//r");
     expect(n).toBeInstanceOf(jsx3.util.List);
      expect(n.size()).toEqual(3);
      expect(n.get(0).getAttribute("a")).toEqual("1");
      expect(n.get(1).getAttribute("a")).toEqual("2");
      expect(n.get(2).getAttribute("a")).toEqual("3");
  };

  t.testSelectNamespace = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//r");
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
      expect(n.getAttribute("a")).toEqual("1");

    n = d.selectSingleNode("//foo:r", 'xmlns:foo="uri"');
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
      expect(n.getAttribute("a")).toEqual("2");


      n = d.selectSingleNode("//r");
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
      expect(n.getAttribute("a")).toEqual("1");
  };

 it("testSelectNamespaceObject" , function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//r");

     expect(n).not.toBeNull();
     expect(n).not.toBeUndefined();
     expect(n.getAttribute("a")).toEqual("1");
    n = d.selectSingleNode("//foo:r", {"uri":"foo"});
     expect(n).not.toBeNull();
     expect(n).not.toBeUndefined();
     expect(n.getAttribute("a")).toEqual("2");
  });

  t.testSelectNamespaceImplicit = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//ns:r");
    jsunit.assertNotNullOrUndef(n);
      expect(n).not.toBeNull();
      expect(n).not.toBeUndefined();
       expect(n.getAttribute("a")).toEqual("2");


  };

  t.testSelectNamespaceError = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//foo:r");
      expect(n).toBeNull();
      expect(n).toBeUndefined();

  };

  it("testSelectNodeIterator", function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var i = d.selectNodeIterator("//r");
      expect(i).toBeInstanceOf(jsx3.util.Iterator);
       expect(i.hasNext()).toBeTruthy();
      expect(i.next().getAttribute("a")).toEqual("1");
      expect(i.hasNext()).toBeTruthy();
      expect(i.next().getAttribute("a")).toEqual("2");
      expect(i.hasNext()).toBeTruthy();
      expect(i.next().getAttribute("a")).toEqual("3");
      expect(i.hasNext()).toBeFalsy();

  });

 it("testSelectNodesContext", function() {
    var d = new jsx3.xml.Document().loadXML('<a><b><c/></b></a>');
    var b = d.getChildNodes().get(0);

      expect(d.selectSingleNode("c")).toBeNull();
       expect(b.selectSingleNode("c")).not.toBeNull();
      expect(b.selectSingleNode("c")).not.toBeUndefined();


      expect(d.selectSingleNode("b")).not.toBeNull();
      expect(d.selectSingleNode("b")).not.toBeUndefined();
       expect(b.selectSingleNode("b")).toBeNull();

      expect(d.selectSingleNode("/a")).not.toBeNull();
      expect(d.selectSingleNode("/a")).not.toBeUndefined();

      expect(b.selectSingleNode("/a")).not.toBeNull();
      expect(b.selectSingleNode("/a")).not.toBeUndefined();

      expect(d.selectSingleNode("//b")).not.toBeNull();
      expect(d.selectSingleNode("//b")).not.toBeUndefined();

      expect(b.selectSingleNode("//b")).not.toBeNull();
      expect(b.selectSingleNode("//b")).not.toBeUndefined();

  });

  it("testSelectIterator" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectNodes("//r");

    var i = n.iterator();

      expect(i.hasNext()).toBeTruthy();
    i.next();
      expect(i.hasNext()).toBeTruthy();

    i.next();
      expect(i.hasNext()).toBeTruthy();

    i.next();
      expect(i.hasNext()).toBeFalsy();

  });

  it("testTransformNode", function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"><r a="1a"/><r a="1b"/></r></data>');
    var n = d.getFirstChild();
    var xsl = new jsx3.xml.Document().loadXML(
        '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:output method="xml" omit-xml-declaration="yes"/>' +
        '<xsl:template match="//r"><doc/></xsl:template>' +
        '</xsl:stylesheet>');
    var s = n.transformNode(xsl);
      expect(s).toMatch(/^<doc\s*\/>$/);

  });

  it("testToString" , function() {
    var d = new jsx3.xml.Document();
    var n = d.createDocumentElement("data");
    n.appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, "record"));
    n.appendChild(d.createNode(jsx3.xml.Entity.TYPETEXT, " -- a record "));
      expect(d.toString()).toMatch(/^<data><record\s*\/> \-\- a record <\/data>$/);

  });

  it("testToStringElement" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "e");
      expect(ne.toString()).toMatch(/^<e\s*\/>$/);

  });

  it("testToStringAttribute" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var na = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "a");
    na.setValue("v");
      expect(na.toString()).toEqual('a="v"');

  });

  it("testToStringText" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nt = d.createNode(jsx3.xml.Entity.TYPETEXT, "text");
      expect( nt.toString()).toEqual("text");

  });

  it("testToStringCdata" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nd = d.createNode(jsx3.xml.Entity.TYPECDATA, "cdata");
      expect(nd.toString()).toEqual("<![CDATA[cdata]]>")

  });

  it("testToStringComment" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nc = d.createNode(jsx3.xml.Entity.TYPECOMMENT, " comment ");
      expect(nc.toString()).toEqual("<!-- comment -->")

  });

  it("testSetValue" , function() {
    //test entity
    var d = new jsx3.xml.Document().loadXML("<abc><a>b</a></abc>");
    d.setValue("b");
      expect("<abc>b</abc>").toEqual(d.toString());


    // TODO: need to test attribute, cdata, comment and text types
  });

  // -1#INF ... 1-7XM18V
  it("testInfinity", function() {
    var x = new jsx3.xml.Document().loadXML("<r/>");
    x.setAttribute("v", Number.POSITIVE_INFINITY);

    var s = x.getAttribute("v");
      expect(s).toEqual("Infinity");
       expect(! isFinite(eval(s))).toBeTruthy();


  });

  it("testInterDoc1", function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data></data>");

      expect(d1.getChildNodes().size()).toEqual(1);
      expect(d2.getChildNodes().size()).toEqual(0);



    d2.appendChild(d1.getChildNodes().get(0));

      expect(d1.getChildNodes().size()).toEqual(0);
      expect(d2.getChildNodes().size()).toEqual(1);


  });

  it("testInterDoc2",function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data></data>");

    d2.appendChild(d1.getChildNodes().get(0).cloneNode(true));
      expect(d1.getChildNodes().size()).toEqual(1);
      expect(d2.getChildNodes().size()).toEqual(1);


  });

  it("testInterDoc3" , function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data><b/></data>");

      expect(d1.getChildNodes().size()).toEqual(1);
      expect(d2.getChildNodes().size()).toEqual(1);



    d2.insertBefore(d1.getChildNodes().get(0), d2.getChildNodes().get(0));
      expect(d1.getChildNodes().size()).toEqual(0);
      expect(d2.getChildNodes().size()).toEqual(2);
       expect(d2.getChildNodes().get(0).getNodeName()).toEqual("a");
      expect(d2.getChildNodes().get(1).getNodeName()).toEqual("b");


  });

  it("testInterDoc4" , function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data><b/></data>");

    d2.replaceNode(d1.getChildNodes().get(0), d2.getChildNodes().get(0));

      expect(d1.getChildNodes().size()).toEqual(0);
      expect(d2.getChildNodes().size()).toEqual(1);
       expect(d2.getChildNodes().get(0).getNodeName()).toEqual("a")


  });

  it("testInterDoc5" , function() {
    var d1 = new jsx3.xml.Document().loadXML('<data a="v"/>');
    var d2 = new jsx3.xml.Document().loadXML("<data/>");
     expect(d1.getAttribute("a")).toEqual("v");
      expect(d2.getAttribute("a")).toBeNull();
    //  expect(d2.getAttribute("a")).toBeUndefined();
    var attr = d1.getAttributeNode("a");
    d1.removeAttributeNode(attr);
    d2.setAttributeNode(attr);

      expect(d1.getAttribute("a")).toBeNull();
     // expect(d1.getAttribute("a")).toBeUndefined();
       expect( d2.getAttribute("a")).toEqual("v");

  });

  it("testInterDoc6" , function() {
    var d1 = new jsx3.xml.Document().loadXML('<data><record/></data>');
    var d2 = new jsx3.xml.Document().loadXML("<data/>");

    var n = d1.getChildNodes().get(0);
    d2.appendChild(n);

    n.setAttribute("a", "v");
    n.appendChild(n.createNode(1, "record"));

    n = d2.getChildNodes().get(0);
      expect( n.getAttribute("a")).toEqual("v");
      expect(n.getChildNodes().get(0)).not.toBeNull();
      expect(n.getChildNodes().get(0)).not.toBeUndefined();
       expect( n.getChildNodes().get(0).getNodeName()).toEqual("record");



  });

 it("testInterDoc7" , function() {
    var d1 = new jsx3.xml.Document().loadXML('<data/>');
    var d2 = new jsx3.xml.Document().loadXML('<data><r1/></data>');
    d1.appendChild(d2.selectSingleNode("//r1"));

    //make sure append happened as well as the delete from source
      expect(d1.selectSingleNode("//r1")).not.toBeNull();
      expect(d2.selectSingleNode("//r1")).toBeNull();


  });

  // SEE: http://www.generalinterface.org/bugs/browse/GI-536
 it("testEmptyNamespace", function() {
    var d, l;

    d = (new jsx3.xml.Document()).loadXML("<data/>");
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record', ''));
    l = d.selectNodes("//record");
      expect(l.size()).toEqual(1);



    d = (new jsx3.xml.Document()).loadXML('<data xmlns="http://www.tibco.com"/>');
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record', ''));
    l = d.selectNodes("//record");
      expect(l.size()).toEqual(1);


    d = (new jsx3.xml.Document()).loadXML("<data/>");
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record'));
    l = d.selectNodes("//record");
      expect(l.size()).toEqual(1);


    d = (new jsx3.xml.Document()).loadXML('<data xmlns="http://www.tibco.com"/>');
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record'));
    l = d.selectNodes("//record");
      expect(l.size()).toEqual(1);

    l = d.selectNodes("//tb:record", {"http://www.tibco.com":"tb"});
      expect(l.size()).toEqual(0);

  });

    afterEach(function() {
        if (t._server) {
            t._server.destroy();
            delete t._server;
        }
    });
});
