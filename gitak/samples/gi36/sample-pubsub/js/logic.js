jsx3.lang.Package.definePackage(
  "eg.pubsub",                //the full package name
  function(pubsub) {          //short package name, good to use in this file only.

// create logger to log messages for this application
 pubsub.logger = jsx3.util.Logger.getLogger("samplepubsubNSLog");

// Application Server
 pubsub.APP;

/* Global message count */
  pubsub.count = 1;
/* Global to count number of subscriptions*/
  pubsub.subscriber_count = 1;
  pubsub.subHandler = function(e) {
    pubsub.logger.log(e.code, "Example1 Subscriber: received message '" + e.description + "'",3,false);     
    var out = pubsub.APP.getJSXByName("output");
    out.setValue( (out.getValue().length ? out.getValue()+"\n" : "") + e.description);
  };
  /**
   * Returns the application server object which by default is the application
   * namespace as specified in Project->Deployment Options.
   *
   * @returns {jsx3.app.Server} the application server object.
   */
   pubsub.getServer = function() {
     return pubsub.APP; 
   };

  //create an object;
  var eg = new Object();
  //create a callback function and set as a field
  eg.myCallback = function(e) {
    var msg = e.code.escapeHTML();
    pubsub.getServer().alert("Event Received", msg, null, "OK", null);
  }
  //subscribe the function to the mr_subject topic
  //pubsub.APP.subscribe("mr_subject",eg,"myCallback");

  //.....here is yet another way to subscribe....
  //create a callback function
  pubsub.myCallback = function(e) {
    var msg = e.code.escapeHTML();
    pubsub.getServer().alert("Event Received", msg, null, "OK", null);
  }
  //subscribe the function to the mr_subject topic
  //pubsub.getServer().subscribe("mr_subject",pubsub.myCallback);


  
});