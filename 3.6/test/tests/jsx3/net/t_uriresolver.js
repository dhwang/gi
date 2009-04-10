/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.net.URIResolver", function(t, jsunit) {

  jsunit.require("jsx3.net.URIResolver.jsxclass", "jsx3.app.Browser");

  t.testResolveRelative = function() {
    var u = ["file.html", "../dir/file.html", "http://www.tibco.com", "file.html?q=v", "file.html#frag",
        "file.html?q=v#frag", "/dir/file.html"];
    for (var i = 0; i < u.length; i++)
      jsunit.assertEquals(u[i], jsx3.resolveURI(u[i]));
  };

  t.testResolveJSX = function() {
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html", jsx3.resolveURI("jsx:///file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html", jsx3.resolveURI("jsx:/file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html", jsx3.resolveURI("JSX/file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "file.html", jsx3.resolveURI("jsx:///../file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html?q=val", jsx3.resolveURI("jsx:///file.html?q=val"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html#frag", jsx3.resolveURI("jsx:///file.html#frag"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html?q=val#frag", jsx3.resolveURI("jsx:///file.html?q=val#frag"));
  };

});
