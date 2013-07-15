/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
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
	
	it("should return the defined package with name", function(){
		expect(jsx3.lang.Package.forName("test.pckg")).toEqual(test.pckg.jsxpackage);
		expect(jsx3.lang.Package.forName("test.pckg.foo")).toBeNull();
	});
	
	it("should return a list of all defined packages", function(){
		var p = jsx3.lang.Package.getPackages();
		expect(p).toBeInstanceOf(Array);
		expect(p.length>=1).toBeTruthy();
		
		var l = new jsx3.util.List(p);
		expect(l.contains(test.pckg.jsxpackage));
	});
	
	it("should return an array of all the classes defined in this package.", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var c = p.getClasses();
		expect(c.length).toEqual(1);
		expect(c[0]).toEqual(test.pckg.Class.jsxclass);
	});
	
	it("should return the fully-qualified name of this class", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		expect(p.getName()).toEqual("test.pckg");
	});
	
	it("should return the namespace of this package.", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		expect(p.getNamespace()).not.toBeNull();
		expect(p.getNamespace()).toBeDefined();
		expect(p.getNamespace()).toEqual(test.pckg);
	});
	
	it("should return the array of static fields defined for this package.", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var f = p.getStaticFieldNames();
		expect(f.length).toEqual(1);
		expect(f[0]).toEqual("aField");
	});
	
	it("should return the static method defined in this package with name.", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var f = p.getStaticMethod("aMethod");
		expect(f).toBeInstanceOf(jsx3.lang.Method);
	});
	
	it("should return the array of static methods defined for this package.", function(){
		var p = jsx3.lang.Package.forName("test.pckg");
		var f = p.getStaticMethods();
		expect(f.length).toEqual(2);
		expect(f[0]).toEqual(test.pckg.aMethod.jsxmethod)
	});
});