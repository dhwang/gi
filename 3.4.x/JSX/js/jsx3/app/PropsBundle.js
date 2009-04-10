/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A subclass of <code>jsx3.app.Properties</code> that supports localized properties. Using this class, an application
 * can define properties for a number of locales but only load the properties necessary to display a particular
 * locale. Additionally, this class supports fall-through so that if a property is not defined for a particular locale
 * that locale inherits the value from the next most specific locale.
 * <p/>
 * A properties bundle can consist of one or more XML files. The main file, <i>fileName.ext</i>, contains the
 * properties for the default locale, as well as the properties for any number of other locales, and metadata
 * indicating what locales are available external to the main file. The format of this file is:
 *
 * <pre>
 * &lt;data jsxnamespace="propsbundle" locales="<b>externalLocales</b>"&gt;
 *   &lt;!-- the default locale --&gt;
 *   &lt;locale&gt;
 *     &lt;record jsxid="<b>propId</b>" jsxtext="<b>propValue</b>"/&gt;
 *     ...
 *   &lt;/locale&gt;
 *
 *   &lt;!-- additional locales --&gt;
 *   &lt;locale key="en_US"&gt;
 *     &lt;record jsxid="<b>propId</b>" jsxtext="<b>propValueEnUs</b>"/&gt;
 *     ...
 *   &lt;/locale&gt;
 *
 *   ...
 * &lt;/data&gt;
 * </pre>
 *
 * <i>externalLocales</i> is a comma-separated list of locales that are available for this properties bundle that
 * are defined in separate files. By spreading a properties bundle over many files, loading a bundle for a single
 * locale is optimized. For each locale, <i>locKey</i>, listed in <i>externalLocales</i>, there must be a file
 * <i>fileName.locKey.ext</i> in the same directory as the main bundle file.
 * <p/>
 * Each external file has the same format as the main file except that the <code>locales</code> attribute of
 * the <code>data</code> tag should not be specified. Any number of locales can be defined. The first locale defined
 * should be the locale explicit in the name of the file. Only more specific locales should follow this locale.
 * For example, file <code>props.es.xml</code>, should start by defining locale <code>es</code> and could continue
 * with locales <code>es_ES</code> and <code>es_MX</code> but should not define locales <code>fr</code> or
 * <code>de</code>.
 *
 * @since 3.4
 */
