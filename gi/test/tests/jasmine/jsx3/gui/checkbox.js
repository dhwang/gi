/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.CheckBox", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.CheckBox");
  var t = new _jasmine_test.App("jsx3.gui.CheckBox");
  var checkBox;
  var CheckBox;

  var getCheckBox = function(s) {
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getServer().getJSXByName('checkbox');
  };

  var getRendered = function(checkBox) {
    var objInput, imgpartial, objLabel, objSpan;
    objInput = checkBox.getRendered().firstChild.firstChild.firstChild;
    imgpartial = checkBox.getRendered().firstChild.childNodes[0].childNodes[1];
    objLabel = checkBox.getRendered().firstChild.childNodes[1];
    objSpan = objLabel.parentNode.parentNode;

    return {
      objInput: objInput,
      imgpartial: imgpartial,
      objLabel: objLabel,
      objSpan: objSpan
    };
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true) : t._server;
    checkBox = getCheckBox(t._server);
    if (!CheckBox) {
      CheckBox = jsx3.gui.CheckBox;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(checkBox).toBeInstanceOf(CheckBox);
  });

  it("should be able to paint", function() {
    expect(checkBox.getRendered()).not.toBeNull();
    expect(checkBox.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should able to do validate", function() {
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
    checkBox.repaint();
    value = checkBox.getValue();
    expect(value).toEqual(CheckBox.CHECKED);
  });

  it("should able to get and set current state of checkbox", function() {
    var checked = checkBox.getChecked();
    expect(checked).toEqual(CheckBox.UNCHECKED);
    checkBox.setChecked(CheckBox.CHECKED);
    checkBox.repaint();
    checked = checkBox.getChecked();
    expect(checked).toEqual(CheckBox.CHECKED);
    expect(getRendered(checkBox).objInput.getAttribute('checked')).toEqual('checked');
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
    checkbox.ispartial = function() {
      return getRendered(checkBox).imgpartial.style.visibility === 'visible';
    }
    expect(checkbox.ispartial()).toBeFalsy();
    checkBox.setChecked(CheckBox.PARTIAL);
    expect(checkbox.ispartial()).toBeTruthy();
  });

  it('should be able to be disabled', function() {
    checkBox.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    checkBox.getRendered().click();
    expect(checkBox.getValue()).toEqual(0);
  });

  if (_jasmine_test.IE && !_jasmine_test.IE8) {
    it("The label is offset over the input checkbox by using padding on IE", function() {
      getRendered(checkBox).objLabel.click();
      expect(checkBox.getChecked()).toEqual(CheckBox.UNCHECKED);
      getRendered(checkBox).objSpan.click();
      expect(checkBox.getChecked()).toEqual(CheckBox.CHECKED);
    });
  }

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});