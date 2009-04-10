/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  resetCache initWith _path _doc _root _xmlcache _ts _cacheKey
/**
 * Read-write system settings interface.
 */
jsx3.Class.defineClass("jsx3.ide.Preferences", jsx3.app.Settings, null, function(Preferences, Preferences_prototype) {
  
  Preferences.DOMAIN_IDE = 4;
  Preferences.DOMAIN_USER = 5;

  /** @private @jsxobf-clobber */
	Preferences.CACHE_KEY = "JSX_IDE_SETTINGS";
  /** @private @jsxobf-clobber */
  Preferences.USER_CACHE_KEY = "JSX_USER_SETTINGS";
	
  /** @private @jsxobf-clobber */
	Preferences.PATH_IDE = "settings/builder.xml";
  /** @private @jsxobf-clobber */
  Preferences.PATH_USER = ".tibcogi.xml";
  
  Preferences_prototype.init = function(intDomain, objInstance) {
		if (intDomain == Preferences.DOMAIN_IDE) {
      var home = jsx3.ide.getCurrentUserHome();
      
      if (home) {
        var settingsURI = home.toURI().resolve(Preferences.PATH_IDE);
        var settingsFile = new jsx3.io.File(settingsURI);
        
        // make sure that builder prefs file exists
        if (! settingsFile.exists()) {
          var templateDir = jsx3.ide.getBuilderRelativeFile(jsx3.ide.HOME_TEMPLATE_DIR);
          var source = new jsx3.io.File(templateDir, Preferences.PATH_IDE);
          (new jsx3.io.File(settingsFile.getParentPath())).mkdirs();
          source.copyTo(settingsFile);
          settingsFile.setReadOnly(false);
        }
        
        this.initWith(jsx3.IDE.getCache(), Preferences.CACHE_KEY, settingsURI);        
      } else {
        this.initWith(jsx3.IDE.getCache(), Preferences.CACHE_KEY, null);
      }
		} else if (intDomain == Preferences.DOMAIN_USER) {
      var strBase = jsx3.io.File.getUserHome().toURI().resolve(Preferences.PATH_USER);
      this.initWith(jsx3.IDE.getCache(), Preferences.USER_CACHE_KEY, strBase);
		} else {
			this.jsxsuper(intDomain, objInstance);
		}
	};

  /** @private @jsxobf-clobber-shared */
  Preferences_prototype.loadDocument = function(doc, strUrl) {
    doc.load(strUrl);
    if (doc.hasError() && jsx3.CLASS_LOADER.IE) {
      // this will allow IE to load the main settings file from the user home directory even if it is on another drive
      var uri = jsx3.net.URI.valueOf(strUrl);
      var file = new jsx3.io.File(uri.getScheme() == "file" ? uri : strUrl);
      if (file.isFile())
        doc.loadXML(file.read());
    }
  };

  /**
	 * Sets a stored setting value.
	 * @param strKey {String...}
	 * @param value {String|Number|boolean|Array|Object} the value to store, map be string, number, boolean, 
	 *   array, or object (map)
	 */
	Preferences_prototype.set = function(strKey, value) {
		if (this._root == null) return;

		var node = this._root;
		for (var i = 0; i < arguments.length - 2; i++) {
			var child = node.selectSingleNode("./record[@jsxid='" + arguments[i] + "']");
			
			if (child != null && child.getAttribute('type') != 'map') {
				node.removeChild(child);
				child = null;
			}
			
			if (child == null) {
				child = node.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
				child.setAttribute("jsxid", arguments[i]);
				child.setAttribute("type", 'map');
				node.appendChild(child);
			}
			node = child;
		}
		
		this.setRecord(node, arguments[arguments.length - 2], arguments[arguments.length - 1]);

    if (this._xmlcache)
      this._xmlcache.setDocument(this._cacheKey, this._doc); // bump ts
    else
      this.resetCache();
  };

	/**
	 * @private
	 * @jsxobf-clobber
	 */
	Preferences_prototype.setRecord = function(parent, strKey, value) {
		var record = this.getOrCreateRecord(strKey, parent);
		record.removeChildren();
		var type = typeof(value);
		
		if (value == null || type == "undefined") {
			record.setAttribute("type", "null");
			record.setValue(null);
		} else if (type == "string" || type == "number") {
			record.setAttribute("type", type);
			record.setValue(value);
		} else if (type == "boolean") {
			record.setAttribute("type", "boolean");
			record.setValue(value ? "true" : "false");
		} else if (type == "object") {
			if (value instanceof Array) {
				record.setAttribute("type", "array");
				for (var i = 0; i < value.length; i++) {
					this.setRecord(record, i.toString(), value[i]);
				}
			} else {
				record.setAttribute("type", "map");
				for (var f in value) {
					this.setRecord(record, f, value[f]);
				}
			}
		} else if (type == "function") {
			;
		} else {
			jsx3.ERROR.doLog("idPR02", "Cannot persist object of type " + type, 5);
		}
	};

	/**
	 * Removes a stored setting value.
	 * @param strKey {String...}
	 */
	Preferences_prototype.remove = function(strKey) {
		var parent = null;
		var node = this._root;
		
		for (var i = 0; node != null && i < arguments.length; i++) {
			parent = node;
			node = node.selectSingleNode("./record[@jsxid='" + arguments[i] + "']");
		}

		if (node != null && parent != null)
			parent.removeChild(node);
	};

	/**
	 * Persists changes to settings.
	 */
	Preferences_prototype.save = function() {
		if (this._path != null && this._root != null) {
			var file = jsx3.ide.getSystemRelativeFile(this._path);
			jsx3.ide.writeBuilderXmlFile(file, jsx3.ide.makeXmlPretty(this._doc, true));
		} else {
			jsx3.ERROR.doLog("idPR01", "Path never set!", 1);
		}
	};

  /**
   * @private
   * @jsxobf-clobber
   */
	Preferences_prototype.getOrCreateRecord = function(strKey, parent) {
		var node = parent.selectSingleNode("./record[@jsxid='" + strKey + "']");
		if (node == null) {
			node = parent.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
			node.setAttribute("jsxid", strKey);
			parent.appendChild(node);
		}
		return node;
	};

	Preferences_prototype.toString = function() {
		return "[jsx3.ide.Preferences " + this._path + "]";
	};

});
