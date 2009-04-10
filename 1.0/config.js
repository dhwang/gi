/*
 * Copyright (c) 2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * {String} The path of the JavaScript file that contains benchmarking code for each app that is tested using the
 *    benchmarking harness. The path is relative to the project directory.
 */
gi.test.gipp.BENCHMARK_JS = "benchmark.js";

//gi.test.gipp.BENCHMARK_JSS = ["benchmark.js", "benchmark2.js"];

// The relative location of the GI deployment directory.
gi.test.gipp.GI = "../gi";

// gi.test.gipp.GIS = [];

// The relative location of the GI app to test ...
gi.test.gipp.APP = "JSXAPPS/matrix-benchmark";

// ... or a list of them, in which case we show a select.
// gi.test.gipp.APPS = [];

// The number of runs.
gi.test.gipp.RUNS = 1;

// Whether to start the tests automatically when the page loads.
gi.test.gipp.AUTORUN = false;
