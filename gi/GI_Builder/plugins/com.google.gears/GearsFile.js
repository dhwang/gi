/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.net.Request.addSchemeHandler("gears", jsx3.io.FileRequest.jsxclass);

jsx3.Class.defineClass("com.google.gears.FileSystem", jsx3.io.FileSystem, null, function(FileSystem, FileSystem_prototype) {

  FileSystem_prototype.init = function() {
    this.jsxsuper();
    this._initDB();
  };

  FileSystem_prototype.getFile = function(strPath) {
    var uri = jsx3.net.URI.valueOf(strPath);
    if (!uri.getScheme())
      uri = new jsx3.net.URI("gears://" + (uri.getPath().indexOf("/") != 0 ? "/" : "") + uri.getPath());

    return new com.google.gears.File(this, uri);
  };

  FileSystem_prototype.getUserDocuments = function() {
    return this.getFile("gears:///");
  };

  FileSystem_prototype.getRoots = function() {
    return [this.getFile("gears:///")];
  };

  FileSystem_prototype.createTempFile = function(strName) {
    var tmpDir = this.getFile("gears:///tmp");
    if (!tmpDir.isDirectory())
      tmpDir.mkdir();

    var tmp = null;
    do {
      tmp = tmpDir.resolve(strName + "." + Math.round(Math.random() * 0xFFFFFF).toString(16));
    } while (tmp.exists());

    tmp.write("");
    return tmp;
  };

  FileSystem._DB = "GIBuilder"

  FileSystem_prototype._getDB = function() {
    var db = google.gears.factory.create('beta.database');
    db.open(FileSystem._DB);
    return db;
  };

  FileSystem_prototype._initDB = function() {
    var db = this._getDB();
    db.execute('CREATE TABLE IF NOT EXISTS file ' +
               '  (id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
               '   pid INTEGER, name text, mtime INTEGER, type TEXT, size INTEGER, data BLOB)');
    db.execute('CREATE TRIGGER IF NOT EXISTS file_delete AFTER DELETE ON file ' +
               'BEGIN ' +
               '  DELETE FROM file WHERE pid=OLD.id; ' +
               'END');

    var rs = db.execute('SELECT * FROM file WHERE id=?', [1]);
    if (!rs.isValidRow()) {
      db.execute('INSERT INTO file (id,name,type) VALUES (?,?,?)', [1, "", "folder"]);
    }
    rs.close();
    db.close();
  };

  // Includes: id, data, size, mtime, type, pid
  FileSystem_prototype._getRecord = function(id, bData) {
    var db = this._getDB();
    var rv = null;
    var rs = db.execute('SELECT id, size, mtime, type, pid, name' + (bData ? ', data' : '') + ' FROM file WHERE id=?', [id]);
    if (rs.isValidRow()) {
      rv = {
        id: rs.field(0),
        size: rs.field(1),
        mtime: rs.field(2),
        type: rs.field(3),
        pid: rs.field(4),
        name: rs.field(5)
      }

      if (bData)
        rv.data = rs.field(6);
    }

    rs.close();
    db.close();
    return rv;
  };

  FileSystem._SET_FIELDS = ["data", "size", "mtime", "type", "pid", "name"];

  // Can include: data, size, mtime, type, pid
  FileSystem_prototype._setRecord = function(id, r) {
    var fields = [];
    var values = [];

    for (var i = 0; i < FileSystem._SET_FIELDS.length; i++) {
      var f = FileSystem._SET_FIELDS[i];
      if (typeof(r[f]) != "undefined") {
        fields.push(f);
        values.push(r[f]);
      }
    }

    values.push(id);
    var q = "UPDATE file SET " + fields.join("=?, ") + "=? WHERE id=?";

    var db = this._getDB();
    db.execute(q, values);
    db.close();
  };

  FileSystem_prototype._createRecord = function(r, tokens) {
    var pid = this._getPKForPath(tokens.slice(0, tokens.length - 1));
    if (!pid)
      throw new jsx3.Exception("Cannot create record with non-existent parent: " + tokens);

    var db = this._getDB();
    db.execute("INSERT INTO file (name,pid,type) VALUES (?,?,?)", [tokens[tokens.length - 1], pid, "file"]);
    var rv = db.lastInsertRowId;
    db.close();
    return rv;
  };

  FileSystem_prototype._deleteRecord = function(id) {
    var db = this._getDB();
    db.execute("DELETE FROM file WHERE id=?", [id]);
    db.close();
  };

  // returns $A of {id:ID, name:NAME}
  FileSystem_prototype._getChildren = function(id) {
    var db = this._getDB();
    var rs = db.execute("SELECT id, name FROM file WHERE pid=?", [id]);

    var c = jsx3.$A();
    while (rs.isValidRow()) {
      c.push({id:rs.field(0), name:rs.field(1)});
      rs.next();
    }

    rs.close();
    db.close();
    return c;
  };

  FileSystem_prototype._getPKForPath = function(tokens) {
    // Return the root file
    if (tokens.length == 0)
      return 1;
    // Skip empty tokens
    if (tokens[tokens.length - 1] == "")
      return this._getPKForPath(tokens.slice(0, tokens.length - 1));

    var pid = this._getPKForPath(tokens.slice(0, tokens.length - 1));

    if (pid == null)
      return null;

    var rv = null;
    var db = this._getDB();
    var rs = db.execute("SELECT id FROM file WHERE pid=? AND name=?", [pid, tokens[tokens.length - 1]]);
    if (rs.isValidRow()) {
      rv = rs.field(0);
    }

    rs.close();
    db.close();
    return rv;
  };

});

