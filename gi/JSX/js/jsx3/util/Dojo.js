/*
* This simply loads Dojo
*/
if(typeof dojo == "undefined") {
  djConfig = typeof djConfig == "undefined" ? {baseUrl: jsx3.resolveURI("jsx:///js/dojo/"), afterOnLoad: true} : djConfig;
  // if we are running from the source version, we will pretend we are spidermonkey
  // providing a load function, which will use the sync loader instead of the
  // destructive document.write technique used by the source version of dojo.js
  load = function(script){
    jsx3.CLASS_LOADER.loadJSFileSync(script.replace(/rhino/,"browser"));
  };
  jsx3.CLASS_LOADER.loadJSFileSync(jsx3.resolveURI("jsx:///js/dojo/dojo.js"));
  delete load;

  // we need to redefine this so the JSXBODY element is treated as the body.
  // This is done for Dijit's popup code so it gets styled correctly.
  dojo.body = function(){
    return dojo.query('[label="JSXBODY"]')[0];
  };
}
jsx3.Class.defineClass("jsx3.util.Dojo", null, null, function() {});
