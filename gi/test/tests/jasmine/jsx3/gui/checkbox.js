/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.CheckBox", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.CheckBox");
  var t = new _jasmine_test.App("jsx3.gui.CheckBox");
  var checkBox;
  var CheckBox;

  var getCheckBox = function(s){
    var root = s.getBodyBlock().load("data/checkbox.xml");
    return root.getChild(0).getServer().getJSXByName('checkbox');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_checkbox.xml", ".", true): t._server;
    checkBox = getCheckBox(t._server);
    if(!CheckBox) {
      CheckBox = jsx3.gui.CheckBox;
    }
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(checkBox).toBeInstanceOf(CheckBox);
  });

  it("should able to do validate ", function(){
    checkBox.setRequired(jsx3.gui.Form.REQUIRED);
    expect(checkBox.doValidate()).toEqual(0);
    checkBox.setChecked(CheckBox.CHECKED);
    expect(checkBox.doValidate()).toEqual(1);
  });

  it("should able to get and set the value", function() {
    var value = checkBox.getValue();
    expect(value).toEqual(CheckBox.UNCHECKED);
    checkBox.setValue(1);
    value = checkBox.getValue();
    expect(value).toEqual(CheckBox.CHECKED);
  });

  it("should able to get and set current state of checkbox", function() {
    var checked = checkBox.getChecked();
    expect(checked).toEqual(0);
    checkBox.setChecked(1);
    checked = checkBox.getChecked();
    expect(checked).toEqual(1);
  });

  it("should able to get and set the state of checkbox when it is first initialized", function() {
    var checked = checkBox.getDefaultChecked();
    expect(checked).toEqual(0);
    checkBox.setDefaultChecked(1);
    checkBox.repaint();
    checked = checkBox.getDefaultChecked();
    expect(checked).toEqual(1);
  });  

  it("should able to set the current state Partial of checkbox", function() {
    expect(checkBox.getRendered().firstChild.childNodes[0].childNodes[1].style.visibility).toEqual('hidden');
    checkBox.setChecked(2);
    expect(checkBox.getRendered().firstChild.childNodes[0].childNodes[1].style.visibility).toEqual('visible');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
