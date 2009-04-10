/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.NumberFormat", function(t, jsunit) {

  jsunit.require("jsx3.util.NumberFormat");

  t.testFactory = function() {
    var f = jsx3.util.NumberFormat.getIntegerInstance();
    jsunit.assertInstanceOf(f, jsx3.util.NumberFormat);
    f = jsx3.util.NumberFormat.getNumberInstance();
    jsunit.assertInstanceOf(f, jsx3.util.NumberFormat);
    f = jsx3.util.NumberFormat.getCurrencyInstance();
    jsunit.assertInstanceOf(f, jsx3.util.NumberFormat);
    f = jsx3.util.NumberFormat.getPercentInstance();
    jsunit.assertInstanceOf(f, jsx3.util.NumberFormat);
  };

  t.testNaN = function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    jsunit.assertEquals("NaN", f.format(Number.NaN));
  };

  t.testInfinity = function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    jsunit.assertEquals("\u221E", f.format(Number.POSITIVE_INFINITY));
    jsunit.assertEquals("-\u221E", f.format(Number.NEGATIVE_INFINITY));
  };

  t.testMaxIntDigit = function() {
    var f = new jsx3.util.NumberFormat("###0", jsx3.util.Locale.US);
    jsunit.assertEquals("1", f.format(1));
    jsunit.assertEquals("10", f.format(10));
    jsunit.assertEquals("100", f.format(100));
    jsunit.assertEquals("1000", f.format(1000));
    jsunit.assertEquals("10000", f.format(10000)); // no max
  };

  t.testMinIntDigit = function() {
    var f = new jsx3.util.NumberFormat("0000", jsx3.util.Locale.US);
    jsunit.assertEquals("0001", f.format(1));
    jsunit.assertEquals("0010", f.format(10));
    jsunit.assertEquals("0100", f.format(100));
    jsunit.assertEquals("1000", f.format(1000));
    jsunit.assertEquals("10000", f.format(10000));
  };

  t.testMaxDecDigit = function() {
    var f = new jsx3.util.NumberFormat("0.0##", jsx3.util.Locale.US);
    jsunit.assertEquals("1.1", f.format(1.1));
    jsunit.assertEquals("1.1", f.format(1.100));
    jsunit.assertEquals("1.11", f.format(1.11));
    jsunit.assertEquals("1.111", f.format(1.111));
    jsunit.assertEquals("1.111", f.format(1.1111));
    jsunit.assertEquals("1.112", f.format(1.1115));
  };

  t.testMinDecDigit = function() {
    var f = new jsx3.util.NumberFormat("0.00##", jsx3.util.Locale.US);
    jsunit.assertEquals("1.00", f.format(1));
    jsunit.assertEquals("1.0001", f.format(1.0001));
    jsunit.assertEquals("1.10", f.format(1.1));
    jsunit.assertEquals("1.15", f.format(1.15));
    jsunit.assertEquals("1.155", f.format(1.155));
  };

  t.testPercent = function() {
    var f = new jsx3.util.NumberFormat("0%", jsx3.util.Locale.US);
    jsunit.assertEquals("1%", f.format(.01));
    jsunit.assertEquals("1%", f.format(.011));
    jsunit.assertEquals("2%", f.format(.015));
    jsunit.assertEquals("15%", f.format(.15));
    jsunit.assertEquals("100%", f.format(.997));
    jsunit.assertEquals("1000%", f.format(10));
  };

  t.testCurrency = function() {
    var f = new jsx3.util.NumberFormat("$0.00", jsx3.util.Locale.US);
    jsunit.assertEquals("$1.00", f.format(1));
    jsunit.assertEquals("$1.50", f.format(1.5));
    jsunit.assertEquals("-$1.12", f.format(-1.119));
  };

  t.testPrefix = function() {
    var f = new jsx3.util.NumberFormat("'#'0", jsx3.util.Locale.US);
    jsunit.assertEquals("#0", f.format(0));
    jsunit.assertEquals("-#1", f.format(-1));
    f = new jsx3.util.NumberFormat("-'#'0", jsx3.util.Locale.US);
    jsunit.assertEquals("--#1", f.format(-1));
    f = new jsx3.util.NumberFormat("''00", jsx3.util.Locale.US);
    jsunit.assertEquals("'01", f.format(1));
  };

  t.testSuffix = function() {
    var f = new jsx3.util.NumberFormat("0'.#'", jsx3.util.Locale.US);
    jsunit.assertEquals("1.#", f.format(1));
    f = new jsx3.util.NumberFormat("0a000", jsx3.util.Locale.US);
    jsunit.assertEquals("1a000", f.format(1));
    f = new jsx3.util.NumberFormat("'-'0'-'", jsx3.util.Locale.US);
    jsunit.assertEquals("-1-", f.format(1));
  };

  t.testNegative = function() {
    var f = new jsx3.util.NumberFormat("0;(0)", jsx3.util.Locale.US);
    jsunit.assertEquals("1", f.format(1));
    jsunit.assertEquals("(1)", f.format(-1));
    f = new jsx3.util.NumberFormat("-0", jsx3.util.Locale.US);
    jsunit.assertEquals("-1", f.format(1));
    jsunit.assertEquals("--1", f.format(-1));
  };

  t.testGrouping = function() {
    var f = new jsx3.util.NumberFormat("#,###", jsx3.util.Locale.US);
    jsunit.assertEquals("1", f.format(1));
    jsunit.assertEquals("10", f.format(10));
    jsunit.assertEquals("100", f.format(100));
    jsunit.assertEquals("1,000", f.format(1000));
    jsunit.assertEquals("10,000", f.format(10000));
    jsunit.assertEquals("1,000,000", f.format(1000000));
    f = new jsx3.util.NumberFormat("##,##.000", jsx3.util.Locale.US);
    jsunit.assertEquals("1,00.000", f.format(100));
  };

  t.testDecimalPlace = function() {
    var f = new jsx3.util.NumberFormat("0", jsx3.util.Locale.US);
    jsunit.assertEquals("1", f.format(1));
    jsunit.assertEquals("1", f.format(1.4));
    f = new jsx3.util.NumberFormat("0.", jsx3.util.Locale.US);
    jsunit.assertEquals("2.", f.format(2));
    jsunit.assertEquals("2.", f.format(2.4));
    f = new jsx3.util.NumberFormat("0.#", jsx3.util.Locale.US);
    jsunit.assertEquals("3", f.format(3));
    jsunit.assertEquals("3.4", f.format(3.4));
  };

  t.testNineBug = function() {
    var nf = new jsx3.util.NumberFormat ('0.00');
    jsunit.assertEquals("99999.10", nf.format(99999.10));
    jsunit.assertEquals("99991.10", nf.format(99991.1));
    jsunit.assertEquals("9999.10", nf.format(9999.1));
    jsunit.assertEquals("89999999.10", nf.format(89999999.10));
  };

  t.testErrors = function() {
    jsunit.assertThrows(function(){
      return new jsx3.util.NumberFormat();
    });
    jsunit.assertThrows(function(){
      return new jsx3.util.NumberFormat("");
    });
    jsunit.assertThrows(function(){
      return new jsx3.util.NumberFormat("-%");
    });
    jsunit.assertThrows(function(){
      return new jsx3.util.NumberFormat("0.000,000");
    });
  };

});
