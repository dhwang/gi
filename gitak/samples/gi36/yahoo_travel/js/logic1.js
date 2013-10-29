/* place JavaScript code here */
jsx3.lang.Package.definePackage(
  "eg.service",                //the full name of the package to create
  function(service) {          //name the argument of this function

    //call this method to begin the service call (eg.service.call();)
    service.callTravel = function(objJSX) {
    	var cdf = new jsx3.xml.CDF.Document();
    	cdf.load(jsx3.resolveURI("../xml/travel_map.xml"));
    	alert(cdf);
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
      objEvent.target.getServer().getJSXByName('matrix1').repaintData();
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

