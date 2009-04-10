/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Wraps the file system. Based on java.io.File.
 */
jsx3.Class.defineClass("jsx3.io.File", null, null, function(File, File_prototype) {

  /** @private @jsxobf-clobber */
  File.FSO = null;

  // create a singleton FileSystemObject
  try {
    if (window.ActiveXObject) {
      File.FSO = new ActiveXObject("Scripting.FileSystemObject");
    } else {
      jsx3.util.Logger.getLogger("jsx3.ide").error("Could not instantiate ActiveX Scripting.FileSystemObject.");
    }
  } catch (e) {
    jsx3.util.Logger.getLogger("jsx3.ide").error("Could not instantiate ActiveX Scripting.FileSystemObject.",
        jsx3.NativeError.wrap(e));
    File.FSO = null;
  }
 
  /**
   * @return {boolean}
   */
  File.isLoaded = function() {
    return File.FSO != null;
  };
  
  File.PATH_SEPARATOR = "\\";
  
  /** @private @jsxobf-clobber */
  File.ATTR_READONLY = 1;
  /** @private @jsxobf-clobber */
  File.ATTR_HIDDEN = 2;
  /** @private @jsxobf-clobber */
  File.ATTR_SYSTEM = 4;
  
  /** {int} */
  File.FIND_INCLUDE = 1;
  /** {int} */
  File.FIND_RECURSE = 2;
  
  /** @private @jsxobf-clobber */
  File_prototype._path = null;
  
  /**
   * instance initializer
   * @param strParent {String|jsx3.net.URI} the parent directory of the file, or the entire file path
   * @param strPath {String} the name of the file in the strParent directory
   */
  File_prototype.init = function(strParent, strPath) {
    if (strParent instanceof jsx3.net.URI) {
      if (strParent.getScheme() != "file")
        throw new jsx3.Exception("scheme is not 'file': " + strParent);
      this._path = (strParent.isAbsolute() && strParent.getPath()) ? 
          strParent.getPath().substring(1) : strParent.getPath();        
    } else {
      if (strParent instanceof File)
        this._path = strParent.getAbsolutePath().replace(/\\/g, "/");
      else if (strParent)
        this._path = strParent.replace(/\\/g, "/").replace(/^\/+(\w+):/, "$1:");
      else
        this._path = "";
      
      if (strPath) {
        strPath = strPath.replace(/\\/g, "/");
        if (this._path && ! jsx3.util.strEndsWith(this._path, "/") && strPath.indexOf("/") != 0)
          this._path += "/";
        this._path += strPath;
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
  File_prototype.write = function(strData, strCharset, strLineMode, bCharsetFailover, bNoLog) {
    var log = jsx3.ide.LOG;
    var bUnicode = strCharset != null && strCharset.toLowerCase() == "utf-16";

    if (strLineMode) strData = strData.split(/\r\n|\r|\n/g).join(File._LINE_SEP[strLineMode]);

    if (strCharset && !bUnicode) {
      try {
        this.writeADO(strData, strCharset);
        return true;
      } catch (e) {
        if (!bNoLog)
          log.error("Could not write file " + this + (strCharset ? " with character encoding " + strCharset : "") + ".",
              jsx3.NativeError.wrap(e));
        if (! bCharsetFailover)
          return false;
      }
    }

    var f = null;

    try {
      //file name, overwrite, unicode
      f = File.FSO.CreateTextFile(this.getPath(), true, bUnicode);
      f.Write(strData);
      f.Close();
      return true;
    } catch (e) {
      if (f != null) f.close();

      if (!bNoLog) {
        if ((e.number & 0xFFFF) == 5) {
          log.error("Failed to write file " + this + " because the content contains unsupported characters.", jsx3.NativeError.wrap(e));
        } else if ((e.number & 0xFFFF) == 70) {
          log.error("Failed to write file " + this + " because the file in not writable.", jsx3.NativeError.wrap(e));
        } else {
          log.error("Failed to write file " + this + ".", jsx3.NativeError.wrap(e));
        }
      }
    }
    
    return false;
  };

  /** @private @jsxobf-clobber */
  File_prototype.writeADO = function(strData, strCharset) {
    var s = new ActiveXObject("ADODB.Stream");
    s.Mode = 3;
    s.Type = 2;
    s.Open();
    s.CharSet = strCharset;
    s.WriteText(strData);
    s.SaveToFile(this.getAbsolutePath(), this.exists() ? 2 : 1);
    s.Close();
  };
  
  /**
   * reads text data from a file
   * @param bUnicode {boolean} if true read as unicode
   * @return {String} file contents
   */
  File_prototype.read = function() {
    try {
      // FSO throws error opening an empty file :-(
      if (this.isFile() && this.getStat().size == 0)
        return "";

      // open the selected file
      var oFile = this.getFileObject();
      var f = oFile.OpenAsTextStream(1, -2);
      
      var r = f.ReadAll();
      f.Close();

      // return document data
      return r;
    } catch (e) {
      jsx3.ERROR.doLog("FILE04", "Failed to read file " + this + ": " + e.description, 4);
    }
    
    return null;
  };
  
  /**
   * whether file exists and is a directory
   * @return {boolean}
   */
  File_prototype.isDirectory = function() {
    var fo = this.getFileObject();
    return fo != null && (fo.Attributes & 0x18) > 0;
  };
  
  /**
   * whether file exists and is a file
   * @return {boolean}
   */
  File_prototype.isFile = function() {
    var fo = this.getFileObject();
    return fo != null && (fo.Attributes & 0x18) == 0;
  };
  
  /**
   * get the folder containing this file; throws an error if this file or does not actually exist on disk. 
   * @return {jsx3.io.File} the parent or null if already root
   */
  File_prototype.getParentFile = function() {
    var file = this.getFileObject();
    
    if (file != null) {
      return file.ParentFolder != null ? File.fromImplementation(file.ParentFolder) : null;
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
    
    var index = path.lastIndexOf("\\");
    
    if (index == path.length-1) {
      path = path.substring(0, path.length-1);
      index = path.lastIndexOf("\\");
    }
    
    if (index < 0) return null;
    
    return path.substring(0, index);
  };
  
  /**
   * get the folders and files contained in this folder
   * @return {Array<jsx3.io.File>}
   */
  File_prototype.listFiles = function() {
    var files = [];

    if (this.isDirectory()) {
      var directory = this.getFileObject();

      var e = new Enumerator(directory.SubFolders);
      for (; !e.atEnd(); e.moveNext()) {
        var file = File.fromImplementation(e.item());
        files.push(file);
      }
        
      e = new Enumerator(directory.Files);
      for (; !e.atEnd(); e.moveNext()) {
        var file = File.fromImplementation(e.item());
        files.push(file);
      }
    } else {
      throw new jsx3.Exception("Cannot list contents of non-existent file " + this + ".");
    }
    
    return files;
  };
    
  /**
   * create this file as a directory
   */
  File_prototype.mkdir = function() {
    File.FSO.CreateFolder(this.getPath());
  };
    
  /**
   * create this directory and any non-existent parent directories
   */
  File_prototype.mkdirs = function() {
    var parentPath = this.getParentPath();
    if (parentPath != null) {
      var objParent = new File(parentPath);
      if (! objParent.isDirectory())
        objParent.mkdirs();
    }
    
    if (! this.isDirectory())
      this.mkdir();
  };
    
  /**
   * delete this file/directory
   */
  File_prototype.deleteFile = function() {
    var file = this.getFileObject();
    
    if (file != null) {
      file.Delete();
    } else {
      throw new jsx3.Exception("Cannot delete non-existent file " + this + ".");
    }
  };
    
  /**
   * get the path field
   * @return {String} the path that this file was created with
   */
  File_prototype.getPath = function() {
    if (this._path == null && this._fileObject != null)
      this._path = this._fileObject.Path;
    return this._path;
  };
    
  /**
   * get the absolute path
   * @return {String}
   */
  File_prototype.getAbsolutePath = function() {
    if (this._abspath == null) {
      var fo = this.getFileObject();
      if (fo != null) {
        this._abspath = fo.Path;
      } else {
        /* @jsxobf-clobber */
        this._abspath = File.FSO.GetAbsolutePathName(this.getPath());
      }
    }
    return this._abspath;
  };
    
  /**
   * get the name of the file excluding the parent path
   * @return {String}
   */
  File_prototype.getName = function() {
    return File.FSO.GetFileName(this.getAbsolutePath());
  };
  
  /**
   * the file extension (ie 'txt'), always lowercase
   * @return {String}
   */
  File_prototype.getExtension = function() {
    var path = this.getAbsolutePath();
    if (path) {
      var indexSlash = path.lastIndexOf("\\");
      var indexDot = path.lastIndexOf(".");
      if (indexDot > indexSlash) return path.substring(indexDot+1);
    }
    return null;
//    var ext = File.FSO.GetExtensionName(this.getPath());
//    if (ext) ext = ext.toLowerCase();
//    return ext;
  };
    
  /**
   * whether the file exists
   * @return {boolean}
   */
  File_prototype.exists = function() {
    return this.isFile() || this.isDirectory();
  };
    
  /**
   * move this file/directory
   * @param objDest {jsx3.io.File} destination file
   */
  File_prototype.renameTo = function(objDest) {
    if (this.equals(objDest))
      throw new jsx3.Exception("Cannot rename file " + this + " to itself.");

    var file = this.getFileObject();
    
    if (file != null) {
      if (objDest.isFile()) objDest.deleteFile();
      file.Move(objDest.getPath());
    } else {
      throw new jsx3.Exception("Cannot move non-existent file " + this + ".");
    }
  };
  
  /**
   * copy this file/directory
   * @param objDest {jsx3.io.File} destination file
   */
  File_prototype.copyTo = function(objDest) {
    var file = this.getFileObject();
    
    if (file != null) {
      try {
        file.Copy(objDest.getPath());
      } catch (e) {
        throw new jsx3.Exception("Error copying " + this + " to " + objDest + ".", jsx3.NativeError.wrap(e));
      }
    } else {
      throw new jsx3.Exception("Cannot copy non-existent file " + this + ".");
    }
  };
  
  /**
   * get the path of a valid temp file
   * @return {jsx3.io.File} the temp file
   */
  File.createTempFile = function(strName) {
//    var tmpDir = File.FSO.GetSpecialFolder(2);
    var tmpName = File.FSO.GetTempName();
    var tmpPath = jsx3.app.Browser.getLocation().resolve(tmpName);
    var tmpFile = new File(tmpPath);
    if (!tmpFile.exists()) {
      var f = File.FSO.CreateTextFile(tmpFile.getPath(), true, false);
      f.Close();
    }

    return tmpFile;
  };

  /**
   * whether file is hidden
   * @return {boolean}
   */
  File_prototype.isHidden = function() {
    var file = this.getFileObject();
    return file != null ? ((file.Attributes & File.ATTR_HIDDEN) > 0) : false;
  };
  
  /**
   * whether file is read only
   * @return {boolean}
   */
  File_prototype.isReadOnly = function() {
    var file = this.getFileObject();
    return file != null ? ((file.Attributes & File.ATTR_READONLY) > 0) : false;
  };
  
  /** @private @jsxobf-clobber */
  File._allRecursive = function(x) { return File.FIND_INCLUDE | File.FIND_RECURSE; };
  
  /**
   * sets the read-only bit on a file
   * @param bReadOnly {boolean} the new value of the bit
   */
  File_prototype.setReadOnly = function(bReadOnly, bRecursive) {
    var file = this.getFileObject();
    if (file != null) {
      if (bReadOnly)
        file.Attributes |= File.ATTR_READONLY;
      else if ((file.Attributes & File.ATTR_READONLY) > 0)
        file.Attributes -= File.ATTR_READONLY;
      
      if (bRecursive && this.isDirectory()) {
        var files = this.find(File._allRecursive, true);
        for (var i = 0; i < files.length; i++) {
          file = files[i].getFileObject();
          if (bReadOnly)
            file.Attributes |= File.ATTR_READONLY;
          else if ((file.Attributes & File.ATTR_READONLY) > 0)
            file.Attributes -= File.ATTR_READONLY;
        }
      }
    }
  };
  
  /**
   * whether this file is a root node in the file syste
   * @return {boolean}
   */
  File_prototype.isRoot = function() {
    var file = this.getFileObject();
    return file != null ? file.IsRootFolder : false;
  };
  
  /**
   * english description of file type
   * @return {String}
   */
  File_prototype.getType = function() {
    var file = this.getFileObject();
    return file != null ? file.Type : null;
  };
  
  /**
   * get files stats
   * @return {map} [ctime: created time, mtime: last modified type, atime: last access time, size: size]
   */
  File_prototype.getStat = function() {
    var file = this.getFileObject();
    if (file != null) {
      var stat = {
//        ctime: new Date(file.DateCreated),
        mtime: new Date(file.DateLastModified)//,
//        atime: new Date(file.DateLastAccessed)
      };
      
      if (this.isFile())
        stat.size = file.Size;
      
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
   * Whether this file is contained within <code>file</code>.
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
    var tokens = relativePath.split('\\');
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
   * @private
   * @jsxobf-clobber
   */
  File_prototype.getFileObject = function() {
    if (this._fileObject != null)
      return this._fileObject;
    if (this._path == null)
      return null;

    var path = this.getPath();
    if (File.FSO.FileExists(path))
      this._fileObject = File.FSO.GetFile(path);
    else if (File.FSO.FolderExists(path))
      this._fileObject = File.FSO.GetFolder(path);
    else
      this._fileObject = null;
    
    return this._fileObject;
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

  /**
   * Returns the root directory of this file. On Windows this is the drive containing this file. On most other
   * systems it is the root "/" directory.
   * @return {jsx3.io.File}
   */
  File_prototype.getRootDirectory = function() {
    var fo = this.getFileObject();
    if (fo != null) {
      while (fo.ParentFolder != null)
        fo = fo.ParentFolder;
      return File.fromImplementation(fo);
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
  
  File.getUserHome = function() {
    var shell = new ActiveXObject("WScript.Shell");
    var desktop = shell.specialFolders("Desktop");
    return new File(desktop).getParentFile();
  };

  File.getUserDocuments = function() {
    var shell = new ActiveXObject("WScript.Shell");
    var docs = shell.specialFolders("MyDocuments");
    var docsFolder = new File(docs);
    return docsFolder.isDirectory() ? docsFolder : File.getUserHome();
  };

  File.getRoots = function() {
    var roots = [];
    var e = new Enumerator(File.FSO.Drives);
    for (; !e.atEnd(); e.moveNext()) {
      var r = e.item();
      roots.push(new File(r.DriveLetter + ":\\"));
//      // only get drives that are mounted
//      if (r.IsReady)
//        roots.push(File.fromImplementation(r.RootFolder));
    }
    return roots;
  };

  File_prototype.toString = function() {
    return this.getPath();
  };

  /** @private @jsxobf-clobber */
  File.fromImplementation = function(imp) {
    var f = File.jsxclass.bless();
    /* @jsxobf-clobber */
    f._fileObject = imp;
    return f;
  };

});
