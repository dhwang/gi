// use jsx3.net.Request and browser's JSON.parse to send/receive request
testJSON.loadInclude("http://cdn.jsdelivr.net/json2/0.1/json2.min.js","json","script");
jsx3.lang.Package.definePackage(
  "eg.request",                //the full name of the package to create
  function(request) {          //name the argument of this function
    request.send = function(objServer) { 
      var mtx = testJSON.getJSXByName("matrix1");
      jsx3.$A(mtx.getRecordIds()).each(function(x) {
            
           //alert(x);
           mtx.deleteRecord(x,true);
      
         
      });

  		 r = new jsx3.net.Request();
  		 url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search%20where%20has_geo%3D%22true%22%20and%20text%3D%22'+
	   testJSON.getJSXByName('textbox').getValue()      
	  +'%22%20and%20api_key%3D%2292bd0de55a63046155c09f1a06876875%22%3B&format=json&diagnostics=true&callback=';
	    r.open("GET", url);
	    r.send();
	     success = r.getStatus() == jsx3.net.Request.STATUS_OK?true:false;

	    if(success){

	    	 json = r.getResponseText();
	    	
	    }else{

	    	console.log(Request.STATUS_ERROR);
	    }

      request.getMatrix = function () {
        return testJSON.getJSXByName('matrix1');
      }

           var mtx = request.getMatrix();
	         objJson = JSON.parse(json);
			     objQuery = objJson.query;
			     objResults = objQuery.results;
			     aPhoto = objResults.photo;
	         
            for(var i = 0; i<aPhoto.length; i++){
            	var url = "http://farm"+aPhoto[i].farm+".staticflickr.com/"+aPhoto[i].server+"/"+aPhoto[i].id+"_"+aPhoto[i].secret+".jpg",
                small = "http://farm"+aPhoto[i].farm+".staticflickr.com/"+aPhoto[i].server+"/"+aPhoto[i].id+"_"+aPhoto[i].secret+"_s.jpg";
            	var objRecord = {
            		jsximg : small,
            		owner : aPhoto[i].owner,
            		url : url,
            		title : aPhoto[i].title,
                jsxid : aPhoto[i].id
            	};
                mtx.insertRecord(objRecord,i,true);
                mtx.repaint();
            };

        }; 
    //call this method to search results by the first textbox. 
       
  }

);  