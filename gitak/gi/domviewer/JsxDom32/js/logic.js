jsx3.require('jsx3.xml.Document');
jsx3.require('jsx3.gui.Dialog');
jsx3.require('jsx3.gui.StackGroup');
jsx3.require('jsx3.gui.Matrix');
jsx3.require('jsx3.gui.Tree');
jsx3.require('jsx3.gui.Splitter');
jsx3.require('jsx3.gui.BlockX');

 jsx3.lang.Package.definePackage(
   "tibco.qa.jsxdom",                           // the full name of the package to create
   function(jsxdom) {                  // name the argument of this function
     jsxdom.dispDom = function (objButton) {
        var objTree = objButton.getServer().getJSXByName('treeJsxDom');
        var contBlock = objTree.getParent();
        contBlock.showMask('Building DOM Tree, please wait...');
        objTree.resetCacheData();
        setTimeout( function () {jsxdom.buildDomTree(objButton.getServer().getBodyBlock(),null, false);}, 100);
         
     }   

     jsxdom.dispObjProperties = function (objTree, objRecordId) {
      var objRecord = objTree.getRecord(objRecordId);
      var objId = objRecord.jsxid;
      var objJSX = objTree.getServer().getJSXById(objId);

      var objGrid = objTree.getServer().getJSXByName('gridProps');
      objGrid.resetCacheData();
      var otype = objJSX.getClass().getName();
      var orec = new Object();
      orec.propName = 'jsxtype';
      orec.propValue = otype;
      objGrid.insertRecord(orec, null, false);

      for (p in objJSX) {
       if ( (objJSX[p] != null) && (typeof(objJSX[p]) != "function") ) {
        var o = new Object();
        o.jsxid = "grid_dom_" + jsx3.xml.CDF.getKey();
        o.propName = p;
        o.propValue = objJSX[p].toString();
        //jsx3.log('p='+p+'/obj[p]='+objJSX[p].toString());
        objGrid.insertRecord(o,null,false);
       }
      }
        objGrid.repaint();      
     };

     // define a static method like this:
     jsxdom.dispObjXml = function (objTree,objRecordId) {
      var objRecord = objTree.getRecord(objRecordId);
      var xmlDisp = objTree.getServer().getJSXByName('xmlBlock'); // blockX
       xmlDisp.resetXmlCacheData();
       if (objRecord.xmlString)
        xmlDisp.setXMLString(objRecord.xmlString);
       else
        xmlDisp.clearXmlData();
       xmlDisp.repaint();
     };


     jsxdom.buildDomTree = function (objJSX,strParentId,bNoEmbed) {
       var objTree = objJSX.getServer().getJSXByName('treeJsxDom');

       //create record object (will become a record node in the CDF)
       var o = new Object();

       //is this a null object? (is this a new component?)
       if(strParentId == null) { 
         o.jsxid = "rootid";
         o.jsxtext = "JSXBODY";
         o.jsximg = "JSX/images/tbb/default.gif";
         o.jsxopen = "1";
         var bFirst = true
       } else {
         var bFirst = false;
         // determine the persistence 
         var intPersist = objJSX.getPersistence();
     
         //build out the style
         var strStyle = "";
         if (intPersist == jsx3.app.Model.PERSISTNONE || bNoEmbed) {
           strStyle = "font-style:italic;color:#215483;";
         } else if(intPersist == jsx3.app.Model.PERSISTREF) {
           //ref
           strStyle = "font-style:italic;color:blue;";
         } else if(intPersist == jsx3.app.Model.PERSISTREFASYNC) {
           //ref-async
           strStyle += "font-style:italic;color:green;";
         }
     
         //assume the tree should stay open by default
         o.jsxid = objJSX.getId();
         o.jsxopen = "1";
         o.objText = objJSX.getText();
         o.objName = objJSX.getName();
         if (o.objName == 'dlgJsxDom') o.jsxopen = 0; // the dialog itself need not be expanded.
         o.jsxtext = objJSX.getName();
         o.jsxstyle = strStyle;
        
         if (objJSX.instanceOf(jsx3.xml.CDF) ) {
             o.xmlString = objJSX.getXML().getXML(); // xml.document->xml::string
             o.jsximg = "JSX/images/tbb/default.gif";
         }
       }
     
       //insert; recurse to populate descendants
       objTree.insertRecord(o,strParentId,false);
       if (intPersist == null || intPersist == jsx3.app.Model.PERSISTNONE || intPersist == jsx3.app.Model.PERSISTEMBED) {
         var objKids = objJSX.getChildren();
         var maxLen = objKids.length;
     
         for (var i=0;i<maxLen;i++)
           jsxdom.buildDomTree(objKids[i], o.jsxid, (strParentId != null &&
               (intPersist == jsx3.app.Model.PERSISTNONE || bNoEmbed)));
       }

       objTree.repaint();
       objTree.getParent().hideMask();
     }; // end buildTree    

    jsxdom.doEval = function (objJSX) {
       try {
        result = eval(objJSX.getServer().getJSXByName('txtScript').getValue()); 
        } catch (ex) {
          result = ex.message;
        }
        objJSX.getServer().getJSXByName('txtResult').setValue(result);   
    };

    jsxdom.doCopy = function (objJSX, column) {
        var mtx = objJSX.getContextParent();
        var recid = objJSX.getContextRecordId();
        var record = mtx.getRecord(recid);
        if (column == 1)
            jsx3.html.copy(record.propName);
        else
            jsx3.html.copy(record.propValue);
    };
   }
 );