jsx3.Class.defineClass("jsx3.app.PropsBundle", jsx3.app.Properties, null, function(PropsBundle, PropsBundle_prototype) {

  var Locale = jsx3.util.Locale;
  var LOG = jsx3.util.Logger.getLogger(PropsBundle.jsxclass.getName());

  /** @private @jsxobf-clobber */
  PropsBundle.ROOT_KEY = "__root";

/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  PropsBundle.FILE_SUFFIX = ".xml";
/* @JSC :: end */

  /** @private @jsxobf-clobber */
  PropsBundle.PATH_SEP = ".";

/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  PropsBundle.DESCRIPTOR_PATH = "meta";

  /** @private @jsxobf-clobber */
  PropsBundle.DEFAULT_PATH = "default";
/* @JSC :: end */

  /** @private @jsxobf-clobber */
  PropsBundle.ERROR = -1;
  
  /** @private @jsxobf-clobber */
  PropsBundle.BASE_TO_LOCALES_CACHE = {};

  /** @private @jsxobf-clobber */
  PropsBundle.KEY_TO_PROPS_CACHE = {};

  /**
   * Returns a properties object representing a localized view onto a properties bundle.
   *
   * @param strBasePath {String|jsx3.net.URI} the relative URI to the main properties file.
   * @param objLocale {jsx3.util.Locale} the locale for which to load the localized properties. If this is not
   *    provided, the system locale is used.
   * @param objCache {jsx3.app.Cache} if provided, any loaded XML documents will be placed in this cache.
   * @return {jsx3.app.PropsBundle}
   */
  PropsBundle.getProps = function(strBasePath, objLocale, objCache) {
    strBasePath = strBasePath.toString();
    if (objLocale == null) objLocale = jsx3.System.getLocale();

    var key = strBasePath + "::" + objLocale.toString();

    // we cache the props document by the key, so if it hasn't been queried before, we need to load it
    if (PropsBundle.KEY_TO_PROPS_CACHE[key] == null) {
      // if this is the first time loading for this props bundle (strBasePath) ...
      if (PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath] == null) {
        // ... we need to load the main file ...
        PropsBundle._loadBundle(strBasePath, PropsBundle.ROOT_KEY, objCache);
/* @JSC :: begin DEP */
        // ... and deprecated functionality is to load the metadata descriptor file if the main file did not include
        // such metadata
        if (PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath] == null)
          PropsBundle._loadBundleDescriptor(strBasePath, objCache);
/* @JSC :: end */
      }

      // check for error loading metadata
      if (PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath] == PropsBundle.ERROR)
        throw new jsx3.Exception(jsx3._msg("propbn.err", strBasePath));

      // now find the key of the best available locale. not all locales are available in each props bundle
      var localeKey = PropsBundle._bestLocaleKeyMatch(strBasePath, objLocale);
      var loadKey = strBasePath + "::" + localeKey;

      // check to see if the best match locale is loaded already, if not then load it
      if (PropsBundle.KEY_TO_PROPS_CACHE[loadKey] == null)
        PropsBundle._loadBundle(strBasePath, localeKey, objCache);

      // check for error loading best match locale
      if (PropsBundle.KEY_TO_PROPS_CACHE[loadKey] == PropsBundle.ERROR)
        throw new jsx3.Exception(jsx3._msg("propbn.err_key", strBasePath, localeKey));

      // loading a property file for a particular locale may have also loaded a more specific locale so we should
      // recalculate what the best available match is
      loadKey = strBasePath + "::" + PropsBundle._bestLocaleKeyMatch(strBasePath, objLocale);

      // store the properties object under the locale key for faster lookup next time
      PropsBundle.KEY_TO_PROPS_CACHE[key] = PropsBundle.KEY_TO_PROPS_CACHE[loadKey];
    }

    return PropsBundle.KEY_TO_PROPS_CACHE[key];
  };

  /** @private @jsxobf-clobber */
  PropsBundle._loadBundle = function(strBasePath, strLocale, objCache) {
    var key = strBasePath + "::" + strLocale;
    var strUrl = null;

/* @JSC :: begin DEP */
    if (jsx3.util.strEndsWith(strBasePath, "/")) {
      strUrl = strBasePath + (strLocale == PropsBundle.ROOT_KEY ? PropsBundle.DEFAULT_PATH : strLocale) +
          PropsBundle.FILE_SUFFIX;
    } else {
/* @JSC :: end */
      var index = strBasePath.lastIndexOf(".");
      strUrl = strLocale == PropsBundle.ROOT_KEY ? strBasePath :
          strBasePath.substring(0, index) + PropsBundle.PATH_SEP + strLocale + strBasePath.substring(index);
/* @JSC :: begin DEP */
    }
/* @JSC :: end */

    var doc = null;
    if (objCache != null) {
      doc = objCache.getOrOpenDocument(strUrl);
    } else {
      doc = new jsx3.xml.Document();
      doc.load(strUrl);
    }

    if (! doc.hasError()) {
/* @JSC :: begin DEP */
      if (doc.getAttribute("jsxnamespace") == "propsbundle") {
/* @JSC :: end */
        PropsBundle._addLocaleRefs(strBasePath, doc);
        PropsBundle._loadInlineLocales(strBasePath, doc);
/* @JSC :: begin DEP */
      } else {
        PropsBundle._setLocaleDoc(strBasePath, strLocale, doc, objCache);
      }
/* @JSC :: end */
    } else {
      LOG.error(jsx3._msg("propbn.err_file", strUrl, doc.getError()));
      PropsBundle.KEY_TO_PROPS_CACHE[key] = PropsBundle.ERROR;
    }
  };

  /** @private @jsxobf-clobber */
  PropsBundle._setLocaleDoc = function(strBasePath, strLocale, objXML, objCache) {
    var props = new PropsBundle();
    props.loadXML(objXML);
    props._locale = Locale.valueOf(strLocale == PropsBundle.ROOT_KEY ? "" : strLocale);

    PropsBundle.KEY_TO_PROPS_CACHE[strBasePath + "::" + strLocale] = props;
    
    if (strLocale != PropsBundle.ROOT_KEY) {
      var next = Locale.valueOf(strLocale).getSearchPath()[1];
      if (next != null)
        props.addParent(PropsBundle.getProps(strBasePath, next, objCache));
    }
  };

  /**
   * Loads any properties within a &lt;locale&gt; tag as though it was contained in its own properties file.
   * @private
   * @jsxobf-clobber
   */
  PropsBundle._loadInlineLocales = function(strBasePath, objXML) {
    for (var i = objXML.selectNodeIterator("/data/locale"); i.hasNext(); ) {
      var lNode = i.next();
      var localeKey = lNode.getAttribute("key");
      if (jsx3.util.strEmpty(localeKey)) localeKey = PropsBundle.ROOT_KEY;

      PropsBundle._setLocaleDoc(strBasePath, localeKey, lNode);
      PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath][localeKey] = true;
    }
  };

  /** @private @jsxobf-clobber */
  PropsBundle._bestLocaleKeyMatch = function(strBasePath, objLocale) {
    var objAvailable = PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath];
    var path = objLocale.getSearchPath();
    for (var i = 0; i < path.length; i++) {
      if (path[i].toString().length > 0 && objAvailable[path[i].toString()])
        return path[i].toString();
    }
    return PropsBundle.ROOT_KEY;
  };

