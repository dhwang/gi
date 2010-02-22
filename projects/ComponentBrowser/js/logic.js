/* place JavaScript code here */
jsx3.Package.definePackage("tibco.ce", function(ce){
  ce.init = function() {
    this._defaultLocale = this.getLocale();
    this.setView(ce.WELCOME, null, true);
  };

  ce.initFromHash = function(objXML) {
    var hash;
    if (typeof window['dhtmlHistory'] != 'undefined') {
      var self = this;
      window.dhtmlHistory.initialize(function(){
        tibco.ce.historyListener.apply(tibco.ce, arguments);
      });
      hash = window.dhtmlHistory.getCurrentLocation();
    } else {
      dojo.subscribe("/dojo/hashchange", null, function(){
        tibco.ce.historyListener.apply(tibco.ce, arguments);
      });
      hash = dojo.hash();
    }
    if (hash) {
      var toSelect = objXML.selectSingleNode('//record[@jsxid="' + hash + '"]');
      if (toSelect) {
        toSelect.setAttribute('jsxselected', '1');
        while((toSelect = toSelect.getParent()).getAttribute('jsxid') != 'jsxrootnode'){
          toSelect.setAttribute('jsxopen', '1');
        }
      }
      this.historyListener(hash, true);
    }
  };

  ce.historyListener = function(hash, initialize) {
    if (!hash) {
      if(!initialize){
        this.setView(ce.WELCOME);
      }
      return;
    }

    this.setView(ce.LOADING, null, initialize);

    if (!initialize&&!this._selectInTree(hash)) {
      this.setView(ce.WELCOME);
      return;
    }

    var rsURL = this.resolveURI('components/demos/' + hash + '.xml');

    var doc = new Document();
    doc.setAsync(true);

    doc.subscribe('*', this, '_onAsyncDone');
    doc._componentId = hash;
    doc.load(rsURL, 60000);
  };

  var _LOG = jsx3.util.Logger.getLogger("tibco.ce");
  ce.getLog = function() {
    return _LOG;
  };

  ce.WELCOME = 0;
  ce.LOADING = 1;
  ce.COMPONENT = 2;

  ce.setView = function(viewType, title, bDontRepaint) {
    var titleStr, view;
    var header = ce.getJSXByName('paneContentHeader');
    var container = ce.getJSXByName('paneContentContainer');
    var lytContent = ce.getJSXByName('lytContent');

    switch (viewType) {
      case ce.WELCOME:
        titleStr = 'Welcome';
        break;
      case ce.LOADING:
        titleStr = 'Loading Component';
        break;
      case ce.COMPONENT:
        titleStr = title;
        break;
    }

    header.setText(titleStr, !bDontRepaint);
    var selectedIdx = container.getSelectedIndex();

    if (viewType != selectedIdx) {
      container.setSelectedIndex(viewType, !bDontRepaint);
    }
  };

  var Document = jsx3.xml.Document;
  ce._onAsyncDone = function(objEvent) {
    var objXML = objEvent.target;
    var strEvtType = objEvent.subject;
    var componentId = objXML._componentId;

    delete objXML._componentId;
    objXML.unsubscribe("*", this);

    if (strEvtType == Document.ON_RESPONSE) {
      ce.componentLoaded(componentId, objXML);
    } else if (strEvtType == Document.ON_TIMEOUT) {
      ce.componentTimeout(componentId, objXML);
    } else if (strEvtType == Document.ON_ERROR) {
      ce.componentError(componentId, objXML.getError().toString());
    }
  };

  ce.componentSelect = function(tree, componentId) {
    window.location.hash = componentId;
  };

  var _selectedComponentId = null;
  ce.componentLoaded = function(componentId, objXML) {
    if (typeof dhtmlHistory != 'undefined') {
      window.dhtmlHistory.add(componentId);
    }

    var container = ce.getJSXByName('componentViewContainer');
    var root = container.getDescendantOfName('root');
    if (root) {
      container.removeChild(root);
    }

    // better performance to not paint on load since we modify the GI DOM immediately after loading
    var compRoot = container.loadXML(objXML, false);

    root = container.getDescendantOfName('root');
    var desc = root.getDescendantOfName('desc');
    if (desc) {
      desc.setText(root.getMetaValue('description'));
    }
    var name = root.getDescendantOfName('name');
    if (name) {
      name.setText(root.getMetaValue('name'));
    }

    var objXML = this.getCache().getDocument('components');

    var rNode = objXML.selectSingleNode('//record[@jsxid="' + componentId + '"]');

    var name = rNode.getAttribute('jsxtext');
    if (!rNode.getAttribute('jsximg')) {
      name = rNode.getParent().getAttribute('jsxtext');
    }
    
    // make sure all text boxes in the properties column respond to the execute (enter key) event
    compRoot.selectDescendants("#properties jsx3_gui_TextBox").each(function(e) {
      e.setEvent('this.doEvent(jsx3.gui.Interactive.CHANGE, {strVALUE:this.getValue()})', 
          jsx3.gui.Interactive.EXECUTE);
    });
    
    // paint now after modifying the DOM
    container.paintChild(compRoot);

    ce.getJSXByName('sourceView').setText(ce.prettyXML(objXML), true);

    _selectedComponentId = componentId;
    this.setView(ce.COMPONENT, ce._getComponentTitle(rNode));
  };

  ce.componentTimeout = function(componentId) {
    ce.showError("Request timed out", "Timeout");
  };

  ce.componentError = function(componentId, error) {
    ce.showError(error, "Error");
  };

  ce._getComponentTitle = function(compNode) {
    var compParent = compNode.getParent();
    var strName = compNode.getAttribute('jsxtext');
    if (compParent.getAttribute('jsxid') != "jsxrootnode") {
      return ce._getComponentTitle(compParent) + " &raquo; " + strName;
    }

    return strName;
  };

  ce.viewSource = function(sourceContainer) {
    sourceContainer.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
  };

  ce.unViewSource = function(sourceContainer) {
    sourceContainer.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
  };

  var _copy = function(strText) {
    if (window.clipboardData) {
      clipboardData.setData('text',strText);
      return true;
    } else if (window.netscape && netscape.security && netscape.security.PrivilegeManager) {
      //get an instance of the clipboard
      netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
      var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
      if (clip) {
        //make sure clipboard is accessible
        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if (trans) {
          //specify Unicode as the string format
          trans.addDataFlavor('text/unicode');

          //instance a native String
          var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
          str.data = strText;

          //(is this due to unicode double-byte?)
          trans.setTransferData("text/unicode",str,strText.length*2);

          var clipid = Components.interfaces.nsIClipboard;
          clip.setData(trans,null,clipid.kGlobalClipboard);
          return true;
        }
      }
    }

    return false;
  };

  ce.onCopySource = function(sourceView) {
    var elm = sourceView.getRendered();
    var data = elm.textContent || elm.innerText;
    if (!_copy(data)) {
      var w = window.open("about:blank", "CopyCode");
      w.document.write("<html><head><title>Copy Code</title></head><body><pre>" + jsx3.util.strEscapeHTML(data) + "</pre></body></html>");
      w.document.close();
      w.focus();
    }
  };

  ce.onDownloadFile = function() {
    window.open(this.resolveURI('components/demos/' + _selectedComponentId + '.xml'), 'Download');
  };

  ce.onMouseOverSource = function(buttonNode) {
    // This is hooked up in the properties of the view source components
    buttonNode.style.backgroundColor = '#aaaafe';
  };
  ce.onMouseOutSource = function(buttonNode) {
    // This is hooked up in the properties of the view source components
    buttonNode.style.backgroundColor = '#9898a5';
  };

  ce.getErrorDialog = function() {
    var name = "dlgErrors",
        body = this.getServer().getBodyBlock(),
        dialog = body.getChild(name);
    if (!dialog) {
      dialog =  body.load("components/" + name + ".xml");
      dialog.setName(name);
    }
    return dialog;
  };
  ce.showError = function(message, type) {
    var dialog = ce.getErrorDialog();
    dialog.focus();
    if (type) {
      var et = ce.getJSXByName("errorType");
      if (et) {
        et.setText(type, true);
      }
    }
    if (message) {
      var msg = ce.getJSXByName("paneErrorText");
      if (msg) {
        msg.setText(message);
      }
    }
  };
  ce.closeError = function(button) {
    var dialog = ce.getErrorDialog();
    dialog.doClose();
  };

  ce._findMatches = function(children, strSearch) {
    var results = new jsx3.util.List([]);

    while (children.hasNext()) {
      var child = children.next();
      if (child.getAttribute('jsxtext').toLowerCase().indexOf(strSearch) > -1) {
        var childClone = child.cloneNode(true);
        childClone.setAttribute('jsxopen', '1');
        results.add(childClone);
      } else {
        var childIter = child.getChildIterator();
        if (childIter.hasNext()) {
          var childResults = ce._findMatches(childIter, strSearch);
          var iter = childResults.iterator();
          if (iter.hasNext()) {
            var childClone = child.cloneNode(false);
            childClone.setAttribute('jsxopen', '1');
            do {
              var c = iter.next();
              childClone.appendChild(c.cloneNode(true));
            } while (iter.hasNext());
            results.add(childClone);
          }
        }
      }
    }

    return results;
  };

  ce._selectInTree = function(componentId, cacheId) {
    var tree = this.getJSXByName('treeExplorer');
    var cacheId = cacheId||tree.getXMLId();
    var objXML = this.getCache().getDocument(cacheId);
    var oldSelected = objXML.selectSingleNode('//record[@jsxselected="1"]');

    if (componentId) {
      if (oldSelected && oldSelected.getAttribute('jsxid') != componentId) {
        oldSelected.setAttribute('jsxselected', '0');
      }

      // select the component
      var toSelect = objXML.selectSingleNode('//record[@jsxid="' + componentId + '"]');
      if (toSelect) {
        toSelect.setAttribute('jsxselected', '1');
      } else {
        if (cacheId != 'components') {
          var components = this.getCache().getDocument('components');
          if (components.selectSingleNode('//record[@jsxid="' + componentId + '"]')) {
            tree.setXMLId(cacheId);
            tree.repaint();
            return true;
          }
        }
        return false;
      }
    }

    tree.setXMLId(cacheId);
    tree.repaint();

    if (componentId) {
      tree.revealRecord(componentId);
    }

    return true;
  };

  var _searchBlank = true;
  ce.onSearch = function(searchbox) {
    var text = jsx3.util.strTrim(searchbox.getValue());
    var tree = this.getJSXByName('treeExplorer');

    if (_searchBlank) {
      this._selectInTree(_selectedComponentId, 'components');
      return;
    }

    var objXML = this.getCache().getDocument('components');
    var searchDoc = this.getCache().getDocument('search_results_xml');

    if (!searchDoc) {
      searchDoc = (new jsx3.xml.Document()).loadXML('<data jsxid="jsxroot"><record jsxid="jsxrootnode" jsxtext="rootnode" jsxunselectable="1" jsxopen="1"/></data>');
      this.getCache().setDocument('search_results_xml', searchDoc);
    }

    var searchRoot = searchDoc.selectSingleNode('//record[@jsxid="jsxrootnode"]');
    searchRoot.removeChildren();

    var categories = objXML.selectNodeIterator('/data/record/record');
    var searchString = text.toLowerCase();

    while (categories.hasNext()) {
      var category = categories.next();
      var results = ce._findMatches(category.getChildIterator(), searchString);

      if (results.size()) {
        var categoryIter = results.iterator();
        var categoryClone = category.cloneNode(false);
        categoryClone.setAttribute('jsxopen', '1');
        do {
          categoryClone.appendChild(categoryIter.next().cloneNode(true));
        } while (categoryIter.hasNext());
        searchRoot.appendChild(categoryClone);
      }
    }

    tree.setXMLId('search_results_xml');
    tree.repaint();
  };

  ce.onSearchFocus = function (searchbox) {
    var text = jsx3.util.strTrim(searchbox.getValue());
    if (text == "Search") {
      searchbox.setValue("");
    }
    this.onSearchIncChange(searchbox, searchbox.getValue());
    searchbox.setColor('#000000', true);
  };

  ce.onSearchBlur = function (searchbox) {
    var text = jsx3.util.strTrim(searchbox.getValue());
    if (text == "") {
      searchbox.setColor('#b8b8c5', true).setValue("Search");
    }
    this.onSearchIncChange(searchbox, text);
  };

  ce.onSearchClear = function(searchbox) {
    searchbox.setValue("").focus();
    this.onSearch(searchbox);
    this.onSearchIncChange(searchbox, "");
  };

  ce.onSearchIncChange = function(searchbox, value) {
    var clear = this.getJSXByName('search_clear');
    if (value.length) {
      _searchBlank = false;
      if (clear.getDisplay() != jsx3.gui.Block.DISPLAYBLOCK) {
        clear.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
      }
    } else {
      _searchBlank = true;
      clear.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    }
  };

  ce.onComponentViewChanged = function(container, button) {
    var btnDim = button.getDimensions();
    button.setDimensions(
      container.getRendered().offsetWidth - 2 - btnDim[2],
      container.getRendered().offsetHeight - 2 - btnDim[3],
      null,
      null,
      true
    );
  };
  
  ce.prettyXML = function(doc) {
    var XmlTokenizer = tibco.ce.XmlTokenizer;
    var tk = new tibco.ce.XmlTokenizer(doc.toString());
    var join = [];
    var token;
    var lastElm;
    
    while ((token = tk.next()) != null) {
      switch (token.type) {
        case XmlTokenizer.MARKUP:
          join.push('<span class="ts ps">', token.token.replace(/>/g, "&gt;").replace(/</g, "&lt;"), '</span>')
          break;
        case XmlTokenizer.SPACE:
          join.push(token.token);
          break;
        case XmlTokenizer.TAGNAME:
          lastElm = token.token;
          join.push('<span class="ts eln">', token.token, '</span>')
          break;
        case XmlTokenizer.ATTRNAME:
          join.push('<span class="ts ans">', token.token, '</span>')
          break;
        case XmlTokenizer.ATTRVALUE:
          if (lastElm == "events") 
            ; // TODO: format as JS
          join.push('<span class="ts avs">', token.token, '</span>')
          break;
        case XmlTokenizer.TEXT:
          if (lastElm == "onAfterDeserialize") 
            ; // TODO: format as JS
          join.push('<span class="ts tns">', token.token, '</span>')
          break;
      }
    }
    
    return join.join("");
  };
  
});

