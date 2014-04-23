if (!window.JSON)
eg.service.APP.loadInclude("http://cdn.jsdelivr.net/json2/0.1/json2.min.js","json","script");

jsx3.require( "jsx3.net.Service");
jsx3.lang.Package.definePackage(
  "eg.service",                //the full name of the package to create
  function(service) { 

    service.APP;
    //name the argument of this function
    //call this method to begin the service call (eg.service.call();)
    service.call = function(appServer) {
      appServer.getBodyBlock().showMask("<h1 style='left:100px;white-space:nowrap;'>Sent request; Loading..</h1>");
      var objService = service.APP.loadResource("testjson_xml");
      //live or static
      objService.setMode(eg.service.APP.getJSXByName("radLive").getSelected());
      objService.setInboundURL("xml/source.json");//locally saved static response

      //service operation name, REST has no name ""
      objService.setOperation("");

      var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search%20where%20has_geo%3D%22true%22%20and%20text%3D%22'+
       service.APP.getJSXByName('textbox').getValue()      
      +'%22%20and%20api_key%3D%2292bd0de55a63046155c09f1a06876875%22%3B&format=json&diagnostics=true';
      objService.setEndpointURL(url);
          
      //subscribe
      objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.onSuccess);
      objService.subscribe(jsx3.net.Service.ON_ERROR, service.onError);
      objService.subscribe(jsx3.net.Service.ON_INVALID, service.onInvalid);

      //call the services
      objService.doCall();
    };

    service.getMatrix = function () {
      return service.APP.getJSXByName('matrix1');
    }
    
    service.getSelectedRecord = function () {
      var table = service.getMatrix();
      if (table) {
        return table.getRecord(table.getValue());
      }
    }
    
    service.onSuccess = function(objEvent) {
     objEvent.target.getServer().getBodyBlock().hideMask();
      var mtx = service.getMatrix();
      // convert the returned codes into actual picture URL, see 
      jsx3.$A(mtx.getRecordIds()).each(function(x) {
         
         var rec = mtx.getRecord(x);
         var url = "http://farm"+rec.farm+".staticflickr.com/"+rec.server+"/"+rec.id+"_"+rec.secret+".jpg",
         small = "http://farm"+rec.farm+".staticflickr.com/"+rec.server+"/"+rec.id+"_"+rec.secret+"_s.jpg";
         mtx.insertRecordProperty(x, "url", url);         
         mtx.insertRecordProperty(x, "jsximg", small);
      });

      service.APP.getCache().setDocument("service_copy",mtx.getXML().cloneDocument());
      
    };

    service.onError = function(objEvent) {
      var myStatus = objEvent.target.getRequest().getStatus();
      objEvent.target.getServer().alert("Error","The service call failed. The HTTP Status code is: " + myStatus);
    };

    service.onInvalid = function(objEvent) {
      objEvent.target.getServer().alert("Invalid","The following message node just failed validation:\n\n" + objEvent.message);
    };
    
    service.dlgTop = 100;
    service.dlgLeft = 0;

    service.showImage = function(imgUrl) {
      var imgBlock = service.APP.getBodyBlock().load("components/imgBlock.xml", true);
      imgBlock.repaint();
      service.dlgTop+=10;
      service.dlgLeft+=10;
      imgBlock.setLeft(service.dlgLeft).setTop(service.dlgTop);
    };
  }

);

