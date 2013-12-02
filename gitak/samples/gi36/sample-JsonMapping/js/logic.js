testJSON.loadInclude("http://cdn.jsdelivr.net/json2/0.1/json2.min.js","json","script");
jsx3.lang.Package.definePackage(
  "eg.service",                //the full name of the package to create
  function(service) {          //name the argument of this function

    //call this method to begin the service call (eg.service.call();)
    service.call = function(appServer) {
      var objService = testJSON.loadResource("testjson_xml");
      objService.setOperation("");

      var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search%20where%20has_geo%3D%22true%22%20and%20text%3D%22'+
       testJSON.getJSXByName('textbox').getValue()      
      +'%22%20and%20api_key%3D%2292bd0de55a63046155c09f1a06876875%22%3B&format=json&diagnostics=true&callback=';
      objService.setEndpointURL(url);
          
      //subscribe
      objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.onSuccess);
      objService.subscribe(jsx3.net.Service.ON_ERROR, service.onError);
      objService.subscribe(jsx3.net.Service.ON_INVALID, service.onInvalid);

      //call the service
      objService.doCall();
    };

    service.getMatrix = function () {
      return testJSON.getJSXByName('matrix1');
    }
    service.onSuccess = function(objEvent) {
      var mtx = service.getMatrix();
      
      // convert the returned codes into actual picture URL, see 
      jsx3.$A(mtx.getRecordIds()).each(function(x) {
         
         var rec = mtx.getRecord(x);
         var url = "http://farm"+rec.farm+".staticflickr.com/"+rec.server+"/"+rec.id+"_"+rec.secret+".jpg",
         small = "http://farm"+rec.farm+".staticflickr.com/"+rec.server+"/"+rec.id+"_"+rec.secret+"_s.jpg";
         mtx.insertRecordProperty(x, "url", url);         
         mtx.insertRecordProperty(x, "jsximg", small);
      });
      //mtx.repaint(); // XML Bind is enabled, no repaint needed
      var aBegin = [];
      jsx3.$A(mtx.getRecordIds()).each(function(x){
         var rec = mtx.getRecord(x);
         //alert(rec.jsximg);
         var objRecord = {
                jsximg : rec.jsximg,
                owner : rec.owner,
                url : rec.url,
                title : rec.title,
                jsxid: rec.id
         };
         aBegin.push(objRecord);

      });
      service.aBegin = aBegin;
    };
    
    //call this method to search results by the owner. 
    service.queryByOwner = function(objQuery){
      var queryValue = objQuery.getServer().getJSXByName("textOwner").getValue();
      var mtx = service.getMatrix();
         if(queryValue!=""){
          jsx3.$A(mtx.getRecordIds()).each(function(x) {
            var rec = mtx.getRecord(x);
            var owner = rec.owner;
            if(queryValue!=owner){
            mtx.deleteRecord(x,true);
            }
          });
         }else{
          for(var i =0,length = service.aBegin.length;i<length;i++){
            mtx.insertRecord(service.aBegin[i],service.aBegin[i].jsxid,true); 
          }
         };

      //});
    } 


    service.onError = function(objEvent) {
      var myStatus = objEvent.target.getRequest().getStatus();
      objEvent.target.getServer().alert("Error","The service call failed. The HTTP Status code is: " + myStatus);
    };

    service.onInvalid = function(objEvent) {
      objEvent.target.getServer().alert("Invalid","The following message node just failed validation:\n\n" + objEvent.message);
    };

    service.showImage = function(imgUrl) {
        var imgBlock = testJSON.getBodyBlock().load("components/imgBlock.xml", true);
        //testJSON.getBodyBlock().insertHTML(imgBlock);
        imgBlock.getChildren()[1].setText("<img src='" + imgUrl + "'/>");
        imgBlock.getChildren()[1].repaint();
    //alert(imgUrl);
    };
  }

);

