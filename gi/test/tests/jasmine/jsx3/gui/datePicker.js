/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.DatePicker", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.DatePicker");
  var t = new _jasmine_test.App("jsx3.gui.DatePicker");
  var datePicker;
  var DatePicker;

  var getDatePicker = function(s){
    var root = s.getBodyBlock().load("data/datePicker.xml");
    return root.getServer().getJSXByName('datePicker');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_datePicker.xml", ".", true): t._server;
    datePicker = getDatePicker(t._server);
    if(!DatePicker) {
      DatePicker = jsx3.gui.DatePicker;
    }

    DatePicker.prototype.allowDate = function(y,m,d) {
      if(y > 2000) {
        return true;
      } else {
        return false;
      }
    }
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to instance", function(){
    expect(datePicker).toBeInstanceOf(DatePicker);
  });

  it("should be able to paint", function(){
    expect(datePicker.getRendered()).not.toBeNull();
    expect(datePicker.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should able to do validate", function(){
    expect(datePicker.doValidate()).toEqual(1);
    datePicker.setRequired(jsx3.gui.Form.REQUIRED);
    expect(datePicker.doValidate()).toEqual(0);
    var d = new Date('January 6, 2013');
    datePicker.setDate(d);
    expect(datePicker.doValidate()).toEqual(1);
  }); 

  it("should able to overridden on an instance of a DatePicker to control which dates are selectable in the calendar popup", function() {
    expect(datePicker.allowDate(1914, 4, 1)).toBeFalsy();
    expect(datePicker.allowDate(2014, 4, 1)).toBeTruthy();
  });

  it("should able to set and get the date value of this form field", function() {
    var date = datePicker.getDate();
    expect(date).toBeNull();
    var d = new Date('January 6, 2013');
    datePicker.setDate(d);
    date = datePicker.getDate();
    expect(date).toEqual(d);
  });

  it("should throw exception on setting invalid date value", function() {
    datePicker.setValue("Mar 1, 1999");
    datePicker.repaint();
    expect(datePicker.getValue()).toEqual("Mar 1, 1999");
    // expect(datePicker.setValue("1999")).toThrow(jsx3.lang.Exception);
  });

  it("should abe to set and get the text label to show in this date picker when no date is selected", function() {
    var defaultText = datePicker.getDefaultText();
    expect(defaultText).toBeUndefined();
    datePicker.setDefaultText('MMM d, yyyy');
    defaultText = datePicker.getDefaultText();
    expect(defaultText).toEqual('MMM d, yyyy');
    expect(datePicker.getValue()).toEqual(defaultText);
    datePicker.setValue('');
    datePicker.repaint();
    expect(datePicker.getValue()).toEqual(defaultText);
  });

  it("should able to and get the jsxfirstweekday field", function() {
    var weekStart = datePicker.getFirstDayOfWeek();
    expect(weekStart).toEqual(DatePicker.DEFAULT_WEEK_START);
    datePicker.focusCalendar();
    expect(document.querySelectorAll('.jsx3_dp_month th')[0].textContent).toEqual('S');
    expect(document.querySelectorAll('.jsx3_dp_month th')[1].textContent).toEqual('M');
  });

  it("should able to set the jsxfirstweekday field", function() {
    datePicker.setFirstDayOfWeek(1);
    weekStart = datePicker.getFirstDayOfWeek();
    expect(weekStart).toEqual(1);
    datePicker.focusCalendar();
    expect(document.querySelectorAll('.jsx3_dp_month th')[0].textContent).toEqual('M');
    expect(document.querySelectorAll('.jsx3_dp_month th')[1].textContent).toEqual('T');
  });

  it("should able to set and get the format of this date picker", function() {
    var format = datePicker.getFormat();
    expect(format).toEqual(0);
    datePicker.setFormat('M/d/yyyy'); 
    format = datePicker.getFormat();
    expect(format).toEqual('M/d/yyyy');
    datePicker.setValue("1/1/1970");
    datePicker.repaint();
    var value = datePicker.getValue();
    expect(value).toEqual('1/1/1970');
  });

  it("should able to set and get the value of this date picker", function() {
    var value = datePicker.getValue();
    expect(value).toEqual('MMM d, yyyy');
    datePicker.setValue("Jan 1, 1970");
    datePicker.repaint();
    value = datePicker.getValue();
    expect(value).toEqual('Jan 1, 1970');
  });

  it("should not take invalide date value", function() {
    var value = datePicker.getValue();
    datePicker.setValue(Math.NaN);
    datePicker.repaint();
    expect(value).toEqual('MMM d, yyyy');
    datePicker.setValue(-1);
    datePicker.repaint();
    value = datePicker.getValue();
    expect(value).toEqual('Jan 1, 1970');
  });

  it("should able to show the calendar for this date picker", function() {
    var dpcalendar = function(objJSX) { return document.getElementById( "jsxDatePicker" + objJSX.getId()); }
    expect(dpcalendar(datePicker)).toBeNull();
    datePicker.focusCalendar();
    expect(dpcalendar(datePicker)).toBeDefined();
    expect(dpcalendar(datePicker).className).toMatch(/jsx30heavy/);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});
