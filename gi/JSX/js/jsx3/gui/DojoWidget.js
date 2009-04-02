djConfig = typeof djConfig == "undefined" ? {baseUrl: "dojo-toolkit/dojo/", afterOnLoad: true} : djConfig;
jsx3.CLASS_LOADER.loadJSFileSync("dojo-toolkit/dojo/dojo.js");
jsx3.require("jsx3.gui.Block");

dojo.require("dojox.lang.docs");
dojo.require("dijit.ColorPalette");

/**
 * Provides an adapter for Dojo widgets
 */
jsx3.Class.defineClass("jsx3.gui.DojoWidget", jsx3.gui.Block, [], function(DojoWidget, DojoWidget_prototype) {
  DojoWidget._LOG = jsx3.util.Logger.getLogger("jsx3.gui.DojoWidget");
  DojoWidget._LOG.debug("started");
  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param intLeft {int} left position (in pixels) of the object relative to its parent container; not required if button is one of: jsx3.gui.Button.SYSTEMOPEN, jsx3.gui.Button.DIALOGCLOSE, jsx3.gui.Button.DIALOGALPHA, jsx3.gui.Button.DIALOGSHADE
   * @param intTop {int} top position (in pixels) of the object relative to its parent container; not required if button is one of: jsx3.gui.Button.SYSTEMOPEN, jsx3.gui.Button.DIALOGCLOSE, jsx3.gui.Button.DIALOGALPHA, jsx3.gui.Button.DIALOGSHADE
   * @param intWidth {int} width (in pixels) of the object; not required if button is one of: jsx3.gui.Button.SYSTEMOPEN, jsx3.gui.Button.DIALOGCLOSE, jsx3.gui.Button.DIALOGALPHA, jsx3.gui.Button.DIALOGSHADE
   * @param strText {String} text to display in the given button; if null JSXTABLEHEADERCELL.DEFAULTTEXT is used
   */
  DojoWidget_prototype.init = function(strName,intLeft,intTop,intWidth,strText) {
    //call constructor for super class
    this.jsxsuper(strName,intLeft,intTop,intWidth);

    //update properties unique to the jsx3.gui.Button class
    this.setText(strText);
  };
  DojoWidget_prototype.isDomPaint = function(){
    return !!this.dijitClassName;
  };
  DojoWidget_prototype.paintDom = function(a){
    if(!this.dijit){
      dojo.require(this.dijitClassName);
      this.dijit = new (dojo.getObject(this.dijitClassName))({palette: "7x10"});
    }
    DojoWidget._LOG.warn("a " + a);
    var newElement = document.createElement("div");
    document.body.appendChild(newElement);
    this.dijit.placeAt(newElement);
    return newElement;
  }
  DojoWidget_prototype.attr = function(name, value){
    if (arguments.length == 1) {
      return this.dijit.attr(name);
    }
    this.dijit.attr(name, value);
  };
  DojoWidget_prototype.getMetadataXML = function(){
    var dijitClass = dijit.ColorPalette; // this.dijit.constructor;
    DojoWidget._LOG.warn("get metadata description" + dijitClass.description);
    
    var metadata = jsx3.xml.CDF.Document.newDocument();
    for (var i in {"object":1, "position":1, "1":1, "font":1, "box_nobg":1, "css":1, "interaction":1, "access":1}) {
      metadata.insertRecord({
        include: "master.xml",
        absinclude: "GI_Builder/plugins/jsx3.ide.palette.properties/templates/master.xml",
        group: i
      });
    }
    metadata.insertRecord({
      group: "1",
      jsxid: "dojo",
      jsxtext: "Dojo"
    });
    for (var i in dijitClass.properties) {
      var propDef = dijitClass.properties[i];
      metadata.insertRecord({
        group: "dojo",
        jsxid: i,
        jsxtext: i,
        jsxtip: propDef.description,
        eval: propDef.type == 'string' ? 0 : 1,
        docgetter:'attr("' + i + '")',
        docsetter:'attr("' + i + '", value)',
        jsxmask:"jsxtext",
        jsxexecute:'objJSX.attr("' + i + '",vntValue);'
      }, "dojo");
    }  
    return metadata;
  };
});
