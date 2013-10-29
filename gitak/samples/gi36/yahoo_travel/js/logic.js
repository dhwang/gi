/* place JavaScript code here */
jsx3.require("jsx3.net.Service");
jsx3.lang.Package.definePackage(
  "eg.service",                //the full name of the package to create
  function(service) {          //name the argument of this function
    var cdf = (new jsx3.xml.CDF.Document()).load(testJASON.resolveURI("xml/travel_map.xml"));
    var children = cdf.getChildNodes(); 
    var length = children.size();
    //call this method to begin the service call (eg.service.call();)
    service.callTravel = function(objJSX) {
      for (var i = 0; i < length; i++) {
         var child = children.get(i);
         var insertRecordId = child.getAttribute("jsxid");
          var obj = {
              jsxid: child.getAttribute("jsxid"),
              jsximg: child.getAttribute("jsximg"),
              Title: child.getAttribute("Title"),
              Url: child.getAttribute("Url"),
              Author: child.getAttribute("Author"),
              jsxdate: child.getAttribute("jsxdate")
            }
          testJASON.getJSXByName('matrix1').insertRecord(obj, insertRecordId,true);
      };
      service.queryTravel = function(objQuery){
      	 var queryValue = objQuery.getServer().getJSXByName("query").getValue();
      	 for (var i = 0; i < length; i++) {
      	 	 var child = children.get(i);
      	 	 if(queryValue && child.getAttribute("Title")==queryValue){
      	 	 	var insertRecordId = child.getAttribute("jsxid");
      	 	 	var recordValue=testJASON.getJSXByName('matrix1').getRecord(insertRecordId);
      	 	 	var obj={jsxid:recordValue.jsxid,
      	 	 		     jsximg:recordValue.jsximg,
      	 	 		     Title:recordValue.Title,
      	 	 		     Url:recordValue.Url,
      	 	 		     Author:recordValue.Author,
      	 	 		     jsxdate:recordValue.jsxdate
      	 	 		 };
      	 	 	testJASON.getJSXByName('matrix1').insertRecord(obj,0,true);
      	 	 }else{testJASON.getJSXByName('matrix1').deleteRecord(i,true);}      	 	 
      	 };     	 
      }
      service.insertTravel = function(objInsert){
      	  var insertServer = objInsert.getServer();
      	  var image = insertServer.getJSXByName("image").getValue();
      	  var name = insertServer.getJSXByName("name").getValue();
      	  var link = insertServer.getJSXByName("link").getValue();
      	  var text = insertServer.getJSXByName("text").getValue();
      	  var date = insertServer.getJSXByName("date").getValue();
      	  var obj={  jsxid:length,
      	 	 	     jsximg:image,
      	 	 	     Title:name,
      	 	 	     Url:link,
      	 	 		 Author:text,
      	 	 		 jsxdate:date
      	 	 		 }
      	  testJASON.getJSXByName('matrix1').insertRecord(obj,length,true); 
      	  //testJASON.getJSXByName('matrix1').insertRecordBefore(obj,1,true); 
      }
      // var objService = testJASON.loadResource("travel_map_xml");
      // objService.setOperation("Transaction");
      // var query = objJSX.getServer().getJSXByName("textbox").getValue();
      // if (!query) query = "paris";
      // objService.setEndpointURL("http://travel.yahooapis.com/TripService/V1.1/tripSearch?appid=YahooDemo&query="+ query +"&results=20&output=json")

      // //subscribe
      // objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.onSuccess);
      // objService.subscribe(jsx3.net.Service.ON_ERROR, service.onError);
      // objService.subscribe(jsx3.net.Service.ON_INVALID, service.onInvalid);

      // //PERFORMANCE ENHANCEMENT: uncomment the following line of code to use XSLT to convert the server response to CDF (refer to the API docs for jsx3.net.Service.compile for implementation details)
      // //objService.compile();

      // //call the service
      // objService.doCall();
    };
    service.onSuccess = function(objEvent) {
      //var responseXML = objEvent.target.getInboundDocument();
      objEvent.target.getServer().getJSXByName('matrix1').redrawRecord();
    };

    service.onError = function(objEvent) {
      var myStatus = objEvent.target.getRequest().getStatus();
      objEvent.target.getServer().alert("Error","The service call failed. The HTTP Status code is: " + myStatus);
    };

    service.onInvalid = function(objEvent) {
      objEvent.target.getServer().alert("Invalid","The following message node just failed validation:\n\n" + objEvent.message);
    };

  }
);

