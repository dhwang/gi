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

  it("should able to set and get type", function() {
    var Select = jsx3.gui.Select;
    expect(select.getType()).toEqual(0);
    select.setType(Select.TYPECOMBO);
    expect(select.getType()).toEqual(1);
  });

  it("should able to set and get the value", function() {
    expect(select.getValue()).toBeNull();
    select.setValue('beijing');
    expect(select.getValue()).toEqual("beijing");
  });    

  it("should able to set and get max length", function() {
    expect(select.getMaxLength()).toBeNull();
    select.setMaxLength(200);
    expect(select.getMaxLength()).toEqual(200);
    select.setMaxLength('-200px');
    select.repaint();
    expect(select.getMaxLength()).toBeNull();
  });

  it("should able to set and get default text", function() {
    expect(select.getDefaultText()).toEqual("- Select -");
    select.setDefaultText("-City-");
    expect(select.getDefaultText()).toEqual("-City-");
  });

  it("should able to focus", function() {
    var Select = jsx3.gui.Select;
    select.setType(Select.TYPECOMBO);
    select.repaint();
    expect(select.focus().nodeName.toLowerCase()).toEqual('input');
    expect(select.focus().className).toEqual('jsx30combo_text');
  });

  it("should able to get the XSL appropriate to the select type (either combo or select) if no custom XSLT is specified", function() {
    expect(select.getXSL()._url).toEqual('../JSX/xsl/jsxselect.xsl');
  });

  it("should able to set and get the URL to use for the dropdown image", function() {
    var strPath = select.getIcon();
    expect(strPath).toBeUndefined();
    select.setIcon("selected.gif");
    select.repaint();
    strPath = select.getIcon()._path;
    expect(strPath).toEqual("tests/jasmine/jsx3/gui/selected.gif");
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
