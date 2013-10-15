//step 1) require the template engine (and all required interfaces by the class)
jsx3.require("jsx3.gui.Template","jsx3.gui.Form","jsx3.gui.Template.Box");


//step 2) define the new class
jsx3.lang.Class.defineClass("my.Button",jsx3.gui.Template.Block,[jsx3.gui.Form],function(BUTTON,button) {
//  button.setBackground("url(" + jsx3.resolveURI("jsx:///images/dialog/window.gif") + ")",true);
  button.bg = "url(" + jsx3.resolveURI("jsx:///images/dialog/window.gif") + ")";
  button.getTemplateXML = function() {
    return ['',
    '<transform xmlns="http://gi.tibco.com/transform/" xmlns:u="http://gi.tibco.com/transform/user" version="1.0">' ,
    '  <template>' ,
    '    <inlinebox style="position:{$position};width:100%;height:100%;padding:{$padding};margin:10px;background:{$bg};background-color:{$bgcolor};display:{$display};overflow:{$overflow};visibility:{$visibility};border:{$border}">',
    '      <attach select="new jsx3.util.List(this.getChildren()).iterator()"/>' ,
    '      <input/>',
    '      <inlinebox style="position:{$position};width:16px;height:14px;display:{$display};background:{bg};margin:0 0 0 10px;"></inlinebox>' ,
    '    </inlinebox>' ,    
    '  </template>' ,
    '</transform>'].join("");
  };
});