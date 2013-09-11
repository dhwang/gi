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
  var getBlock2 = function(s){
    var root = s.getBodyBlock().loadAndCache("data/block2.xml");
    return root;
  };
  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server2.xml", ".", true): t._server;
    block = getBlock(t._server);
    t._server2 = (!t._server2) ? t.newServer("data/server3.xml", ".", true): t._server2;
    block2 = getBlock2(t._server2);    
  });

  afterEach(function() {
    t._server.getBodyBlock().removeChildren();
    t._server2.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function(){   
    expect(block).toBeInstanceOf(jsx3.gui.Block);
    expect(block2).toBeInstanceOf(jsx3.gui.Block);
    expect(block).toBeInstanceOf(jsx3.gui.Painted);
    expect(block2).toBeInstanceOf(jsx3.gui.Painted);
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

  it("has method hideMask() to remove the blocking mask inside the block to stop user interactions with existing content", function(){
    block.showMask();
    expect(block._jsxmaskid).not.toBeNull();
    expect(block.getRendered().style.zIndex || 0).toBeLessThan(block.getRendered().childNodes[1].style.zIndex);
    block.hideMask();
    expect(block._jsxmaskid).toEqual(undefined);
    expect(block.getRendered().childNodes[1]).toEqual(undefined);
    
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
  it("should able to set and get valid css property value for the background", function(){
    expect(block.getBackground()).toEqual(undefined);
    block.setBackground("background-repeat:no-repeat");
    block.repaint();
    expect(block.getRendered().style.backgroundRepeat).toEqual("no-repeat");
  }); 
  
  it("should able to set and get valid css property value for the border", function(){
    expect(block.getBorder()).toEqual(undefined);
    block.setBorder("border: solid 1px #000000",true);
    expect(block.getRendered().style.border).toEqual("1px solid rgb(0, 0, 0)");
  });  
  
  it("should able to set and get valid css property value for color", function(){
    expect(block.getColor()).toEqual(undefined);
    block.setColor('rgb(255,0,0)',true);
    expect(block.getRendered().style.color).toEqual("rgb(255, 0, 0)");
  });
  
  it("should able to set and get the width property", function(){
    expect(block.getWidth()).toEqual(100);
    block.setWidth(120,true);
    expect(block.getWidth()).toEqual(120);
    expect(block.getRendered().style.width).toEqual("120px");
  });   
  
  it("should able to find an on-screen reference for the given block", function(){
     expect(block._findGUI()).toEqual(block.getRendered());
  });   
  
  it("should able to try to find an on-screen reference for the given block and update its css without forcing a repaint", function(){
     block.updateGUI("border","rgb(255,255,0)")
     expect(block._findGUI().style["border"]).toEqual("rgb(255, 255, 0)");
  }); 
  
  it("should able to set and get the css z-index property", function(){
     expect(block.getZIndex()).toEqual(undefined);
     block.setZIndex(2, true);
     expect(block.getZIndex()).toEqual(2);
  });  
   
  it("should able to set and get the named arrribute on the CDF record to which the block is mapped", function(){
     expect(block.getCDFId()).toEqual(undefined);
  }); 

  it("should able to set and get HTML tag name to use when rendering the object on-screen", function(){
    expect(block.getTagName()).toEqual(undefined);
    expect(block.getRendered().nodeName.toLowerCase()).toEqual("span");    
    block.setTagName("div");
    block.repaint();
    expect(block.getTagName()).toEqual("div");
    expect(block.getRendered().nodeName.toLowerCase()).toEqual("div"); 
  });               
  
  it("should able to set and get CSS property value(s) for a margin", function(){
    expect(block.getMargin()).toEqual(undefined);
    expect(block.getRendered().style.margin).toEqual("");    
    block.setMargin("10,0,0,10",true);
    expect(block.getMargin()).toEqual("10,0,0,10");
    expect(block.getRendered().style.margin).toEqual("10px 0px 0px 10px"); 
  }); 

  it("should able to set and get CSS property value(s) for a margin", function(){
    expect(block.getMargin()).toEqual(undefined);
    expect(block.getRendered().style.margin).toEqual("");    
    block.setMargin("10,0,0,10",true);
    expect(block.getMargin()).toEqual("10,0,0,10");
    expect(block.getRendered().style.margin).toEqual("10px 0px 0px 10px"); 
  }); 
    
  it("should able to set and get valid CSS property value for cursor", function(){
    expect(block.getCursor()).toEqual(undefined);
    expect(block.getRendered().cursor).toEqual(undefined);    
    block.setCursor("col-resize",true);
    expect(block.getRendered().style.cursor).toEqual("col-resize");    
  }); 
  
  it("should able to set and get CSS property value(s) for a padding", function(){
    expect(block.getPadding()).toEqual(undefined);
    expect(block.getRendered().style.padding).toEqual("");    
    block.setPadding("10,0,0,10",true);
    expect(block.getPadding()).toEqual("10,0,0,10");
    expect(block.getRendered().style.padding).toEqual("10px 0px 0px 10px"); 
  });  
  
  it("should able to set and get CSS text to override the standard instance properties on the painted block", function(){
    expect(block.getCSSOverride()).toEqual(undefined);
    expect(block.getRendered().style.margin).toEqual("");    
    block.setCSSOverride("margin:10px");
    block.repaint();
    expect(block.getRendered().style.margin).toEqual("10px"); 
    expect(block.getCSSOverride()).toEqual("margin:10px");
  });  

  it("should able to set and get the named CSS rule(s) to apply to the painted block", function(){
    expect(block.getClassName()).toEqual(undefined);
    expect(block.getRendered().className).toEqual('jsx30block');    
    block.setClassName("css2");
    expect(block.getClassName()).toEqual("css2");
    block.repaint();
    expect((/css2$/).test(block.getRendered().className)).toBeTruthy();
  }); 
  
  it("should able to set and get the display", function(){
    expect(block.getDisplay()).toEqual(undefined);
    expect(block.getRendered().style.display).toEqual('inline-block');    
    block.setDisplay(jsx3.gui.Block.DISPLAYNONE,true);
    expect(block.getDisplay()).toEqual("none");
    expect(block.getRendered().style.display).toEqual('none');
  });  
  
  it("should able to set and get the left property if the block is absolutely positioned", function(){
    expect(block.getLeft()).toEqual(undefined);
    expect(block.getRendered().style.left).toEqual("");
    block.setRelativePosition(jsx3.gui.Block.ABSOLUTE,true);    
    block.setLeft(5,true);
    expect(block.getLeft()).toEqual(5);
    expect(block.getRendered().style.left).toEqual("5px");
  });
    
  it("should able to set and get if the Block instance is relatively positioned on-screen", function(){
    expect(block.getRelativePosition()).toEqual('1');
    expect(block.getRendered().style.position).toEqual("relative");
    block.setRelativePosition(jsx3.gui.Block.ABSOLUTE,true);    
    expect(block.getRelativePosition()).toEqual(0);
    expect(block.getRendered().style.position).toEqual("absolute");
  }); 
  
  it("should able to set and get the top property if the block is absolutely positioned", function(){
    expect(block.getTop()).toEqual(undefined);
    expect(block.getRendered().style.top).toEqual("");
    block.setRelativePosition(jsx3.gui.Block.ABSOLUTE,true);    
    block.setTop(5,true);
    expect(block.getTop()).toEqual(5);
    expect(block.getRendered().style.top).toEqual("5px");
  });  
  
  it("should able to set and get the CSS visibility property", function(){
    expect(block.getVisibility()).toEqual(undefined);
    expect(block.getRendered().style.visibility).toEqual("");
    block.setVisibility(jsx3.gui.Block.VISIBILITYHIDDEN,true);    
    expect(block.getVisibility()).toEqual(jsx3.gui.Block.VISIBILITYHIDDEN);
    expect(block.getRendered().style.visibility).toEqual(jsx3.gui.Block.VISIBILITYHIDDEN);
  }); 
  
  it("should able to wrap a block", function(){
    expect(block2.getRendered().childNodes[1].firstChild.className).toEqual("jsx30block");     
  });
    
  it("the width childNode should less than parentNode if the parentNode set padding or the childNode set border", function(){
    expect(block2.getRendered().childNodes[1].firstChild.style.width).toBeLessThan(block2.getRendered().childNodes[1].style.width);
     block2.getChild(1).setPadding("10,10,10,10",true);
     block2.getChild(1).getChild(0)setBorder("border:none",true);
    expect(block2.getRendered().childNodes[1].firstChild.offsetWidth+20).toEqual(block2.getRendered().childNodes[1].offsetWidth);    
  });  

  it("the height childNode should less than parentNode if the parentNode set padding or the childNode set border", function(){
    expect(block2.getRendered().childNodes[1].firstChild.style.height).toBeLessThan(block2.getRendered().childNodes[1].style.height);
     block2.getChild(1).setPadding("10,10,10,10",true);
     block2.getChild(1).getChild(0)setBorder("border:none",true);
    expect(block2.getRendered().childNodes[1].firstChild.offsetHeight+20).toEqual(block2.getRendered().childNodes[1].offsetHeight);    
  });
                                        
});