/* @JSC :: begin DEP */

  /** @private @jsxobf-clobber */
  PropsBundle._loadBundleDescriptor = function(strBasePath, objCache) {
    var strMetaPath = null;
    if (jsx3.util.strEndsWith(strBasePath, "/")) {
      strMetaPath = strBasePath + PropsBundle.DESCRIPTOR_PATH + PropsBundle.FILE_SUFFIX;
    } else {
      var index = strBasePath.lastIndexOf(".");
      strMetaPath = strBasePath.substring(0, index) + PropsBundle.PATH_SEP +
          PropsBundle.DESCRIPTOR_PATH + strBasePath.substring(index);
    }

    var doc = null;
    if (objCache != null) {
      doc = objCache.getDocument(strMetaPath) || objCache.openDocument(strMetaPath, strMetaPath);
    } else {
      doc = new jsx3.xml.Document();
      doc.load(strMetaPath);
    }

    var success = false;
    if (! doc.hasError()) {
      PropsBundle._addLocaleRefs(strBasePath, doc);
      success = true;
    } else {
      LOG.error("Error loading localized bundle meta file " + strMetaPath + ": " + doc.getError());
    }

    if (! success)
      PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath] = PropsBundle.ERROR;
  };

/* @JSC :: end */

  /**
   * Looks for and caches metadata in <code>objXML</code> that indicates that there are other files in this
   * properties bundle for other locales.
   * @private
   * @jsxobf-clobber
   */
  PropsBundle._addLocaleRefs = function(strBasePath, objXML) {
    var localeString = objXML.getAttribute("locales");
/* @JSC :: begin DEP */
    if (localeString == null) {
      var node = objXML.selectSingleNode("/data/record[@jsxid='locales']");
      if (node != null)
        localeString = node.getAttribute("jsxtext");
    }
/* @JSC :: end */

    if (PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath] == null)
      PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath] = {};

    if (localeString != null) {
      var localeKeys = localeString.split(/\s*,\s*/);
      for (var i = 0; i < localeKeys.length; i++)
        if (localeKeys[i])
          PropsBundle.BASE_TO_LOCALES_CACHE[strBasePath][localeKeys[i]] = true;
    }
  };

  /**
   * Returns the locale for which this properties object was created. The value returned by this method is the
   * value sent to the <code>getProps()</code> method and not necessarily the most specific locale for which the
   * properties in this view are defined.
   *
   * @return {jsx3.app.Locale}
   * @see #getProps()
   */
  PropsBundle_prototype.getLocale = function() {
    return this._locale;
  };

  /**
   * Clears all the data stored in the caches internal to this class. Repeated calls to <code>getProps()</code>
   * consult only these caches. If files have changed on disk this method must be called for the return value of
   * <code>getProps()</code> to reflect these changes.
   */
  PropsBundle.clearCache = function() {
    PropsBundle.BASE_TO_LOCALES_CACHE = {};
    PropsBundle.KEY_TO_PROPS_CACHE = {};
  };

});