jsx3.Class.defineClass("com.google.gears.File", jsx3.io.File, null, function(File, File_prototype) {

  File_prototype.init = function(fs, uri, pk) {
    this.jsxsuper(fs, uri);

    if (uri.getScheme() != "gears")
      throw new jsx3.Exception("scheme is not 'gears': " + uri);

    this._pk = pk;
  };

  File_prototype._getTokens = function() {
    var p = this._uri.getPath().substring(1).split("/");
    if (p.length > 1 && p[p.length - 1] == "")
      p.splice(p.length - 1, 1);
    return p;
  };

  File_prototype._getPK = function() {
    if (!this._pk) {
      var tokens = this._getTokens();
      this._pk = this._fs._getPKForPath(tokens);
    }
    return this._pk;
  };

  File_prototype._getRec = function(bData) {
    var id = this._getPK();
    return id ? this._fs._getRecord(id, bData) : null;
  };

  File_prototype._setRec = function(r) {
    var id = this._getPK();
    if (id)
      this._fs._setRecord(id, r);
    else {
      var tokens = this._getTokens();
      id = this._fs._createRecord(r, tokens);
      this._fs._setRecord(id, r);
    }
  };

  File_prototype._delRec = function() {
    var id = this._getPK();
    if (id)
      this._fs._deleteRecord(id);
  };

  File_prototype.write = function(strData, objParams) {
    if (!objParams) objParams = {};

    var strLineMode = objParams.linebreakmode;
    if (strLineMode) strData = strData.split(/\r\n|\r|\n/g).join(jsx3.io.File.LINE_SEP[strLineMode]);

    this._setRec({data: strData, size:strData.length, mtime:(new Date()).getTime(), type:"file"});
    return true;
  };

  File_prototype.read = function() {
    var rec = this._getRec(true);
    return rec ? rec.data : null;
  };

  File_prototype.isDirectory = function() {
    var rec = this._getRec();
    return rec && rec.type == "folder";
  };

  File_prototype.isFile = function() {
    var rec = this._getRec();
    return rec && rec.type == "file";
  };

  File_prototype.exists = function() {
    return this._getPK() != null;
  };

  File_prototype.listFiles = function() {
    var id = this._getPK();
    if (id) {
      return this._fs._getChildren(id).map(jsx3.$F(function(e) {
        return new File(this._fs, this.toURI().resolve(e.name), e.id);
      }).bind(this));
    } else {
      return [];
    }
  };

  File_prototype.mkdir = function() {
    var rec = this._getRec();
    if (rec) {
      if (rec.type == "file")
        throw new jsx3.Exception("File already exists: " + this);
    } else {
      this._setRec({type:"folder"});
    }
  };

  File_prototype.deleteFile = function() {
    this._delRec();
  };

  File_prototype.renameTo = function(objDest) {
    var rec = objDest._getRec();
    if (rec) {
      if (rec.type == "file")
        objDest.deleteFile();
      else
        throw new jsx3.Exception("Directory already exists: " + objDest);
    }

    var parent = objDest.getParentFile();
    var pid = parent._getPK();
    this._setRec({pid:pid, name:objDest.getName()});
  };

  File_prototype.isHidden = function() {
    return false;
  };

  File_prototype.isReadOnly = function() {
    return false;
  };

  File_prototype.setReadOnly = function(bReadOnly) {
  };

  /**
   * get files stats
   * @return {map} [ctime: created time, mtime: last modified type, atime: last access time, size: size]
   */
  File_prototype.getStat = function() {
    var rec = this._getRec();
    return rec ? {mtime:rec.mtime ? new Date(rec.mtime) : null, size:rec.size} : {mtime: null, size: null}
  };

  File_prototype.toURI = function() {
    var u = this._uri;
    if (!jsx3.$S(u.getPath()).endsWith("/") && this.isDirectory()) {
      var path = u.getPath().replace(/\\/g,"/") + (this.isDirectory() ? "/" : "");
      if (path.substring(0, 1) != "/") path = "/" + path;
      this._uri = jsx3.net.URI.fromParts(u.getScheme(), u.getUserInfo(), u.getHost(), u.getPort(), path, 
              u.getQuery(), u.getFragment());
    }
    return this._uri;
  };

});
