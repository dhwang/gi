/**
* This simply loads Dojo
*/
if(typeof dojo == "undefined") {
  djConfig = typeof djConfig == "undefined" ? {baseUrl: "dojo-toolkit/dojo/", afterOnLoad: true} : djConfig;
  // if we are running from the source version, we will pretend we are spidermonkey
  // providing a load function, which will use the sync loader instead of the
  // destructive document.write technique used by the source version of dojo.js
  load = function(script){
    jsx3.CLASS_LOADER.loadJSFileSync(script.replace(/rhino/,"browser"));
  };
  jsx3.CLASS_LOADER.loadJSFileSync("dojo-toolkit/dojo/dojo.js");
  delete load;
}
jsx3.Class.defineClass("jsx3.util.Dojo", null, null, function() {});