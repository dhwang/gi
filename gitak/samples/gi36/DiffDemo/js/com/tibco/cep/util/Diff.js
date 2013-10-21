/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.lang.Package.definePackage("com.tibco.cep.util",
  function (ns) {});



/**
 * Represents the differences between two arrays.
 */
jsx3.Class.defineClass("com.tibco.cep.util.Diff",
  null, [], function(staticContext, instanceContext) {


  /**
   * Constructor.
   * @param oldElements {Array<int|String|Object>} the first array.
   * @param newElements {Array<int|String|Object>} the second array.
   */
  instanceContext.init = function(oldElements, newElements) {
    this.jsxsuper();
    this.arrayOld = oldElements;
    this.arrayNew = newElements;
    this.matches = _buildMatches(
      _buildLcsMatrix(this.arrayOld, this.arrayNew),
      this.arrayOld, this.arrayNew,
      this.arrayOld.length, this.arrayNew.length);
  }


  /**
   * Gets a list of matched and unmatched sections.
   * @return {Array<object>} list of matched and unmatched sections.
   */
  instanceContext.getMatches = function() {
    return this.matches.slice(0);
  }

  /**
   * @return {String} text view of the diff.
   */
  instanceContext.toString = function() {
    var s = '';
    var matches = this.matches;
    for (var i=0; i<matches.length; i++) {
      var match = matches[i];
      if (match.isSame) {
        for (var j=0; j<match.oldElements.length; j++) {
          s += '  ' + match.oldElements[j] +"\n";
        }
      } else {
        for (var j=0; j<match.oldElements.length; j++) {
          s += '- ' + match.oldElements[j] +"\n";
        }
        for (var j=0; j<match.newElements.length; j++) {
          s += '+ ' + match.newElements[j] +"\n";
        }
      }
    }
    return s;
  };


  // Builds the matrix of longest common sequences.
  function _buildLcsMatrix(x,y) {
    var m = x.length;
    var n = y.length;
    var c = new Array(m+1);
    for (var i=0; i<=m; i++) {
      c[i] = new Array(n+1);
      c[i][0] = 0;
    }
    for (var j=0; j<=n; j++) {
      c[0][j] = 0;
    }
    for (var i=1; i<=m; i++) {
      for (var j=1; j<=n; j++) {
        if (x[i-1] == y[j-1]) {
          c[i][j] = c[i-1][j-1] + 1;
        } else {
          c[i][j] = Math.max(c[i][j-1], c[i-1][j]);
        }
      }
    }
    return c;
  }



  // Builds the diff result recursively by traversing the LCS matrix.
  function _toString(c, x, y, i, j) {
    if ((i>0) && (j>0) && (x[i-1] == y[j-1])) {
      return _toString(c, x, y, i-1, j-1) +"  " + x[i-1] + "\n";
    } else {
      if ((j>0) && ((i==0) || (c[i][j-1] >= c[i-1][j]))) {
        return _toString(c, x, y, i, j-1) + "+ " + y[j-1] + "\n";
      } else if ((i>0) && ((j==0) || (c[i][j-1] < c[i-1][j]))) {
        return _toString(c, x, y, i-1, j) + "- " + x[i-1] + "\n";
      }
    }
    return "";
  }



  // Builds the diff result recursively by traversing the LCS matrix.
  function _buildMatches(c, x, y, i, j) {
    if ((i>0) && (j>0) && (x[i-1] == y[j-1])) {
      var matches = _buildMatches(c, x, y, i-1, j-1);
      var match = matches[matches.length-1];
      if ((match == undefined) || !match.isSame) {
        match = {isSame:true, oldElements:[], newElements:[]};
        matches.push(match);
      }
      match.oldElements.push(x[i-1]);
      match.newElements.push(x[i-1]);
      return matches;
    } else {
      if ((j>0) && ((i==0) || (c[i][j-1] >= c[i-1][j]))) {
        var matches = _buildMatches(c, x, y, i, j-1);
        var match = matches[matches.length-1];
        if ((match == undefined) || match.isSame) {
          match = {isSame:false, oldElements:[], newElements:[]};
          matches.push(match);
        }
        match.newElements.push(y[j-1]);
        return matches;
      } else if ((i>0) && ((j==0) || (c[i][j-1] < c[i-1][j]))) {
        var matches = _buildMatches(c, x, y, i-1, j);
        var match = matches[matches.length-1];
        if ((match == undefined) || match.isSame) {
          match = {isSame:false, oldElements:[], newElements:[]};
          matches.push(match);
        }
        match.oldElements.push(x[i-1]);
        return matches;
      }
    }
    return [];
  }



});

