// use jsx3.net.Request and browser's JSON.parse to send/receive request
jsx3.lang.Package.definePackage(
  "eg.request", //the full name of the package to create
  function(request) { //name the argument of this function

    var server, r, ruser; // private scope variable, not global.
    
    request.getMatrix = function(objServer) {
      if(!objServer) objServer = eg.service.APP;
      return objServer.getJSXByName('matrix1');
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
        var json = r.getResponseText();
        var mtx = request.getMatrix();
        var objJson = JSON.parse(json);
        var aPhoto = objJson.query.results.photo;
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