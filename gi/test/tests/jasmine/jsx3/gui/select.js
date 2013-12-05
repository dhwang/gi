/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Select", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Select", "jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");
  var t = new _jasmine_test.App("jsx3.gui.Select");
  var newCDF = function(strURL) {
    return jsx3.xml.CDF.Document.newDocument().load(t.resolveURI(strURL));
  };
  var Select;

  describe('test for regular select', function() {
    var select;

    var getSelect = function(s) {
      var root = s.getBodyBlock().load("data/form_components.xml");
      return root.getChild(0).getServer().getJSXByName('select');
    };
    
    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true) : t._server;
      select = getSelect(t._server);
      if (!Select) {
        Select = jsx3.gui.Select;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to deserialize", function() {
      expect(select).toBeInstanceOf(Select);
    });

    it("should be able to paint", function() {
      expect(select.getRendered()).not.toBeNull();
      expect(select.getRendered().nodeName.toLowerCase()).toEqual("span");
    });

    it("should able to set and get text", function() {
      select.setDefaultText("hello");
      expect(select.getText()).toEqual("hello");
    });

    it("should able to do validate", function() {
      expect(select.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
      select.setValue(2);
      expect(select.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
    });

    it("should able to load new CDF document using setSourceXML() method", function() {
      var cdf = newCDF("data/selectCdf.xml");
      var r = cdf.getRecord('c2');
      expect(select.getText()).toEqual('- Select -')
      select.setSourceXML(cdf);
      select.setValue('c2');
      expect(select.getText()).toEqual(r.jsxtext);
    });

    it("should able to set and get type", function() {
      expect(select.getType()).toEqual(0);
      select.setType(Select.TYPECOMBO);
      expect(select.getType()).toEqual(1);
    });

    it("should able to set and get the value", function() {
      var cdf2 = newCDF("data/countries.xml");
      var r2 = cdf2.getRecord('china');
      select.setSourceXML(cdf2);
      select.setValue('china');
      expect(select.getText()).toEqual(r2.jsxtext);
      var r3= cdf2.getRecord('japan');
      select.setValue('japan');
      expect(select.getText()).toEqual(r3.jsxtext);
      var r4= cdf2.getRecord('Korea');
      select.setValue('Korea');
      expect(select.getText()).toEqual(r4.jsxtext);
      var r5= cdf2.getRecord('French');
      select.setValue('French');
      expect(select.getText()).toEqual(r5.jsxtext);
      var r6= cdf2.getRecord('German');
      select.setValue('German');
      expect(select.getText()).toEqual(r6.jsxtext);
    });

    it("should not select an option using an invalid id", function() {
      select.setValue('invalidid');
      var selectText = select.getRendered().childNodes[0].innerText || select.getRendered().childNodes[0].textContent;
      expect(selectText).toEqual('- Select -');
    });

    it("should able to set and get default text", function() {
      expect(select.getDefaultText()).toEqual("- Select -");
      select.setDefaultText("-City-");
      expect(select.getDefaultText()).toEqual("-City-");
    });

    it("should able to focus", function() {
      expect(select.focus().nodeName.toLowerCase()).toEqual('span');
      expect(select.focus().className).toEqual('jsx30select_select');
    });

    it("should able to load new CDF XML", function() {
      var cdf3 = newCDF("data/countries.xml");
      select.setSourceXML(cdf3);
      select.repaint();
      select.show();
      console.log(jsx3.html.getOuterHTML(select.getRendered()))
      expect(document.getElementById('jsx30curvisibleoptions').childNodes[1].style.backgroundImage).toEqual('url("../JSX/images/menu/scroll_up.gif")');
      expect(document.getElementById('jsx30curvisibleoptions').childNodes[2].style.backgroundImage).toEqual('url("../JSX/images/menu/scroll_down.gif")');
    });

    it("should able to set and get the XSL appropriate to the select type if no custom XSLT is specified", function() {
      var xslURl = select.getXSLURL();
      expect(xslURl).toBeUndefined();
      select.setXSLURL('../JSX/xsl/jsxselect.xsl');
      xslURl = select.getXSLURL();
      expect(xslURl).toEqual('../JSX/xsl/jsxselect.xsl');
    });

    it("should able to set and get the URL to use for the dropdown image", function() {
      var icon = select.getIcon();
      expect(icon).toBeUndefined();
      select.setIcon('JSX/images/icons/v.png');
      select.repaint();
      expect(select.getIcon().toString()).toEqual(select.getServer().resolveURI("JSX/images/icons/v.png").toString());
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe('test for combo-select', function() {
    var select2;

    var getSelect2 = function(s) {
      var root2 = s.getBodyBlock().load("data/select-combo.xml");
      return root2.getChild(0).getServer().getJSXByName('combo');
    };
    beforeEach(function() {
      t._server2 = (!t._server2) ? t.newServer("data/server_combo-select.xml", ".", true) : t._server2;
      select2 = getSelect2(t._server2);
    });

    afterEach(function() {
      if (t._server2)
        t._server2.getBodyBlock().removeChildren();
    });

    it("should be able to deserialize", function() {
      expect(select2).toBeInstanceOf(Select);
    });

    it("should able to set and get type", function() {
      expect(select2.getType()).toEqual(1);
      select2.setType(Select.TYPESELECT);
      expect(select2.getType()).toEqual(0);
    });

    it("should able to focus", function() {
      expect(select2.focus().nodeName.toLowerCase()).toEqual('input');
      expect(select2.focus().className).toEqual('jsx30combo_text');
    });

    it("should able to set and get max length", function() {
      expect(select2.getMaxLength()).toBeNull();
      select2.setMaxLength(200);
      expect(select2.getMaxLength()).toEqual(200);
    });

    it("should not take invalid maxLength value", function() {
      select2.setMaxLength(-200);
      select2.repaint();
      expect(select2.getMaxLength()).toBeNull();
    });

    it("should be able to show and hide the list of options for this select box", function() {
      select2.show();
      expect(document.getElementById('jsx30curvisibleoptions').className).toMatch(/jsx30heavy/);
      select2.hide();
      expect(document.getElementById('jsx30curvisibleoptions')).toBeNull();
    });

    it("should clean up", function() {
      t._server2.destroy();
      t.destroy();
      expect(t._server2.getBodyBlock().getRendered()).toBeNull();
      delete t._server2;
    });
  });
});