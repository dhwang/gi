/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Select", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Select","jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");
  var t = new _jasmine_test.App("jsx3.gui.Select");
  var newCDF = function (strURL) {
    return (new jsx3.xml.CDF.Document()).load(t.resolveURI(strURL));
  };
  var select;

  var getSelect = function(s){
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getChild(0).getDescendantOfName('select');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true): t._server;
    select = getSelect(t._server);
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to deserialize", function(){
    expect(select).toBeInstanceOf(jsx3.gui.Select);
  });

  it("should be able to paint", function(){
    expect(select.getRendered()).not.toBeNull();
    expect(select.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should able to set and get text", function(){
    select.setDefaultText("hello");
    expect(select.getText()).toEqual("hello");
  });

  it("should able to do validate ", function(){
     expect(select.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
     select.setValue(2);
     expect(select.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });  
  it("should able to map cdf ", function(){
    var cdf = newCDF("data/selectCdf.xml");
    var r = cdf.getRecord('c2');
    select.setSourceXML(cdf);
    select.setValue('c2');
    select.repaint();
    expect(select.getText()).toEqual(r.jsxtext);
  }); 
        
});
