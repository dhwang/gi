var loc = document.location;

// Parse all query parameters into a map
var params = {};
var tokens = String(loc.search).substring(1).split(/&/g);
for (var i = 0; i < tokens.length; i++) {
  var bits = tokens[i].split(/=/);
  params[bits[0]] = bits.length == 1 ? true : bits[1];
}

// If parameter gi-searchgo is true, then find the first search result and 
// go to that page immediately
if (params["gi-searchgo"]) {
  jQuery(document).ready(function() {
    var elm = jQuery("ul.search-results li:first h3 a")[0];
    if (elm) {
      var prefix = loc.href.substring(0, loc.href.indexOf(loc.pathname));
      // Forward parameter gi-searchanchor to anchor search= so that the search
      // match page jumps automatically to the search anchor
      loc.replace(prefix + elm.getAttribute("href") + "#search=" + params["gi-searchanchor"]);
    }
  });
}

// If parameter gi-anchor is available, find any anchor on the page that
// partially matches it and go to that anchor
if (String(loc.hash).indexOf("#search=") == 0) {
  jQuery(document).ready(function() {
    var elm = jQuery('a[name~="' + loc.hash.substring(8) + '"]')[0];
    if (elm) {
      loc.replace(loc.protocol + "//" + loc.hostname + 
          (loc.port ? ":" + loc.port : "") + loc.pathname + loc.search +
          "#" + elm.getAttribute("name"));
    }
  });  
}

