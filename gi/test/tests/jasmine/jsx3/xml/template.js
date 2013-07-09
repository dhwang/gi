/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Template", function() {
    var _jasmine_test = gi.test.jasmine;
    _jasmine_test.require("jsx3.xml.Template");
    var t = new _jasmine_test.TestSuite("jsx3.xml.Template");

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

    it("testDefined" ,function() {

      expect(jsx3.lang.Class.forName("jsx3.xml.Template")).not.toBeNull();

  });

    it("testTransform" ,function() {

    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
      expect(p.hasError()).toBeFalsy();
      expect(d).toBeTypeOf("string");
       expect(d).toBe('<doc id="r1"/>');
  });

    it("testReset" ,function() {

    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans2));
    p.setParam("p1", "2");

    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var d = p.transformToObject(xml);

      expect(p.hasError()).toBeFalsy();

      expect(d.selectSingleNode("//doc/@id").getValue()).toEqual('2');
    d = p.transformToObject(xml);
      expect(d.selectSingleNode("//doc/@id").getValue()).toEqual('2');
    p.reset();
    d = p.transformToObject(xml);
      expect(d.selectSingleNode("//doc/@id").getValue()).toEqual('1');

  });

  it("testEmptyConstructor" , function()
  {

      var func = function() {
          return new jsx3.xml.Template();
      };
      expect(func).toThrow();



  });

  it("testBadTemplate" , function() {
    var template = new jsx3.xml.Document().loadXML("<unclosed");
      var func = function() {
          return new jsx3.xml.Template(template);
      };
      expect(func).toThrow();




  });

  it("testTransformEntity" , function() {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans4));
    var d = p.transform(xml.selectSingleNode("//record"));


      expect(d).toBeTypeOf("string");
      expect( p.hasError()).toBeFalsy();
      expect(d).toBe('<doc id="r1"/>');


  });

  it("testTransformObject" , function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transformToObject((new jsx3.xml.Document()).loadXML(src1));


        expect(d).toBeInstanceOf(jsx3.xml.Document);
       expect(d.getNodeName()).toEqual("doc");
      expect( p.hasError()).toBeFalsy();
      expect(d).toBe(/^<doc id="r1"\s*\/>$/);


  });

 it("testErrorNoTrans" , function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML("<html/>"));

      expect(p.hasError()).toBeTruthy();
  });

  it("testParam" ,function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans2));
    p.setParams({p1: "2"});
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));

      expect( p.hasError()).toBeFalsy();
      expect(d).toBe('<doc id="2"/>');


  });

  it("testParamDefault" ,function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans2));
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
      expect( p.hasError()).toBeFalsy();
      expect(d).toBe('<doc id="1"/>');

  });

  it("testOutputEscaping" , function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans3));

    p.setParams({p1:"&amp;"});
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
    if (jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
     expect('<doc>&amp;</doc>').toEqual(d);
//    else
//      jsunit.assertEquals('<doc>&amp;amp;</doc>', d);
  });

  it("testModifyXsl" , function() {
    var xsl = new jsx3.xml.Document().loadXML(trans1);
    var temp = new jsx3.xml.Template(xsl);
    var xml = new jsx3.xml.Document().loadXML(src1);

    var d = temp.transformToObject(xml);
      expect( d.selectSingleNode("//doc").getAttribute("id")).toEqual("r1");
      expect(d.selectSingleNode("//doc").getAttribute("a1")).toBeNull();

    var node = xsl.selectSingleNode("//doc");
    node.setAttribute("a1", "v1");
    d = temp.transformToObject(xml);
      expect(d.selectSingleNode("//doc").getAttribute("id")).toEqual("r1");
      expect(d.selectSingleNode("//doc").getAttribute("a1")).toEqual("v1");
  });
 // t.testModifyXsl._unless = "IE"; // NOTE: IE doesn't support this ...

    afterEach(function() {
        if (t._server) {
            t._server.destroy();
            delete t._server;
        }
    });
});
