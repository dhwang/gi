/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _initFromReq

/**
 * A generic wrapper to hide the complexities and API-specifics of the native XMLHTTP control for a given browser.
 * Developers wishing to create/modify XML documents can use this class to access common XMLHTTP methods.
 * <p/>
 * Note that when using this interface to post xml content to a server, the called server may expect the content
 * type to be set for the posting.  For example,
 * <code>objRequest.setRequestHeader("Content-Type", "text/xml");</code>
 */
jsx3.Class.defineClass("jsx3.net.Request", null, [jsx3.util.EventDispatcher], function(Request, Request_prototype) {

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  Request.STATUS_OK = 200;

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  Request.STATUS_ERROR = 400;

  /**
   * {String} Event type published when the response has loaded.
   * @final @jsxobf-final
   */
  Request.EVENT_ON_RESPONSE = "response";

  /**
   * {String} Event type published when the server has not responded after the specified timeout period.
   * @final @jsxobf-final
   */
  Request.EVENT_ON_TIMEOUT = "timeout";

/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  Request.trackArray = {};
/* @JSC :: end */

  /**
   * The instance initializer.
   * @param id {String} <span style="text-decoration:line-through;">If the call will be asynchronous, assigns a unique identifier.</span>
   *    <b>Using this deprecated parameter will cause memory to leak. Don't use it.</b>
   */
  Request_prototype.init = function(id) {
/* @JSC :: begin DEP */
    if (id != null)
      Request.trackArray[id] = this;
/* @JSC :: end */

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      /* @jsxobf-clobber */
      this._request = jsx3.getHttpInstance();
    } catch (e) {
      throw new jsx3.Exception(jsx3._msg("req_inst"), jsx3.NativeError.wrap(e));
    }
/* @JSC */ } else {
    try {
      this._request = new XMLHttpRequest();
    } catch (e) {
      throw new jsx3.Exception(jsx3._msg("req_inst"), jsx3.NativeError.wrap(e));
    }
/* @JSC */ }
  };

  /**
   * Aborts the request.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.abort = function() {
    if (this._timeoutto) {
      window.clearTimeout(this._timeoutto);
      delete this._timeoutto;
    }

    this._request.onreadystatechange = new Function();
/* @JSC */ if (!jsx3.CLASS_LOADER.IE) {
    this._request.onerror = null;
/* @JSC */ }

    //call the native abotr
    this._request.abort();
    return this;
  };

  /**
   * Gets the value of all the HTTP headers.
   * @return {String}
   */
  Request_prototype.getAllResponseHeaders = function() {
    return this._request.getAllResponseHeaders();
  };

  /**
   * Gets the value of a specific HTTP response header.
   * @param strName {String} the name for the response header to retrieve.
   * @return {String}
   */
  Request_prototype.getResponseHeader = function(strName) {
    return this._request.getResponseHeader(strName);
  };

  /**
   * Gets the HTTP response line status (e.g. "OK").
   * @return {String}
   */
  Request_prototype.getStatusText = function() {
    return this._request.statusText;
  };

  /**
   * Gets the HTTP response code (e.g. 200, 404, 500, etc).
   * @return {int}
   */
  Request_prototype.getStatus = function() {
    var s = this._status != null ? this._status : this._request.status;

/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    // HACK: http://bugs.webkit.org/show_bug.cgi?id=14831
    if (s < 0 || s == 112 || s >= 600) s = Request.STATUS_ERROR;
/* @JSC */ }
    
    return s == 0 ? Request.STATUS_OK : s;
  };

  /**
   * Gets the content of the response as string.
   * @return {String}
   */
  Request_prototype.getResponseText = function() {
    return this._request.responseText;
  };

  /**
   * Gets the content of the response as an XML document. If the response is not a valid XML document,
   * <code>null</code> is returned.
   * @return {jsx3.xml.Document}
   */
  Request_prototype.getResponseXML = function() {
    var objDoc = new jsx3.xml.Document();
    objDoc._initFromReq(this);

    if (!objDoc.hasError()) {
      return objDoc;
    } else {
      Request._log(2, jsx3._msg("req.bad_xml", this._url, objDoc.getError()));
      return null;
    }
  };

  /**
   * @return {XMLHttpRequest}
   * @deprecated
   */
  Request_prototype.getNative = function() {
    return this._request;
  };

  /**
   * Sets the value of a specific HTTP request header. The <code>open()</code> method should be called before calling
   * this method.
   * @param strName {String} the name for the request header to send to the server with the request content.
   * @param strValue {String} the value for the request header to send to the server with the request content.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.setRequestHeader = function(strName, strValue) {
    this._request.setRequestHeader(strName, String(strValue));
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Gets the ready state for the request; return values include:
   *          0) The object has been created, but not initialized (the open method has not been called).
   *          1) The object has been created, but the send method has not been called.
   *          2) The send method has been called, but the status and headers are not yet available.
   *          3) Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.
   *          4) All the data has been received, and the complete data is available via the getResponseText()/getResponseXML() methods
   * @return {int}
   * @deprecated  This method is not consistent between browsers. Use the event publisher interface instead to track
   *    the state of the request.
   */
  Request_prototype.getReadyState = function() {
    //get handle to the XMLHTTP object associated with the SOAPSocket instance
    return this._request.readyState;
  };

  /**
   * Creates and opens a request object. This is a factory method that creates the proper subclass of
   * <code>Request</code> based on the scheme of <code>strURL</code>.
   *
   * @param strMethod
   * @param strURL
   * @param bAsync
   * @param strUser
   * @param strPass
   *
   * @since 3.7
   * @see #addSchemeHandler()
   */
  Request.open = function(strMethod, strURL, bAsync, strUser, strPass) {
    var url = jsx3.net.URI.valueOf(strURL);
    var scheme = url.getScheme();
    var handler = Request._HANDLERS[scheme] || Request.jsxclass;
    return (handler.newInstance()).open(strMethod, url, bAsync, strUser, strPass);
  };

