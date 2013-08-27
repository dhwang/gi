/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
 describe("jsx3.lang.AOP;The AOP class allows aspect oriented programming technique such as wrapping existing function in before call and after call code execution", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.AOP");
	
	it("should be able to instantiate AOP", function(){
		expect(jsx3).not.toBeNull();
		expect(jsx3.lang).not.toBeNull();
		expect(jsx3.lang.AOP).not.toBeNull();
	});
	
	it("has method pc() that creates a new pointcut", function(){
		var c1 = false, c2 = false, c3 = false;
    
		jsx3.lang.Class.defineClass("test.C1", null, null, function(C, P){
			P.m = function() {
				c1 = true;
			};
		});

		jsx3.lang.Class.defineClass("test.C2", test.C1, null, function(C, P){
			P.m = function() {
				c2 = true;
			};
		});
		
		jsx3.lang.AOP.pc("testSubclass", {classes:"test.C2", methods:"m"});
    
    (new test.C2()).m();
		expect(c1).toBeFalsy();
		expect(c2).toBeTruthy();
		
		jsx3.lang.AOP.pcrem("testSubclass");
		delete test.C1;
		delete test.C2;
	});
  	
	it("has method before() that add advice before any call to an instance method of a GI class", function(){
		var c1 = false, c2 = false;
		jsx3.lang.Class.defineClass("test.AOP", null,null ,function(C,P){
			P.m = function(){
				expect(c2).toBeTruthy();
				c1 = true;
			}
		});
   
		jsx3.lang.AOP.pc("testBefore", {classes:"test.AOP", methods:"m"});
		jsx3.lang.AOP.before("testBefore",function(){
			expect(c1).toBeFalsy();
			c2 = true;
		});
		
		(new test.AOP()).m();
		
		expect(c1).toBeTruthy();
		expect(c2).toBeTruthy();
		
		jsx3.lang.AOP.pcrem("testBefore");
		delete test.AOP;
	});
	
	it("has method after() that add advice after any call to an instance method of a GI class", function(){
		var c1 = false, c2 = false;
		expect(test.AOP).not.toBeDefined();
		jsx3.lang.Class.defineClass("test.AOP", null, null, function(C,P){
			P.m = function(){
				expect(c2).toBeFalsy();
				c1 = true;
				return 10;
			};
		});
		
		jsx3.lang.AOP.pc("testAfter",{classes:"test.AOP", methods:"m"});
		
		jsx3.lang.AOP.after("testAfter", function(rv){
			expect(c1).toBeTruthy();
			expect(rv).toEqual(10);
			c2 = true;
			return 20;
		});
		
		var v = (new test.AOP()).m();
		expect(c1).toBeTruthy();
		expect(c2).toBeTruthy();
		expect(v).toEqual(10);
		
		jsx3.lang.AOP.pcrem("testAfter");
		delete test.AOP;
	});
	
	it("has method around() that add advice around any call to an instance method of a GI class", function(){
		jsx3.lang.Class.defineClass("test.AOP",null, null, function(C, P){
			P.m = function(a, b){
				expect(a).toEqual(1);
				expect(b).toEqual(5);
				return 10;
			}
		});
		jsx3.lang.AOP.pc("testAround", {classes:"test.AOP", methods:"m"});
		jsx3.lang.AOP.around("testAround", function(aop, a, b) {
			expect(a).toEqual(1);
			expect(b).toEqual(2);
			var rv = aop.proceed(a, 5);
      //call an instance method
			expect(rv).toEqual(10);
			return 20;
		});

		var v = (new test.AOP()).m(1, 2);
		expect(v).toEqual(20);
		
		jsx3.lang.AOP.pcrem("testAround");
		delete test.C1;
	});
 });