/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
 describe("jsx3.gui.NativeForm", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.gui.NativeForm");
	var t = new _jasmine_test.TestSuite("jsx3.gui.NativeForm");
	
	beforeEach(function () {
    this.addMatchers(gi.test.jasmine.matchers);
		t._server = null;
  });
	var ACTION = _jasmine_test.HTTP_BASE + "/formdata.cgi";
	
	var getForm = function(){
		var s = t._server = t.newServer("data/server1.xml", ".", true);
    var root = s.getBodyBlock().load("data/nativeform.xml");
		return root.getChild(0);
	};
	
	it("should be able to deserialize", function(){
		var form = getForm();
		expect(form).toBeInstanceOf(jsx3.gui.NativeForm);
	});
	
	it("should be able to paint", function(){
		var form = getForm();
		expect(form.getRendered()).not.toBeNull();
		expect(form.getRendered().nodeName.toLowerCase()).toEqual("form");
	});
	
	it("should be able to submit this form", function(){
		var form = getForm();
		form.setAction(form.getUriResolver().relativizeURI(ACTION, true));
		form.subscribe("jsxdata", function(objEvent){
			expect(objEvent.context.type).toEqual("load");
		})
		form.submit();
	});
	
	it("should be able to get the form data", function(){
		var form = getForm();
		form.setAction(form.getUriResolver().relativizeURI(ACTION, true));
		form.subscribe("jsxdata", function(){
			var doc = form.getResponseXML();
			expect(doc.hasError()).toBeFalsy();
			expect(doc.getNodeName()).toEqual("data");
			expect(doc.selectSingleNode("record[@jsxid='select']").getValue()).toEqual("1");
		});
		form.submit();
	});
	
	afterEach(function(){
		if (t._server) {
			if (t._server instanceof Array) {
				for (var i = 0; i < t._server.length; i++)
				t._server[i].destroy();
			} else {
				t._server.destroy();
			}
			delete t._server;
		}
	});
	
 })