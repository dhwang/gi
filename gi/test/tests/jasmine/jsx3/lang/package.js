/*
 * Copyright (c) 2001-2011, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.lang.Package", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.util.jsxpackage", "jsx3.lang.Package", "jsx3.util.List");
	var t = new _jasmine_test.TestSuite("jsx3.lang.Package");
	
	beforeEach(function(){
		this.addMatchers(gi.test.jasmine.matchers);
		jsx3.lang.Package.definePackage("test.pckg", function(P) {
			P.aField = 1;
			//P.sMethod = function(){return "static Method";}
			P.aMethod = function() {};
		});
		jsx3.lang.Class.defineClass("test.pckg.Class", null, null, function(C, P) {
		});
	});
	
	it("test forName", function(){
		expect(jsx3.lang.Package.forName("test.pckg")).toEqual(test.pckg.jsxpackage);
		expect(jsx3.lang.Package.forName("test.pckg.foo")).toBeNull();
	});
	
	it("test getPackages", function(){
		var p = jsx3.lang.Package.getPackages();
		expect(p).toBeInstanceOf(Array);
		expect(p.length>=1).toBeTruthy();
		
		var l = new jsx3.util.List(p);
		expect(l.contains(test.pckg.jsxpackage));
	});
	
	it("test getClasses", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var c = p.getClasses();
		expect(c.length).toEqual(1);
		expect(c[0]).toEqual(test.pckg.Class.jsxclass);
	});
	
	it("test getName", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		expect(p.getName()).toEqual("test.pckg");
	});
	
	it("test getNamespace", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		expect(p.getNamespace()).not.toBeNull();
		expect(p.getNamespace()).toBeDefined();
		expect(p.getNamespace()).toEqual(test.pckg);
	});
	
	it("test getStaticFieldnames", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var f = p.getStaticFieldNames();
		expect(f.length).toEqual(1);
		expect(f[0]).toEqual("aField");
	});
	
	it("test getStaticMethod", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var f = p.getStaticMethod("aMethod");
		expect(f).toBeInstanceOf(jsx3.lang.Method);
	});
	
	it("test getStaticMethods", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var f = p.getStaticMethods();
		expect(f.length).toEqual(2);
		expect(f[0]).toEqual(test.pckg.aMethod.jsxmethod)
	});
});