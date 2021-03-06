/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.html.DOM", function() {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.html.DOM");
  var t = new _jasmine_test.App("jsx3.html.DOM");

  var dom, testspace;
  var getDOM = function(s) {
    var root = s.getBodyBlock().loadAndCache("data/block.xml");
    return root.getChild(0);
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server.xml", ".", true) : t._server;
    dom = getDOM(t._server);
    testspace = new RegExp("");
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to clear a string of multiple CSS style properties to a DOM element", function() {
    expect(dom.getRendered()).toHaveStyle('width', /100px/);
    expect(dom.getRendered()).toHaveStyle('height', /30px/);
// * @param strCSS {String} string of CSS. One of two variants are supported:  <code>left:10px;height:20px;width:100px;</code>
    jsx3.html.DOM.clearStyles(dom.getRendered(), "width: 100px; height: 30px;");
    expect(dom.getRendered()).toHaveStyle('width', /\s*/);
    expect(dom.getRendered()).toHaveStyle('height', /\s*/);

    jsx3.html.DOM.setStyles(dom.getRendered(), 'backgroundColor: red; width: 200px; height: 50px;');
    expect(dom.getRendered()).toHaveStyle('width', /200px/);
    expect(dom.getRendered()).toHaveStyle('height', /50px/);
//   or  <code>left:;height:;width:;</code>
    jsx3.html.DOM.clearStyles(dom.getRendered(), "width:; height:;");
    expect(dom.getRendered()).toHaveStyle('width', /\s*/);
    expect(dom.getRendered()).toHaveStyle('height', /\s*/);
  });

  it("should be able to apply a single CSS style to a DOM node", function() {
    var bgColor = dom.getRendered().style.backgroundColor;
    if (bgColor.indexOf('#') > -1) {
      expect(bgColor).toEqual('#a29f9f');
    } else {
      expect(bgColor).toEqual('rgb(162, 159, 159)');
    }
    jsx3.html.DOM.setStyle(dom.getRendered(), 'backgroundColor', 'red');
    expect(dom.getRendered()).toHaveStyle('backgroundColor', /red/);
  });

  it("should be able to apply a string of multiple CSS style properties to a DOM element", function() {
    expect(dom.getRendered()).toHaveStyle('width', /100px/);
    expect(dom.getRendered()).toHaveStyle('height', /30px/);
    var bgColor = dom.getRendered().style.backgroundColor;
    if (bgColor.indexOf('#') > -1) {
      expect(bgColor).toEqual('#a29f9f');
    } else {
      expect(bgColor).toEqual('rgb(162, 159, 159)');
    }
    jsx3.html.DOM.setStyles(dom.getRendered(), 'backgroundColor: red; width: 200px; height: 50px;');
    expect(dom.getRendered()).toHaveStyle('width', /200px/);
    expect(dom.getRendered()).toHaveStyle('height', /50px/);
    expect(dom.getRendered()).toHaveStyle('backgroundColor', /red/);
  });

  it("should be able to get the true offset height for the element including: margin, padding, border, and content", function() {
    dom.setMargin("10 10 10 10", true);
    var extendedOffsetHeight = jsx3.html.DOM.getExtendedOffsetHeight(dom.getRendered());
    var domHeight = parseInt(dom.getRendered().offsetHeight) + parseInt(dom.getRendered().style.marginTop) + parseInt(dom.getRendered().style.marginBottom);
    expect(extendedOffsetHeight).toEqual(domHeight);
  });

  it("should be anle to get the true offset width for the element including: margin, padding, border, and content", function() {
    dom.setMargin("10 10 10 10", true);
    var extendedOffsetWidth = jsx3.html.DOM.getExtendedOffsetWidth(dom.getRendered());
    var domWidth = parseInt(dom.getRendered().offsetWidth) + parseInt(dom.getRendered().style.marginTop) + parseInt(dom.getRendered().style.marginBottom);
    expect(extendedOffsetWidth).toEqual(domWidth);
  });

  it("should be able to remove the function, objFn, as the event handler for the given DOM node", function() {
    var bgColor = dom.getRendered().style.backgroundColor;
    if (bgColor.indexOf('#') > -1) {
      expect(bgColor).toEqual('#a29f9f');
    } else {
      expect(bgColor).toEqual('rgb(162, 159, 159)');
    }
    jsx3.html.DOM.removeEventListener(dom.getRendered(), 'onclick', new Function());
    jsx3.html.DOM.removeBridgedEvent(dom.getRendered(), 'onclick', new Function());
    //dom.getRendered().setAttribute('onclick', '');
    dom.getRendered().click();
    //console.log(dom.getRendered())

    bgColor = dom.getRendered().style.backgroundColor;

    if (bgColor.indexOf('#') > -1) {
      expect(bgColor).toEqual('#a29f9f');
    } else if (bgColor.indexOf('rgb') > -1) {
      expect(bgColor).toEqual('rgb(162, 159, 159)');
    }
    expect(bgColor).not.toEqual('red'); // this test was not suppose to trigger after removeEventListener

  });
});