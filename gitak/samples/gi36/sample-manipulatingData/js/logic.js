// make a short cut
jsx3.app.Server.prototype.get = jsx3.app.Server.prototype.getJSXByName;

jsx3.lang.Package.definePackage(
"eg.manipulateCDF",                //the full name of the package to create
function(manipulateCDF) {          //name the argument of this function

  var Block = jsx3.gui.Block;

    /**
    * Returns the application server object which by default is the application
    * namespace as specified in Project->Deployment Options.
    *
    * @returns {jsx3.app.Server} the application server object.
    */
    manipulateCDF.getServer = function() {
      // should be the same as namespace in Project -> Deployment Options
      return eg.manipulateCDF.SERVER;
    }

  /**
    * selected Function selected from menu menuXY
    */
    manipulateCDF.fXYType = "sum" ;

  /**
    * selected Function selected from menu menuX
    */
    manipulateCDF.fXType  = "sum" ;

  /**
    * selected Function selected from menu menuyY
    */
    manipulateCDF.fYType  = "sum" ;

  /**
    * selected Function selected from menu menuZ
    */
    manipulateCDF.fZType  = "sum" ;

  /**
    * Applies the selected functions to the columns X, Y and Z
    * Modifies the original CDF document
    * Creates a new CDF document from selected list.
    */
    manipulateCDF.calculate = function(){
      // New CDF Document ( later add modified records to this Object)
      var appServer = this.getServer(), objFiltered = jsx3.xml.CDF.newDocument();
      var objRoot = objFiltered.getRootNode();
      var objEndresult = objRoot.createNode(jsx3.xml.Entity.TYPEELEMENT,"record");
      objEndresult.setAttribute("jsxid",jsx3.xml.CDF.getKey())
      objEndresult.setAttribute("jsxtext","Total");

      // Sets the default value for place holder based on selected function, multiplication or summation
      var resultTotalX = ( manipulateCDF.fXType == "sum") ? 0 : 1;
      var resultTotalY = ( manipulateCDF.fYType == "sum") ? 0 : 1;
      var resultTotalZ = ( manipulateCDF.fZType == "sum") ? 0 : 1;
      // Place holder for selected record
      var objNode;
      // Place holders for attributes X and Y and their result
      var xint, yint, resultXY ;
      // Object list
      var objSOURCE = appServer.get("srcList");
      var selectedRECORDS = objSOURCE.getSelectedNodes();
      // Gets all records if none is selected
      if (!selectedRECORDS.hasNext()){
        selectedRECORDS = objSOURCE.getXML().selectNodes("//data/*");
      }
      while (selectedRECORDS.hasNext()){
        objNode = selectedRECORDS.next();
        xint = parseInt(objNode.getAttribute("jsxIntX"));
        yint = parseInt(objNode.getAttribute("jsxIntY"));
        // Applies the select function to x and y for selected Record
        resultXY = manipulateCDF.doCalculateXY(xint,yint,manipulateCDF.fXYType)
        // Sets the value for column Z
        objNode.setAttribute("jsxIntXY",resultXY);
        // update original record view
        objSOURCE.redrawRecord(objNode.getAttribute("jsxid"), jsx3.xml.CDF.UPDATE);
        // Clones and add the selected record in newly created new CDF document
        objRoot.appendChild(objNode.cloneNode(true));
        // Applies the select function to y and previous y result
        resultTotalZ = manipulateCDF.doCalculateXY(resultTotalZ,resultXY,manipulateCDF.fZType)
        // Applies the select function to X and previous X result
        resultTotalX = manipulateCDF.doCalculateXY(resultTotalX,xint,manipulateCDF.fXType)
        // Applies the select function to Z and previous Z result
        resultTotalY = manipulateCDF.doCalculateXY(resultTotalY,yint,manipulateCDF.fYType)
      }

      // create end results for end result list and filtered list
      manipulateCDF.addToEndResult(resultTotalX,resultTotalY,resultTotalZ);
      objEndresult.setAttribute("jsxIntX",resultTotalX);
      objEndresult.setAttribute("jsxIntY",resultTotalY);
      objEndresult.setAttribute("jsxIntXY",resultTotalZ);
      objRoot.appendChild(objEndresult);

      // Adds the document to the cache
      appServer.getCache().setDocument("cachedFiltered",objFiltered);
      //appServer.get("listFiltered").repaintData(); // changed matrix "bind" to automatically refresh
      manipulateCDF.repaintXMLBlocks()
      // deselect lists and menus
      manipulateCDF.resetRecordSelection(objSOURCE);
      manipulateCDF.resetRecordSelection(appServer.get("listFiltered"));
      manipulateCDF.resetRecordSelection(appServer.get("listMultiSelect"))
    }

  /**
    * Applies the function cType on parameters intX and intY and returns the result
    * @param intX  {int}
    * @param intY  {int}
    * @param cType (String}
    * @retirn {int}
    */
    manipulateCDF.doCalculateXY = function(intX, intY, cType){
      var result = null ;
      switch(cType) {
        case "sum":
          result= intX + intY;
          break;
        case "mult":
          result= intX * intY;
          break;
        default:
          result= intX + intY;
          break;
      }
      return result
    }

  /**
    * Modifies the end result record for the second list
    * @param intX  {int}
    * @param intY  {int}
    * @param intY  {int}
    */
   manipulateCDF.addToEndResult = function(intX,intY,intZ){
    var objSOURCE   = manipulateCDF.getServer().get("endResultIist");
    var objRecordNode = objSOURCE.getRecordNode("unique")
    objRecordNode.setAttribute("jsxfX",intX);
    objRecordNode.setAttribute("jsxfY",intY);
    objRecordNode.setAttribute("jsxfZ",intZ);
    objSOURCE.insertRecordNode(objRecordNode, null, true);
   }

   manipulateCDF.resetRecordSelection = function(listOBJ){
    if (!listOBJ) listOBJ = manipulateCDF.getServer().get("srcList");
     listOBJ.deselectAllRecords()
   }

   manipulateCDF.selectRecord = function(listOBJ,strRECORDID){
    listOBJ.selectRecord(strRECORDID)
   }

   manipulateCDF.repaintXMLBlocks = function(){
    var blockXfiltered = manipulateCDF.getServer().get("blockXfiltered");
    var blockXmodified = manipulateCDF.getServer().get("blockXmodified");

    var radioFiltered = manipulateCDF.getServer().get("radioFiltered");
    if(radioFiltered.getSelected()==jsx3.gui.RadioButton.SELECTED){
      blockXmodified.setDisplay(Block.DISPLAYNONE  ,false);
      blockXfiltered.setDisplay(Block.DISPLAYBLOCK ,false);
    }
    else{
      blockXfiltered.setDisplay(Block.DISPLAYNONE ,false);
      blockXmodified.setDisplay(Block.DISPLAYBLOCK,false);
    }
    //blockXmodified.repaint();
    //blockXfiltered.repaint();
    blockXfiltered.getParent().repaint();
    return false
   }

   manipulateCDF.onRadioSelected = function(){
     setTimeout( function() { manipulateCDF.repaintXMLBlocks() } , 200);
   }

    manipulateCDF.onlyOne = []; // only one of these should exist.
/**
  * Launches a simple dialog as a child of server body block if one dosen't exists.
  * Brings an existing dialog forward instead of launching it again
  * @param url : location of the resource
  * @param name : jsxname the resource
  */
manipulateCDF.launchSimple = function(url,name) {
   
   var mainBlock = manipulateCDF.getServer().getBodyBlock(), objDialog = mainBlock.getChild(name);
   if (!objDialog){
    objDialog = mainBlock.load(url,false);
    this.onlyOne.push(objDialog);
    mainBlock.paintChild(objDialog);
   }
   else{
    objDialog.focus();
   }
}

});
