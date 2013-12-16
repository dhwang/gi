/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.CDF", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.CDF", "jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");
  var t = new _jasmine_test.App("jsx3.gui.CDF");
  var newCDF = function(strURL) {
    return jsx3.xml.CDF.Document.newDocument().load(t.resolveURI(strURL));
  };
  var cdf;

  var getCDF = function(s) {
    var root = s.getBodyBlock().load("data/cdf.xml");
    return root.getServer().getJSXByName('cdf');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_cdf.xml", ".", true) : t._server;
    cdf = getCDF(t._server);
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(cdf).toBeInstanceOf(jsx3.gui.CDF);
  });

  it("should be able to paint", function() {
    expect(cdf.getRendered()).not.toBeNull();
    expect(cdf.getRendered().nodeName.toLowerCase()).toEqual("div");
  });

  it('should and get the CDF ID of the record to map to', function() {
    var cdfId = cdf.getCDFId();
    expect(cdfId).toBeUndefined();
    cdf.setCDFId('2');
    cdfId = cdf.getCDFId();
    expect(cdfId).toEqual('2');
    expect(cdf.getServer().getJSXByName('firstName').getValue()).toEqual('Tom');
    expect(cdf.getServer().getJSXByName('middleInitial').getValue()).toEqual('R');
    expect(cdf.getServer().getJSXByName('lastName').getValue()).toEqual('Pink');
    cdf.setCDFId('3');
    expect(cdf.getServer().getJSXByName('firstName').getValue()).toEqual('Zelda');
    expect(cdf.getServer().getJSXByName('middleInitial').getValue()).toEqual('P');
    expect(cdf.getServer().getJSXByName('lastName').getValue()).toEqual('Bingo');
  });

  it('should able to get and set the named attribute on the CDF record to which this object is mapped', function() {
    cdf.setCDFId('2');
    expect(cdf.getServer().getJSXByName('firstName').getValue()).toEqual('Tom');
    var cdfAttr = cdf.getServer().getJSXByName('firstName').getCDFAttribute();
    expect(cdfAttr).toEqual('first');
    cdf.getServer().getJSXByName('firstName').setCDFAttribute('middle');
    cdfAttr = cdf.getServer().getJSXByName('firstName').getCDFAttribute();
    expect(cdfAttr).toEqual('middle');
    expect(cdf.getServer().getJSXByName('firstName').getValue()).toEqual('R')
  });

  it("The value of matrix should be able to change, when the value of text box changes", function() {
    var cdfXML = cdf.getXML();
    var text = cdf.getRecord('1').first;
    expect(text).toEqual('Bob');
    cdf.repaint();
    var firstName = cdf.getServer().getJSXByName('firstName');
    var matrix = cdf.getServer().getJSXByName('matrix1');
    cdf.setCDFId('1');
    firstName.setValue('summer');
    matrix.insertRecordProperty(cdf.getCDFId(),firstName.getCDFAttribute(),firstName.getValue(),true); 
    text = cdf.getRecord('1').first;
    expect(text).toEqual('summer');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});