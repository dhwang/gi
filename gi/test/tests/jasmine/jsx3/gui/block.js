/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.gui.Block", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Block","jsx3.html.DOM","jsx3.html.Style");  
  var t = new _jasmine_test.App("jsx3.gui.Block");
  var block;

  var getBlock = function(s){
    var root = s.getBodyBlock().loadAndCache("data/block.xml");
    return root.getChild(0);
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server2.xml", ".", true): t._server;
    block = getBlock(t._server);
  });

  afterEach(function() {
    t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function(){   
    expect(block).toBeInstanceOf(jsx3.gui.Block);
    expect(block).toBeInstanceOf(jsx3.gui.Painted);
  });
  
  it("should be able to paint", function(){
    expect(block.getRendered()).not.toBeNull();
    expect(block.getRendered().nodeName.toLowerCase()).toEqual("span");    
  });  
  
  it("should able to set and get the CSS display", function(){
    block.setDisplay(jsx3.gui.Block.DISPLAYBLOCK);
    var display = block.getDisplay();  
    expect(display).toEqual(jsx3.gui.Block.DISPLAYBLOCK);
  });  
  
  it("should able to set and get the CSS font-family", function(){
    block.setFontName("Verdana,Arial,sans-serif");
    var fontName = block.getFontName();  
    expect(fontName).toEqual("Verdana,Arial,sans-serif");
  }); 
  
  it("should able to set and get the dimensions in an array of four int values", function(){
    var dimensions = block.getDimensions();
    expect(dimensions).toEqual([undefined, undefined,100,30]);
    block.setDimensions(10,10,80,80);
    dimensions = block.getDimensions();
    expect(dimensions).toEqual([10,10,80,80]);
  });  
  
  it("should able to renders overflow css using paintOverflow()", function(){
    var overflow = block.paintOverflow();
    expect(overflow).toEqual("overflow:auto;");
  });  
   
  it("has method showMask() to display a 'blocking mask' inside the block to stop user interactions with content within the block", function(){
    block.showMask();
    expect(block._jsxmaskid).not.toBeNull();
    expect(block.getRendered().style.zIndex || 0).toBeLessThan(block.getRendered().childNodes[1].style.zIndex);
  });
  
  it("has method paintBackgroundColor() to renders valid CSS property value for the background", function(){
    expect(block.paintBackgroundColor()).toEqual("background-color:#A29F9F;");
    expect(block.getRendered().style.backgroundColor).toEqual("rgb(162, 159, 159)");
  });  
  
  it("has method setRelativePosition() to set if instance is relatively positioned on-screen", function(){
    block.setRelativePosition(jsx3.gui.Block.ABSOLUTE,true);
    expect(block.jsxrelativeposition).toEqual(jsx3.gui.Block.ABSOLUTE);
    expect(block.getRendered().style.position).toEqual("absolute");
  });            
});