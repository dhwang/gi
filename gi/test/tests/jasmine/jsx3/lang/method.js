/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
 describe("jsx3.lang.Method", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.Method","jsx3.lang.Class", "jsx3.lang.Exception", "jsx3.util.jsxpackage");
	var t = new _jasmine_test.TestSuite("jsx3.lang.Method");
	
	beforeEach(function(){
		this.addMatchers(gi.test.jasmine.matchers);
		jsx3.lang.Class.defineClass("test.jsx3Method", null, null, function(C, P){
			P.init = function() {};
			P.function1 = function(arg1, arg2, arg3) { return this.getValue() + arg1 + arg2; };
			P.getValue = function() { return this.value; };
			P.abstractFunction = jsx3.lang.Method.newAbstract("arg1", "arg2");
			C.staticFunction = function(arg1) { return arg1 * 2; };
		});
	});
	
	it("test Defined", function(){
		expect(jsx3).not.toBeNull();
		expect(jsx3.lang).not.toBeNull();
		expect(jsx3.lang.Method).not.toBeNull();
	});
	
	it("test New", function(){
		expect(function(){
			return new jsx3.lang.Method();
		}).toThrow();
	});
	
	it("test MetaData", function(){
		expect(test.jsx3Method.prototype.function1.jsxmethod).toBeInstanceOf(jsx3.lang.Method);
	});
	
	it("test name", function(){
		expect(test.jsx3Method.prototype.function1.jsxmethod.getName()).toEqual("function1");
	});
	
	it("test Params", function(){
		var m = test.jsx3Method.prototype.function1.jsxmethod;
		expect(m.getArity()).toEqual(3);
		var params = m.getParameterNames();
		expect(params.length).toEqual(3);
		expect(params[0]).toEqual("arg1");
		expect(params[1]).toEqual("arg2");
		expect(params[2]).toEqual("arg3");
	});
	
	it("test getDeclaringClass", function(){
		var m = test.jsx3Method.prototype.function1.jsxmethod;
		var jclass = m.getDeclaringClass();
		expect(jclass).toEqual(test.jsx3Method.jsxclass);
		expect(m.isPackageMethod()).toBeFalsy();
	});
	
	it("test isStatic", function(){
		var m1 = test.jsx3Method.prototype.function1.jsxmethod;
		var m2 = test.jsx3Method.staticFunction.jsxmethod;
		expect(m1.isStatic()).toBeFalsy();
		expect(m2.isStatic()).toBeTruthy();
	});
	
	it("test isAbstract", function(){
		var m = test.jsx3Method.prototype.abstractFunction.jsxmethod;
		expect(test.jsx3Method.prototype.function1.jsxmethod.isAbstract()).toBeFalsy();
		expect(test.jsx3Method.staticFunction.jsxmethod.isAbstract()).toBeFalsy();
		expect(m.isAbstract()).toBeTruthy();
		var params = m.getParameterNames();
		expect(params.length).toEqual(2);
		expect(params[0]).toEqual("arg1");
		expect(params[1]).toEqual("arg2");
		var o= new test.jsx3Method();
		expect(function(){
			o.abstractFunction();
		}).toThrow();
	});
	
	it("test getFunction", function(){
		expect(test.jsx3Method.prototype.function1.jsxmethod.getFunction()).toEqual(test.jsx3Method.prototype.function1);
		expect(test.jsx3Method.staticFunction.jsxmethod.getFunction()).toEqual(test.jsx3Method.staticFunction);
	});
	
	it("test call", function(){
		var o = new test.jsx3Method();
		o.value = 10;
		var m = test.jsx3Method.prototype.function1.jsxmethod;
		expect(m.apply(o, [7,11,3])).toEqual(28);
		expect(m.call(o, 7, 11, 3)).toEqual(28);
		expect(function(){
			m.apply(null, [7,11,3]);
		}).toThrow();
		expect(function(){
			m.call(null, 7, 11, 3);
		}).toThrow();
		
	});
	
	afterEach(function(){
		delete test.jsx3Method.jsxclass;
		delete test.jsx3Method;
	});
 });