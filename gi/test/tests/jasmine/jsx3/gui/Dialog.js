/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Dialog", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Dialog");
  var t = new _jasmine_test.App("jsx3.gui.Dialog");
  var dialog;
  var Dialog;

  var getDialog = function(s){
    var root = s.getBodyBlock().load("data/dialog.xml");
    return root.getChild(0);
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_dialog.xml", ".", true): t._server;
    dialog = getDialog(t._server);
    if(!Dialog) {
       Dialog = jsx3.gui.Dialog;
    }
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(dialog).toBeInstanceOf(Dialog);
  });

  it("should able to the absolute positioning of the object's on-screen view in relation to JSXROOT", function() {
    expect(dialog.getAbsolutePosition()).toBeInstanceOf(Object);
    expect(dialog.getAbsolutePosition().L).toEqual(141);
    expect(dialog.getAbsolutePosition().T).toEqual(57);
    expect(dialog.getAbsolutePosition().W).toEqual(429);
    expect(dialog.getAbsolutePosition().H).toEqual(316);
  });

  it("should able to implement necessary method for the Alerts interface", function() {
    expect(dialog.getAlertsParent().getName()).toEqual('dialog');
  });

  it("should able to set and get the outer border that surrounds the entire dialog", function() {
    var border = dialog.getBorder();
    expect(border).toBeUndefined();
    dialog.setBorder('border: solid 1px #000000');
    dialog.repaint();
    border = dialog.getBorder();
    expect(border).toEqual('border: solid 1px #000000');
    expect(dialog.getRendered().style.border).toEqual('1px solid rgb(0, 0, 0)');
  });

  it("should not take invalid border value", function() {
    dialog.setBorder('solid1 1px #000000');
    dialog.repaint();
    var border = dialog.getBorder();
    expect(border).toEqual('solid1 1px #000000');
    expect(dialog.getRendered().style.border).toEqual('');
  });

  it("should able to set and get the uniform buffer", function() {
    var buffer = dialog.getBuffer();
    expect(buffer).toBeFalsy();
    dialog.setBuffer(5);
    buffer = dialog.getBuffer();
    expect(buffer).toEqual(5);
  });

  it("should abe to get an object handle to the jsx3.gui.WindowBar instance", function() {
    expect(dialog.getCaptionBar().getRendered().className).toEqual('jsx30windowbar');
    expect(dialog.getCaptionBar().getDescendantOfName('btnMinimize').getRendered().className).toEqual('jsx30toolbarbutton');
    expect(dialog.getCaptionBar().getDescendantOfName('btnMaximize').getRendered().className).toEqual('jsx30toolbarbutton');
    expect(dialog.getCaptionBar().getDescendantOfName('btnClose').getRendered().className).toEqual('jsx30toolbarbutton');
  });

  it("should able to set and get the border that surrounds the dialog content", function() {
    var contentBorder = dialog.getContentBorder();
    expect(contentBorder).toBeUndefined();
    dialog.setContentBorder('border: solid 1px #000000');
    contentBorder = dialog.getContentBorder();
    expect(contentBorder).toEqual('border: solid 1px #000000');
  });

  it("should able to set and get whether a dialog displays as modal or not", function() {
    var modal = dialog.getModal();
    expect(modal).toEqual(Dialog.NONMODAL);
    dialog.setModal(Dialog.MODAL);
    modal = dialog.getModal();
    expect(modal).toEqual(Dialog.MODAL);
  });

  it("should able to set and get whether the dialog can be resized or not", function() {
    var resize = dialog.getResize();
    expect(resize).toEqual(Dialog.RESIZABLE);
    dialog.setResize(Dialog.FIXED);
    resize = dialog.getResize();
    expect(resize).toEqual(Dialog.FIXED);
  });

  it("should able to set and get state of the window", function() {
    var windowState = dialog.getWindowState();
    expect(windowState).toEqual(Dialog.MAXIMIZED);
    dialog.setWindowState(Dialog.MINIMIZED);
    windowState = dialog.getWindowState();
    expect(windowState).toEqual(Dialog.MINIMIZED);
  });

  it("should able to get and set numeric multiplier for the dialog's z-index", function() {
    var zMultiplier = dialog.getZMultiplier();
    expect(zMultiplier).toEqual(1);
    dialog.setZMultiplier(2);
    zMultiplier = dialog.getZMultiplier();
    expect(zMultiplier).toEqual(2);
  });

  it("should able to set and get object handle to the jsx3.gui.ToolbarButton", function() {
    expect(dialog.getTaskButton()).toBeNull();
  });

  it("should able to remove the dialog box from the JSX DOM and remove its on-screen VIEW from the browser DOM", function() {
    expect(dialog.getRendered().className).toEqual('jsx30dialog');
    dialog.doClose();
    expect(dialog.getRendered()).toBeNull();
  });

  it("should able to set and get toggles the window's state between full-size and window-shaded", function() {
    dialog.doToggleState();
    expect(dialog.getRendered().childNodes[1].style.display).toEqual('none');
    dialog.doToggleState();
    expect(dialog.getRendered().childNodes[1].style.display).toEqual('');
  });

  it("should able to toggle the state of the dialog between 'maximized' and its 'initial state'", function() {
    expect(dialog.selectDescendants('#btnMaximize')[0].getRendered().innerHTML).toEqual()
    dialog.doMaximize(dialog.getDescendantOfName('btnMaximize'));
    expect(dialog.selectDescendants('#btnMaximize')[0].getRendered().innerHTML).toEqual()
  });

  it("should able to applie focus to the caption bar if the dialog has one", function() {
    expect(dialog.getChild(0).focus().nodeName.toLowerCase()).toEqual('div');
    expect(dialog.getChild(0).focus().className).toEqual('jsx30windowbar');
  });

  it("should able to modifiy the top and left properties of this dialog in order to fit it within its parent container", function() {
    dialog.constrainPosition();
    expect(dialog.getDimensions()).toEqual([141, -32, 431, 318 ])
    expect(dialog.getAbsolutePosition().T).toEqual(-32);
  });

  it("whether this dialog instance is the front-most dialog among all open dialogs", function() {
    expect(dialog.isFront()).toBe(true);
  });

  it("should able to set resize parameters such as min width, max width, etc for the dialog", function() {
    dialog.setResizeParameters(Dialog.RESIZEABLE,80,50,1000,800);
    expect(dialog.getResize()).toEqual(Dialog.RESIZEABLE)
  });

  it("should be able to be moved to an absolute position on screen", function() {
    var left = dialog.getAbsolutePosition().L;
    dialog.setLeft(left+100,true);
    expect(dialog.getAbsolutePosition().L).toEqual(241);
    var top = dialog.getAbsolutePosition().T;
    dialog.setTop(top+100,true);
    expect(dialog.getAbsolutePosition().T).toEqual(157);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
