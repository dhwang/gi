/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/** GET PROTOTYPE LIBRARIES **************************************/
/**
 * ? getPrototypeLibraries() -- returns a record set containing all the prototypes available to the IDE. This includes system prototypes, addin prototypes, and user prototypes.
 * ! returns --(XML) nested record set
 */
jsx3.ide.getPrototypeLibraries = function() {
  var nodeImg = jsx3.IDE.resolveURI('images/icon_7.gif');
	var doc = jsx3.xml.CDF.newDocument();
	var root = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
	root.setAttribute('jsxid', 'components');
	root.setAttribute('jsxtext', "Components");
	root.setAttribute('jsxopen', "1");
	doc.appendChild(root);
	
	var currentNode = null;
	
	// do system prototypes
	currentNode = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
	currentNode.setAttribute('jsxid', 'system');
	currentNode.setAttribute('jsxtext', "System");
	currentNode.setAttribute('type', 'system');
	currentNode.setAttribute('jsxopen', "1");
	currentNode.setAttribute('jsxunselectable', '1');
  currentNode.setAttribute('jsximg', nodeImg);
  currentNode.setAttribute('sorton', 'a');
  root.appendChild(currentNode);
	jsx3.ide.doPLDirectoryRead(currentNode, jsx3.ide.getBuilderRelativeFile('prototypes'), jsx3.IDE);
	
	// do addin prototypes
	currentNode = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
	currentNode.setAttribute('jsxid', 'addins');
	currentNode.setAttribute('jsxtext', "Addins");
	currentNode.setAttribute('type', 'addin');
	currentNode.setAttribute('jsxopen', "1");
	currentNode.setAttribute('jsxunselectable', '1');
  currentNode.setAttribute('jsximg', nodeImg);
  currentNode.setAttribute('sorton', 'b');
  root.appendChild(currentNode);
	var addins = jsx3.System.getAddins();
	for (var i = 0; i < addins.length; i++) {
		var addin = addins[i];
    var prototypesDir = jsx3.ide.getSystemRelativeFile(addin.resolveURI(jsx3.app.AddIn.PROTOTYPES_DIR));
    if (prototypesDir.isDirectory()) {
      var addinNode = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
      addinNode.setAttribute('jsxid', currentNode.getAttribute('jsxid') + '/' + addin.getKey());
      addinNode.setAttribute('jsxtext', addin.getName());
      addinNode.setAttribute('type', 'folder');
      addinNode.setAttribute('key', addin.getKey());
      addinNode.setAttribute('jsxunselectable', '1');
      addinNode.setAttribute('jsximg', nodeImg);
      addinNode.setAttribute('abspath', prototypesDir.getAbsolutePath());
      addinNode.setAttribute('jsxlazy', '1');
      currentNode.appendChild(addinNode);
    }
	}
	
	// do user prototypes
	currentNode = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
	currentNode.setAttribute('jsxid', 'user');
	currentNode.setAttribute('jsxtext', "User");
	currentNode.setAttribute('type', 'user');
	currentNode.setAttribute('jsxopen', "1");
	currentNode.setAttribute('jsxunselectable', '1');
  currentNode.setAttribute('jsximg', nodeImg);
  currentNode.setAttribute('sorton', 'c');
  root.appendChild(currentNode);
	jsx3.ide.doPLDirectoryRead(currentNode, jsx3.ide.getHomeRelativeFile('prototypes'), jsx3.net.URIResolver.USER);
	
	return doc;
};



