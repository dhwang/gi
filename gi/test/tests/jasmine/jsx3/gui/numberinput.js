/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.NumberInput", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.NumberInput");

  beforeEach(function () {
    this.addMatchers(gi.test.jasmine.matchers);
  });

  it("has method parseValue() to parse input number", function(){
    var nin = new jsx3.gui.NumberInput();
    nin.setFormat("#,##0.00");
    expect(nin.parseValue("1,234.56")).toEqual(1234.56);
  });

  it("has method formatValue() to format the value before displaying it in the onscreen input box.", function(){
    var nin = new jsx3.gui.NumberInput();
    expect(nin.formatValue(1234.56)).toEqual("1,234.56");
  });

  it("will use the default number format (US) when bad format is specified by setFormat()", function(){
    var nin = new jsx3.gui.NumberInput();
    nin.setFormat("NaN");//bad format;
    expect(nin.parseValue("1,234.56")).toEqual(1234.56);
    expect(nin.formatValue(1234.56)).toEqual("1,234.56");
  });

});