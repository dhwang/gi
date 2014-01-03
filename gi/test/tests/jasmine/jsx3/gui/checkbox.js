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

  var getCheckBox = function(s) {
    var root = s.getBodyBlock().load("data/checkbox.xml");
    return root.getServer().getJSXByName('checkbox');
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

  it("should be able to paint", function(){
    expect(checkBox.getRendered()).not.toBeNull();
    expect(checkBox.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should able to do validate", function(){
    expect(checkBox.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
    checkBox.setRequired(jsx3.gui.Form.REQUIRED);
    expect(checkBox.doValidate()).toEqual(jsx3.gui.Form.STATEINVALID);
    checkBox.setChecked(CheckBox.CHECKED);
    expect(checkBox.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });

  it("should able to get and set the value", function() {
    var value = checkBox.getValue();
    expect(value).toEqual(CheckBox.UNCHECKED);
    checkBox.setValue(CheckBox.CHECKED);
    value = checkBox.getValue();
    expect(value).toEqual(CheckBox.CHECKED);
  });

  it("should able to get and set current state of checkbox", function() {
    var checked = checkBox.getChecked();
    expect(checked).toEqual(CheckBox.UNCHECKED);
    checkBox.setChecked(CheckBox.CHECKED);
    checked = checkBox.getChecked();
    expect(checked).toEqual(CheckBox.CHECKED);
  });

  it("should able to get and set the state of checkbox when it is first initialized", function() {
    var checked = checkBox.getDefaultChecked();
    expect(checked).toEqual(CheckBox.UNCHECKED);
    checkBox.setDefaultChecked(CheckBox.CHECKED);
    checked = checkBox.getDefaultChecked();
    expect(checked).toEqual(CheckBox.CHECKED);
  });

  it("should able to set the current state Partial of checkbox", function() {
    var checkbox = {};
    checkbox.imgpartial = checkBox.getRendered().firstChild.childNodes[0].childNodes[1];
    checkbox.ispartial = function() { return checkbox.imgpartial.style.visibility == "visible"; }\
    expect(checkbox.ispartial()).toBeFalsy();
    checkBox.setChecked(CheckBox.PARTIAL);
    expect(checkbox.ispartial()).toBeTruthy();
  });

  it('should be able to be disabled', function() {
    checkBox.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
    checkBox.getRendered().click();
    expect(checkBox.getValue()).toEqual(0);
  });

  it("should be able to display different styled checkBoxs", function() {
    checkBox.setFontName("Verdana,Arial,sans-serif");
    checkBox.repaint();
    var fontFamily = checkBox.getRendered().style.fontFamily;
    if(fontFamily === "Verdana, Arial, sans-serif") {
      expect(fontFamily).toEqual("Verdana, Arial, sans-serif");
    } else if(fontFamily === "Verdana,Arial,sans-serif") {
      expect(fontFamily).toEqual("Verdana,Arial,sans-serif");
    }
    checkBox.setFontSize(18);
    checkBox.repaint();
    expect(checkBox.getRendered().style.fontSize).toEqual('18px');
    checkBox.setFontWeight('bold');
    checkBox.repaint();
    expect(checkBox.getRendered().style.fontWeight).toEqual('bold');
    checkBox.setColor('red',true);
    expect(checkBox.getRendered().style.color).toEqual('red');
    checkBox.setBackgroundColor('#f00');
    checkBox.repaint();
    expect(checkBox.getRendered().style.backgroundColor).toEqual('rgb(255, 0, 0)');
    checkBox.setBorder('border: inset 3px #000000',true);
    expect(checkBox.getRendered().style.border).toEqual('3px inset rgb(0, 0, 0)');
  });

  it("should be able to set and get the color when it is disabled", function() {
    checkBox.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
    expect(checkBox.getDisabledColor()).toBeUndefined();
    checkBox.setDisabledColor('#ff0000');
    checkBox.repaint();
    expect(checkBox.getDisabledColor()).toEqual('#ff0000');
    expect(checkBox.getRendered().style.color).toEqual('rgb(255, 0, 0)');
  });

  it("should be able to set and get the background color of this form control when it is disabled", function() {
    checkBox.setEnabled(jsx3.gui.Form.STATEDISABLED,true);
    expect(checkBox.getDisabledBackgroundColor()).toBeUndefined();
    checkBox.setDisabledBackgroundColor('#0000ff');
    checkBox.repaint();
    expect(checkBox.getDisabledBackgroundColor()).toEqual('#0000ff');
    expect(checkBox.getRendered().style.backgroundColor).toEqual('rgb(0, 0, 255)');
  });


  it("The label is offset over the input checkbox by using padding on IE", function() {
    var label = checkBox.getRendered().firstChild.childNodes[1];
    var span = label.parentNode.parentNode;
    label.click();
    expect(checkBox.getChecked()).toEqual(CheckBox.UNCHECKED);
    span.click();
    expect(checkBox.getChecked()).toEqual(CheckBox.CHECKED);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
