/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Entity", function() {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.xml.Entity", "jsx3.xml.Document");
  var t = new _jasmine_test.TestSuite("jsx3.xml.Entity");

  beforeEach(function () {
    this.addMatchers(gi.test.jasmine.matchers);
  });


  it("should have jsx3.xml.Entity defined." , function() {
    expect(jsx3.lang.Class.forName("jsx3.xml.Entity")).not.toBeNull();
  });

  it("should not be able to use the jsx3.xml.Entity constructor directly.", function() {
    var func = function() {
      return new jsx3.xml.Entity();
    };
    expect(func).toThrow();
  });

  it("should be able to load XML string to construct a jsx3.xml.Document." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    expect(d.getNodeName()).toEqual("data");
  });

  it("should be able to find the root node of a Document to be of instance of jsx3.xml.Entity." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var n = d.getRootNode();
    expect(n instanceof jsx3.xml.Entity).toBeTruthy();
    expect(n instanceof jsx3.xml.Document).toBeFalsy();
    expect(n.getNodeName()).toEqual("data");
  });

  it("should be able to create an element node." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "element");
    expect(ne.getNodeName()).toEqual("element");
  });


  it("should be able to create an element node with namespace." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "el:element","http://namespace");
    expect(ne.getBaseName()).toEqual("element");
    expect(ne.getPrefix()).toEqual("el");
    expect(ne.getNamespaceURI()).toEqual("http://namespace");
  });

  it("should be able to create an attribute node." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var na = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "attribute");
    expect(na.getNodeName()).toEqual("attribute");
  });

  it("should be able to create an attribute node with namespace." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "at:attribute","http://namespace");
    expect(ne.getBaseName()).toEqual("attribute");
    expect(ne.getPrefix()).toEqual("at");
    expect(ne.getNamespaceURI()).toEqual("http://namespace");
  });

  it("should be able to get the xml of a created element node." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "element");
    expect(ne.getXML()).toEqual("<element/>");
  });

  it("should be able to get the xml of a created element node with namespace.", function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "el:element","http://namespace");
    expect(ne.getXML()).toEqual("<el:element xmlns:el=\"http://namespace\"/>")
  });

  it("should be able to create and get the value of a text node." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nt = d.createNode(jsx3.xml.Entity.TYPETEXT, "text");
    expect( nt.getValue()).toEqual("text");
  });

  it("should be able to create and get the value of a CDATA node." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nd = d.createNode(jsx3.xml.Entity.TYPECDATA, "cdata");
    expect(nd.getValue()).toEqual("cdata");
  });

  it("should be able to create and get the value of a comment node." , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nc = d.createNode(jsx3.xml.Entity.TYPECOMMENT, "comment");
    expect(nc.getValue()).toEqual("comment")
  });

  it("should be able to determine the various Node Type in an element." , function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val">poo</data>');
    expect(d.getNodeType()).toEqual(jsx3.xml.Entity.TYPEELEMENT);
    expect(d.getChildNodes(true).get(0).getNodeType()).toEqual(jsx3.xml.Entity.TYPETEXT);
    expect(d.getAttributeNode("att").getNodeType()).toEqual(jsx3.xml.Entity.TYPEATTRIBUTE);
  });

  it("should be able to determine the various Node Name in an element" , function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val"/>');
    expect( d.getNodeName()).toEqual("data");

    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
    expect(d.getNodeName()).toEqual("foo:data")
  });

  it("should be able to get the Namespace URI." , function() {
    var ns = "http://foo.example.com";
    var d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="' + ns + '"><foo:record/><record/></foo:data>');
    expect(d.getNamespaceURI()).toEqual(ns);
    expect(d.getChildNodes().get(0).getNamespaceURI()).toEqual(ns);
    expect(d.getChildNodes().get(1).getNamespaceURI()).toEqual("");
  });

  it("should be able to get the Namespace URI regardless of its application." , function() {
    var ns = "http://foo.example.com";
    var d = new jsx3.xml.Document().loadXML('<data xmlns="' + ns + '"><record/></data>');
    expect(d.getNamespaceURI()).toEqual(ns);
    expect(d.getChildNodes().get(0).getNamespaceURI()).toEqual(ns);
  });

  it("should be able to use jsx3.xml.Document.getBaseName() to find the root node name." , function() {
    var d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
    expect(d.getBaseName()).toEqual("data");
  });

  it("should be able to get the node prefix with getPrefix() call." , function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val"/>');
    expect(d.getPrefix()).toEqual("");

    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
    expect(d.getPrefix()).toEqual("foo");

    d = new jsx3.xml.Document().loadXML('<data xmlns="http://foo.example.com"/>');
    expect(d.getPrefix()).toEqual("");
  });

  it("should be able to use appendChild() to add more child element." , function() {
    var d = new jsx3.xml.Document().loadXML('<data/>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r2");
    d.appendChild(n1);
    d.appendChild(n2);
    expect(d.getChildNodes().get(0)).toEqual(n1);
    expect(d.getChildNodes().get(1)).toEqual(n2);
  });

  it("should be able to use insertBefore() to add element at specific location." , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r2/></data>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.getChildNodes().get(0);
    d.insertBefore(n1, n2);

    expect(d.getChildNodes().get(0)).toEqual(n1);
    expect(d.getChildNodes().get(1)).toEqual(n2);
  });

  it("should be able to replace a node in a document with another using replaceNode(n1, n2)" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r2/></data>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.getChildNodes().get(0);
    d.replaceNode(n1, n2);

    expect(d.getChildNodes().get(0)).toEqual(n1);
    expect(d.getChildNodes().size()).toEqual(1);
  });

  it("should be able to remove a child node using removeChild(node)" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/></data>');
    var n1 = d.getChildNodes().get(0);
    var n2 = d.getChildNodes().get(1);
    d.removeChild(n1);

    expect(d.getChildNodes().get(0)).toEqual(n2);
    expect(d.getChildNodes().size()).toEqual(1);
  });

  it("should be able to clear all child nodes by calling removeChildren()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/></data>');
    d.removeChildren();
    expect(d.getChildNodes().size()).toEqual(0);

  });

  it("should be able to find attibute of a node using getAttribute()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    expect(d.getAttribute("a1")).toEqual("v1");
    expect(d.getAttribute("n1")).toBeNull();

    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com" foo:a1="v1"/>');
    expect(d.getAttribute("a1")).toBeNull();
    expect(d.getAttribute("foo:a1")).toEqual("v1");

  });

  it("should be able to set new attribute value using setAttribute()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    expect(d.getAttribute("a1")).toEqual("v1");

    d.setAttribute("a1", "v1d");
    expect(d.getAttribute("a1")).toEqual("v1d");

    d.setAttribute("a1", null);
    expect(d.getAttribute("a1")).toBeNull();
  });

  it("should be able to get an attribute as a node using getAttributeNode()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var n = d.getAttributeNode("a1");
    expect(n).toBeInstanceOf(jsx3.xml.Entity);
    expect(n.getNodeType()).toEqual(jsx3.xml.Entity.TYPEATTRIBUTE);
    expect(n.getNodeName()).toEqual("a1");
    expect(n.getValue()).toEqual("v1");
    // expect(d.getAttributeNode("n1")).toBeNull();
    expect(d.getAttributeNode("n1")).toBeUndefined();
  });

  it("should be able to set an an attribute using an attribute node." , function() {
    var d = new jsx3.xml.Document().loadXML('<data/>');
    var n = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "a1");
    n.setValue("v1");
    d.setAttributeNode(n);
    expect(d.getAttribute("a1")).toEqual("v1");
  });

  it("should be able to get a list of all attributes with getAttributes()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var a = d.getAttributes();
    expect(a).toBeInstanceOf(jsx3.util.List);
    expect(a.size()).toEqual(2);
    expect(a.get(0).getNodeName()).toEqual("a1");
    expect(a.get(1).getNodeName()).toEqual("a2");
    expect(a.get(0).getNodeType()).toEqual(jsx3.xml.Entity.TYPEATTRIBUTE);
  });

  it("should be able to get a list of all attributes name with getAttributeNames()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var a = d.getAttributeNames();
    expect(a.length).toEqual(2);
    expect(a[0]).toEqual("a1");
    expect(a[1]).toEqual("a2");

  });

  it("should be able to remove an attribute." , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1"/>');
    expect(d.getAttribute("a1")).toEqual("v1");

    d.removeAttribute("a1");
    expect(d.getAttribute("a1")).toBeNull();
  });

  it("should be able to remove an attribute node." , function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1"/>');
    expect(d.getAttribute("a1")).toEqual("v1");
    d.removeAttributeNode(d.getAttributeNode("a1"));
    expect(d.getAttribute("a1")).toBeNull();
  });

  it("should be able to find the parent node with getParent()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><record/></data>');
    expect(d.getParent()).toBeNull();
    expect(d.getChildNodes().get(0).getParent()).toEquals(d);
  });

  it("should be able to getOwnerDocument" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><record/></data>');
    var n = d.getChildNodes().get(0);
    expect(d.getOwnerDocument()).toEquals(d);
    expect(n.getOwnerDocument()).toEquals(d);

  });

  it("should be able to get child nodes" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var c = d.getChildNodes();

    expect(c).toBeInstanceOf(jsx3.util.List);
    expect(c.size()).toEqual(3);
    expect(c.get(0).getNodeName()).toEqual("r1");
    expect(c.get(1).getNodeName()).toEqual("r2");
    expect(c.get(2).getNodeName()).toEqual("r3");
  });

  it("should be able to get child nodes text" , function() {
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

  it("should be able to iterate through child nodes using getChildIterator" , function() {
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

  it("should be able to iterate through child nodes using getChildIterator. testChildIteratorRomain" , function() {
    var d = new jsx3.xml.Document().loadXML('<record jsxid="1" jsxtext="Service 1" serviceProvider="Svc Prov 1" identification="TO_FILL" status="INACTIVE" ad=" xcxcxc"><record jsxid="jsx_lf" interactID="1" jsxtext="Interact1" interactivity="Interact1"><record jsxid="jsx_lg" text="ddfd" url="fdff" advertising=" xcxcxc"/></record><record jsxid="jsx_lh" interactID="6" jsxtext="gg" interactivity="gg"/><record jsxid="jsx_li" constraintTypeID="4" jsxtext="contentType" constraintsType="contentType"><record jsxid="jsx_lj" constraintID="7" jsxtext="movies" value="movies"/><record jsxid="jsx_lk" constraintID="6" jsxtext="news" value="news"/><record jsxid="jsx_ll" constraintID="5" jsxtext="sport" value="sport"/></record><record jsxid="jsx_lm" constraintTypeID="3" jsxtext="Channel" constraintsType="Channel"><record jsxid="jsx_ln" constraintID="4" jsxtext="fr2" value="fr2"/><record jsxid="jsx_lo" constraintID="3" jsxtext="tf1" value="tf1"/></record></record>');
    var i = d.getChildIterator();
    expect(i.hasNext()).toBeTruthy();
    expect(i.next().getAttribute('jsxid')).toEqual("jsx_lf");
    expect(i.hasNext()).toBeTruthy();
    expect(i.next().getAttribute('jsxid')).toEqual("jsx_lh");
    expect(i.hasNext()).toBeTruthy();
    expect(i.next().getAttribute('jsxid')).toEqual("jsx_li");
    expect(i.hasNext()).toBeTruthy();
    expect(i.next().getAttribute('jsxid')).toEqual("jsx_lm");
    expect(i.hasNext()).toBeFalsy();

  });

  it("should be able to find the first child node." , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    expect(d.getFirstChild().getNodeName()).toEqual("r1");
    expect(d.getFirstChild().getFirstChild()).toBeNull();
  });

  it("should be able to find the last child node." , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    expect(d.getLastChild().getNodeName()).toEqual("r3");
    expect(d.getLastChild().getLastChild()).toBeNull();

  });

  it("should be able to get previous sibling node." , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var r1 = d.getChildNodes().get(0);
    var r2 = d.getChildNodes().get(1);
    expect(r1.getPreviousSibling()).toBeNull();
    expect(r2.getPreviousSibling()).toEqual(r1);


  });

  it("should be able to get next sibling node." , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var r2 = d.getChildNodes().get(1);
    var r3 = d.getChildNodes().get(2);
    expect(r3.getNextSibling()).toBeNull();
    expect(r2.getNextSibling()).toEqual(r3);

  });

  it("should be able to compare two nodes using Entity.equals()", function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/></data>');
    expect(d.getFirstChild().equals(d.getChildNodes().get(0))).toBeTruthy();
    expect(d.getFirstChild().equals(null)).toBeFalsy();

  });

  it("should be able to retrieve a single node using Xpath selector Entity.selectSingleNode()" , function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectSingleNode("//r");
    expect(n).toBeInstanceOf(jsx3.xml.Entity);
    expect(n.getAttribute("a")).toEqual("1");
  });

  it("should be able to select multiple nodes using Xpath selector, Document.selectNodes", function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectNodes("//r");
    expect(n).toBeInstanceOf(jsx3.util.List);
    expect(n.size()).toEqual(3);
    expect(n.get(0).getAttribute("a")).toEqual("1");
    expect(n.get(1).getAttribute("a")).toEqual("2");
    expect(n.get(2).getAttribute("a")).toEqual("3");
  });

  it("should be able to select node with Namespace", function() {
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
  });

  it("should bel able to select node with a NamespaceObject" , function() {
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

  it ("should be able to select node with implicit Namespace.", function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//ns:r");
    expect(n).not.toBeNull();
    expect(n.getAttribute("a")).toEqual("2");
  });

  it ("should not be able to select node with bad Namespace", function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//foo:r");
    expect(n).toBeNull();
  });

  it("should be able to iterate through selected nodes using selectNodeIterator", function() {
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

  it("should be able to select node with different NodesContext", function() {
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

  it("should be able to to create iterator from selected nodes" , function() {
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

  it("should be able to apply transformation xsl using transformNode", function() {
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

  it("should be able to convert XML document to String" , function() {
    var d = new jsx3.xml.Document();
    var n = d.createDocumentElement("data");
    n.appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, "record"));
    n.appendChild(d.createNode(jsx3.xml.Entity.TYPETEXT, " -- a record "));
    expect(d.toString()).toMatch(/^<data><record\s*\/> \-\- a record <\/data>$/);

  });

  it("should be able to convert Node element into String" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "e");
    expect(ne.toString()).toMatch(/^<e\s*\/>$/);

  });

  it("should be able to convert Node attribute into String" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var na = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "a");
    na.setValue("v");
    expect(na.toString()).toEqual('a="v"');

  });

  it("should be able to convert Node text into String" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nt = d.createNode(jsx3.xml.Entity.TYPETEXT, "text");
    expect( nt.toString()).toEqual("text");

  });

  it("should be able to convert CDATA node into String" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nd = d.createNode(jsx3.xml.Entity.TYPECDATA, "cdata");
    expect(nd.toString()).toEqual("<![CDATA[cdata]]>")

  });

  it("should be able to convert comment node into String" , function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nc = d.createNode(jsx3.xml.Entity.TYPECOMMENT, " comment ");
    expect(nc.toString()).toEqual("<!-- comment -->")

  });

  it("should be able to set the text value of a document using Document.setValue" , function() {
    //test entity
    var d = new jsx3.xml.Document().loadXML("<abc><a>b</a></abc>");
    d.setValue("b");
    expect("<abc>b</abc>").toEqual(d.toString());


    // TODO: need to test attribute, cdata, comment and text types
  });

  // -1#INF ... 1-7XM18V
  it("should be able to set infinity value. testInfinity", function() {
    var x = new jsx3.xml.Document().loadXML("<r/>");
    x.setAttribute("v", Number.POSITIVE_INFINITY);

    var s = x.getAttribute("v");
    expect(s).toEqual("Infinity");
    expect(! isFinite(eval(s))).toBeTruthy();


  });

  it("should be able to interchange Document node. testInterDoc1", function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data></data>");

    expect(d1.getChildNodes().size()).toEqual(1);
    expect(d2.getChildNodes().size()).toEqual(0);

    d2.appendChild(d1.getChildNodes().get(0));

    expect(d1.getChildNodes().size()).toEqual(0);
    expect(d2.getChildNodes().size()).toEqual(1);

  });

  it("should be able to interchange document node with cloning, cloneNode()",function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data></data>");

    d2.appendChild(d1.getChildNodes().get(0).cloneNode(true));
    expect(d1.getChildNodes().size()).toEqual(1);
    expect(d2.getChildNodes().size()).toEqual(1);
  });

  it("should be able to interchange document node with insertBefore" , function() {
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

  it("should be able to interchange document node with replaceNode" , function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data><b/></data>");

    d2.replaceNode(d1.getChildNodes().get(0), d2.getChildNodes().get(0));

    expect(d1.getChildNodes().size()).toEqual(0);
    expect(d2.getChildNodes().size()).toEqual(1);
    expect(d2.getChildNodes().get(0).getNodeName()).toEqual("a")


  });

  it("should be able to interchange document node with removeAttributeNode and setAttributeNode" , function() {
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

  it("should be able to interchange document node with setAttribute and appendChild" , function() {
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

  it("should be able to interchange document node with selectNode and appendChild" , function() {
    var d1 = new jsx3.xml.Document().loadXML('<data/>');
    var d2 = new jsx3.xml.Document().loadXML('<data><r1/></data>');
    d1.appendChild(d2.selectSingleNode("//r1"));

    //make sure append happened as well as the delete from source
    expect(d1.selectSingleNode("//r1")).not.toBeNull();
    expect(d2.selectSingleNode("//r1")).toBeNull();


  });

  // SEE: http://www.generalinterface.org/bugs/browse/GI-536
  it("should work with empty Namespace", function() {
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
  });
});