/* @JSC :: end */

  Request._HANDLERS = {};

  /**
   * Adds a handler that will field requests to a particular URL scheme.
   * @param scheme {String} the scheme that the handler to handle.
   * @param handler {jsx3.lang.Class} a custom subclass of Request.
   * @since 3.7
   */
  Request.addSchemeHandler = function(scheme, handler) {
    Request._HANDLERS[scheme] = handler;
  };

  /**
   * @param scheme {String}
   * @return {jsx3.lang.Class}
   * @package
   * @since 3.7
   */
  Request.getSchemeHandler = function(scheme) {
    return Request._HANDLERS[scheme];
  };

  /**
   * Initializes the request, and specifies the method, URL, and authentication information for the request.
   * @param strMethod {String} The HTTP method used to open the connection. Valid values include: GET, POST, or PUT.
   * @param strURL {String|jsx3.net.URI} The requested URL. This can be either an absolute URL, such as "http://www.TIBCO.com", or a relative URL, such as "../MyPath/MyFile".
   * @param bAsync {boolean} whether to issue the request asynchronously, if true this class will use the EventDispatcher interface to publish an event on response or timeout.
   * @param strUser {String} The name of the user for authentication. If this parameter is null ("") or missing and the site requires authentication, the native HTTP control will display a logon window.
   * @param strPass {String} The password for authentication. This parameter is ignored if the user parameter is null ("") or missing.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.open = function(strMethod, strURL, bAsync, strUser, strPass) {
//    if (!bAsync) {
//      Request._log(3, "Synchronous request to: " + strURL);
////      if (Request._LOG)
////        Request._LOG.logStack(4, "");
//    }

    this._status = 0;

    /* @jsxobf-clobber */
    this._async = Boolean(bAsync);
    /* @jsxobf-clobber */
    this._method = strMethod;
    /* @jsxobf-clobber */
    this._url = jsx3.net.URIResolver.DEFAULT.resolveURI(strURL);

