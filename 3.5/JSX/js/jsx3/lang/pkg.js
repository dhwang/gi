/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/** @jsxdoc-category  jsx3.lang */

if (jsx3.lang == null) jsx3.lang = {};

  jsx3.lang.STACK_MAX = 50;

/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {

  /**
   * @param intUp {int}
   * @return {Function}
   */
  jsx3.lang.getCaller = function(intUp) {
    var skip = (intUp != null ? intUp : 0) + 1;
    for (var a = arguments.caller; a != null; a = a.caller) {
      if (--skip >= 0) continue;
      return a.callee;
    }
    return null;
  };
  
  /**
   * @param intUp {int}
   * @return {Array<Function>}
   */
  jsx3.lang.getStack = function(intUp) {
    var stack = [];
    var skip = (intUp != null ? intUp : 0) + 1;
    for (var a = arguments.caller; a != null; a = a.caller) {
      if (--skip >= 0) continue;
      stack[stack.length] = a.callee;
    }
    return stack;
  };

/* @JSC */ } else {
  
  jsx3.lang.getCaller = function(intUp) {
    var skip = (intUp != null ? intUp : 0) + 1;
    for (var a = arguments.callee; a != null; a = a.caller) {
      if (--skip >= 0) continue;
      return a.caller;
    }
    return null;
  };
  
  jsx3.lang.getStack = function(intUp) {
    var stack = [];
    var skip = (intUp != null ? intUp : 0) + 1;
    for (var a = arguments.callee; a != null && stack.length < jsx3.lang.STACK_MAX; a = a.caller) {
      if (--skip >= 0) continue;
      stack[stack.length] = a.caller;
    }
    return stack;
  };

/* @JSC */ }