jsx3.Class.defineClass("tibco.ce.XmlTokenizer", null, null, function(XmlTokenizer, XmlTokenizer_prototype){

  XmlTokenizer.MARKUP = 1;
  XmlTokenizer.SPACE = 2;
  XmlTokenizer.TAGNAME = 3;
  XmlTokenizer.ATTRNAME = 4;
  XmlTokenizer.ATTRVALUE = 5;
  XmlTokenizer.TEXT = 6;
  
  XmlTokenizer_prototype.init = function(xml) {
    this._xml = xml;
    this._l = xml.length;
    this._i = 0;
    this._state = 0;
  };
  
  XmlTokenizer_prototype.next = function() {
    if (this._i >= this._l) return null;
    
    var token, type;
    
    switch (this._state) {
      case 0: // outside
        var nextOpen = this._xml.indexOf("<", this._i);
        if (nextOpen == this._i) {
          if (this._xml.indexOf("</", this._i) == this._i) {
            token = this._xml.substring(this._i, this._i + 2);
            type = XmlTokenizer.MARKUP;
            this._state = "4a";
            this._i += 2;
          } else if (this._xml.indexOf("<![CDATA[", this._i) == this._i) {
            token = this._xml.substring(this._i, this._i + 9);
            type = XmlTokenizer.MARKUP;
            this._state = 5;
            this._i += 9;
          } else {
            token = this._xml.substring(this._i, this._i + 1);
            type = XmlTokenizer.MARKUP;
            this._state = "1a";
            this._i += 1;
          }
        } else if (nextOpen == -1) {
          token = this._xml.substring(this._i);
          type = XmlTokenizer.TEXT;
          this._i = this._l;
        } else {
          token = this._xml.substring(this._i, nextOpen);
          type = XmlTokenizer.TEXT;
          this._i = nextOpen;
        }
        break;
      case "1a": // just inside open tag
        var space = chompSpace(this._xml, this._i);
        if (space) {
          token = space;
          type = XmlTokenizer.SPACE;
          this._i += space.length;
        } else {
          var name = chompName(this._xml, this._i);
          if (name) {
            token = name;
            type = XmlTokenizer.TAGNAME;
            this._state = 1;
            this._i += name.length;
          } else {
            throw new Error("Expected name at char " + this._i);
          }
        }
        break;
      case 1: // inside open tag
        var space = chompSpace(this._xml, this._i);
        if (space) {
          token = space;
          type = XmlTokenizer.SPACE;
          this._i += space.length;
        } else {
          if (this._xml.indexOf("/>", this._i) == this._i) {
            token = this._xml.substring(this._i, this._i + 2);
            type = XmlTokenizer.MARKUP;
            this._state = 0;
            this._i += 2;
          } else if (this._xml.indexOf(">", this._i) == this._i) {
            token = this._xml.substring(this._i, this._i + 1);
            type = XmlTokenizer.MARKUP;
            this._state = 0;
            this._i += 1;
          } else {
            var name = chompName(this._xml, this._i);
            if (name) {
              token = name;
              type = XmlTokenizer.ATTRNAME;
              this._i += name.length;
              this._state = 2;
            } else {
              throw new Error("Expected attr name at char " + this._i);
            }
          }
        }
        break;
      case 2: // after attr name
        var space = chompSpace(this._xml, this._i);
        if (space) {
          token = space;
          type = XmlTokenizer.SPACE;
          this._i += space.length;
        } else if (this._xml.charAt(this._i) == "=") {
          token = this._xml.substring(this._i, this._i + 1);
          type = XmlTokenizer.MARKUP;
          this._state = 3;
          this._i += 1;
        } else {
          throw new Error("Expected = at char " + this._i);
        }
        break;
      case 3: // after attr equals
        var space = chompSpace(this._xml, this._i);
        if (space) {
          token = space;
          type = XmlTokenizer.SPACE;
          this._i += space.length;
        } else if (this._xml.charAt(this._i) == '"') {
          token = this._xml.substring(this._i, this._i + 1);
          type = XmlTokenizer.MARKUP;
          this._state = 6;
          this._i += 1;
        } else {
          throw new Error("Expected = at char " + this._i);
        }
        break;
      case "4a": // just inside close tag
        var space = chompSpace(this._xml, this._i);
        if (space) {
          token = space;
          type = XmlTokenizer.SPACE;
          this._i += space.length;
        } else {
          var name = chompName(this._xml, this._i);
          if (name) {
            token = name;
            type = XmlTokenizer.TAGNAME;
            this._state = 4;
            this._i += name.length;
          } else {
            throw new Error("Expected name at char " + this._i);
          }
        }
        break;
      case 4: // inside close tag
        var space = chompSpace(this._xml, this._i);
        if (space) {
          token = space;
          type = XmlTokenizer.SPACE;
          this._i += space.length;
        } else if (this._xml.charAt(this._i) == ">") {
          token = ">";
          type = XmlTokenizer.MARKUP;
          this._state = 0;
          this._i += 1;
        } else {
          throw new Error("Expected > at char " + this._i);
        }
        break;
      case 5: // inside cdata
        var nextClose = this._xml.indexOf("]]>", this._i);
        if (nextClose >= 0) {
          token = this._xml.substring(this._i, nextClose);
          type = XmlTokenizer.TEXT;
          this._state = 8;
          this._i = nextClose;
        } else {
          throw new Error("No close CDATA after char " + this._i);
        }
        break;
      case 8: // before ]]>
        token = "]]>";
        type = XmlTokenizer.MARKUP;
        this._state = 0;
        this._i += 3;
        break;
      case 6: // after attr open "
        var nextQuote = this._xml.indexOf('"', this._i);
        if (nextQuote >= 0) {
          token = this._xml.substring(this._i, nextQuote);
          type = XmlTokenizer.ATTRVALUE;
          this._state = 7;
          this._i = nextQuote;
        } else {
          throw new Error("No close attribute (\") after char " + this._i);
        }
        break;
      case 7: // after attr close "
        token = '"';
        type = XmlTokenizer.MARKUP;
        this._state = 1;
        this._i += 1;
        break;
    }
    
    return {token:token, type:type};
  };
  
  var chompSpace = function(s, start) {
    var i = start;
    while (s.charAt(i) == " ")
      i++;
    return s.substring(start, i);
  };
  
  var chompName = function(s, start) {
    var i = start;
    while (i < s.length) {
      var c = s.charAt(i);
      if (c == "-" || c == "_" || (c >= "0" && c <= "9") || (c >= "a" && c <= "z") || (c >= "A" && c <= "Z"))
        i++;
      else
        break;
    }
    
    return s.substring(start, i);
  };
  
});
