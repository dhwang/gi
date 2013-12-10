/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Slider", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Slider");
  var t = new _jasmine_test.App("jsx3.gui.Slider");
  var slider;
  var Slider;

  var getSlider = function(s){
    var root = s.getBodyBlock().load("data/slider.xml");
    return root.getServer().getJSXByName('slider');
  };

  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_slider.xml", ".", true): t._server;
    slider = getSlider(t._server);
    if(!Slider) {
      Slider = jsx3.gui.Slider;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function(){
    expect(slider).toBeInstanceOf(Slider);
  });

  it("should be able to paint", function(){
    expect(slider.getRendered()).not.toBeNull();
    expect(slider.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should be able to set and get the URL of the image to use for the handle", function() {
    var handleImage =  slider.getHandleImage();
    expect(handleImage).toBeNull();
    var handle = slider.getRendered().firstChild.childNodes[1].firstChild;//This is a handle.
    expect(handle.style.backgroundImage).toEqual('url("../JSX/images/slider/top.gif")');
    slider.setHandleImage(Slider.IMAGE_UPWARD);
    handleImage =  slider.getHandleImage();
    slider.repaint();
    expect(handleImage).toEqual(Slider.IMAGE_UPWARD);
    handle = slider.getRendered().firstChild.childNodes[1].firstChild;//This is a handle.
    expect(handle.style.backgroundImage).toEqual('url("../JSX/images/slider/bottom.gif")');
  });

  it("should be able to set and get the length of this slider", function() {
    var length = slider.getLength();
    expect(length).toEqual('200');
    var track = slider.getRendered().firstChild.firstChild;
    expect(track.style.width).toEqual('198px');
    slider.setLength(300, true);
    length = slider.getLength();
    expect(length).toEqual(300);
    track = slider.getRendered().firstChild.firstChild;
    expect(track.style.width).toEqual('298px');
  });

  it("should be bae to set and get the orientation of this slider", function() {
    var orientation = slider.getOrientation();
    expect(orientation).toEqual(Slider.HORIZONTAL);
    var track = slider.getRendered().firstChild.firstChild;
    expect(track.style.width).toEqual('198px');
    expect(track.style.height).toEqual('5px');
    slider.setOrientation(Slider.VERTICAL);
    slider.repaint();
    orientation = slider.getOrientation();
    expect(orientation).toEqual(Slider.VERTICAL);
    track = slider.getRendered().firstChild.firstChild;
    expect(track.style.width).toEqual('5px');
    expect(track.style.height).toEqual('198px');
  });

  it("should be able to set and get whether the track is painted", function() {
    var paintTrack = slider.getPaintTrack();
    expect(paintTrack).toEqual(jsx3.Boolean.TRUE);
    var track = slider.getRendered().firstChild.firstChild;
    slider.setPaintTrack(jsx3.Boolean.FALSE);
    slider.repaint();
    paintTrack = slider.getPaintTrack();
    expect(paintTrack).toEqual(jsx3.Boolean.FALSE);
    track = slider.getRendered().firstChild.firstChild;
    expect(track.style.visibility).toEqual('hidden');
  });

  it("shoud able to set and get the value of this slider and repositions the handle", function() {
    var value = slider.getValue();
    expect(value).toEqual(0);
    var handle = slider.getRendered().firstChild.childNodes[1];//This is a handle.
    expect(handle.style.left).toEqual('0px');
    slider.setValue(50);
    slider.repaint();
    value = slider.getValue();
    expect(value).toEqual(50);
    handle = slider.getRendered().firstChild.childNodes[1];//This is a handle.
    expect(handle.style.left).toEqual('93px')
  });

  it("should be able to set and get whether clicking the track moves the handle to that point", function() {
    var trackClickable = slider.getTrackClickable();
    expect(trackClickable).toEqual(jsx3.Boolean.TRUE);
    var handle = slider.getRendered().firstChild.childNodes[1];//This is a handle.
    expect(handle.style.left).toEqual('0px');
    var track = slider.getRendered().firstChild.firstChild;
    track.click();
    handle = slider.getRendered().firstChild.childNodes[1];//This is a handle.
    var left_1 = handle.style.left;
    expect(left_1).not.toEqual('0px');
    slider.setTrackClickable(jsx3.Boolean.FALSE);
    slider.repaint();
    trackClickable = slider.getTrackClickable();
    expect(trackClickable).toEqual(jsx3.Boolean.FALSE);
    track = slider.getRendered().firstChild.firstChild;
    track.click();
    handle = slider.getRendered().firstChild.childNodes[1];//This is a handle.
    var left_2 = handle.style.left;
    expect(left_1).toEqual(left_2);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
