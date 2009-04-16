jsx3.require("jsx3.util.Dojo");
/**
* This provides a static instance that acts as a bridge to Dojo's publish/subscribe hub.
* Events on dojo's hub can be subscribed to through this instance, which implements the
* EventDispatcher interface. Events can also be published through this bridge, and they
* will be broadcast on Dojo's hub.
*/
jsx3.Class.defineClass("jsx3.util.DojoPubSub", null, [jsx3.util.EventDispatcher], function(DojoPubSub, DojoPubSub_prototype) {
  var eventHandlers = {};
  var defaultPublish = jsx3.util.EventDispatcher.prototype.publish;
  DojoPubSub_prototype.publish = function(message) {
    message._fromGI = true
    dojo.publish(message.subject, [message]);
    return defaultPublish.call(this, message);
  };
  DojoPubSub_prototype.subscribe = function(topic, context, method) {
    var self = this;
    if (!eventHandlers[topic]) {
      eventHandlers[topic] = dojo.subscribe(topic, null, function(m) {
        if(!(m && m._fromGI)) {        
          var message = {subject: topic};
          for (var i = 0; i < arguments.length; i++) {
            message[i] = arguments[i];
          }
          defaultPublish.call(self, message);
        }
      });
    }
    return this.jsxsupermix(topic, context, method);
  };
  
});

jsx3.util.DojoPubSub.hub = new jsx3.util.DojoPubSub();
