jsx3.lang.Package.definePackage(
  "eg.search",                //the full name of the package to create
  function(search) {          //name the argument of this function
  /**
   * Position of the record in the CDF document to be returned
   */
  var resultIndex = 1;
  
  /**
   * Returns the application server object which by default is the application
   * namespace as specified in Project->Deployment Options.
   *
   * @returns {jsx3.app.Server} the application server object.
   */
   search.getServer = function() {
    // should be the same as namespace in Project -> Deployment Options
    return eg.search.SERVER;
   };
  
 /**
  * Finds and focuses the first or next found record in list. 
  * @param strSearched {String} Text to find
  * @param bReset {boolean} if true search from begining.
  */
  search.selectRecord = function(strSearched, bReset) {
    if(bReset) search.resetResult();
    var mylist =  search.getServer().getJSXByName('list');
    var objXSL =  new jsx3.xml.Document();
    objXSL.load(search.getServer().resolveURI('xsl/findrecordid.xsl'));
    var objXML =  search.getServer().getCache().getDocument("cachedlist");
    var params= {'searchedtext':strSearched, 'resultindex':resultIndex}
    var objPROC = new jsx3.xml.Template(objXSL);
    objPROC.setParams(params);
    var strRECORDID = objPROC.transform(objXML);
    jsx3.log("id = " + strRECORDID);
    if (strRECORDID){
      resultIndex++;
      mylist.focusRowById(strRECORDID)
    }
    else{
      var message = (resultIndex == 1)?'Text not found':'End of search'
      search.resetResult();
      search.getServer().alert(message,message)
    }
  } 

/**
 * Resets the search index to 1
 */
  search.resetResult = function() {
    resultIndex = 1 ;
  }

})