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

  _userLoginUri: "http://localhost:8080/Class/User",

  userLogin: function(username, password, onLogin, onTimeout, onAll) {
    var request = new jsx3.net.Request(),
        s = jsx3.ide.getIDESettings(),
        id = this.getId();

    if (onLogin) {
      request.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, onLogin);
    }
    if (onTimeout) {
      request.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, onTimeout);
    }
    if (onAll) {
      request.subscribe('*', onAll);
    }

    request.open("post", this._userLoginUri, true);
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(jsx3.$O.json({
      id: "call1",
      method: "authenticate",
      params: [
        username,
        password
      ]
    }), 5000);
  },

  uploadUserPrototype: function(objPalette, objTree) {
    var s = jsx3.ide.getIDESettings();
    var id = this.getId();

    if (s.get(id, 'username')) {
      var objRecord = objTree.getRecord(objTree.getValue());
      var objXML = this._loadComponentForUpload(objRecord.path);
      if (objXML) {
        objPalette.setUploadDetail(objXML, objRecord);
      }
    } else {
      objPalette.setUserView('login');
    }
  },

  _loadComponentForUpload: function(strPath) {
    var Document = jsx3.xml.Document;
    var doc = new Document();

    var strPath = jsx3.net.URIResolver.getResolver(strPath).resolveURI(strPath);

    var objXML = doc.load(strPath);
    if (objXML.hasError()) {
      return null;
    }

    return objXML;
  },

  _doUploadComponent: function(objName, objDescription, objXML, objPalette, objButton, objSpinner, objPalette) {
  }
});
