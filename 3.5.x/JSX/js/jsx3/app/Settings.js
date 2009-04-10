/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _jsxtodo
/**
 * Read-Only system settings interface.
 *
 * @since 3.0
 */
jsx3.Class.defineClass("jsx3.app.Settings", null, null, function(Settings, Settings_prototype) {
  
/* @JSC :: begin DEP */

  /**
   * {int}
   * @final @jsxobf-final
   * @deprecated
   */
  Settings.DOMAIN_SYSTEM = 1;

/* @JSC :: end */

  /**
   * {int} 
   * @final @jsxobf-final
   */
  Settings.DOMAIN_PROJECT = 2;
  
  /**
   * {int} 
   * @final @jsxobf-final
   */
  Settings.DOMAIN_ADDIN = 3;
  
/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  Settings.PATH_SYSTEM = "JSX/settings.xml";
/* @JSC :: end */
  /** @private */
  Settings.PATH_PROJECT = "/config.xml";
  /** @private @jsxobf-clobber */
  Settings.PATH_ADDIN = "/config.xml";
  /** @private @jsxobf-clobber */
  Settings.CACHE_KEY = "JSX_SETTINGS";
  
  /**
   * The instance initializer. Creates a view onto the settings persisted on disk. All identical instances of this
   * class are backed by the same XML source document.
   *
   * @param intDomain {int|jsx3.xml.Document} the domain of the settings to load, one of <code>jsx3.app.Settings.DOMAIN</code>...
   * @param objInstance {String|Object} if in the project or addin domain, the key of the specific project or addin to load settings for
   * @throws {jsx3.IllegalArgumentException}  if <code>intDomain</code> is not a valid domain
   */
  Settings_prototype.init = function(intDomain, objInstance) {
    var cache = null;
    var key = null;
    var url = null;
    
    if (intDomain instanceof jsx3.xml.Document) {
      this.initWith(null, null, intDomain.getSourceURL(), intDomain);
      return;
/* @JSC :: begin DEP */
    } else if (intDomain == Settings.DOMAIN_SYSTEM) {
      cache = jsx3.getSystemCache();
      key = Settings.CACHE_KEY;
      url = Settings.PATH_SYSTEM;
/* @JSC :: end */
    } else if (intDomain == Settings.DOMAIN_PROJECT) {
      if (typeof(objInstance) == 'object') {
        cache = objInstance.getCache();
        key = Settings.CACHE_KEY;
        url = objInstance.getAppPath() + Settings.PATH_PROJECT;
      } else if (typeof(objInstance) == 'string') {
        url = objInstance + Settings.PATH_PROJECT;
      }
    } else if (intDomain == Settings.DOMAIN_ADDIN) {
      cache = jsx3.getSystemCache();
      var path = objInstance instanceof jsx3.app.AddIn ? objInstance.getPath() : jsx3.System.addinKeyToPath(objInstance);
      key = Settings.CACHE_KEY + "_addin_" + path;
      url = path + Settings.PATH_ADDIN;
    } else {
      throw new jsx3.IllegalArgumentException("intDomain", intDomain);
    }
    
    this.initWith(cache, key, url);
  };
  
  /**
   * @private
   * @jsxobf-clobber-shared 
   */
  Settings_prototype.initWith = function(objCache, strKey, strUrl, objDoc) {
    if (objCache != null)
      objDoc = objCache.getDocument(strKey, true);
    
    if (objDoc == null) {
      objDoc = new jsx3.xml.Document();
      if (strUrl != null) {
        this.loadDocument(objDoc, strUrl);
        if (objDoc.hasError()) {
          jsx3.util.Logger.GLOBAL.warn(jsx3._msg("sets.error", strUrl, objDoc.getError()));
          objDoc = (new jsx3.xml.Document()).loadXML('<data jsxid="jsxroot"/>');
        }
      } else {
        jsx3.util.Logger.GLOBAL.warn(jsx3._msg("sets.no_url"));
        objDoc = (new jsx3.xml.Document()).loadXML('<data jsxid="jsxroot"/>');
      }
      
      if (objCache != null)
        objCache.setDocument(strKey, objDoc);
    }
    
    /* @jsxobf-clobber-shared */
    this._path = strUrl;
    /* @jsxobf-clobber-shared */
    this._doc = objDoc;
    /* @jsxobf-clobber-shared */
    this._root = objDoc.getRootNode();
    /* @jsxobf-clobber-shared */
    this._xmlcache = objCache;
    /* @jsxobf-clobber-shared */
    this._cacheKey = strKey;
    
    if (objCache != null)
      /* @jsxobf-clobber-shared */
      this._ts = objCache.getTimestamp(strKey);
  };

  /** @private @jsxobf-clobber-shared */
  Settings_prototype.loadDocument = function(doc, strUrl) {
    doc.load(strUrl);
  };

  /**
   * Returns a stored setting value.
   * @param strKey {String...} the setting key.
   * @return {String|Number|boolean|Array|Object} the stored value.
   */
  Settings_prototype.get = function(strKey) {
    var value = this.getCachedValue(arguments);
    if (typeof(value) == "undefined") {
      var node = this.getNode.apply(this, arguments);
      if (node == null) return null;
      value = Settings.getRecordValue(node);
      this.cacheValue(value, arguments);
    }
    return value;
  };
  
  /**
   * @param strKey {String...} the setting key.
   * @param strField {String} the map field to query on.
   * @param strValue {String} the field value.
   * @package
   */
  Settings_prototype.getMapInArrayByField = function(strKey, strField, strValue) {
    var key = [];
    for (var i = 0; i < arguments.length - 2; i++)
      key.push(arguments[0]);
    
    strField = arguments[arguments.length-2];
    strValue = arguments[arguments.length-1];
    
    var node = this.getNode.apply(this, key);
    if (node) {
      var mapNode = node.selectSingleNode("./record[@type='map' and record[@jsxid='" + strField + 
          "' and .='" + strValue + "']]");
      if (mapNode != null)
        return Settings.getRecordValue(mapNode);
    }
    
    return null;
  };
  
  /**
   * @param strKey {String...} the setting key.
   * @param strField {String} the map field to query on.
   * @param strValue {String} the field value.
   * @package
   */
  Settings_prototype.getMapsInArrayByField = function(strKey, strField, strValue) {
    var key = [];
    for (var i = 0; i < arguments.length - 2; i++)
      key.push(arguments[0]);
    
    strField = arguments[arguments.length-2];
    strValue = arguments[arguments.length-1];
    
    var node = this.getNode.apply(this, key);
    if (node) {
      var mapNodes = node.selectNodes("./record[@type='map' and record[@jsxid='" + strField + 
          "' and .='" + strValue + "']]");

      return mapNodes.map(function(x) { return Settings.getRecordValue(x); }).toArray(true);
    }
    
    return [];
  };
  
  /**
   * Returns a stored setting value as the raw XML node.
   * @param strKey {String...} the setting key.
   * @return {jsx3.xml.Entity}
   */
  Settings_prototype.getNode = function(strKey) {
    var node = this._root;
    
    var query = "/data";
    for (var i = 0; node != null && i < arguments.length; i++) {
      query += "/record[@jsxid='" + arguments[i] + "']";
    }
    
    return node.selectSingleNode(query);
  };

  /**
   * Caches a value retrieved from the XML source. If this settings is read from and never written to eventually the
   * entire source will exist in memory as a nested object.
   * @param objValue {Object}
   * @param arrPath {Array<String>}
   * @private 
   * @jsxobf-clobber 
   */
  Settings_prototype.cacheValue = function(objValue, arrPath) {
    if (arrPath.length == 0) {
      this._cache = objValue;
    } else {
      if (this._cache == null) this._cache = {_jsxtodo:true};
      var node = this._cache;
      for (var i = 0; i < arrPath.length - 1; i++) {
        var path = arrPath[i];
        if (node[path] == null) {
          node[path] = {_jsxtodo:true};
        }
        node = node[path];
      }
      node[arrPath[arrPath.length-1]] = objValue;
    }
  };
  
  /**
   * Retrieves a cached value.
   * @param arrPath {Array<String>}
   * @return {Object|undefined}
   * @private 
   * @jsxobf-clobber 
   */
  Settings_prototype.getCachedValue = function(arrPath) {
    if (this._xmlcache) {
      var ts = this._xmlcache.getTimestamp(this._cacheKey);
      if (ts > this._ts) {
        this.resetCache();
        this._ts = ts;
        return;
      }
    }
    
    var node = this._cache;
    for (var i = 0; node != null && i < arrPath.length; i++) {
      node = node[arrPath[i]];
    }
    return (node != null && node._jsxtodo) ? Settings.UNDEF : node;
  };
  
  /**
   * Resets the cache. This method should be called any time this settings is written to.
   * @private
   * @jsxobf-clobber-shared 
   */
  Settings_prototype.resetCache = function() {
    delete this._cache;
  };
  
  /** @private @jsxobf-clobber */
  Settings.VALUE_GETTERS = {
    array: function(record) {
      var i = record.selectNodeIterator("./record");
      var a = [];
      while (i.hasNext()) {
        var x = i.next();
        var getter = Settings.VALUE_GETTERS[x.getAttribute("type")];
        a[a.length] = getter ? getter(x) : x.getValue();
      }
      return a;
    },
    map: function(record) {
      var i = record.selectNodeIterator("./record");
      var o = {};
      while (i.hasNext()) {
        var x = i.next();
        var getter = Settings.VALUE_GETTERS[x.getAttribute("type")];
        o[x.getAttribute('jsxid')] = getter ? getter(x) : x.getValue();
      }
      return o;
    }
  };
  Settings.VALUE_GETTERS["number"] = function(record) { return Number(record.getValue()); };
  Settings.VALUE_GETTERS["boolean"] = function(record) { return record.getValue() === "true"; };
  Settings.VALUE_GETTERS["null"] = function(record) { return null; };
  Settings.VALUE_GETTERS["string"] = function(record) { return record.getValue(); };

  /**
   * @private
   * @jsxobf-clobber
   */
  Settings.getRecordValue = function(record) {
    var type = record.getNodeName() == "data" ? "map" : record.getAttribute("type");
    var getter = Settings.VALUE_GETTERS[type];
    return getter != null ? getter(record) : record.getValue();
  };

  Settings_prototype.toString = function() {
    return this.jsxsuper() + this._path;
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.Settings
 * @see jsx3.app.Settings
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Settings", -, null, function(){});
 */
jsx3.Settings = jsx3.app.Settings;

/* @JSC :: end */