/* @JSC */ if (! jsx3.CLASS_LOADER.IE) {
      try {
        if (window.netscape && netscape.security)
          netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
      } catch (e) {
        Request._log(5, jsx3._msg("req.netsc", jsx3.NativeError.wrap(e)));
      }
/* @JSC */ }

    //open the request, passing in relevant info and return object ref
    try {
      Request._log(6, jsx3._msg("req.open", this._url));
      this._request.open(strMethod, this._url.toString(), this._async, strUser, strPass);
    } catch (e) {
      this._status = Request.STATUS_ERROR; // communicate failure to client
      Request._log(2, jsx3._msg("req.err_open", strURL, jsx3.NativeError.wrap(e)));
    }

    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Cancels the named request.
   * @param strRequestId {String} named id for the request (assigned by developer when the Request was instanced);
   * @deprecated  Use <code>abort()</code> instead.
   * @see #abort()
   */
  Request.cancelRequest = function(strRequestId) {
    var r = Request.trackArray[strRequestId];
    if (r) r.abort();
  };

  /**
   * Gets the named request instance.
   * @param strRequestId {String} named id for the request (assigned by developer when the Request was instanced);
   * @return {jsx3.net.Request}
   * @deprecated  Static access to pending requests by id is deprecated.
   */
  Request.getRequest = function(strRequestId) {
    return Request.trackArray[strRequestId];
  };

/* @JSC :: end */

  /**
   * Gets the URL passed when opening this request.
   * @return {String}
   */
  Request_prototype.getURL = function() {
    return this._url && this._url.toString();
  };

/* @JSC :: begin DEP */

  /**
   * Specifies timeout settings for resolving the domain name, establishing the connection to the server, sending the data, and receiving the response. The timeout parameters of the setTimeouts method are specified in milliseconds, so a value of 1000 would represent 1 second. A value of zero represents an infinite timeout. There are four separate timeout parameters: resolveTimeout, connectTimeout, sendTimeout, and receiveTimeout. When calling the setTimeouts method, all four values must be specified. The timeouts are applied at the Winsock layer.
   * @param intResolveTimeout {int} The value is applied to mapping host names (such as "www.microsoft.com") to IP addresses; the default value is infinite, meaning no timeout.
   * @param intConnectTimeout {int} The value is applied to establishing a communication socket with the target server, with a default timeout value of 60 seconds.
   * @param intSendTimeout {int} The value applies to sending an individual packet of request data (if any) on the communication socket to the target server. A large request sent to a server will normally be broken up into multiple packets; the send timeout applies to sending each packet individually. The default value is 5 minutes.
   * @param intReceiveTimeout {int} The value applies to receiving a packet of response data from the target server. Large responses will be broken up into multiple packets; the receive timeout applies to fetching each packet of data off the socket. The default value is 60 minutes.
   * @return {jsx3.net.Request} this instance.
   * @deprecated  IE only.
   */
  Request_prototype.setTimeouts = function(intResolveTimeout,intConnectTimeout,intSendTimeout,intReceiveTimeout) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      this._request.setTimeouts(intResolveTimeout,intConnectTimeout,intSendTimeout,intReceiveTimeout);
    } catch (e) {
      Request._log(3, "The HTTP ActiveX object does not appear to support setting timeouts.");
    }
/* @JSC */ }
    return this;
  };

