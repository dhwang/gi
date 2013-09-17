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
    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      delete t._server;
    });
  }); 
 });