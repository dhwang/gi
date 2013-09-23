/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("form components like textbox, radio button, select box, etc", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.NativeForm");
  var t = new _jasmine_test.App("jsx3.gui.NativeForm");
  var ACTION = _jasmine_test.HTTP_BASE + "/formdata.cgi";

  describe("jsx3.gui.TextBox", function(){
    var textbox;

    var getTextbox = function(s){
      var root = s.getBodyBlock().load("data/nativeform.xml");
      return root.getChild(0).getDescendantOfName('textbox');
    };    
    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server1.xml", ".", true): t._server;
      textbox = getTextbox(t._server);
    });   

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to deserialize", function(){
      expect(textbox).toBeInstanceOf(jsx3.gui.TextBox);
    });

    it("should be able to paint", function(){
      expect(textbox.getRendered()).not.toBeNull();
      expect(textbox.getRendered().nodeName.toLowerCase()).toEqual("input");
    });

    it("should able to set and get the type of TextBox", function(){
      expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXT);
      textbox.setType(jsx3.gui.TextBox.TYPETEXTAREA);
      expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXTAREA);
    });

    it("should able set and get the value for the text box", function(){
      expect(textbox.getValue()).toEqual("");
      textbox.setValue("helloword");
      expect(textbox.getValue()).toEqual("helloword");
      expect(textbox.getRendered().value).toEqual("helloword");
      textbox.setValue(12345);
      expect(textbox.getValue()).toEqual("12345");
      expect(textbox.getRendered().value).toEqual("12345");
    });   

    it("should able to paint BackgroundColor", function(){
      expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXT);
      textbox.setType(jsx3.gui.TextBox.TYPETEXTAREA);
      expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXTAREA);
    }); 
  });

  describe("jsx3.gui.Select", function(){
    var select;

    var getSelect = function(s){
      var root = s.getBodyBlock().load("data/nativeform.xml");
      return root.getChild(0).getDescendantOfName('select');
    };    
    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server1.xml", ".", true): t._server;
      select = getSelect(t._server);
    });   

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to deserialize", function(){
      expect(select).toBeInstanceOf(jsx3.gui.NativeSelect);
    });

    it("should be able to paint", function(){
      expect(select.getRendered()).not.toBeNull();
      expect(select.getRendered().nodeName.toLowerCase()).toEqual("select");
    });

    it("should able to set and get text", function(){
      select.setText("hello");
      expect(select.getText()).toEqual("hello");
    });

    it("should able to set and get the value of the select box", function(){
      select.setValue(2);
      expect(select.getValue()).toEqual("2");
    });   

    it("should able to getXSLString", function(){
       expect(/<data>/.test(select.getXMLString())).toBeTruthy();
    });      
  });
});
