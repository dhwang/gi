djConfig = typeof djConfig == "undefined" ? {baseUrl: "dojo-toolkit/dojo/", afterOnLoad: true} : djConfig;
jsx3.CLASS_LOADER.loadJSFileSync("dojo-toolkit/dojo/dojo.js");
jsx3.require("jsx3.gui.Block");

dojo.require("dojox.lang.docs");
dojo.require("dijit.ColorPalette");

/**
 * Provides an adapter for Dojo widgets
 */
jsx3.Class.defineClass("jsx3.gui.DojoWidget", jsx3.gui.Block, null, function(DojoWidget, DojoWidget_prototype) {
  DojoWidget._LOG = jsx3.util.Logger.getLogger("jsx3.gui.DojoWidget");
  DojoWidget._LOG.debug("started");

  DojoWidget._stylesheets = {};

  DojoWidget.insertThemeStyleSheets = function(theme){
    var ss = DojoWidget._stylesheets;
    var head = document.getElementsByTagName("head")[0];

    if(!ss[theme]){
      ss[theme] = dojo.create('link', {
        'rel': 'stylesheet',
        'type': 'text/css',
        'href': 'dojo-toolkit/dijit/themes/' + theme + '/' + theme + '.css'
      }, head);
      dojo.create('link', {
              'rel': 'stylesheet',
              'type': 'text/css',
              'href': 'dojo-toolkit/dojo/resources/dojo.css'
      }, head);
      dojo.addClass(dojo.body(), theme);
    }
  };

  DojoWidget_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strHTML,dijitProps) {
    //call constructor for super class
    this.dijitProps = dijitProps||{};
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight,strHTML);
    DojoWidget._LOG.warn('init');
    this._createDijit(this.dijitProps);
  };
  DojoWidget_prototype.onAfterAssemble = function(){
    DojoWidget._LOG.warn('onAfterAssemble');
    this.dijitProps=this.dijitProps||{};
    this.jsxsuper.apply(this, arguments);
    this._createDijit(this.dijitProps);
  };
  DojoWidget_prototype._createDijit = function(props){
    DojoWidget._LOG.warn('_createDijit: ' + this.getId());
    if(!this.dijit){
      if (!this.dijitClassName) {
        throw new Error("No dijitClassName defined");
      }
      dojo.require(this.dijitClassName);
      this.dijit = new (dojo.getObject(this.dijitClassName))(props);
    }
  };
  DojoWidget_prototype.isDomPaint = function(){
    return !!this.dijitClassName;
  };
  DojoWidget_prototype.paintDom = function(a){
    DojoWidget.insertThemeStyleSheets('tundra');
    DojoWidget._LOG.warn("paintDom: " + this.dijit.id);
    var newElement = document.createElement("div");
    dojo.attr(newElement, 'id', this.getId());
    document.body.appendChild(newElement);
    this.dijit.placeAt(newElement);
    return newElement;
  };
  DojoWidget_prototype.attr = function(name, value){
    if (arguments.length == 1) {
      return this.dijit.attr(name);
    }
    this.dijit.attr(name, value);
  };
  DojoWidget_prototype.onDestroy = function(objParent){
    DojoWidget._LOG.warn('destroy');
    this.dijit.destroyRecursive();

    this.jsxsuper(objParent);
  };
  DojoWidget_prototype.setEvent = function(script, eventName){
    this.getEvents()[eventName] = script;
    var handles = this._eventHandles = this._eventHandles || {};
    // disconnect any prior handler that we set
    if (handles[eventName]) {
      dojo.disconnect(handles[eventName]);
    }
    var objJSX = this;
    handles[eventName] = dojo.connect(this.dijit, eventName, function(event) {
      // send the Dojo event to the GI event system
      objJSX.doEvent(eventName, {objEVENT: event});
    });
    return this;
  }
  DojoWidget_prototype.getMetadataXML = function(metadataType){
    var schemaDefined, dijitClass = this.dijit.constructor;
    var metadata = jsx3.xml.CDF.Document.newDocument();
    if (metadataType == "prop") {
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
      function addProperty(propDef, i) {
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
      while (dijitClass) {
        for (var i in dijitClass.properties) {
          schemaDefined = true;
          if (i.charAt(0) != "_") {
            addProperty(dijitClass.properties[i], i);
          }
        }
        dijitClass = dijitClass["extends"];
      }
      if (!schemaDefined) {
        // no schema defined, we will to the prototype and current state for properties
        for (var i in this.dijit) {
          var type = typeof this.dijit[i];
          if (i.charAt(0) != "_" && type != "function") {
            addProperty({
              type: type,
            }, i);
          }
        }
      }
    }else if(metadataType=="event"){
      function addMethod(methodDef, i) {
        metadata.insertRecord({
          group: "dojo",
          jsxid: i,
          jsxtext: i,
          jsxtip: methodDef.description
        }, "dojo");
        metadata.insertRecord({
          jsxid:"objEVENT",
          type:"jsx3.gui.Event",
          jsxtext:"the browser event that triggers this event."
        }, i);
      }
      while (dijitClass) {
        for (var i in dijitClass.methods) {
          schemaDefined = true;
          if (i.charAt(0) != "_") {
            addMethod(dijitClass.methods[i], i);
          }
        }
        dijitClass = dijitClass["extends"];
      }      
      if (!schemaDefined) {
        // no schema defined, we will to the prototype and current state for methods/events
        for (var i in this.dijit) {
          if (i.charAt(0) != "_" && typeof this.dijit[i] == "function") {
            addMethod({}, i);
          }
        }
      }
    }
    return metadata;

  }
});
