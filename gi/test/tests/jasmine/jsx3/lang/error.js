/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
  describe("jsx3.lang.NativeError;The NativeError class is used for wrap the browser-native exception.", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.NativeError", "jsx3.util.jsxpackage");

	it("should be able to initialize error trapping mechanism", function(){
		var ex = null;
		expect(ex).toBe(null);
		try{
			var b = jasmine.not.defined.at.all;
		}catch(e){
			ex = jsx3.lang.NativeError.initErrorCapture(e);
		}
		expect(ex).not.toBeNull();
	});
	
	it("should be able to wraps a native browser exception in an instance of NativeError.", function(){
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
  
	if (!_jasmine_test.IE && !_jasmine_test.SAF)
	it("should be able to return the URL of the Javascript include where this error was raised.", function(){
		var ex = null;
		try {
			var b = jasmine.not.defined.at.all;
		}catch (e) {
			ex = new jsx3.lang.NativeError.wrap(e);
			expect(ex).toBeInstanceOf(jsx3.lang.Exception);
		}
		if (ex != null) {
			expect(ex.getFileName().match("error.js")).not.toBeNull();
			expect(ex.getFileName()).not.toBeNull();
		}
	});
	
  if (!_jasmine_test.IE && !_jasmine_test.SAF)
	it("should be able to return the line number in the javascript include where this error was raised.", function(){
		var ex = null;
		try {
			var b = jasmine.fun();
		}catch (e) {
			ex = jsx3.lang.NativeError.wrap(e);
		}
		if(ex){
			expect(ex.getLineNumber()).not.toBeNull()
			expect(ex.getLineNumber()).toEqual(64);
		}
	});
	
});	