/** DO PL DIRECTORY READ **************************************/
jsx3.ide.doPLDirectoryRead = function(parent, file, objResolver) {
  var home = jsx3.ide.getSystemDirFile();
  var leafImg = jsx3.IDE.resolveURI('images/icon_46.gif');

  if (file.isDirectory()) {
		var list = file.listFiles();
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
      if (jsx3.ide.isFileToIgnore(item)) continue;

      var name = item.getName();
      if (item.isDirectory()) {
        var node = parent.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
				node.setAttribute('jsxid', parent.getAttribute('jsxid') + '/' + name);
				node.setAttribute('jsxtext', name);
				node.setAttribute('type', 'folder');
        node.setAttribute('jsxlazy', '1');
				node.setAttribute('jsxunselectable', '1');
        node.setAttribute('jsximg', parent.getAttribute("jsximg"));
        node.setAttribute('sorton', 'a_' + (name.charAt(0) == "~" ? ("z" + name) : name));
        node.setAttribute('abspath', item.getAbsolutePath());
        parent.appendChild(node);
			} else if (item.getExtension() == 'xml') {
				var node = parent.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record');
				node.setAttribute('jsxid', parent.getAttribute('jsxid') + '/' + name);
				node.setAttribute('jsxtext', name);
				node.setAttribute('type', 'component');
				node.setAttribute('path', objResolver != null && !jsx3.IDE.equals(objResolver) ?
            objResolver.relativizeURI(home.relativePathTo(item)) :
            jsx3.ide.SERVER.relativizeURI(home.relativePathTo(item), true));
        node.setAttribute('abspath', item.getAbsolutePath());
        node.setAttribute('jsximg', leafImg);
        node.setAttribute('sorton', 'b_' + name);
        jsx3.ide.doPLRefineRecord(node, item, objResolver);
        parent.appendChild(node);
			}
		}
	} else {
		return false;
	}
	
	return true;
};


jsx3.ide.doPLDirData = function(objTree, objXML, objNode) {
  var objFile = new jsx3.io.File(objNode.getAttribute("abspath"));

  var objResolver = null;
  var objRecord = objNode, objLastRecord = null;
  while (objRecord != null && objResolver == null) {
    if (objRecord.getAttribute("type") == "system")
      objResolver = jsx3.IDE;
    else if (objRecord.getAttribute("type") == "user")
      objResolver = jsx3.net.URIResolver.USER;
    else if (objRecord.getAttribute("type") == "addin")
      objResolver = jsx3.System.getAddin(objLastRecord.getAttribute("key"));

    objLastRecord = objRecord;
    objRecord = objRecord.getParent();
  }

  jsx3.ide.doPLDirectoryRead(objNode, objFile, objResolver);
  return {bCLEAR:true};
};

/* @jsxobf-clobber */
jsx3.ide._nameRE = new RegExp("<(?:meta name=\")?name(?:\")?>(<!\\[CDATA\\[)?(.*?)(\\]\\]>)?</");
/* @jsxobf-clobber */
jsx3.ide._iconRE = new RegExp("<(?:meta name=\")?icon(?:\")?>(<!\\[CDATA\\[)?(.*?)(\\]\\]>)?</");
/* @jsxobf-clobber */
jsx3.ide._descRE = new RegExp("<(?:meta name=\")?description(?:\")?>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?</");
/* @jsxobf-clobber */
jsx3.ide._typeRE = new RegExp("<object type=['\"]([\\.\\w]+)['\"]");

/* @jsxobf-clobber */
jsx3.ide.doPLRefineRecord = function(objNode, objFile, objResolver) {
  var name = null, icon = null, description = "";

  var content = objFile.read();

  var r1 = jsx3.ide._nameRE.exec(content);
  if (r1 && r1[0])
    name = r1[2];

  var r2 = jsx3.ide._iconRE.exec(content);
  if (r2 && r2[0])
    icon = r2[2];

  var r3 = jsx3.ide._descRE.exec(content);
  if (r3 && r3[0])
    description = r3[2].replace(/\s+/g, " ");

  var r4 = jsx3.ide._typeRE.exec(content);
  if (r4 && r4[0])
    description = "[" + r4[1] + "] " + description;

  if (name) {
    objNode.setAttribute('jsxtext', name);
    objNode.setAttribute('sorton', "b_" + name);
  }

  if (icon)
    objNode.setAttribute('jsximg', objResolver ? objResolver.resolveURI(icon) : icon);
  if (description)
    objNode.setAttribute('jsxtip', description);
};

jsx3.ide.reloadPrototypeLibraries = function(bSkipEvent) {
	var doc = jsx3.ide.getPrototypeLibraries();
	jsx3.IDE.getCache().setDocument('IDE_COMPONENT_LIBS', doc);
	
	if (! bSkipEvent)
		jsx3.IDE.publish({subject: jsx3.ide.events.COMPONENTS_RELOADED});

  jsx3.IDE.getJSXByName("ide_component_libs_tree").repaint();
};
