//logic to call the yahoo search service.  will query for 20 JSON results on the query, "kite"
jsx3.lang.Package.definePackage(
  "eg.service",                
  function(service) {  

    //call this method to begin the service call (eg.service.call();)
    service.call = function() {
      var objService = templating.loadResource("json_rule_xml");

      //subscribe
      objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.onSuccess);
      objService.subscribe(jsx3.net.Service.ON_ERROR, service.onError);

      //call the service
      objService.doCall();
    };

    service.onSuccess = function(objEvent) {
      jsx3.log("Success","The service call was successful.");
    };

    service.onError = function(objEvent) {
      var myStatus = objEvent.target.getRequest().getStatus();
     jsx3.log("Error","The service call failed. The HTTP Status code is: " + myStatus);
    };

  }
);

/* logic for converting the edit pane to syntax highlighting editor 

var o = jsx3.GO("jsxcodeeditor_content");
var strId = o.getId();
var g = o.getRendered();
g.style.left="0px";
g.style.top="0px";
g.style.width=g.parentNode.clientWidth +"px";
g.style.zIndex=32000;
g.parentNode.firstChild.style.display="none";

editAreaLoader.init({
  id: strId
  ,start_highlight: true
  //,allow_resize: "both"
  ,allow_toggle: true
  ,language: "en"
  ,syntax: "js"	
});

*/
