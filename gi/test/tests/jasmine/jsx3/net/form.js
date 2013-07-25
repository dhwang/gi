/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.Form", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.Form");
  var t = new _jasmine_test.TestSuite("jsx3.net.Form");
  var ACTION = jasmine.HTTP_BASE + "/formdata.cgi";

  beforeEach(function () {
    this.addMatchers(gi.test.jasmine.matchers);
    t._server = null;
  });

  it("should return the HTTP method of this form.", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    try {
      expect(jsx3.net.Form.METHOD_POST).toEqual(f.getMethod());
    } finally {
      f.destroy();
    }
  });

  it("should return the action of this form, the URL that this form is submitted to", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    try {
      expect(jsx3.$S(f.getAction()).endsWith("formdata.cgi")).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should test if this form is multipart: if it can upload files", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, true);
    try {
      expect(f.getMultipart()).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should set the method of this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, "", false);
    try {
      expect(jsx3.net.Form.METHOD_POST).toEqual(f.getMethod())
      f.setMethod(jsx3.net.Form.METHOD_GET);
      expect(jsx3.net.Form.METHOD_GET).toEqual(f.getMethod())
    } finally {
      f.destroy();
    }
  });

  it("should test  the action of this form, the URL that this form is submitted to", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "#", false);
    try {
      f.setAction(ACTION);
      expect(jsx3.$S(f.getAction()).endsWith("formdata.cgi")).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the form as multipart", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      expect(f.getMultipart()).toBeFalsy();
      f.setMultipart(true);
      expect(f.getMultipart()).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should reveal and hide the IFRAME containing this form after it has been shown by calling reveal()", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.reveal();
      f.conceal();
    } finally {
      f.destroy();
    }
  });

  it("should test  the value of a field in this form.", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      expect(f.getField("field")).toBeNull();
    } finally {
      f.destroy();
    }
  });

  it("should be able to set  the value of a field in this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value");
      expect(f.getField("field")).toEqual("value");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form and then override the same", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1");
      expect(f.getField("field")).toEqual("value1");
      f.setField("field", "value2");
      expect(f.getField("field")).toEqual("value2");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form and then append another value", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      expect(f.getField("field")).toEqual("value1");
      f.setField("field", "value2", true);
      expect(f.getField("field")).toEqual("value1 value2");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to null", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1");
      expect(f.getField("field")).toEqual("value1");
      f.setField("field", null);
      expect(f.getField("field")).toEqual("");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to whitespace", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "   value   ";
    try {
      f.setField("field", value);
      expect(f.getField("field")).toEqual(value)
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to a tab", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\tvalue\t\t";
    try {
      f.setField("field", value);
      expect(f.getField("field")).toEqual(value)
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to a line break", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\nvalue\n\n";
    try {
      f.setField("field", value);
      expect(f.getField("field").replace(/\r\n/g, "\n")).toEqual(value)
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to two linebreaks", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\r\nvalue\r\n\r\n";
    try {
      f.setField("field", value);
      expect(f.getField("field").replace(/\r\n/g, "\n")).toEqual("\nvalue\n\n")
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to utf8", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\u3CC4";
    try {
      f.setField("field", value);
      expect(f.getField("field")).toEqual(value)
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form  and then remove the same", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      expect(f.getField("field")).toEqual("value1")
      f.removeField("field");
      expect(f.getField("field")).toBeNull();
    } finally {
      f.destroy();
    }
  });

  it("should add a file upload field to this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      expect(f.getField("file")).not.toBeNull();
    } finally {
      f.destroy();
    }
  });

  it("should test for a duplicate file upload field to this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      var func = function () {
        f.addFileUploadField("file");
      };
      expect(func).toThrow();
    } finally {
      f.destroy();
    }
  });

  it("should create a new form and initialize it from the HTML representation of a GET form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"></form>');
    try {
      expect(jsx3.net.Form.METHOD_GET).toEqual(f.getMethod())
    } finally {
      f.destroy();
    }
  });

  it("should create a new form and initialize it from the HTML representation of a POST form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form method="POST" action="#"></form>');
    try {
      expect(jsx3.net.Form.METHOD_POST).toEqual(f.getMethod())
    } finally {
      f.destroy();
    }
  });

  it("should create a new form and initialize it from the HTML representation of a form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="' + ACTION + '"></form>');
    try {
      expect(jsx3.$S(f.getAction()).endsWith("formdata.cgi")).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should determine if  whether this form is multipart", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"></form>');
    try {
      expect(f.getMultipart()).toBeFalsy();
    } finally {
      f.destroy();
    }
  });

  it("should determine if  whether this form is multipart", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#" enctype="multipart/form-data"></form>');
    try {
      expect(f.getMultipart()).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should return  the value of a field in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"><input type="hidden" name="field" value="value"/></form>');
    try {
      expect(f.getField("field")).toEqual("value");
    } finally {
      f.destroy();
    }
  });

  it("should append values to form fields in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"><input type="hidden" name="field" value="value1"/></form>');
    try {
      f.setField("field", "value2", true);
      expect(f.getField("field")).toEqual("value1 value2");
    } finally {
      f.destroy();
    }
  });

  it("should test the value of a field in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
      '<input type="text" name="field1" value="value1"/><input type="text" name="field2" value="value2"/></form>');
    try {
      expect(f.getField("field1")).toEqual("value1");
      expect(f.getField("field2")).toEqual("value2");
    } finally {
      f.destroy();
    }
  });

  it("should test the value of a field in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
      '<textarea name="field">value</textarea></form>');
    try {
      expect(f.getField("field")).toEqual("value");
    } finally {
      f.destroy();
    }
  });

  it("should sort the form fields and then check their values", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
      '<input type="text" name="field1" value="value1"/><input type="text" name="field2" value="value2"/></form>');
    try {
      var fields = f.getFields();
      fields.sort();
      expect(fields.length).toEqual(2);
      expect(fields[0]).toEqual("field1");
      expect(fields[1]).toEqual("field2");
    } finally {
      f.destroy();
    }
  });

  it("should return the names of all fields in this form and also remove a form field", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field2", "value2");
      f.setField("field1", "value1");
      var fields = f.getFields();
      fields.sort();
      expect(fields.length).toEqual(2);
      expect(fields[0]).toEqual("field1");
      expect(fields[1]).toEqual("field2");
      f.removeField("field1");
      var fields = f.getFields();
      expect(fields.length).toEqual(1);
      expect(fields[0]).toEqual("field2");
    } finally {
      f.destroy();
    }
  });

  it("should add a file upload field to this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      var fields = f.getFields();
      expect(fields.length).toEqual(1);
      expect(fields[0]).toEqual("file");
      f.removeField("file");
      var fields = f.getFields();
      expect(fields.length).toEqual(0);
    } finally {
      f.destroy();
    }
  });

  it("testTimeout", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, jasmine.HTTP_BASE + "/timeout.cgi", false);
    f.setField("field", "value");
    var objEvent = {};
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe(jsx3.net.Form.EVENT_ON_RESPONSE, function (evt) {
      flag = true;
      objEvent = evt;
    }, 500);
    f.send(null, 500);
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);
    runs(function () {
      //expect(objEvent.subject).toEqual("docId");
      //expect(objEvent.action).toEqual(jsx3.app.Cache.CHANGE);
      expect(objEvent.target).toEqual(f);
      var objDoc = objEvent.target.getDocument("docId");
      expect(objDoc).toBeInstanceOf(jsx3.xml.Document);
      //expect(objDoc.getError()).toBeUndefined()
      expect(objDoc.hasError()).toBeFalsy();
      expect(objDoc.getNodeName()).toEqual("data");
    });
    var objEvent;
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe(jsx3.net.Form.EVENT_ON_RESPONSE, function (evt) {
      flag = true;
      objEvent = evt;
    }, 500);
    f.send(null, 500);
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);
    runs(function () {
      expect("Timed out form should not fire a response: " + objEvent).toBeFalsy()
    });
  });
  //t.testTimeout._skip_unless = "NETWORK";

  it("testAbort", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, jasmine.HTTP_BASE + "/timeout.cgi", false);
    f.setField("field", "value");
    var objEvent;
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe("*", function (evt) {
      flag = true;
      objEvent = evt;
    }, 500);
    f.send(null, 5000);
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);
    runs(function () {
      expect("Aborted form should not fire an event: " + objEvent.subject + " " + objEvent.target).toBeFalsy()
    });
    window.setTimeout(function () {
      f.abort();
    }, 100);
    window.setTimeout(function () {
      onDone();
    }, 300);
  });
  // t.testAbort._async = true;
  //t.testAbort._skip_unless = "NETWORK";

  /* Will just get back the 404 error page rather than any sort of status...

   t.testBadUrl = function() {
   var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, jsunit.HTTP_BASE + "/404.cgi", false);
   f.setField("field", "value");

   f.subscribe("*", t.asyncCallback(function(objEvent) {
   if (objEvent.subject != jsx3.net.Form.EVENT_ON_ERROR) {
   jsunit.assert("Form to bad URL should only fire an error event: " + objEvent.subject + " " + f.getResponseText(), false);
   } else {
   }
   }));

   f.send();
   };
   t.testBadUrl._async = true;
   t.testBadUrl._skip_unless = "NETWORK";
   */
  it("testSendSimple", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    f.setField("field", "value");
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe("*", function (evt) {
      flag = true;
      objEvent = evt;
    }, 500);
    f.send();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);

    runs(function () {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE && f.getResponseText()) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field']");
        expect(rec).not.toBeNull()
        expect(rec).not.toBeUndefined()
        expect(rec.getValue()).toEqual("value")
      } else {
        expect("Form should only fire response event: " + objEvent.subject + " " + objEvent.message).toBeFalsy()
      }
    });
  });
  //t.testSendSimple._skip_unless = "NETWORK";

  it("testReceiveText", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, t.resolveURI("data/req.txt"), false);
    var evt = {};
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe("*", function (objEvent) {
      flag = true;
      evt = objEvent;
    }, 500);
    f.send();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);
    runs(function () {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var text = f.getResponseText();
        expect(/^File data.(\n|\r\n|\r)?$/.test(text)).toBeTruthy()
      }
    });
  });
  //t.testReceiveText._skip_unless = "NETWORK";

  it("testSendWhiteSpace", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    var value = " \t value\n\n";
    f.setField("field", value);
    var evt = {};
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe("*", function (objEvent) {
      flag = true;
      evt = objEvent;
    }, 500);
    f.send();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);

    runs(function () {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field']");
        expect(rec).not.toBeNull();
        expect(rec).not.toBeUndefined();
        expect(rec.getValue().replace(/\r\n/g)).toEqual(value);
      }
    });

  });
  //t.testSendWhiteSpace._async = true;
  //t.testSendWhiteSpace._skip_unless = "NETWORK";
  it("testSendXml", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    var value1 = "<some>&xml &lt;";
    f.setField("field1", value1);
    var evt = {};
    var flag, value;
    flag = false;
    value = 0;
    f.subscribe("*", function (objEvent) {
      evt = objEvent;
      flag = true;
    }, 500);
    f.send();
    waitsFor(function () {
      value++;
      return flag;
    }, "The Value should be incremented", 750);

    runs(function () {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field1']");
        expect(rec).not.toBeNull();
        expect(rec).not.toBeUndefined();
        expect(rec.getValue()).toEqual(value1);
      }
    });
  });
  //t.testSendXml._async = true;
  //t.testSendXml._skip_unless = "NETWORK";

  /* Can't get this one to work between the browser and our server...
   t.testSendUtf8 = function() {
   var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
   var value1 = "\u3CC4";

   f.setField("field1", value1);

   f.subscribe("*", t.asyncCallback(function(objEvent) {
   if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
   var xml = f.getResponseXML();
   var rec = xml.selectSingleNode("//record[@jsxid='field1']");
   var recValue = rec.getValue();
   jsunit.assertNotNullOrUndef(rec);
   jsunit.assertEquals(value1, recValue.replace(/&#(\d+);/g, function($0, $1) { return String.fromCharCode($1); }));
   } else {
   jsunit.assert("Form should only fire response event: " + objEvent.subject + " " + objEvent.message, false);
   }
   }));

   f.send();
   };
   t.testSendUtf8._async = true;
   t.testSendUtf8._skip_unless = "NETWORK";
   */

});
