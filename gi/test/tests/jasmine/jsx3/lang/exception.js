/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
 describe("jsx3.lang.Exception", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.Exception", "jsx3.util.jsxpackage");

	it("should be able to return the cause of the exception", function(){
		var c = new jsx3.lang.Exception();
		var e = new jsx3.lang.Exception("test getCause", c);
		expect(e.getCause()).toEqual(c);
	});
	
	it("should be able to return the description of the exception.", function(){
		var m ="test getMessage";
		var e = new jsx3.lang.Exception(m);
		expect(e.getMessage()).toEqual(m);
	});
	
	it("should be able to return the complete call stack from when exception was instantiated as an array of function", function(){
		var a = function(){throw new jsx3.lang.Exception("test getStack");}
		var b = function(){ a(); };
		var c = function(){ b();};
		try{
			c();
		}catch(ex){
			e =ex;
		}
		expect(e).toBeInstanceOf(jsx3.lang.Exception);
		var s = e.getStack();
		expect(s).toBeInstanceOf(Array);
		expect(s.length>=4).toBeTruthy;
		expect(s[0]).toEqual(a);
		expect(s[1]).toEqual(b);
		expect(s[2]).toEqual(c);
	});
	
	it("should be able to create a special exception type to throw when the caller of a function doesn't pass arguments arrording to the method's contract.", function(){
		var e = new jsx3.lang.IllegalArgumentException("arg1", null);
		expect(e).toBeInstanceOf(jsx3.lang.Exception);
	});
	
	it("should be able to return a  string representation of the call stack.", function(){
		var a = function(a,b,c) { throw new jsx3.lang.Exception("test exception"); };
		function b(y,z) { a(); }
		var c = function() { b(); };

		var e = null;
		try {
			c();
		} catch (ex) {
			e = ex;
		}
	});
	
 });