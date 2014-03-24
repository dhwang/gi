/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Button", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Button");
  var t = new _jasmine_test.App("jsx3.gui.Button");
  var button;

  var getButton = function(s) {
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getServer().getJSXByName('submit');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true) : t._server;
    button = getButton(t._server);
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(button).toBeInstanceOf(jsx3.gui.Button);
  });

  it("should be able to paint", function() {
    expect(button.getRendered()).not.toBeNull();
    expect(button.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should be able to set and get the value", function() {
    var value = button.getValue();
    expect(value).toEqual('submit');
    button.setText('test');
    value = button.getValue();
    expect(value).toEqual('test');
    expect(button.getText()).toEqual('test');
  });

  it("should be able to trigger action when clicked", function() {
    expect(button._clickCounter).toEqual(0);
    button.doExecute();
    expect(button._clickCounter).toEqual(1);
    button.getRendered().click();
    expect(button._clickCounter).toEqual(2);
  });

  it('should be able to be disabled', function() {
    expect(button._clickCounter).toEqual(0);
    button.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    button.getRendered().click();
    expect(button._clickCounter).toEqual(0);
    button.setEnabled(jsx3.gui.Form.STATEENABLED, true);
    button.getRendered().click();
    expect(button._clickCounter).toEqual(1);
  });

  it("should be able to display different styled buttons", function() {
    button.setFontName("Verdana,Arial,sans-serif");
    button.repaint();
    expect(button.getRendered()).toHaveStyle('fontFamily', 'Arial');

    button.setFontSize(18);
    button.repaint();
    expect(button.getRendered()).toHaveStyle('fontSize', '18px');

    button.setFontWeight('bold');
    button.repaint();
    expect(button.getRendered()).toHaveStyle('fontWeight', 'bold');

    button.setColor('red', true);
    expect(button.getRendered()).toHaveStyle('color', 'red');
    
    button.setBackgroundColor('#f00');
    button.repaint();

    var bgColor = button.getRendered().style.backgroundColor;
    if (bgColor.indexOf('#') != -1) {
      expect(button.getRendered()).toHaveStyle('backgroundColor', '#f00');
    } else {
      expect(button.getRendered()).toHaveStyle('backgroundColor', 'rgb(255, 0, 0)');
    }

    button.setBorder('border: inset 3px #000000', true);
    var border = button.getRendered().style.border;

    if (border.indexOf('#') != -1) {
      expect(button.getRendered()).toHaveStyle('border', '#000000 3px inset');
    } else {
      expect(button.getRendered()).toHaveStyle('border', '3px inset rgb(0, 0, 0)');
    }
  });

  it("should be able to set and get the font color to use when this control is disabled", function() {
    button.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    expect(button.getDisabledColor()).toBeUndefined();
    button.setDisabledColor('#ff0000');
    button.repaint();
    expect(button.getDisabledColor()).toEqual('#ff0000');

    var disabledColor = button.getRendered().style.color;

    if (disabledColor.indexOf('#') != -1) {
      expect(button.getRendered()).toHaveStyle('color', '#ff0000');
    } else {
      expect(button.getRendered()).toHaveStyle('color', 'rgb(255, 0, 0)');
    }
  });

  it("should be able to set and get the background color when it is disabled", function() {
    button.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    expect(button.getDisabledBackgroundColor()).toBeUndefined();
    //Input box has default disabled color 'rgb(216, 216, 229)'

    var disabledColor = button.getRendered().style.backgroundColor;

    if (disabledColor.indexOf('#') != -1) {
      expect(button.getRendered()).toHaveStyle('backgroundColor', '#d8d8e5');
    } else {
      expect(button.getRendered()).toHaveStyle('backgroundColor', 'rgb(216, 216, 229)');
    }

    button.setDisabledBackgroundColor('grey');
    button.repaint();
    expect(button.getDisabledBackgroundColor()).toEqual('grey');
    expect(button.getRendered()).toHaveStyle('backgroundColor', 'gre');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});