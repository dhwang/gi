/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Provides cached access to XML and XSL data.
 */
jsx3.Class.defineClass("jsx3.app.Cache", null, [jsx3.util.EventDispatcher], function(Cache, Cache_prototype) {

  /**
   * {String}
   * @package
   * @final @jsxobf-final
   */
  Cache.EVENT_CHANGE = "change";

  /**
   * Creates a new instance of this class.
   */
  Cache_prototype.init = function() {
    // declare an object array to hold all cache documents
    /* @jsxobf-clobber */
    this._index = {};
    /* @jsxobf-clobber */
    this._parents = [];
    /* @jsxobf-clobber */
    this._waiting = {};
  };
  
  Cache_prototype.addParent = function(objParent) {
    this._parents.push(objParent);
  };

  /**
   * Removes the document stored in this cache under id <code>strId</code>.
   * @param strId {String}
   */
  Cache_prototype.clearById = function(strId) {
    if (this._index[strId] != null) {
      delete this._index[strId];
      this.onChange();
    }
  };

/* @JSC :: begin DEP */

  /**
   * returns whether or not the given document in the cache is owned by the system. If no document by the given ID exists, false is returned.
   * @param strId {String} unique identifier for the jsx3.xml.DocumentInstance instance when it was placed in the cache
   * @return {boolean} <code>false</code>.
   * @deprecated
   */
  Cache_prototype.isSystem = function(strId) {
    return false;
//    return this._index[strId] != null && this._index[strId].jsxsystem;
  };

/* @JSC :: end */

  /**
   * Removes all documents placed in this cache before <code>intTimestamp</code>.
   * @param intTimestamp {int|Date} epoch seconds or a date object.
   */
  Cache_prototype.clearByTimestamp = function(intTimestamp) {
    if (intTimestamp instanceof Date) intTimestamp = intTimestamp.getTime();

    var changed = false;
    for (var p in this._index) {
      var record = this._index[p];
      if (record.jsxtimestamp < intTimestamp) {
        delete this._index[p];
        changed = true;
      }
    }

    //call 'onChange' event in case any calling classes have added their own custom 'onChange' callback/scriptlet
    if (changed) this.onChange();
  };

  /**
   * Returns the document stored in this cache under id <code>strId</code>.
   * @param strId {String}
   * @return {jsx3.xml.Document} the stored document or <code>null</code> if none exists.
   */
  Cache_prototype.getDocument = function(strId) {
    if (this._index[strId] != null)
      return this._index[strId].jsxdocument;
    
    for (var i = 0; i < this._parents.length; i++) {
      var doc = this._parents[i].getDocument(strId);
      if (doc != null) return doc;
    }

    return null;
  };
  
  /**
   * Retrieves a document from this cache or, if this cache contains no such document, loads the document
   * synchronously and returns it.
   * @param strURL {String|jsx3.net.URI} the URI of the document.
   * @param strId {String} the id under which the document is/will be stored. If this parameter is not provided, the
   *    <code>strURL</code> parameter is used as the id.
   * @param objClass {jsx3.lang.Class} <code>jsx3.xml.Document</code> (default value) or one of its subclasses. The
   *    class with which to instantiate the new document instance if a new document is opened.
   */
  Cache_prototype.getOrOpenDocument = function(strURL, strId, objClass) {
    if (strId == null) strId = strURL.toString();
    return this.getDocument(strId) || this.openDocument(strURL, strId, objClass);
  };

  /**
   * Synchronously loads an xml document, stores it in this cache, and returns the loaded document.
   * @param strURL {String|jsx3.net.URI} url (relative or absolute) the URI of the document to open.
   * @param strId {String} the id under which to store the document. If this parameter is not provided, the
   *    <code>strURL</code> parameter is used as the id.
   * @param objClass {jsx3.lang.Class} <code>jsx3.xml.Document</code> (default value) or one of its subclasses. The
   *    class with which to instantiate the new document instance.
   * @return {jsx3.xml.Document} the loaded document object.
   */
  Cache_prototype.openDocument = function(strURL, strId, objClass) {
    if (objClass == null) objClass = jsx3.xml.Document.jsxclass;
    if (strId == null) strId = strURL.toString();

    var objXML = objClass.newInstance();
    objXML.load(strURL);
    
    this.setDocument(strId, objXML);
    return objXML;
  };

  /**
   * Asynchronously loads an xml document and stores it in this cache. A client of this method can be notified that
   * the document has loaded by passing in a callback function.
   *
   * @param strURL {String|jsx3.net.URI} url (relative or absolute) the URI of the document to open.
   * @param strId {String} the id under which to store the document. If this parameter is not provided, the
   *    <code>strURL</code> parameter is used as the id.
   * @param objClass {jsx3.lang.Class} <code>jsx3.xml.Document</code> (default value) or one of its subclasses. The
   *    class with which to instantiate the new document instance.
   * @param fctCallback {Function} an optional callback function that takes one argument, which is the document that
   *    was loaded.
   * @package  not sure this is really working
   */
  Cache_prototype.openDocumentAsync = function(strURL, strId, objClass, fctCallback) {
    var Document = jsx3.xml.Document;

    if (objClass == null) objClass = Document.jsxclass;
    if (strId == null) strId = strURL.toString();

    if (this._waiting[strId]) return;

    // clear any document currently in the cache with this id
    delete this._index[strId];

    var objXML = objClass.newInstance();
    objXML.setAsync(true);
    objXML.subscribe("*", this, function(objEvent) {
      if (this._waiting[strId]) {
        this.setDocument(strId, objXML);
        delete this._waiting[strId];
      }
      
      objXML.unsubscribe("*", this);
      if (fctCallback) fctCallback(objXML);
    });

    this._waiting[strId] = true;
    objXML.load(strURL);
  };

  /**
   * Stores the document <code>objDocument</code> in this cache under id <code>strId</code>. If a document already
   * exists in this cache under <code>strId</code> then that document is removed from the cache.
   *
   * @param strId {String} the id under which to store <code>objDocument</code>.
   * @param objDocument {jsx3.xml.Document} 
   * @param-package bOnChange {boolean}
   */
  Cache_prototype.setDocument = function(strId, objDocument, bOnChange) {
    if (strId == null) throw new jsx3.IllegalArgumentException("strId", strId);
    if (objDocument == null) throw new jsx3.IllegalArgumentException("objDocument", objDocument);
    
//    //explicitly de-reference existing object in cache if it exists
//    this.clearById(strId, false);

    //create a new cache object
    var record = {};
    /* @jsxobf-clobber */
    record.jsxtimestamp = (new Date()).getTime();
    /* @jsxobf-clobber */
    record.jsxdocument = objDocument;

    //persist to cache
    this._index[strId] = record;
    delete this._waiting[strId];

    if (bOnChange !== false) this.onChange();
  };

  /**
   * Returns the timestamp from when the document stored under id <code>strId</code> was stored in this cache.
   * @param strId {String} the id under which the document is stored.
   * @return {int} the timestamp as an integer (epoch seconds) or <code>null</code> if no such document exists
   *    in this cache.
   */
  Cache_prototype.getTimestamp = function(strId) {
    var record = this._index[strId];
    return record != null ? record.jsxtimestamp : null;
  };

  /**
   * called by internal XMLCACHE functions whenever a document is removed/added to the cache.
   * @private
   */
  Cache_prototype.onChange = function() {
    this.publish({subject:Cache.EVENT_CHANGE});
  };

  /**
   * Returns a list of all the keys in this cache instance.
   * @return {Array<String>}
   */
  Cache_prototype.keys = function() {
    var keys = [];
    for (var f in this._index)
      keys[keys.length] = f;
    return keys;
  };
  
  /**
   * Removes all references to documents contained in this cache. This cache is no longer usable after calling this
   * method.
   */
  Cache_prototype.destroy = function() {
    delete this._index;
    delete this._parents;
  };
  
});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.Cache
 * @see jsx3.app.Cache
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Cache", -, null, function(){});
 */
jsx3.Cache = jsx3.app.Cache;

/* @JSC :: end */
