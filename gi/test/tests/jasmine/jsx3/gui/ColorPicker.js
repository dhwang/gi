/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.ColorPicker", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.ColorPicker");
  var t = new _jasmine_test.App("jsx3.gui.ColorPicker");
  var colorPicker;
  var ColorPicker;

  var getColorPicker = function(s){
    var root = s.getBodyBlock().load("data/ColorPicker.xml");
    return root.getChild(0).getDescendantOfName('colorPicker');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_ColorPicker.xml", ".", true): t._server;
    colorPicker = getColorPicker(t._server);
    if(!ColorPicker) {
      ColorPicker = jsx3.gui.ColorPicker;
    }
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(colorPicker).toBeInstanceOf(ColorPicker);
  });

  it("should able to set and get the color axis shown on the right side of the control", function() {
    var Axis = colorPicker.getAxis();
    expect(Axis).toEqual(ColorPicker.HUE);
    colorPicker.setAxis(2);
    Axis = colorPicker.getAxis();
    expect(Axis).toEqual(ColorPicker.SATURATION);
  });

  it("the currently selected color by RGB", function() {
    var RGB = colorPicker.getRGB();
    expect(RGB).toEqual(16711680);
    colorPicker.setRGB(10000000);
    RGB = colorPicker.getRGB();
    expect(RGB).toEqual(10000000);
  });

  it("should able to set and get the RGB value of the currently selected color as an integer", function() {
    var value = colorPicker.getValue();
    expect(value).toEqual(16711680);
    colorPicker.setValue('#ffffff');
    value = colorPicker.getValue();
    expect(value).toEqual(16777215);
    colorPicker.setValue(16734546);
    value = colorPicker.getValue();
    expect(value).toEqual(16734546);
  });

  it("should able to set the currently selected color by HSB components", function() {
    colorPicker.setHSB(0.1,0.2,0.3);
    expect(colorPicker.getRGB()).toEqual(5064253);
    expect(colorPicker.getValue()).toEqual(5064253);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});