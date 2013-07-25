/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

var specs = [
  /* Reflection and metadata suite */
  "jsx3/lang/pkg.js", "jsx3/lang/object.js", "jsx3/lang/method.js", "jsx3/lang/class.js",
  "jsx3/lang/package.js", "jsx3/lang/aop.js",

  /* Exception and error suite */
  "jsx3/lang/exception.js", "jsx3/lang/error.js",

  /* URI and URI resolver suite */
  ["jsx3/net/uri.js", "jsx3/net/uriresolver.js"],

  /* App suite */
  "jsx3/app/cache.js", "jsx3/app/properties.js","jsx3/app/dom.js","jsx3/app/settings.js", "jsx3/app/server.js",

  /* XML suite 1 */
  "jsx3/xml/document.js","jsx3/xml/entity.js",

  /* XML suite 2 */
  "jsx3/xml/cdf.js", "jsx3/xml/processor.js","jsx3/xml/template.js",

  /* Server suite */
    "jsx3/app/model.js", "jsx3/xml/cacheable.js",
    "jsx3/net/service.js", "jsx3/net/form.js"
];

gi.test.jasmine.loadTestSpecs(specs);

