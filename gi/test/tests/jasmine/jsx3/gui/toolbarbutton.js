/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.ToolbarButton", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.ToolbarButton");
  var t = new _jasmine_test.App("jsx3.gui.ToolbarButton", "jsx3.gui.WindowBar");
  var taskbar, toolbarbtn1, toolbarbtn2, toolbarbtn3;

  var getToolbarbtn = function(s) {
    var root = s.getBodyBlock().load("data/toolbarbutton.xml");
    return root.getServer().getJSXByName('taskBar');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_toolbarbutton.xml", ".", true) : t._server;
    taskbar = getToolbarbtn(t._server);
    toolbarbtn1 = taskbar.getChild(0);
    toolbarbtn2 = taskbar.getChild(1);
    toolbarbtn3 = taskbar.getChild(2);
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(taskbar).toBeInstanceOf(jsx3.gui.WindowBar);
    expect(toolbarbtn1).toBeInstanceOf(jsx3.gui.ToolbarButton);
  });

  it("should be able to paint", function() {
    expect(taskbar.getRendered()).not.toBeNull();
    expect(toolbarbtn1.getRendered()).not.toBeNull();
    expect(taskbar.getRendered().nodeName.toLowerCase()).toEqual("div");
    expect(toolbarbtn1.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should be able to invoke the execute model event of this toollar button", function() {
    expect(toolbarbtn1._clickCounter).toBeUndefined();
    toolbarbtn1.doExecute();
    expect(toolbarbtn1._clickCounter).toEqual(1);
  });

  it("should be able to set and get the URL of the image to use when this button is disabled", function() {
    expect(toolbarbtn1.getDisabledImage()).toEqual("jsx:///images/tbb/open.gif");
    toolbarbtn1.setDisabledImage("data/dispic.png");
    expect(toolbarbtn1.getDisabledImage()).toEqual("data/dispic.png");
  });

  it("should be able to set and get whether this toolbar button renders a visual divider on its left side", function() {
    expect(toolbarbtn1.getDivider()).toBeFalsy();
    toolbarbtn1.setDivider(1);
    toolbarbtn1.repaint();
    expect(toolbarbtn1.getDivider()).toBeTruthy();
    expect(toolbarbtn1.getRendered()).toHaveStyle("borderWidth", /1px/);
  });

  it("should be able to set and get the name of the group to which this radio button belongs", function() {
    expect(toolbarbtn1.getGroupName()).toBeNull();
    toolbarbtn1.setType(2);
    toolbarbtn2.setType(2);
    toolbarbtn3.setType(2);
    toolbarbtn1.setGroupName("radioGroup");
    toolbarbtn2.setGroupName("radioGroup");
    toolbarbtn3.setGroupName("radioGroup");
    toolbarbtn1.repaint();
    toolbarbtn2.repaint();
    toolbarbtn3.repaint();
    expect(toolbarbtn1.getGroupName()).toEqual("radioGroup");
    expect(toolbarbtn2.getGroupName()).toEqual("radioGroup");
    expect(toolbarbtn3.getGroupName()).toEqual("radioGroup");
  });

  it("should be able to set and get the URL of the image to use to render this button", function() {
    expect(toolbarbtn1.getImage()).toEqual("jsx:///images/tbb/open.gif");
    toolbarbtn1.setImage("data/dispic.png");
    toolbarbtn1.repaint();
    expect(toolbarbtn1.getImage()).toEqual("data/dispic.png");
    expect(toolbarbtn1.getRendered().firstChild).toHaveStyle("backgroundImage", /dispic\.png/);
  });

  it("should be able to get the state always as zero when the type is Normal ", function() {
    toolbarbtn1.setType(0);
    toolbarbtn1.setState(0);
    expect(toolbarbtn1.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
    toolbarbtn1.setState(1);
    expect(toolbarbtn1.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
  });

  it("should be able to be different to set the state of this button when the type is Check/Toggle", function() {
    toolbarbtn2.setType(1);
    toolbarbtn2.setState(0);
    expect(toolbarbtn2.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
    toolbarbtn2.getRendered().click();
    expect(toolbarbtn2.getState()).toBe(jsx3.ToolbarButton.STATEON);
    expect(toolbarbtn2.getRendered()).toHaveStyle("backgroundImage", /on\.gif/);
  });

  it("should be able to select only one button at a time when the type is RadioGroup", function() {
    toolbarbtn1.setType(2);
    toolbarbtn2.setType(2);
    toolbarbtn3.setType(2);
    toolbarbtn1.setGroupName("radioGroup");
    toolbarbtn2.setGroupName("radioGroup");
    toolbarbtn3.setGroupName("radioGroup");
    toolbarbtn1.getRendered().click();
    expect(toolbarbtn1.getState()).toBe(jsx3.ToolbarButton.STATEON);
    expect(toolbarbtn2.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
    expect(toolbarbtn3.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
    expect(toolbarbtn1.getRendered()).toHaveStyle("backgroundImage", /on\.gif/);
    expect(toolbarbtn2.getRendered().style.backgroundImage).toEqual("");
    toolbarbtn2.getRendered().click();
    expect(toolbarbtn2.getState()).toBe(jsx3.ToolbarButton.STATEON);
    expect(toolbarbtn1.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
    expect(toolbarbtn3.getState()).toBe(jsx3.ToolbarButton.STATEOFF);
  });

  it("should be able to set and get the type of this button", function() {
    expect(toolbarbtn1.getType()).toEqual(jsx3.gui.ToolbarButton.TYPENORMAL);
    toolbarbtn2.setType(1);
    expect(toolbarbtn2.getType()).toEqual(jsx3.gui.ToolbarButton.TYPECHECK);
    toolbarbtn3.setType(2);
    expect(toolbarbtn3.getType()).toEqual(jsx3.gui.ToolbarButton.TYPERADIO);
  });

  //Adding the test for WindowBar.js

  it("should be able to set and get the type of the window bar", function() {
    taskbar.setType(0);
    expect(taskbar.getType()).toEqual(jsx3.gui.WindowBar.TYPECAPTION);
    taskbar.setType(1);
    expect(taskbar.getType()).toEqual(jsx3.gui.WindowBar.TYPETOOL);
    taskbar.setType(2);
    expect(taskbar.getType()).toEqual(jsx3.gui.WindowBar.TYPEMENU);
    taskbar.setType(3);
    expect(taskbar.getType()).toEqual(jsx3.gui.WindowBar.TYPETASK);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});