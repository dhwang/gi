/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Wraps the file system. Based on java.io.File.
 */
jsx3.Class.defineClass("jsx3.io.File", null, null, function(File, File_prototype) {

  File._LOADED = false;

  var ep = netscape.security.PrivilegeManager.enablePrivilege;
  /** @private @jsxobf-clobber */
  File._PERM = "UniversalXPConnect";
  
  try {
    ep(File._PERM);

    /** @private @jsxobf-clobber */
    File._F = {};

    /* @jsxobf-clobber */
    File._F._FILE = new Components.Constructor("@mozilla.org/file/local;1", "nsILocalFile", "initWithPath");
    /* @jsxobf-clobber */
    File._F._URL = new Components.Constructor("@mozilla.org/network/standard-url;1", "nsIURL");
    /* @jsxobf-clobber */
    File._F._INPUTSTREAM = new Components.Constructor("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
    /* @jsxobf-clobber */
    File._F._PROTOCOL = Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(
        Components.interfaces["nsIFileProtocolHandler"]);
    /* @jsxobf-clobber */
    File._F._DIRSERVICE = Components.classes["@mozilla.org/file/directory_service;1"].getService(
        Components.interfaces["nsIProperties"]);
    /* @jsxobf-clobber */
    File._F._IOSERVICE = Components.classes["@mozilla.org/network/io-service;1"].getService(
        Components.interfaces["nsIIOService"]);
    /* @jsxobf-clobber */
    File._F._RDF = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);

    /* @jsxobf-clobber */
    File._LOADED = true;
  } catch (e) {
    jsx3.ide.LOG.error("Error instantiating file system access.",
        jsx3.NativeError.wrap(e));
  }
  
  /**
   * @return {boolean}
   */
  File.isLoaded = function() {
    return File._LOADED;
  };
  
  /** @package */
  File.PATH_SEPARATOR = jsx3.app.Browser.getSystem() == jsx3.app.Browser.WIN32 ? "\\" : "/";
  /** @private @jsxobf-clobber */
  File.READONLY_PERM = jsx3.app.Browser.getSystem() == jsx3.app.Browser.WIN32 ? 07555 : 07577;
  /** @private @jsxobf-clobber */
  File.READWRITE_PERM = jsx3.app.Browser.getSystem() == jsx3.app.Browser.WIN32 ? 0222 : 0200;
    
  /** {int} */
  File.FIND_INCLUDE = 1;
  /** {int} */
  File.FIND_RECURSE = 2;
  
  /** @private @jsxobf-clobber */
  File_prototype._path = null;
  /** @private @jsxobf-clobber */
  File_prototype._imp = null;
  
  /**
   * instance initializer
   * @param strParent {String|jsx3.net.URI} the parent directory of the file, or the entire file path
   * @param strPath {String} the name of the file in the strParent directory
   */
  File_prototype.init = function(strParent, strPath) {
    ep(File._PERM);
    
    if (strParent instanceof jsx3.net.URI) {
      if (strParent.getScheme() != "file")
        throw new jsx3.Exception("scheme is not 'file': " + strParent);
      
      try {
        this._imp = File._F._PROTOCOL.getFileFromURLSpec(strParent.toString());
        this._path = this._imp.path;
      } catch (e) {
        this._imp = null;
        this._path = strParent.getPath().substring(1);
      }
    } else {
      if (strParent instanceof File)
        this._path = strParent.getAbsolutePath().replace(/\\/g, "/");
      else if (strParent)
        this._path = strParent.replace(/\\/g, "/");
      else
        this._path = "";
      
      if (strPath) {
        strPath = strPath.replace(/\\/g, "/");
        if (this._path && ! jsx3.util.strEndsWith(this._path, "/") && strPath.indexOf("/") != 0)
          this._path += "/";
        this._path += strPath;
      }
      
      var uri = "file:" + (this._path.indexOf("/") == 0 ? "" : "/") + this._path;
      try {
        this._imp = File._F._PROTOCOL.getFileFromURLSpec(uri);
        this._path = this._imp.path;
      } catch (e) {
//        jsx3.util.Logger.GLOBAL.logStack(1, "Error making file " + uri + ": " + e);
        jsx3.log("Error making file " + uri + ": " + e + " (" + strParent + "," + strPath + ")");
        this._imp = null;
      }
    }
  };

  /** @private @jsxobf-clobber */
  File._LINE_SEP = {dos:"\r\n", mac:"\r", unix:"\n"};

  /**
   * writes text data to a file; if bUnicode is false or null and the first write attempt fails, this method tries to write again with unicode output
   * @param strData {String} the text to write
   * @param strCharset {String}
   * @return {boolean} success
   */
  File_prototype.write = function(strData, strCharset, strLineMode, bCharsetFailover) {
    if (! this._imp) return null;

    if (strLineMode) strData = strData.split(/\r\n|\r|\n/g).join(File._LINE_SEP[strLineMode]);

    ep(File._PERM);
    var perms = 0755 | File.READWRITE_PERM;

    try {
      if (! this._imp.exists())
        this._imp.create(0x00, perms); 
      
      var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces["nsIFileOutputStream"]);
      outputStream.init(this._imp, 0x20 | 0x02, perms, null);

      if (strCharset) {
        var charConverter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
        charConverter.init(outputStream, strCharset, 0, "?".charAt(0));

        charConverter.writeString(strData);
        charConverter.close();
      } else {
        outputStream.write(strData, strData.length);
        outputStream.flush();
      }

      outputStream.close();
      // HACK: seems to be that writing to a file requires this to be updated for read to work
      this._imp = File._F._PROTOCOL.getFileFromURLSpec(this.toURI().toString());

      return true;
    } catch (e) {
      if (strCharset && bCharsetFailover) {
        jsx3.ide.LOG.error("Could not write file " + this + (strCharset ? " with character encoding " + strCharset : "") + ".",
            jsx3.NativeError.wrap(e));
        return this.write(arguments[0], null, strLineMode, false);
      } else {
        jsx3.ide.LOG.error("Failed to write to file " + this + ".", jsx3.NativeError.wrap(e));
        return false;
      }
    }
  };

  /**
   * reads text data from a file
   * @param bUnicode {boolean} if true read as unicode
   * @return {String} file contents
   */
  File_prototype.read = function() {
    if (! this._imp) return null;
    
    ep(File._PERM);
    try {
      var bytes = this._imp.fileSize;
      
      var uri = File._F._IOSERVICE.newFileURI(this._imp);
      var channel = File._F._IOSERVICE.newChannelFromURI(uri);
      var inputStream = new File._F._INPUTSTREAM();
      inputStream.init(channel.open());
      
      var contents = inputStream.read(bytes);
      inputStream.close();
      
      return contents;
    } catch (e) {
      throw new jsx3.Exception("Failed to read file " + this + ": " + e);
    }
  };
  
  /**
   * whether file exists and is a directory
   * @return {boolean}
   */
  File_prototype.isDirectory = function() {
    ep(File._PERM);    
    return this._imp != null && this._imp.exists() && this._imp.isDirectory();
  };
  
  /**
   * whether file exists and is a file
   * @return {boolean}
   */
  File_prototype.isFile = function() {
    ep(File._PERM);    
    return this._imp != null && this._imp.exists() && this._imp.isFile();
  };
  
  /**
   * get the folder containing this file; throws an error if this file or does not actually exist on disk. 
   * @return {jsx3.io.File} the parent or null if already root
   */
  File_prototype.getParentFile = function() {
    ep(File._PERM);
    if (this._imp && this._imp.exists()) {
      // throwing an exception on Windows
      try {
        var parent = this._imp.parent;
      } catch (e) { return null; }

      if (parent != null && !parent.equals(this._imp))
        return File.fromImplementation(parent);
      else
        return null;
    } else {
      throw new jsx3.Exception("Cannot get parent of non-existent file " + this + ".");
    }
  };
  
  /**
   * get the path of the parent of this file, will work even for non-existent files
   * @return {String}
   */
  File_prototype.getParentPath = function() {
    var path = this.getAbsolutePath();
    
    var index = path.lastIndexOf(File.PATH_SEPARATOR);
    
    if (index == path.length-1) {
      path = path.substring(0, path.length-1);
      index = path.lastIndexOf(File.PATH_SEPARATOR);
    }
    
    if (index < 0) return null;
    
    return path.substring(0, index);
  };
  
  /**
   * get the folders and files contained in this folder
   * @return {Array<jsx3.io.File>}
   */
  File_prototype.listFiles = function() {
    ep(File._PERM);
    var files = [];
    
    if (this._imp) {
      var entries = this._imp.directoryEntries;
  
      while (entries.hasMoreElements()) {
        var file = entries.getNext().QueryInterface(Components.interfaces["nsILocalFile"]);
        files.push(File.fromImplementation(file));
      }
    }
    
    return files;
  };
    
  /**
   * create this file as a directory
   */
  File_prototype.mkdir = function() {
    ep(File._PERM);
    if (this._imp) {
      if (this._imp.parent && this._imp.parent.exists() && this._imp.parent.isDirectory()) {
        if (this._imp.exists()) {
          if (! this._imp.isDirectory())
            throw new jsx3.Exception("Error creating directory " + this + ": file already exists.");
        } else {
          this._imp.create(0x01, 0755);
        }
      } else {
        throw new jsx3.Exception("Error creating directory " + this + ": parent directory does not exist.");
      }
    } else {
      throw new jsx3.Exception("Error creating directory " + this + ": bad path.");
    }
  };
    
  /**
   * create this directory and any non-existent parent directories
   */
  File_prototype.mkdirs = function() {
    ep(File._PERM);
    if (this._imp) {
      if (!this._imp.exists() || !this._imp.isDirectory())
        this._imp.create(0x01, 0755);
    } else {
      throw new jsx3.Exception("Error creating directory " + this + ": bad path.");
    }
  };
    
  /**
   * delete this file/directory
   */
  File_prototype.deleteFile = function() {
    ep(File._PERM);    
    
    if (!(this._imp && this._imp.exists()))
      throw new jsx3.Exception("Error deleting file " + this + ": this file does not exist.");      

    if (this.isDirectory()) {
      this._imp.remove(true);
    } else {
      this._imp.remove(false);
    }
  };
    
  /**
   * get the path field
   * @return {String} the path that this file was created with
   */
  File_prototype.getPath = function() {
    return this._path;
  };
    
  /**
   * get the absolute path
   * @return {String}
   */
  File_prototype.getAbsolutePath = function() {
    if (this._abspath == null) {
      ep(File._PERM);
      try {
        var path = this._path;
        if (jsx3.app.Browser.WIN32) {
          if (this._path.length <= 3 && this._path.charAt(1) == ":")
            path += "\\\\\\";
        }
        var f = new File._F._FILE(path);
        f.normalize();
        /* @jsxobf-clobber */
        this._abspath = f.path;
      } catch (e) {
        this._abspath = this._path;
      }
    }
    return this._abspath;
  };
    
  /**
   * get the name of the file excluding the parent path
   * @return {String}
   */
  File_prototype.getName = function() {
    ep(File._PERM);
    return this._imp && this._imp.leafName;
  };
  
  /**
   * the file extension (ie 'txt'), always lowercase
   * @return {String}
   */
  File_prototype.getExtension = function() {
    var name = this.getName();
    if (name) {
      var index = name.lastIndexOf(".");
      if (index >= 0)
        return name.substring(index+1);
    }
    return "";
  };
    
  /**
   * whether the file exists
   * @return {boolean}
   */
  File_prototype.exists = function() {
    ep(File._PERM);    
    if (this._imp != null && this._imp.exists()) {
      if (this._imp.isDirectory()) {
        try {
          var t = this._imp.directoryEntries.length;
          return true;
        } catch (e) {
          this._imp = null;
        }
      } else {
        return true;
      }
    }
    return false;
  };
    
  /**
   * move this file/directory
   * @param objDest {jsx3.io.File} destination file
   */
  File_prototype.renameTo = function(objDest) {
    ep(File._PERM);    
    var destImp = objDest._imp;
    
    if (!(destImp && this._imp && this._imp.exists()))
      throw new jsx3.Exception("Error renaming file " + this + ": this file does not exist.");      
    
    var newDir = destImp.parent;
    var newName = destImp.leafName;
    if (!(newDir.exists() && newDir.isDirectory()))
      throw new jsx3.Exception("Error renaming file " + this + ": destination directory does not exist.");        
    
    if (destImp.exists())
      objDest.deleteFile();
    this._imp.moveTo(newDir, newName);
  };
  
  /**
   * copy this file/directory
   * @param objDest {jsx3.io.File} destination file
   */
  File_prototype.copyTo = function(objDest) {
    ep(File._PERM);    
    var destImp = objDest._imp;

    if (!(destImp && this._imp && this._imp.exists()))
      throw new jsx3.Exception("Error copying file " + this + ": this file does not exist.");      

    var newDir = destImp.parent;
    var newName = destImp.leafName;
    if (!(newDir.exists() && newDir.isDirectory()))
      throw new jsx3.Exception("Error copying file " + this + ": destination directory does not exist.");        
    
    if (this.isFile()) {
      this._imp.copyTo(newDir, newName);
    } else if (this.isDirectory()) {
      objDest.mkdir();
      var children = this.listFiles();
      for (var i = 0; i < children.length; i++) {
        var src = children[i];
        var dest = new File(objDest, src.getName());
        src.copyTo(dest);
      }
    }
  };
  
  /**
   * get the path of a valid temp file
   * @return {jsx3.io.File} the temp file
   */
  File.createTempFile = function(strName) {
    ep(File._PERM);
    var perms = 0755 | File.READWRITE_PERM;
    var tmpDir = File._F._DIRSERVICE.get("TmpD", Components.interfaces["nsIFile"]);
    tmpDir.append(strName);
    tmpDir.createUnique(0x00, perms);
    return File.fromImplementation(tmpDir);
  };
  
  /**
   * whether file is hidden
   * @return {boolean}
   */
  File_prototype.isHidden = function() {
    ep(File._PERM);
    return this._imp && this._imp.exists() && this._imp.isHidden();
  };
  
  /**
   * whether file is read only
   * @return {boolean}
   */
  File_prototype.isReadOnly = function() {
    ep(File._PERM);
    return this._imp && this._imp.exists() && ! this._imp.isWritable();
  };
  
  /** @private @jsxobf-clobber */
  File._allRecursive = function(x) { return File.FIND_INCLUDE | File.FIND_RECURSE; };
  
  /**
   * sets the read-only bit on a file
   * @param bReadOnly {boolean} the new value of the bit
   */
  File_prototype.setReadOnly = function(bReadOnly, bRecursive) {
    ep(File._PERM);
    if (this.exists()) {
      if (bReadOnly) {
        this._imp.permissions &= File.READONLY_PERM;
        if (bRecursive && this.isDirectory()) {
          var files = this.find(File._allRecursive, true);
          for (var i = 0; i < files.length; i++)
            files[i]._imp.permissions |= File.READONLY_PERM;
        }
      } else {
        this._imp.permissions |= File.READWRITE_PERM;
        if (bRecursive && this.isDirectory()) {
          var files = this.find(File._allRecursive, true);
          for (var i = 0; i < files.length; i++)
            files[i]._imp.permissions |= File.READWRITE_PERM;
        }
      }
    }
  };
  
  /**
   * whether this file is a root node in the file syste
   * @return {boolean}
   */
  File_prototype.isRoot = function() {
    ep(File._PERM);
    if (this._imp) {
      try {
        var parent = this._imp.parent;
        return parent == null || ! parent.exists();
      } catch (e) {
        return true;
      }
    } else {
      return false;
    }
  };
  
  /**
   * english description of file type
   * @return {String}
   */
  File_prototype.getType = function() {
    return this.isDirectory() ? "Folder" : this.getExtension().toUpperCase() + " File";
  };
  
  /**
   * get files stats
   * @return {map} [ctime: created time, mtime: last modified type, atime: last access time, size: size]
   */
  File_prototype.getStat = function() {
    ep(File._PERM);
    if (this._imp) {
      var stat = {
        mtime: new Date(this._imp.lastModifiedTime)
      };
      
      if (this.isFile())
        stat.size = this._imp.fileSize;
      
      return stat;
    } else {
      return null;
    }
  };
  
  /**
   * whether two instances of this class represent the same file on disk
   * @param file {object} another File instance
   */
  File_prototype.equals = function(file) {
    return file != null && file instanceof File &&
        this.getAbsolutePath() == file.getAbsolutePath();
  };
  
  /**
   * whether the file argument is a contained within this folder instance
   * @param file {jsx3.io.File} the possible descendant
   * @param intMaxDepth {int} the maximum number of nested folders to look in
   * @return {boolean}
   */
  File_prototype.isDescendantOf = function(file, intMaxDepth) {
    var path2 = this.getAbsolutePath();
    var path1 = file.getAbsolutePath();
    
    var ok = path2.length > path1.length && path2.indexOf(path1) == 0 &&
        (path2.charAt(path1.length) == File.PATH_SEPARATOR || path2.charAt(path1.length - 1) == File.PATH_SEPARATOR);
    if (!ok || !intMaxDepth) return ok;
    
    var relativePath = file.relativePathTo(this);
    var tokens = relativePath.split(File.PATH_SEPARATOR);
    return tokens.length <= intMaxDepth;
  };
  
  /**
   * construct a relative file path from this file to the file argument, including any necessary '..'
   * @param file {jsx3.io.File} 
   * @return {String}
   */
  File_prototype.relativePathTo = function(file) {
    return this.toURI().relativize(file.toURI()).toString();
  };
  
  /**
   * find all descendants of this folder according to a filter function
   * @param fctFilter {function} returns a bit mask including jsx3.io.File.FIND_INCLUDE is the file should be included in the result and jsx3.io.File.FIND_RECURSE if the folder should be recursed into.
   * @param bRecursive {boolean} whether to search recursively into sub folders.
   * @param-private arrDest {Array<jsx3.io.File>}
   * @return {Array<jsx3.io.File>} the found files
   */
  File_prototype.find = function(fctFilter, bRecursive, arrDest) {
    if (arrDest == null) arrDest = [];
    
    var files = this.listFiles();
    for (var i = 0; i < files.length; i++) {
      var result = fctFilter.call(null, files[i]);
      
      if ((result & File.FIND_INCLUDE) > 0)
        arrDest.push(files[i]);
      
      if (bRecursive && files[i].isDirectory() && (result & File.FIND_RECURSE) > 0)
        files[i].find(fctFilter, bRecursive, arrDest);
    }
    
    return arrDest;
  };

  /**
   * @return {jsx3.net.URI}
   */
  File_prototype.toURI = function() {
    if (this._uri == null) {
      var path = this.getAbsolutePath().replace(/\\/g,"/") + (this.isDirectory() ? "/" : "");
      if (path.substring(0, 1) != "/") path = "/" + path;
      /* @jsxobf-clobber */
      this._uri = jsx3.net.URI.fromParts("file", null, null, null, path, null, null);
    }
    return this._uri;
  };

  File_prototype.getRootDirectory = function() {
    if (this.exists()) {
      var f = this;
      while (true) {
        var parent = f.getParentFile();
        if (parent == null || f.equals(parent))
          return f;
        f = parent;
      }
    } else {
      var f = this;
      while (!f.exists()) {
        var ppath = f.getParentPath();
        if (!ppath || f.getPath() == ppath)
          return null;
        f = new File(ppath);
      }
      if (f.exists())
        return f.getRootDirectory();
    }
    return null;
  };

  File_prototype.toString = function() {
    return this._path;
  };

  File.getUserHome = function() {
    ep(File._PERM);
    var file = File._F._DIRSERVICE.get("Desk", Components.interfaces["nsIFile"]);
//    var file = File._F._DIRSERVICE.get("Home", Components.interfaces["nsIFile"]);
    return file != null ? File.fromImplementation(file.parent) : null;
  };
  
  File.getUserDocuments = function() {
    var home = File.getUserHome();
    var list = home.listFiles();
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.isDirectory()) {
        if (f.getName() == "Documents" || f.getName() == "My Documents")
          return f;
      }
    }
    return home;
  };

  File.getRoots = function() {
    try {
      ep(File._PERM);
      var ds = File._F._RDF.GetDataSource("rdf:files");
      var rsc = File._F._RDF.GetResource("NC:FilesRoot");
      var prd = File._F._RDF.GetResource("http://home.netscape.com/NC-rdf#child");
      var targets = ds.GetTargets(rsc, prd, true);
      var roots = [];
      while (targets.hasMoreElements()) {
        var target = targets.getNext();
        if (target instanceof Components.interfaces.nsIRDFResource) {
          var d = new File(new jsx3.net.URI(target.Value));
      //        try {
          //          // only get drives that are mounted
          //          d._imp.directoryEntries;
                roots.push(d);
      //        } catch (e) {}
        }
      }
      return roots;
    } catch(ex) {
      jsx3.ide.LOG.warn("Error determining file system roots: " + jsx3.NativeError.wrap(ex));
      return [];
    }
  };

  /** @private @jsxobf-clobber */
  File.fromImplementation = function(imp) {
    var f = File.jsxclass.bless();
    f._imp = imp;
    f._path = imp.path;
    return f;
  };

});
