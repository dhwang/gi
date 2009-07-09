/**
 * This provides a static instance that acts as a bridge to Dojo's publish/subscribe hub.
 * Events on dojo's hub can be subscribed to through this instance, which implements the
 * EventDispatcher interface. Events can also be published through this bridge, and they
 * will be broadcast on Dojo's hub.
 * @package
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

/**
 * Requiring this class loads Dojo.
 *
 * @see jsx3.gui.DojoWidget
 * @see jsx3.xml.DojoDataStore
 */
jsx3.Class.defineClass("jsx3.util.Dojo", null, null, function(Dojo) {

  /**
   * {jsx3.util.EventDispatcher}
   * A bridge to Dojo's publish/subscribe hub. Events on dojo's hub can be subscribed to through this
   * instance. Events can also be published through this bridge, and they will be broadcast on Dojo's hub.
   */
  Dojo.hub = new jsx3.util.DojoPubSub();

  /**
   * Returns the resolved path to Dojo or a file within Dojo. Dojo is assumed to be installed in the directory
   * <code>dojo-toolkit</code> as a peer of <code>JSX</code>. This location may be overridden by setting the
   * <code>jsx_dojo</code> deployment parameter.
   *
   * @param s {String} the relative path of a Dojo resource.
   */
  Dojo.getPath = function(s) {
    var prefix = jsx3.getEnv("jsx_dojo") || "jsx:/../dojo-toolkit";
    return jsx3.resolveURI(prefix + (s ? s : ""));
  };

  Dojo.load = function() {
    if (typeof dojo == "undefined") {
      window.djConfig = typeof djConfig == "undefined" ? {baseUrl: jsx3.util.Dojo.getPath("/dojo/"), afterOnLoad: true} : djConfig;
      // if we are running from the source version, we will pretend we are spidermonkey
      // providing a load function, which will use the sync loader instead of the
      // destructive document.write technique used by the source version of dojo.js

      load = function(script){
        jsx3.CLASS_LOADER.loadJSFileSync(script.replace(/rhino|spidermonkey/,"browser"));
      };
      jsx3.CLASS_LOADER.loadJSFileSync(jsx3.util.Dojo.getPath("/dojo/dojo.js"));
      delete load;

      // we need to redefine this so the JSXBODY element is treated as the body.
      // This is done for Dijit's popup code so it gets styled correctly.
      dojo.body = function(){
        return dojo.query('[label="JSXBODY"]')[0];
      };
    }
  };
  
});
