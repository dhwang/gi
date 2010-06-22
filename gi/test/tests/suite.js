/*
 * Copyright (c) 2001-2010, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/*
 * This file defines all the JavaScript test files that comprise the GI testing suite. Files should
 * be referenced relatively from the tests/ directory.
 *
 *
 */

var alreadyRan = false;

function suite() {
  gi.test.jsunit.warn("suite() in suite.js");

  // Chrome seems to call this function twice for some reason
  if (alreadyRan)
    return gi.test.jsunit.newJsSuite();

  alreadyRan = true;
  
  return gi.test.jsunit.newJsSuite(
      /* Other utilities suite */
      ["jsx3/t_pkg.js"]
  );
}
