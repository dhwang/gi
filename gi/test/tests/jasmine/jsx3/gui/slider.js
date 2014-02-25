/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Slider", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Slider");
  var t = new _jasmine_test.App("jsx3.gui.Slider");
  var slider;
  var Slider;

  var getSlider = function(s) {
    var root = s.getBodyBlock().load("data/slider.xml");
    return root.getServer().getJSXByName('slider');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_slider.xml", ".", true) : t._server;
    slider = getSlider(t._server);
    if (!Slider) {
      Slider = jsx3.gui.Slider;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(slider).toBeInstanceOf(Slider);
  });

  it("should be able to paint", function() {
    expect(slider.getRendered()).not.toBeNull();
    expect(slider.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should be able to set and get the URL of the image to use for the handle", function() {
    var handleImage = slider.getHandleImage();
    expect(handleImage).toBeNull();
    var handle = slider.getRendered().firstChild.childNodes[1].firstChild; //This is a handle.
    var handleBg = handle.style.backgroundImage;
    expect(handleBg).toMatch(/top\.gif/);
    slider.setHandleImage(Slider.IMAGE_UPWARD);
    handleImage = slider.getHandleImage();
    slider.repaint();
    expect(handleImage).toEqual(Slider.IMAGE_UPWARD);
    handle = slider.getRendered().firstChild.childNodes[1].firstChild; //This is a handle.
    var handleBg = handle.style.backgroundImage;
    expect(handleBg).toMatch(/bottom\.gif/);
  });

  it("should be able to set and get the length of this slider", function() {
    var length = slider.getLength();
    expect(length).toEqual('200');
    slider.setBorder('none', true);
    slider.setLength(300, true);
    length = slider.getLength();
    expect(length).toEqual(300);
    track = slider.getRendered().querySelector('.jsx30slider_track');
    expect(track.style.width).toEqual('300px');
  });

  it("should be bae to set and get the orientation of this slider", function() {
    var orientation = slider.getOrientation();
    expect(orientation).toEqual(Slider.HORIZONTAL);
    var sliderHTML = slider.repaint();
    expect(sliderHTML).toMatch(/width:198px/);
    slider.setOrientation(Slider.VERTICAL);
    orientation = slider.getOrientation();
    expect(orientation).toEqual(Slider.VERTICAL);
    sliderHTML = slider.repaint();
    expect(sliderHTML).toMatch(/width:15px/);
  });

  it("should be able to set and get whether the track is painted", function() {
    var paintTrack = slider.getPaintTrack();
    expect(paintTrack).toEqual(jsx3.Boolean.TRUE);
    var track = slider.getRendered().querySelector('.jsx30slider_track');
    expect(track.style.visibility).toEqual('');
    slider.setPaintTrack(jsx3.Boolean.FALSE);
    slider.repaint();
    paintTrack = slider.getPaintTrack();
    expect(paintTrack).toEqual(jsx3.Boolean.FALSE);
    track = slider.getRendered().querySelector('.jsx30slider_track');
    expect(track.style.visibility).toEqual('hidden');
  });

  it("shoud able to set and get the value of this slider and repositions the handle", function() {
    var value = slider.getValue();
    expect(value).toEqual(0);
    var handle = slider.getRendered().firstChild.childNodes[1]; //This is a handle.
    expect(handle.style.left).toEqual('0px');
    slider.setValue(50);
    value = slider.getValue();
    expect(value).toEqual(50);
    expect(handle.style.left).toEqual('93px');
  });

  it("should be able to set and get whether clicking the track moves the handle to that point", function() {
    var trackClickable = slider.getTrackClickable();
    expect(trackClickable).toEqual(jsx3.Boolean.TRUE);
    slider.setTrackClickable(jsx3.Boolean.FALSE);
    trackClickable = slider.getTrackClickable();
    expect(trackClickable).toEqual(jsx3.Boolean.FALSE);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});