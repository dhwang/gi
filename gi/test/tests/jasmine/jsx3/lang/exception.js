/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
 describe("jsx3.lang.Exception", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.Exception", "jsx3.util.jsxpackage");
	var t = new _jasmine_test.TestSuite("jsx3.lang.Exception");
	
	beforeEach(function(){
		this.addMatchers(gi.test.jasmine.matchers);
	});
	
	it("test getCause", function(){
		var c = new jsx3.lang.Exception();
		var e = new jsx3.lang.Exception("test getCause", c);
		expect(e.getCause()).toEqual(c);
	});
	
	it("test getMessage", function(){
		var m ="test getMessage";
		var e = new jsx3.lang.Exception(m);
		expect(e.getMessage()).toEqual(m);
	});
	
	it("test getStack", function(){
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
	
	it("test IllegalArgumentException", function(){
		var e = new jsx3.lang.IllegalArgumentException("arg1", null);
		expect(e).toBeInstanceOf(jsx3.lang.Exception);
	});
	
	it("test printStack", function(){
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