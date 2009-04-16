jsx3.require("jsx3.util.Dojo");
jsx3.require("jsx3.gui.Block");

dojo.require("dojox.lang.docs");
dojo.require("dojox.html._base");

/**
 * Provides an adapter for Dojo widgets
 */
jsx3.Class.defineClass("jsx3.gui.DojoWidget", jsx3.gui.Block, null, function(DojoWidget, DojoWidget_prototype) {
  DojoWidget._LOG = jsx3.util.Logger.getLogger("jsx3.gui.DojoWidget");
  DojoWidget._LOG.debug("started");

  var ss = DojoWidget._stylesheets = {};

  DojoWidget.insertThemeStyleSheets = function(theme, node){
    var theme_ss = 'dojo-toolkit/dijit/themes/' + theme + '/' + theme + '.css';

    if(!ss[theme_ss]){
      DojoWidget.insertStyleSheet(theme_ss, node);
      dojo.addClass(dojo.body(), theme);
    }
  };

  DojoWidget.insertStyleSheet = function(name, node){
    var doc = node.ownerDocument;
    var head = doc.getElementsByTagName("head")[0];
    var s = ss[name];
    if(!s){
      s = ss[name] = doc.createElement('style');
      s.setAttribute('type', 'text/css');
      head.appendChild(s);

      dojo.xhrGet({
        url: name,
        sync: true,
        load: function(text){
          var text = dojox.html._adjustCssPaths(name, text);
          if(s.styleSheet){ // IE
            if(!ss.styleSheet.cssText){
              s.styleSheet.cssText = text;
            }else{
              s.styleSheet.cssText += text;
            }
          }else{ // w3c
            s.appendChild(doc.createTextNode(text));
          }
        }
      });
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
    var dijitProps = {};
    for (var i in this) {
      if (i.substring(0,6) == "dijit_") {
        dijitProps[i.substring(6)] = this[i];
      }
    }
    this.jsxsuper.apply(this, arguments);
    this._createDijit(dijitProps);
  };
  DojoWidget_prototype._subPropId = function() {
    return this.dijitClassName;
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
    var newElement = document.createElement("div");
    DojoWidget.insertThemeStyleSheets('tundra', newElement);
    if(this.dijitStyleSheets){
      dojo.forEach(this.dijitStyleSheets, function(style_sheet){
        DojoWidget.insertStyleSheet(style_sheet, newElement);
      });
    }
    dojo.attr(newElement, 'id', this.getId());
    document.body.appendChild(newElement);
    var style = (this.jsxheight ? "height:" + this.jsxheight + "px;" : "") +
                (this.jsxwidth ? "width:" + this.jsxwidth + "px;" : "") + 
                this.paintFontSize() + this.paintBackgroundColor() + this.paintBackground() +
                this.paintColor() + this.paintOverflow() + this.paintFontName() +
                this.paintZIndex() + this.paintFontWeight() + this.paintTextAlign() +
                this.paintCursor() + this.paintVisibility() + this.paintBlockDisplay() + this.paintCSSOverride();

    newElement.setAttribute("style", style);
    this.dijit.placeAt(newElement);
    if(this.jsxheight) {
      newElement.firstChild.style.height = "100%";
    }
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
    var self = this;
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
        var firstCap = i.charAt(0).toUpperCase() + i.substring(1, i.length);
        if(i != "id" && i != "class"){
          self["get" + firstCap] = function() {
            return self.dijit.attr(i);
          };
          self["set" + firstCap] = function(value) {
            self["dijit_" + i] = value;
            self.dijit.attr(i, value);
          };
        }
        metadata.insertRecord({
          jsxid: i,
          jsxtext: firstCap,
          jsxtip: propDef.description,
          eval: propDef.type == 'string' ? 0 : 1,
          docgetter:"get" + firstCap,
          docsetter:"set" + firstCap,
          getter:"get" + firstCap,
          jsxmask:"jsxtext",
          jsxexecute:'objJSX.set' + firstCap + '(vntValue);'
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
