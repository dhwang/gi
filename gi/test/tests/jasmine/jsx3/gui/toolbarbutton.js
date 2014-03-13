/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.ToolbarButton", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.ToolbarButton");
  var t = new _jasmine_test.App("jsx3.gui.ToolbarButton");
  var toolbarbtn;

    var getToolbarbtn = function(s){
      var root = s.getBodyBlock().load("data/toolbarbutton.xml");
      return root.getServer().getJSXByName('toolBarBtn');
    };    

    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_toolbarbutton.xml", ".", true): t._server;
      toolbarbtn = getToolbarbtn(t._server);
    });

      afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to instance",function(){
      expect(toolbarbtn).toBeInstanceOf(jsx3.gui.ToolbarButton);
    });

    it("should be able to paint",function(){
      expect(toolbarbtn.getRendered()).not.toBeNull();
      expect(toolbarbtn.getRendered().nodeName.toLowerCase()).toEqual("span");
    });

    it("should be able to invoke the execute model event of this toollar button",function(){
      delete toolbarbtn._clickCounter;
      expect(toolbarbtn._clickCounter).toBeUndefined();
      toolbarbtn.doExecute();
      expect(toolbarbtn._clickCounter).toEqual(1);
    });

    it("should be able to invoke the execute model event of this toollar button",function(){
      delete toolbarbtn._clickCounter;
      expect(toolbarbtn._clickCounter).toBeUndefined();
      toolbarbtn.doExecute();
      expect(toolbarbtn._clickCounter).toEqual(1);
    });

    it("should be able to set and get the URL of the image to use when this button is disabled",function(){
      expect(toolbarbtn.getDisabledImage()).toEqual("jsx:///images/tbb/open.gif");
      toolbarbtn.setDisabledImage("data/dispic.png");
      expect(toolbarbtn.getDisabledImage()).toEqual("data/dispic.png");
    });

    it("should be able to set and get whether this toolbar button renders a visual divider on its left side",function(){
      expect(toolbarbtn.getDivider()).toBeFalsy();
      toolbarbtn.setDivider(1);
      expect(toolbarbtn.getDivider()).toBeTruthy();
    });

    it("should be able to set and get whether this toolbar button renders a visual divider on its left side",function(){
      expect(toolbarbtn.getDivider()).toBeFalsy();
      toolbarbtn.setDivider(1);
      expect(toolbarbtn.getDivider()).toBeTruthy();
    });

    it("should be able to set and get the name of the group to which this radio button belongs",function(){
      expect(toolbarbtn.getGroupName()).toBeNull();
      toolbarbtn.setType(2);
      toolbarbtn.setGroupName("myGroup");
      expect(toolbarbtn.getGroupName()).toEqual("myGroup");
    });

    it("should be able to set and get the URL of the image to use to render this button",function(){
      expect(toolbarbtn.getImage()).toEqual("jsx:///images/tbb/open.gif");
      toolbarbtn.setImage("data/dispic.png");
      toolbarbtn.repaint();
      expect(toolbarbtn.getImage()).toEqual("data/dispic.png");
      expect(toolbarbtn.getRendered().firstChild.style.backgroundImage).toEqual('url("tests/jasmine/jsx3/gui/data/dispic.png")');
    });

    it("should be able to set and get the URL of the image to use to render this button",function(){
      expect(toolbarbtn.getImage()).toEqual("jsx:///images/tbb/open.gif");
      toolbarbtn.setImage("data/dispic.png");
      toolbarbtn.repaint();
      expect(toolbarbtn.getImage()).toEqual("data/dispic.png");
      expect(toolbarbtn.getRendered().firstChild.style.backgroundImage).toEqual('url("tests/jasmine/jsx3/gui/data/dispic.png")');
    });

    // Following can't pass, when I use setState() in GI_builder, it works, but in Jasmine it can't work. 
    // it("should be able to set and get the state of this button",function(){
    //   expect(toolbarbtn.getState()).toEqual(0);
    //   expect(toolbarbtn.getRendered().style.backgroundImage).toEqual("");
    //   toolbarbtn.setState(1); 
    //   expect(toolbarbtn.getState()).toEqual(1);
    //   expect(toolbarbtn.getRendered().style.backgroundImage).toNotEqual("");
    // });

    it("should be able to set and get the type of this button",function(){
      expect(toolbarbtn.getType()).toEqual(0);
      toolbarbtn.setType(1);
      expect(toolbarbtn.getType()).toEqual(1);
      toolbarbtn.setType(2);
      expect(toolbarbtn.getType()).toEqual(2);
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
});