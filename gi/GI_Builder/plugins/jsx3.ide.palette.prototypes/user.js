jsx3.$O(this).extend({
  _getUserLibraries: function() {
    var nodeImg = this.resolveURI('jsxapp:/images/icon_7.gif');
    var doc = jsx3.xml.CDF.Document.newDocument();
    
    var protoDir = jsx3.ide.getHomeRelativeFile('prototypes');
    var root = doc.insertRecord({
      jsxid: 'user', jsxtext: 'Workspace', jsxopen: '1', jsximg: nodeImg, type: "folder",
      syspath: jsx3.ide.getSystemDirFile().relativePathTo(protoDir)
    });

    this._resolvers['user'] = null;

    this._doPLDirectoryRead(doc, root, protoDir, jsx3.net.URIResolver.USER);
    this._resolvers['user'] = jsx3.net.URIResolver.USER;

    return doc;
  },

  reloadUserLibraries: function(objTree) {
    var doc = this._getUserLibraries();
    objTree.setSourceXML(doc);
    this.publish({subject: "user_reloaded"});
  },

  uploadUserPrototype: function(objTree) {
    console.log(objTree);
  }
});
