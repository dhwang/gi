/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.CDF", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.CDF","jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");
  var t = new _jasmine_test.App("jsx3.gui.CDF");
  var newCDF = function (strURL) {
    return (new jsx3.xml.CDF.Document()).load(t.resolveURI(strURL));
  };
  var CDF;

  var getCDF = function(s){
    var root = s.getBodyBlock().load("data/CDF.xml");
    return root.getChild(0);
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_cdf.xml", ".", true): t._server;
    CDF = getCDF(t._server);
    cdf = newCDF("data/server_cdf.xml");
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(CDF).toBeInstanceOf(jsx3.gui.CDF);
  });

  it('should and get the CDF ID of the record to map to', function() {
    var cdfId = CDF.getCDFId();
    expect(cdfId).toEqual('1');
    CDF.setCDFId('2');
    var cdfId = CDF.getCDFId();
    expect(cdfId).toEqual('2');
  });

  it('should able to get and set the named attribute on the CDF record to which this object is mapped', function() {
    var cdfAttr = CDF.getChild(0).getCDFAttribute();
    expect(cdfAttr).toBeUndefined();
    CDF.getChild(0).setCDFAttribute('cdf'); 
    var cdfAttr = CDF.getChild(0).getCDFAttribute();
    expect(cdfAttr).toEqual('cdf');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
