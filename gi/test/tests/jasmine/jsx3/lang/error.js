/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
  describe("jsx3.lang.NativeError", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.NativeError", "jsx3.util.jsxpackage");
	var t = new _jasmine_test.TestSuite("jsx3.lang.NativeError");
	
	beforeEach(function(){
		this.addMatchers(gi.test.jasmine.matchers);
	});
	
	it("test initErrorCapture", function(){
		var ex = null;
		expect(ex).toBe(null);
		try{
			var b = jasmine.not.defined.at.all;
		}catch(e){
			ex = jsx3.lang.NativeError.initErrorCapture(e);
		}
		expect(ex).not.toBeNull();
	});
	
	it("test wrap", function(){
		var ex = null;
		try{
			var b = jasmine.not.defined.at.all;
		}catch(e){
			ex = jsx3.lang.NativeError.wrap(e);
		}
		if(ex != null){
			expect(ex).toBeInstanceOf(jsx3.lang.Exception);
			expect(ex).toBeInstanceOf(jsx3.lang.NativeError);
		}
		var e = new jsx3.lang.Exception();
		var wrapped = jsx3.lang.NativeError.wrap(e);
		expect(e).toEqual(wrapped);
		
		var o = {};
		o.toString = function() { return "an object"; };
		wrapped = jsx3.lang.NativeError.wrap(o);
		expect(o.toString()).toEqual(wrapped.getMessage());

		wrapped = jsx3.lang.NativeError.wrap(123);
		expect(wrapped.getMessage()).toEqual("123");
	});
	
	it("test getFileName", function(){
		var ex = null;
		try {
			var b = jasmine.not.defined.at.all;
		}catch (e) {
			ex = new jsx3.lang.NativeError.wrap(e);
			expect(ex).toBeInstanceOf(jsx3.lang.Exception);
		}
		if (ex != null) {
			expect(ex.getFileName()).not.toBeNull();
			//expect(ex.getFileName()).not.toBeDefined();
		}
	});
	
	it("test getLineNumber", function(){
		var ex = null;
		try {
			var b = jasmine.not.defined.at.all;
		}catch (e) {
			ex = jsx3.lang.NativeError.wrap(e);
		}
		if(ex){
			expect(ex.getLineNumber()).not.toBeNull()
		}
	});
});	