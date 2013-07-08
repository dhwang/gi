/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 describe("jsx3.lang.Object", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.Object","jsx3.lang.Class");
	var t = new _jasmine_test.TestSuite("jsx3.lang.Object");
	
	beforeEach(function(){
		this.addMatchers(gi.test.jasmine.matchers);
	});
	
	it("test Defined", function(){
		expect(jsx3).not.toBeNull();
		expect(jsx3.lang).not.toBeNull();
		expect(jsx3.lang.Object).not.toBeNull();
		expect(jsx3.lang.Object).toBeInstanceOf(Function);
	});
	
	it("test equals", function(){
		var o = new jsx3.lang.Object();
		expect(o.equals(o)).toBeTruthy();
		expect(o.equals(1)).toBeFalsy();
		expect(o.equals(true)).toBeFalsy();
		expect(o.equals(null)).toBeFalsy();
		expect(o.equals(new jsx3.lang.Object())).toBeFalsy();
		
		var o1 =new jsx3.lang.Object();
		o1.toString = function(){
			return "o";
		}
		
		var o2 = new jsx3.lang.Object();
		o2.toString = function(){
			return "o";
		}
		expect(o1.equals(o2)).toBeFalsy();
		expect(o1.equals("o")).toBeFalsy();
	});
	
	it("test getClass", function(){
		var o = new jsx3.lang.Object();
		expect(o.getClass()).toEqual(jsx3.lang.Object.jsxclass);
	});
	
	it("test Clone", function(){
		var o = new jsx3.lang.Object();
		o.field = "value";
		var o2 = o.clone();
		expect(o.field).toEqual(o2.field);
		expect(o.equals(o2)).toBeFalsy();
		expect(o2).toBeInstanceOf(jsx3.lang.Object);
	});
	
	it("test instanceOf", function(){
		var o = new jsx3.lang.Object();
		expect(o.instanceOf(jsx3.lang.Object)).toBeTruthy();
		expect(o.instanceOf("jsx3.lang.Object")).toBeTruthy();
		expect(o.instanceOf(jsx3.lang.Object.jsxclass)).toBeTruthy();
		expect(o.instanceOf(Object)).toBeTruthy();
		expect(o.instanceOf(jsx3.lang.Class)).toBeFalsy();
	});
	
	it("test eval", function(){
		var o = new jsx3.lang.Object();
		o.field = "value";
		expect(o.eval("this.field")).toEqual(o.field);
		expect(o.eval("a",{a:3})).toEqual(3);
		expect(function(){
			o.eval("not.toBeDefined");
		}).toThrow();
	});
 });