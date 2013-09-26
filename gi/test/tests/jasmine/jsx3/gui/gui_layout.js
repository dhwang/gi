describe("Application screen layout GI components like blocks, layout, dialog, menus", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.LayoutGrid","jsx3.gui.Button");
  var t = new _jasmine_test.App("jsx3.gui.LayoutGrid");

  describe("First canvas", function () {
    var layout;
    var getLayout = function(s){
      return s.getBodyBlock().loadAndCache("data/gui_appCanvas_1.xml").getChild(0);
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_gui_layout.xml", ".", true): t._server;
      layout = getLayout(t._server); // reset the block to initial state every time.
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should have a layout grid with three rows", function(){      
      expect(layout).toBeInstanceOf(jsx3.gui.LayoutGrid);
      expect(layout.getRows()).toEqual('150,*,50');
    });

    it("should have one block inside the first row with 150px height", function(){
      expect(layout.getChild(0)).toBeInstanceOf(jsx3.gui.Block);
      expect(parseInt(layout.getChild(0).getRendered().style.height)).toEqual(150);
    }); 

    it("should have a layout grid inside the second row with two columns",function(){
      expect(layout.getChild(1).getChild(0)).toBeInstanceOf(jsx3.gui.LayoutGrid);
      expect(layout.getChild(1).getChild(0).getCols()).toEqual('100,*');
    });

    it("should have one block inside the last row with 50px height",function(){
      expect(layout.getChild(2)).toBeInstanceOf(jsx3.gui.Block);
      expect(parseInt(layout.getChild(2).getRendered().style.height)).toEqual(50);
    });

    it("should able to set whether the layout grid will render items top-over (--) or side-by-side (|)",function(){
      layout.setOrientation(jsx3.gui.LayoutGrid.ORIENTATIONROW);
      var orientation=layout.getOrientation();
      expect(orientation).toEqual(jsx3.gui.LayoutGrid.ORIENTATIONROW);
    });
    
    it("should able to leverage an HTML Table for its on-screen VIEW",function(){
       layout.setBestGuess(jsx3.gui.LayoutGrid.ADAPTIVE);
       var bestGuess=layout.getBestGuess();
       expect(bestGuess).toEqual(jsx3.gui.LayoutGrid.ADAPTIVE);
    });
 
    it("should able to set the number of cells to draw before starting a new row/column of cells",function(){
    	layout.setRepeat(3);
    	var repeat=layout.getRepeat();
    	expect(repeat).toEqual(3);
    });

    it("should able to set dimensions for cells in the layoutgrid",function(){
    	layout.setDimensionArray(['3','5'],true);
    	var dimension=layout.getDimensionArray();
    	expect(dimension).toEqual(['3','5'],true);
    });

    it("should able to set column with setCols",function(){
    	layout.setCols('5,2,3',true);
    	var cols=layout.getCols();
    	expect(cols).toEqual('5,2,3');
    });

    it("should able to set rows with setRows",function(){
    	layout.setRows('5,2,3',true);
    	var rows=layout.getRows();
    	expect(rows).toEqual('5,2,3');
    });

    it("should able to return array of true sizes (not what the developer specified in code, but what it evaluates to according to the browser",function(){
    	var lows=layout.getRows();
    	var sTruesize=(layout._getTrueSizeArray(lows)).join();
    	var truesize=sTruesize.replace(/\,0\,/,",*,");
    	expect(truesize).toEqual(lows);	
    });

    it("should able to get the size of the canvas for a given child (the true drawspace)",function(){
    	var layChild=layout.getChild(1);
    	var clientDimension=layout.getClientDimensions(layChild);
    	layChild.setLeft(0);
    	layChild.setTop(150);
    	expect(clientDimension.width).toEqual(layChild.getWidth());
    	expect(clientDimension.height).toEqual(layChild.getHeight());
    	expect(clientDimension.left).toEqual(layChild.getLeft());
    	expect(clientDimension.top).toEqual(layChild.getTop());
    	
    });

    it("should clean up", function() {
        t._server.destroy();
        t.destroy();
        delete t._server;
    });
  }); 
describe("Second canvas",function(){
     var layout2,block2,dialog;
     var getBlock2=function(s){
     return s.getBodyBlock().loadAndCache("data/gui_appCanvas_2.xml");
     };

     beforeEach(function() {
      t._server2 = (!t._server2) ? t.newServer("data/server_gui_layout.xml", ".", true): t._server2;
      block2 = getBlock2(t._server2); // reset the block to initial state every time.
      layout2 = block2.getChild(0);
      dialog = block2.getChild(1);
    });

    afterEach(function() {
      if (t._server2)
        t._server2.getBodyBlock().removeChildren();
    });

    it("should have a layout grid with four areas/rows",function(){
    	expect(layout2).toBeInstanceOf("jsx3.gui.LayoutGrid");
    	expect(layout2.getRows()).toEqual('50,28,*,28');
    });

    it("should have a banner block with an image in first row",function(){
    	var imageBlk=layout2.getChild(0).getChild(0);
    	expect(imageBlk).toBeInstanceOf("jsx3.gui.Image");
    	imageBlk.setSrc("baidu.jpg");
    	expect(imageBlk.getSrc()).toEqual("baidu.jpg");
    });

    it("should have a window bar in second row",function(){
    	var menuBlk=layout2.getChild(1).getChild(0);
    	expect(menuBlk).toBeInstanceOf("jsx3.gui.WindowBar");
    });

    it("should have a body content area in third row",function(){
    	expect(layout2.getChild(2)).toBeInstanceOf("jsx3.gui.Block");
    });

    it("should have a task bar in fourth row",function(){
    	expect(layout2.getChild(3).getChild(0)).toBeInstanceOf("jsx3.gui.WindowBar");
    });

    it("should have a dialog box with fixed T,L,W,H",function(){
    	expect(dialog).toBeInstanceOf("jsx3.gui.Dialog");
    	expect(dialog.getLeft()).toEqual(48);
    	expect(dialog.getRendered().style.left).toEqual("48px");
    	expect(dialog.getTop()).toEqual(126);
    	expect(dialog.getRendered().style.top).toEqual("126px");
      expect(dialog.getRendered().style.position).toEqual("absolute");

      // Dialog width and height contains dialog chrome(border + buffer area)
      dialog.setWidth(450); // not painted yet
    	expect(dialog.getWidth()).toEqual(450);
      dialog.setHeight(350); // not painted yet
    	expect(dialog.getHeight()).toEqual(350);
      dialog.repaint();

      // actual width height are different due to affordance given for dialog chrome
      expect(dialog.getRendered().style.width).not.toEqual("450px");
      expect(dialog.getRendered().style.height).not.toEqual("350px");

      dialog.setBorder("0px solid"); // remove border, 0px size
      dialog.setBuffer("0");   // remove dialog buffer (contains the resize handle bar)
      dialog.repaint();

      expect(dialog.getRendered().style.width).toEqual("450px");
      expect(dialog.getRendered().style.height).toEqual("350px");
    });
    
    it("should clean up", function() {
      t._server2.destroy();
      t.destroy();
      delete t._server2;
    });

	});
 });