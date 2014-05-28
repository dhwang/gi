// use jsx3.net.Request and browser's JSON.parse to send/receive request
jsx3.lang.Package.definePackage(
  "eg.request", //the full name of the package to create
  function(request) { //name the argument of this function

    var server, r, ruser, r2; // private scope variable, not global.
    
    request.getMatrix = function(objServer) {
      if(!objServer) objServer = eg.service.APP;
      return objServer.getJSXByName('matrix1');
    };
    
    request.repaintData = function(json) {
        var mtx, objJson, aPhoto;
        
        mtx = request.getMatrix();
        objJson = JSON.parse(json);
        aPhoto = objJson.query.results.photo;
      
        if (objJson) {
          for (var i = 0; i < aPhoto.length; i++) {
            var url = "http://farm" + aPhoto[i].farm + ".staticflickr.com/" + aPhoto[i].server + "/" + aPhoto[i].id + "_" + aPhoto[i].secret + ".jpg",
            small = "http://farm" + aPhoto[i].farm + ".staticflickr.com/" + aPhoto[i].server + "/" + aPhoto[i].id + "_" + aPhoto[i].secret + "_s.jpg";
            var objRecord = {
              jsximg: small,
              owner: aPhoto[i].owner,
              url: url,
              title: aPhoto[i].title,
              jsxid: aPhoto[i].id
            };
            mtx.insertRecord(objRecord, i, (i+1 == aPhoto.length) ); // repaint only when inserting last record
            // The matrix has bind event enabled, which repaints the matrix automatically on XML data change.
          }
        }

    };

    request.doRequest = function(objServer){
      if(eg.service.APP.getJSXByName("radStatic").getSelected()){      
        this.resTest = '{"query":{"count":10,"created":"2014-01-15T06:32:45Z","lang":"zh-CN","diagnostics":{"publiclyCallable":"true","url":{"execution-start-time":"1","execution-stop-time":"1149","execution-time":"1148","content":"http://api.flickr.com/services/rest/?method=flickr.photos.search&has_geo=true&text=beijing&page=1&per_page=10"},"user-time":"1149","service-time":"1148","build-version":"0.2.2157"},"results":{"photo":[{"farm":"4","id":"11959060785","isfamily":"0","isfriend":"0","ispublic":"1","owner":"87317679@N00","secret":"94482aa9dd","server":"3667","title":"Beijing"},{"farm":"8","id":"11959351243","isfamily":"0","isfriend":"0","ispublic":"1","owner":"87317679@N00","secret":"c8179021f2","server":"7424","title":"Beijing"},{"farm":"4","id":"11958300335","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"08cf7119c1","server":"3714","title":"Beijing 2013"},{"farm":"6","id":"11959135076","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"0426154622","server":"5537","title":"Beijing 2013"},{"farm":"6","id":"11958610853","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"494519867a","server":"5507","title":"Beijing 2013"},{"farm":"6","id":"11959157216","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"d29135ed53","server":"5493","title":"Beijing 2013"},{"farm":"6","id":"11958723904","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"c5a9f6e4a5","server":"5475","title":"Beijing 2013"},{"farm":"8","id":"11958747434","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"72aa523c0b","server":"7308","title":"Beijing 2013"},{"farm":"3","id":"11959088006","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"dd80442382","server":"2851","title":"Beijing 2013"},{"farm":"3","id":"11958698954","isfamily":"0","isfriend":"0","ispublic":"1","owner":"17642366@N00","secret":"46496b8b55","server":"2840","title":"Beijing 2013"}]}}}';
        request.repaintData(this.resTest);
        this.getMatrix().repaint();
      }else{
        request.send(objServer);
        this.getMatrix().repaint();
      }
    };

    request.send = function(objServer) {
      server = objServer;
      var searchText = server.getJSXByName('textbox').getValue();
      server.getBodyBlock().showMask("<h1 style='left:100px;white-space:nowrap;'>Searching for "+ searchText + " ... </h1>");
      var mtx = this.getMatrix(objServer);
      mtx.clearXmlData();

      r = new jsx3.net.Request();
      var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search%20where%20has_geo%3D%22true%22%20and%20text%3D%22' +
        searchText + '%22%20and%20api_key%3D%2292bd0de55a63046155c09f1a06876875%22%3B&format=json&diagnostics=true';
      r.open("GET", url, true);
      r.send();
   
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE,request.onSuccess);
      r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT,request.onTimeout);
    };

    request.onSuccess = function(objEvent) {
      if (r.getStatus() == 200) {
        server.getBodyBlock().hideMask();
        eg.flag = false;
        request.repaintData( r.getResponseText() );
     }
    };

    request.onTimeout = function(objEvent){
      objEvent.target.getServer().alert("Timeout","The service call failed. The HTTP Status code is: " + r.getStatus());
    };

    request.getUserInfo = function(id, userid) {
       ruser = new jsx3.net.Request();
       var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.people.info2%20where%20user_id%3D%22'+ userid +'%22%20and%20api_key%3D%2292bd0de55a63046155c09f1a06876875%22%3B&format=json';      
       ruser.open("GET", url, true);
       ruser.send();
      ruser.id = id;      
      ruser.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE,request.onUserInfo);
      ruser.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT,request.onTimeout); 
    }
    
    request.onUserInfo = function(objEvent) {
      var ownerInfo = JSON.parse(ruser.getResponseText());
      jsx3.log(ruser.getResponseText());
      jsx3.log(ownerInfo.query.results.person.realname);
      request.getMatrix().getRecord(ruser.id).realname = ownerInfo.query.results.person.realname;
      return ownerInfo.query.results.person;
    }
   }

  );