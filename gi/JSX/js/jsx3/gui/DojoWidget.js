// @jsxobf-clobber-shared  _jsxevents
jsx3.require("jsx3.util.Dojo", "jsx3.gui.Block");

jsx3.util.Dojo.load();

dojo.require("dojox.lang.docs");
// seems that sometimes there is concurrent loading, so we have to actually specify these explicitly
dojo.require("dojo._base.connect");
dojo.require("dojo._base.Deferred");
dojo.require("dojo._base.json");
dojo.require("dojo._base.array");
dojo.require("dojo._base.Color");
dojo.require("dojo._base.browser");
dojo.require("dijit.dijit");
dojo.require("dojox.html._base");

/**
 * Provides an adapter for Dojo widgets
 */
jsx3.Class.defineClass("jsx3.gui.DojoWidget", jsx3.gui.Block, null, function(DojoWidget, DojoWidget_prototype) {
  DojoWidget._LOG = jsx3.util.Logger.getLogger("jsx3.gui.DojoWidget");

  var ss = DojoWidget._stylesheets = {};
  var correctedPopups;
  /**
   * Dynamically inserts the theme style sheet and applies the correct class to the app's DOM
   * @param theme theme to apply
   * @param node The node to use
   * @private
   */
  DojoWidget.insertThemeStyleSheets = function(theme, node){
    var theme_ss = jsx3.util.Dojo.getPath('/dijit/themes/' + theme + '/' + theme + '.css');

    if(!ss[theme_ss]){
      DojoWidget.insertStyleSheet(theme_ss, node);
      dojo.addClass(dojo.body(), theme);
    }
  };
  /**
   * Dynamically inserts a style sheet into the DOM
   * @param name filename of the style sheet to add
   * @param node The node to use
   * @private
   */
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
            if(!s.styleSheet.cssText){
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
    this._createDijit(this.dijitProps);
  };
  DojoWidget_prototype.onAfterAssemble = function(){
    var dijitProps = {};
    for (var i in this) {
      if (i.substring(0,6) == "dijit_") {
        dijitProps[i.substring(6)] = this[i];
      }
    }
    this.jsxsuper.apply(this, arguments);
    this._createDijit(dijitProps);
    for (var i in this._jsxevents) {
      this.setEvent(this._jsxevents[i], i);
    }
  };
  DojoWidget_prototype.onSetChild = function() {
    return false;
  };
  /**
   * Gets the sub-id of the class
   * @return the sub-id of the class
   * @private
   */
  DojoWidget_prototype._subPropId = function() {
    return this.dijitClassName;
  };
  
  /**
   * Creates a new dijit
   * @param props {Object} property bag to provide to the dijit constructor
   * @private
   */
  DojoWidget_prototype._createDijit = function(props){
    if(!this.dijit){
      if (!this.dijitClassName) {
        throw new Error("No dijitClassName defined");
      }
      dojo._postLoad = true; // make sure we don't tempt the widget to use document.write
      dojo.require(this.dijitClassName);
      if(!correctedPopups && dijit.popup){
        correctedPopups = true;        
        dojo.connect(dijit.popup, "open", function(){
          dojo.query(".dijitPopup").addClass("jsx30block");
        });
      }
      
      this.dijit = new (dojo.getObject(this.dijitClassName))(props);
      setupAccessors(this);
      var self = this;
      dojo.connect(self.dijit, "onChange", function(){
        self.dijit_value = self.dijit.attr("value");
      });
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
        DojoWidget.insertStyleSheet(jsx3.util.Dojo.getPath('/' + style_sheet), newElement);
      });
    }
    dojo.attr(newElement, 'id', this.getId());
    document.body.appendChild(newElement);
    var style = (this.jsxheight ? "height:" + this.jsxheight + "px;" : "") +
                (this.jsxwidth ? "width:" + this.jsxwidth + "px;" : "") + 
                (this.jsxleft ? "left:" + this.jsxleft + "px;" : "") +
                (this.jsxtop? "top:" + this.jsxtop + "px;" : "") + 
                (typeof this.jsxrelativeposition == "number" ? "position:" + (this.jsxrelativeposition ? "relative" : "absolute") : "") + 
                this.paintFontSize() + this.paintBackgroundColor() + this.paintBackground() +
                this.paintColor() + this.paintOverflow() + this.paintFontName() +
                this.paintZIndex() + this.paintFontWeight() + this.paintTextAlign() +
                this.paintCursor() + this.paintVisibility() + this.paintBlockDisplay() + this.paintCSSOverride();

    newElement.style.cssText = style;
    newElement.title = this.getTip();
    
    this.dijit.placeAt(newElement);
    if(this.jsxheight) {
      newElement.firstChild.style.height = "100%";
    }
    return newElement;
  };

  /**
   * Returns a getter for retrieving attribute value from the Dojo widget
   * @param name {String} Name of the attribute whose value will be retrieved when calling the getter
   * @return {Function} Getter function to return the attribute's value
   */
  DojoWidget_prototype.getter = function(name){
    var dijit = this.dijit;
    return function() {
      return dijit.attr(name);
    };
  };

  /**
   * Returns a setter for modifying an attribute's value in the Dojo widget
   * @param name {String} Name of the attribute whose value will be modified when calling the setter
   * @return {Function} Setter function to modify attribute's value
   */
  DojoWidget_prototype.setter = function(name){
    var dijit = this.dijit;
    return function(value) {
      dijit.attr(name, value);
    };
  };
  /**
   * Handles destruction of the widget
   * @private
   */
  DojoWidget_prototype.onDestroy = function(objParent){
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

  // iterates over the properties, whether it be from the API docs, or the object's prototype  
  function iterateProperties(self, handler) {
    var schemaDefined, dijitClass = self.dijit.constructor;
      while (dijitClass) {
        for (var i in dijitClass.properties) {
          schemaDefined = true;
          if (i.charAt(0) != "_") {
            var propDef = dijitClass.properties[i];
            var protoType = typeof self.dijit[i];
            if (!propDef.type && protoType != "undefined" && protoType != "function") {
              propDef.type = protoType;
            }
            handler(dijitClass.properties[i], i);
          }
        }
        dijitClass = dijitClass["extends"];
      }
      if (!schemaDefined) {
        // no schema defined, we will to the prototype and current state for properties
        for (var i in self.dijit) {
          var type = typeof self.dijit[i];
          if (i.charAt(0) != "_" && type != "function") {
            handler({
              type: type
            }, i);
          }
        }
      }
  };
  var objectsMissingDocGetters = [];
  // setup the getters and setters on the object
  function setupAccessors(self){
    if(!docsInitialized){
      objectsMissingDocGetters.push(self);
    }
    iterateProperties(self, function(propDef, i){
      var firstCap = i.charAt(0).toUpperCase() + i.substring(1, i.length);
      if(i != "id" && i != "class"){
        if(!self["get" + firstCap] && !self["set" + firstCap]) {
          var getter = self["get" + firstCap] = function() {
            return self.dijit.attr(i);
          };
          getter._dojoGetter = true;
          var defaultValue = self.dijit.constructor.prototype[i];
          if (defaultValue && typeof defaultValue == 'object') {
            self["getJSON" + firstCap] = function() {
              return '(' + dojo.toJson(self.dijit.attr(i)) + ')';
            };
          }
          self["set" + firstCap] = function(value) {
            self["dijit_" + i] = value;
            self.dijit.attr(i, value);
          };
        }
      }
    });
  };
  var docsInitialized;
  /**
   * Returns the metadata in XML form
   * @param metadataType {String} This can be "prop" for the properties, or "event" for the events
   * @return {jsx3.xml.CDF} The metadata in CDF/XML form
   */
  DojoWidget_prototype.getMetadataXML = function(metadataType){
    if(!docsInitialized){
      docsInitialized = true;
      dojox.lang.docs.init(); // make sure it is initialized
      for(var i = 0, l = objectsMissingDocGetters.length; i < l; i++) {
        setupAccessors(objectsMissingDocGetters[i]);
      }
    }
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
        if (propDef.type == 'object' && propDef.name != 'attributeMap' && propDef.name != 'params') {
          return;
        }
        var firstCap = i.charAt(0).toUpperCase() + i.substring(1, i.length);
        if (self["get" + firstCap]._dojoGetter) {
          var defaultValue = dijitClass.prototype[i];
          var rec = {
            jsxid: i,
            jsxtext: firstCap,
            jsxtip: propDef.description,
            eval: propDef.type == 'string' ? 0 : 1,
            docgetter: typeof defaultValue == "undefined" ? 'getter("' + i + '")' : "get" + firstCap,
            docsetter: typeof defaultValue == "undefined" ? 'setter("' + i + '")' : "set" + firstCap,
            getter: (defaultValue && typeof defaultValue == 'object') ? "getJSON" + firstCap : "get" + firstCap,
            jsxmask: propDef.type == 'boolean' ? "jsxselect" : 
                   /\n/.test(dijitClass.prototype[i]) ? "jsxtextarea" : "jsxtext",
            jsxexecute:'objJSX.set' + firstCap + '(vntValue);'
          };
          var objRecordNode = metadata.insertRecord(rec, "dojo");
          if(propDef.type == 'boolean'){
            // Boolean properties need to have enum elements set up
            // for the property editor
            var objXML = metadata.getXML();
            var trueNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "enum");
            trueNode.setAttribute('jsxid', 'jsx3.Boolean.TRUE');
            trueNode.setAttribute('jsxtext', 'True');
            objRecordNode.appendChild(trueNode);
            var falseNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "enum");
            falseNode.setAttribute('jsxid', 'jsx3.Boolean.FALSE');
            falseNode.setAttribute('jsxtext', 'False');
            objRecordNode.appendChild(falseNode);
          }
        }
      }
      iterateProperties(self, addProperty);
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
