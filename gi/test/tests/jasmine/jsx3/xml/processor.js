/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Processor", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.xml.Document", "jsx3.xml.Processor");
  var t = new _jasmine_test.TestSuite("jsx3.xml.Processor");

  beforeEach(function () {
    this.addMatchers(gi.test.jasmine.matchers);
    t._server = null;
  });

  var xslPrefix = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
    '<xsl:output method="xml" omit-xml-declaration="yes"/>';
  var xslSuffix = '</xsl:stylesheet>';
  var src1 = '<data jsxid="root"><record jsxid="r1"/></data>';
  var trans1 = xslPrefix + '<xsl:template match="/data"><doc><xsl:attribute name="id">' +
    '<xsl:value-of select="record/@jsxid"/>' +
    '</xsl:attribute></doc></xsl:template>' + xslSuffix;
  var trans2 = xslPrefix + '<xsl:param name="p1">1</xsl:param>' +
    '<xsl:template match="/data"><doc><xsl:attribute name="id">' +
    '<xsl:value-of select="$p1"/>' +
    '</xsl:attribute></doc></xsl:template>' + xslSuffix;
  var trans3 = xslPrefix + '<xsl:param name="p1"></xsl:param>' +
    '<xsl:template match="/*"><doc>' +
    '<xsl:value-of disable-output-escaping="yes" select="$p1"/>' +
    '</doc></xsl:template>' + xslSuffix;
  var trans4 = xslPrefix + '<xsl:param name="p1"></xsl:param>' +
    '<xsl:template match="*"><doc><xsl:attribute name="id">' +
    '<xsl:value-of select="@jsxid"/>' +
    '</xsl:attribute></doc></xsl:template>' + xslSuffix;
  t._unless = "NODEP";

  it("testDefined", function () {
    expect(jsx3.lang.Class.forName("jsx3.xml.Processor")).not.toBeNull();
  });

  it("testEmptyConstructor", function () {
    var p = new jsx3.xml.Processor();
    expect(p.hasError()).toBeFalsy();
  });

  it("testEmptyProcess", function () {
    var p = new jsx3.xml.Processor();
    var func = function () {
      p.transform();
    };
    expect(func).toThrow();
  });

  it("testTransform", function () {
    var p = new jsx3.xml.Processor((new jsx3.xml.Document()).loadXML(src1), (new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeTypeOf("string");
    expect(d).toBe('<doc id="r1"/>');
  });

  it("testTransformEntity", function () {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var p = new jsx3.xml.Processor(xml.selectSingleNode("//record"), (new jsx3.xml.Document()).loadXML(trans4));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeTypeOf("string");
    expect(d).toBe('<doc id="r1"/>');
  });

  it("testTransformObject", function () {
    var p = new jsx3.xml.Processor((new jsx3.xml.Document()).loadXML(src1), (new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transformToObject();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeInstanceOf(jsx3.xml.Document);
    expect(d.getNodeName()).toEqual("doc");
    expect(d).toMatch(/^<doc id="r1"\s*\/>$/);
  });

  it("testSetXml", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeTypeOf("string");
    expect(d).toBe('<doc id="r1"/>');
  });

  it("testErrorNoTrans", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML("<html/>"));
    var d = p.transform();
    expect(p.hasError()).toBeTruthy();
    expect(d).toBeNull();
  });

  it("testParam", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML(trans2));
    p.setParams({p1: "2"});
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBe('<doc id="2"/>');
  });

  it("testParamDefault", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML(trans2));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBe('<doc id="1"/>');
  });

  it("testParamConstructor", function () {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var xsl = (new jsx3.xml.Document()).loadXML(trans2);
    var p = new jsx3.xml.Processor(xml, xsl, {p1: 3});
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBe('<doc id="3"/>');
  });

  it("testOutputEscaping", function () {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var xsl = (new jsx3.xml.Document()).loadXML(trans3);
    var p = new jsx3.xml.Processor(xml, xsl, {p1: "&amp;"});
    var d = p.transform();
    if (jsx3.xml.Processor.supports(jsx3.xml.Processor.DISABLE_OUTPUT_ESCAPING))
    expect(d).toEqual('<doc>&amp;</doc>');
  });

  if (!_jasmine_test.IE)
  it("testModifyXsl", function () {
    var xsl = new jsx3.xml.Document().loadXML(trans1);
    var xml = new jsx3.xml.Document().loadXML(src1);
    var d = xml.transformNode(xsl, null, true);
    expect(d.selectSingleNode("//doc").getAttribute("id")).toEqual("r1");
    expect(d.selectSingleNode("//doc").getAttribute("a1")).toBeNull();
    var node = xsl.selectSingleNode("//doc");
    node.setAttribute("a1", "v1");
    d = xml.transformNode(xsl, null, true);
    expect(d.selectSingleNode("//doc").getAttribute("id")).toEqual("r1");
    expect(d.selectSingleNode("//doc").getAttribute("a1")).toEqual("v1");
  });
});
