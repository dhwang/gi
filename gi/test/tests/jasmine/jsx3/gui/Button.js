/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Button", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Button");
  var t = new _jasmine_test.App("jsx3.gui.Button");
  var button;

  var getButton = function(s){
    var root = s.getBodyBlock().load("data/Button.xml");
    return root.getChild(0).getDescendantOfName('button');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_button.xml", ".", true): t._server;
    button = getButton(t._server);
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(button).toBeInstanceOf(jsx3.gui.Button);
  });

  it("should able to do validate ", function(){
     expect(button.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
     button.setValue(2);
     expect(button.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });

  it("should able to get the value", function() {
    var value = button.getValue();
    expect(value).toEqual('[button text]');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