/* @JSC :: end */

  /**
   * Sends the request.
   * @param strContent {String} The content to send for a POST request.
   * @param intTimeout {int}  the number milliseconds to wait before publishing a timeout event. This only applies
   *    to asynchronous requests. If used, subscribe to the <code>jsx3.net.Request.EVENT_ON_TIMEOUT</code> event to
   *    be notified of a timeout.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.send = function(strContent, intTimeout) {
    if (this._status == Request.STATUS_ERROR)
      throw new jsx3.Exception(jsx3._msg("req.err_state"));

/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Request.jsxclass, this._url);
/* @JSC :: end */

    var bError = false;

    try {
// Sync XHR may cause timeouts to fire in Forefox 3.0, fixed in 3.1
// https://bugzilla.mozilla.org/show_bug.cgi?id=340345
/* @JSC */ if (jsx3.CLASS_LOADER.FX) {
      if (!this._async) Request.INSYNC = true;
/* @JSC */ }

      this._request.send(strContent);

      if (this._async)
        /* @jsxobf-clobber */
        this._status = 0;
      else
        delete this._status;

    } catch (e) {
      // TODO: communicate failure to client
      this._status = Request.STATUS_ERROR; // Firefox seems to still report status as 0 when error on local file access.
      Request._log(2, jsx3._msg("req.err_send", this._url, jsx3.NativeError.wrap(e)));
      bError = this;
    } finally {
/* @JSC */ if (jsx3.CLASS_LOADER.FX) {
      Request.INSYNC = false;
/* @JSC */ }
    }

    // if this async, add the request object to the array of
    if (this._async) {
      if (bError || this._request.readyState == 4) {
        // If async, events should always be published asynchronously.
        jsx3.sleep(function() {
/* @JSC :: begin BENCH */
          t1.log("load.async");
/* @JSC :: end */
          this.publish({subject:Request.EVENT_ON_RESPONSE});
        }, null, this);
      } else {
        var me = this;
        this._request.onreadystatechange = function() {
          if (me._request.readyState == 4) {
/* @JSC :: begin BENCH */
            t1.log("load.async");
/* @JSC :: end */
            me._onReadyStateChange();
          }
        };

/* @JSC */ if (!jsx3.CLASS_LOADER.IE) {
        this._request.onerror = jsx3.$F(this._onHttpError).bind(this);
/* @JSC */ }

         if (!isNaN(intTimeout) && intTimeout > 0) {
          //set timeout to fire if the response doesn't happen in time
          this._timeoutto = window.setTimeout(function() {
/* @JSC :: begin BENCH */
            t1.log("timeout");
/* @JSC :: end */
            me._onTimeout();
          }, intTimeout);
        }
      }
    }
/* @JSC :: begin BENCH */
    else {
      t1.log("load.sync");
    }
/* @JSC :: end */

    return this;
  };

  /** @private @jsxobf-clobber */
  Request_prototype._onTimeout = function() {
    delete this._timeoutto;
    this.abort();
    this._status = 408; // request timeout
    this.publish({subject:Request.EVENT_ON_TIMEOUT});
  };

  /** @private @jsxobf-clobber */
  Request_prototype._onReadyStateChange = function() {
    delete this._status;

    if (this._timeoutto) {
      window.clearTimeout(this._timeoutto);
      delete this._timeoutto;
    }

    this._request.onreadystatechange = new Function();
/* @JSC */ if (!jsx3.CLASS_LOADER.IE) {
    this._request.onerror = null;
/* @JSC */ }

    this.publish({subject:Request.EVENT_ON_RESPONSE});
  };

/* @JSC */ if (!jsx3.CLASS_LOADER.IE) {
  /** @private @jsxobf-clobber */
  Request_prototype._onHttpError = function() {
    try {
      // Accessing the request object here may throw an error
      this._status = this._request.status;
    } catch (e) {
      // So here I clear out the request so that no other errors are thrown
      this._status = Request.STATUS_ERROR;
      this._request = {};
    }

    this.publish({subject:Request.EVENT_ON_RESPONSE});
  };
/* @JSC */ }

  Request_prototype.toString = function() {
    return this.jsxsuper() + " " + this._method + " " + this.getStatus() + " " + this._url;
  };

  /** @private @jsxobf-clobber */
  Request._log = function(intLevel, strMessage) {
    if (Request._LOG == null) {
      if (jsx3.util.Logger) {
        /* @jsxobf-clobber */
        Request._LOG = jsx3.util.Logger.getLogger(Request.jsxclass.getName());
        if (Request._LOG == null) return;
      } else {
        return;
      }
    }
    Request._LOG.log(intLevel, strMessage);
  };

/* @JSC :: begin DEP */

  /**
   * gets the release/build for the class (i.e., "3.0.00")
   * @return {String}
   * @deprecated
   */
  Request.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.net.Request
 * @see jsx3.net.Request
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.HttpRequest", -, null, function(){});
 */
jsx3.HttpRequest = jsx3.net.Request;

/* @JSC :: end */
