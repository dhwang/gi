/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.CheckBox", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.CheckBox");
  var t = new _jasmine_test.App("jsx3.gui.CheckBox");
  var CheckBox;

  var getCheckBox = function(s){
    var root = s.getBodyBlock().load("data/checkbox.xml");
    return root.getChild(0).getDescendantOfName('checkbox');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_checkbox.xml", ".", true): t._server;
    CheckBox = getCheckBox(t._server);
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(CheckBox).toBeInstanceOf(jsx3.gui.CheckBox);
  });

  it("should able to do validate ", function(){
     expect(CheckBox.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
     CheckBox.setValue(2);
     expect(CheckBox.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });

  it("should able to get and set the value", function() {
    var value = CheckBox.getValue();
    expect(value).toEqual(1);
    CheckBox.setValue(0);
    value = CheckBox.getValue();
    expect(value).toEqual(0);
  });

  it("should able to get and set current state of checkbox", function() {
    var checked = CheckBox.getChecked();
    expect(checked).toEqual(1);
    CheckBox.setChecked(0);
    checked = CheckBox.getChecked();
    expect(checked).toEqual(0);
  });

  it("should able to get and set the state of checkbox when it is first initialized", function() {
    var checked = CheckBox.getDefaultChecked();
    expect(checked).toEqual(0);
    CheckBox.setDefaultChecked(1);
    checked = CheckBox.getChecked();
    expect(checked).toEqual(1);
  });  

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
