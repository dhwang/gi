/* place JavaScript code here */

jsx3.lang.Package.definePackage(
  "eg.request", //the full name of the package to create
  function(request) { //name the argument of this function

    /* Application Server object which is by default the project namespace  (see Project -> Project settings -> Namespace) */
    request.APP;

    request.doSubmit = function(objJSX) {
      // List grid view
      var objServer = objJSX.getServer();
      var mtxView = objServer.getJSXByName("mtxAddTable");

      var objRecord = new Object(); // new CDF record obj
      objRecord.jsxid = jsx3.CDF.getKey();

      //get the value of every form elements
      objRecord.first = objServer.getJSXByName("regFirstName").getValue();
      objRecord.last = objServer.getJSXByName("regLastName").getValue();
      objRecord.password = objServer.getJSXByName("regPassword").getValue();
      objRecord.phone = objServer.getJSXByName("regPhone").getValue();
      objRecord.email = objServer.getJSXByName("regEmail").getValue();
      // var male = objServer.getJSXByName("male").getSelected();
      // var female = objServer.getJSXByName("female").getSelected();
      objRecord.city = objServer.getJSXByName("regCity").getValue();
      objRecord.birth = objServer.getJSXByName("regBirth").getValue();
      objRecord.reading = objServer.getJSXByName("reading").getValue();
      objRecord.cooking = objServer.getJSXByName("cooking").getValue();
      objRecord.traveling = objServer.getJSXByName("traveling").getValue();
      objRecord.studying = objServer.getJSXByName("studying").getValue();

      objServer.getJSXByName("cdf").setAttribute('first', objRecord.first);
      objServer.getJSXByName("cdf").setAttribute('last', objRecord.last);
      objServer.getJSXByName("cdf").setAttribute('password', objRecord.password);
      objServer.getJSXByName("cdf").setAttribute('email', objRecord.email);
      objServer.getJSXByName("cdf").setAttribute('city', objRecord.city);
      objServer.getJSXByName("cdf").setAttribute('birth', objRecord.birth);
      objServer.getJSXByName("cdf").setAttribute('reading', objRecord.reading);
      objServer.getJSXByName("cdf").setAttribute('cooking', objRecord.cooking);
      objServer.getJSXByName("cdf").setAttribute('traveling', objRecord.traveling);
      objServer.getJSXByName("cdf").setAttribute('studying', objRecord.studying);
      objServer.getJSXByName("cdf").write();
      mtxView.insertRecord(objRecord, null, true);
      //reset the form
      // request.doReset();
    };

    request.doReset = function(objJSX) {

      var objServer = objJSX.getServer();
      //clean-up visible form elements
      objServer.getJSXByName("regFirstName").setValue("");
      objServer.getJSXByName("regLastName").setValue("");
      objServer.getJSXByName("password").setValue("");
      objServer.getJSXByName("regPhone").setValue("");
      objServer.getJSXByName("regEmail").setValue("");
      // objServer.getJSXByName("male").setSelected(0);
      // objServer.getJSXByName("female").setSelected(0);
      objServer.getJSXByName("regCity").setValue("");
      objServer.getJSXByName("regBirth").setValue("");
      objServer.getJSXByName("regTime").setValue("");
      objServer.getJSXByName("reading").setValue("");
      objServer.getJSXByName("cooking").setValue("");
      objServer.getJSXByName("traveling").setValue("");
      objServer.getJSXByName("studying").setValue("");
    };
  });