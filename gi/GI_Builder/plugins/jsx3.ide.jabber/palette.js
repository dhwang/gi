/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({
  /*********************
   * UI Util functions *
   *********************/
  _getTree: function() {
    // Gets the tree from the palette
    var ui = this.getPalette().getUIObject();
    return ui && ui.getXMPPTree();
  },

  getTreeDocument: function(blank){
    var xml = new jsx3.xml.CDF.Document();
    xml.loadXML('<data jsxid="jsxroot"><record jsxid="jsxrootnode" jsxtext="rootnode" jsxunselectable="1" jsxopen="1" jsximg="jsxapp:/images/icon_7.gif"/></data>');
    return xml;
  },

  getToolbarItem: function(name) {
    var p = this.getPalette();
    if (p) {
      var u = p.getUIObject();
      if (u) {
        return u.getDescendantOfName(name);
      }
    }
    return null;
  },

  setUIState: function(state) {
    // Displays the correct Block depending on the
    // state of the XMPP settings/connection
    var ui = this.getPalette().getUIObject();
    var Block = jsx3.gui.Block;

    if (state == 0 && !this.isConfigured()) {
      ui.getDescendantOfName("xmpp_conf_block").setDisplay(Block.DISPLAYBLOCK, true);
      ui.getDescendantOfName("xmpp_list_block").setDisplay(Block.DISPLAYNONE, true);
    } else {
      ui.getDescendantOfName("xmpp_list_block").setDisplay(Block.DISPLAYBLOCK, true);
      ui.getDescendantOfName("xmpp_conf_block").setDisplay(Block.DISPLAYNONE, true);

      var add_button = ui.getDescendantOfName("btnadd");

      if (state == 0) {
        this.setUsername('Offline');
        add_button.setEnabled(0, true);
      } else if (state == 1) {
        this.setUsername('Loading...');
        add_button.setEnabled(0, true);
      } else if (state == 2) {
        this.setUsername(this.session.jid);
        add_button.setEnabled(1, true);
      }
    }
  },

  setUsername: function(name) {
    var b = this.getToolbarItem('xmpp_username');
    if (b) {
      b.setText(name, true);
    }
  },

  isConfigured: function() {
    var credentials = this.getCredentials();
    return credentials.server && credentials.username && credentials.password;
  },

  setTempPassword: function(pw) {
    this._temppw = pw;
  },

  getCredentials: function() {
    // Gets the saved credentials from the
    // user's settings
    var s = jsx3.ide.getIDESettings();
    var id = this.getId();

    return {
      username: s.get(id, 'userid'),
      password: this._temppw || s.get(id, 'password'),
      server: s.get(id, 'server'),
      autologin: Boolean(s.get(id, 'autologin')),
      port: s.get(id, 'port'),
      bind: s.get(id, 'bind'),
      use_ssl: s.get(id, 'ssl')
    }
  },

  _getRecord: function(item, notImgFromStatus) {
    // Returns a record object for use with the palette's
    // tree's XML.
    var name = (item.name||item.jid) + (item.substatus == dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING ? ' (awaiting authorization)' : '');
    return {
      jsxid: item.jid,
      jsxnick: item.name,
      jsxtext: name,
      jsximg: 'images/none.gif',
      jsxsort: '1-' + name
    };
  },

  getGroupRecord: function(group_name) {
    return {
      jsxid: group_name,
      jsxtext: group_name == 'jsxcontacts' ? 'Contacts' : group_name,
      jsximg: '',
      jsxgroup: group_name,
      jsxstyle: 'font-weight:bold;',
      jsxsort: group_name.toLowerCase(),
      jsxnick: '',
      jsxopen: 1,
      jsxunselectable: 1
    };
  },

  /******************
   * XMPP Functions *
   ******************/
  connectSession: function(credentials) {
    // Handles connecting to the XMPP server.
    // Determines if we need to use the iframe transport
    // for a cross-domain situation.

    var jid_parts = credentials.username.split('@');
    var domain = jid_parts[1];
    var serviceUrl = credentials.server;

    if(serviceUrl.indexOf('http://') != 0){
      serviceUrl = 'http://' + serviceUrl;
    }

    if(credentials.port){
      serviceUrl += ':' + credentials.port;
    }

    serviceUrl += (serviceUrl.charAt(serviceUrl.length-1) == '/' ? '' : '/') + (credentials.bind||'http-bind') + '/';

    var useScript = true;

    if (window.location.protocol == 'file:') {
      if (dojo.isFF < 3) {
        useScript = false;
      }
    } else if (window.location.hostname == credentials.server) {
      useScript = false;
    }
    this.session = new dojox.xmpp.xmppSession({
      serviceUrl: serviceUrl,
      secure: !!credentials.ssl,
      useScriptSrcTransport: useScript,
      domain: domain
    });

    this.roster = {};
    this.chatInstances = {};
    this.chatDialogs = {};

    dojo.connect(this.session, 'onActive', this, 'onActive');
    dojo.connect(this.session, 'onRosterAdded', this, 'onRosterAdded');
    dojo.connect(this.session, 'onRosterChanged', this, 'onRosterChanged');
    dojo.connect(this.session, 'onRosterRemoved', this, 'onRosterRemoved');
    dojo.connect(this.session, 'onRosterUpdated', this, 'onRosterUpdated');
    dojo.connect(this.session, 'onPresenceUpdate', this, 'onPresenceUpdate');
    dojo.connect(this.session, 'onRegisterChatInstance', this, 'onRegisterChatInstance');
    dojo.connect(this.session, 'onTerminate', this, function(newState, oldState, message) {
      if (message == 'error') {
        this.getLog().error("Received onTerminate message: " + message);
        this.doShutdown();
      }
    });
    dojo.connect(this.session, 'onLoginFailure', this, function(message) {
      this.getLog().error("Received onLoginFailure message: " + message);
      this.doShutdown();
    });

    // automatically approve all subscription requests
    dojo.connect(this.session, 'onSubscriptionRequest', this, function(from) {
      this.session.presenceService.approveSubscription(from);
    });

    // this is so the iframes get appended to the actual body rather than
    // the loaded application's body
    var oldDojoBody = dojo.body;
    dojo.body = function() {
      return dojo.doc.body || dojo.doc.getElementsByTagName("body")[0]; // Node
    }

    var xml = this.getTreeDocument();
    this._getTree().setSourceXML(xml);

    this.setUIState(1);
    this.session.open(credentials.username, credentials.password, 'TIBCO/GIChat');
    dojo.body = oldDojoBody;
  },

  _updateTree: function() {
    // Iterates through the XMPP session's roster
    // and updates the palette's tree.
    var objTree = this._getTree();
    if (objTree) {
      var xml = objTree.getXML();
      for (var i = 0, l = this.session.roster.length; i<l; i++) {
        this._addContactToRoster(this.session.roster[i], objTree, xml);
      }
      objTree.repaint();
    }
  },

  _addContactToRoster: function(item, objTree, xml) {
    if (!objTree) {
      objTree = this._getTree();
    }
    if (objTree) {
      if (!xml) {
        xml = objTree.getXML();
      }
      var group_name = 'jsxcontacts';
      this.roster[item.jid] = item;

      if (item.groups.length) {
        group_name = item.groups[0];
      }

      var rec = objTree.getRecordNode(item.jid);
      if (!rec) {
        var group_node = xml.selectSingleNode('//record[@jsxgroup="' + group_name + '"]');
        if (!group_node) {
            objTree.insertRecord(this.getGroupRecord(group_name), 'jsxrootnode', true);
        }
        objTree.insertRecord(this._getRecord(item), group_name, true);
      }
    }
  },

  onActive: function(){
    // Called when the XMPP session is active.  Publishes
    // the user's status as "online" and displays the contact
    // tree.

    //jsx3.ide.LOG.warn('Active!', arguments);
    this.session.presenceService.publish({});
    this.setUIState(2);
  },

  onRosterAdded: function(item){
    this.getLog().trace("onRosterAdded " + jsx3.$O.json(item));
    // Called when the session adds a contact.  Inserts
    // the contact's record into the tree's XML.

    //jsx3.ide.LOG.warn('RosterAdded!', arguments);
    var objTree = this._getTree();

    // need this because dojox.xmpp doesn't add the item
    // to the roster.
    this.session.roster.push(item);
    this.roster[item.jid] = item;

    if (objTree) {
      this._addContactToRoster(item, objTree);
    }
  },

  onRosterChanged: function(newItem, oldItem){
    this.getLog().trace("onRosterChanged " + jsx3.$O.json(newItem) + " " + jsx3.$O.json(oldItem));
    // Called when the session changes the roster.  Updates
    // the tree's record for the contact.

    //jsx3.ide.LOG.warn('RosterChanged!', arguments);
    var objTree = this._getTree();

    if (objTree) {
      var record = objTree.getRecord(oldItem.jid);
      var name = (newItem.name||newItem.jid) + (newItem.substatus == dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING ? ' (awaiting authorization)' : '');
      record.jsxtext = name;
      record.jsxsort = record.jsxsort.substr(0, 1) + '-' + name;
      objTree.insertRecord(record, null, true);
    }
  },

  onRosterRemoved: function(item){
    this.getLog().trace("onRosterRemoved " + jsx3.$O.json(item));
    // Called when the session removes a concact
    // from the roster.  Removes the record from
    // the tree.

    //jsx3.ide.LOG.warn('RosterRemoved!', arguments);
    var objTree = this._getTree();
    delete this.roster[item.id];

    if (objTree) {
      objTree.deleteRecord(item.id, true);
    }
  },

  onRosterUpdated: function(){
    this.getLog().trace("onRosterUpdated " + jsx3.$O.json(arguments[0]));
    // Called when the session updates the roster.
    // Updates the tree based on the session's roster.

    //jsx3.ide.LOG.warn('RosterUpdated!', arguments);
    this._updateTree();
  },

  onPresenceUpdate: jsx3.$F(function(buddy){
    this.getLog().trace("onPresenceUpdate " + jsx3.$O.json(buddy));

    // Called when the session updates a contact's
    // status.  Updates the icon for the contact in
    // the tree based on status.

    //jsx3.ide.LOG.warn('PresenceUpdate!', arguments);
    var objTree = this._getTree();
    if (objTree) {
      var record = objTree.getRecord(buddy.from);
      var image = '';
      var sort = '0-';
      switch(buddy.show) {
        case 'none':
          sort = '1-';
        case 'away':
        case 'dnd':
        case 'xa':
        case 'online':
          image = buddy.show;
          break;
        case 'offline':
          sort = '1-';
          image = 'none';
          break;
        default:
          image = 'online';
      }
      record.jsximg = 'images/' + image + '.gif';
      record.jsxsort = sort + record.jsxtext;
      objTree.insertRecord(record, null, true);
    }
  }).throttled(),

  isConnected: function() {
    return this.session && this.session.state != dojox.xmpp.xmpp.TERMINATE;
  },

  loadXMPP: jsx3.$Y(function(cb) {
    var eng = this.getEngine();
    eng.getPlugIn("jsx3.util.Dojo").load().when(function() {
      var Dojo = jsx3.util.Dojo;

      var f = jsx3.ide.getSystemRelativeFile(jsx3.resolveURI(Dojo.getPath()));
      if (f.isDirectory()) {
        Dojo.load();
        dojo.require("dojox.xmpp.xmppSession");
        cb.done();
      } else {
        var plugIn = eng.getPlugIn("jsx3.ide.xmpp");
        window.djConfig = typeof djConfig == "undefined" ? {baseUrl: plugIn.resolveURI("dojo/").toString(), afterOnLoad: true} : djConfig;
        plugIn.load().when(cb);
      }
    });
  }),

  /***********************
   * UI Dialog functions *
   ***********************/
  doPower: function() {
    // Closes the XMPP session.
    if (this.isConnected()) {
      this.doShutdown();
    } else {
      var credentials = this.getCredentials();
      this.loadXMPP().when(jsx3.$F(function() {
        this.connectSession(credentials);
      }).bind(this));
    }
  },

  doShutdown: function() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    
    var tree = this._getTree();
    tree.setSourceXML(this.getTreeDocument(true));
    tree.repaint();
    this.setUIState(0);
  },

  doShowAddContact: function() {
    // Called when user clicks the "Add Contact" button on
    // the palette.  Loads the add dialog and sets it up.
    this.getResource("xmpp_add_dialog").load().when(jsx3.$F(function() {
      var dialog = this.loadRsrcComponent("xmpp_add_dialog", this.getServer().getRootBlock(), false);
      dialog.getParent().paintChild(dialog);

      dialog.focus();
    }).bind(this));
  },

  _doAddContact: function(objEvent, dialog) {
    // Called when the user accepts the contact to add.
    // Adds the contact to the user's roster and requests
    // a subscription to their presence.
    var contact = dialog.getJID();
    this.session.rosterService.addRosterItem(contact, contact);
    this.session.presenceService.subscribe(contact);
    dialog.doClose();
  },

  editNickname: function(user) {
    // Called when user selects "Set Nickname" from context
    // menu.  Loads the nickname dialog and sets it up.
    this.getResource("xmpp_nick_dialog").load().when(jsx3.$F(function() {
      var dialog = this.loadRsrcComponent("xmpp_nick_dialog", this.getServer().getRootBlock(), false);
      dialog.getParent().paintChild(dialog);

      dialog.focus();
      dialog.setNickname(user.jsxid, user.jsxnick);
    }).bind(this));
  },

  _doEditNickname: function(objEvent, dialog) {
    // Called when user accepts the nickname for a contact.
    // Sets the nickname for the contact using the roster
    // service.
    var nickname = dialog.getNickname();
    //jsx3.ide.LOG.warn(dialog.jsxjid, nickname);
    this.session.rosterService.updateRosterItem(dialog.jsxjid, nickname);
    dialog.doClose();
  },

  deleteFromRoster: function(user) {
    // Called when user selects "Delete" from context
    // menu.  Loads the delete dialog and sets it up.
    this.getResource("xmpp_delete_dialog").load().when(jsx3.$F(function() {
      var dialog = this.loadRsrcComponent("xmpp_delete_dialog", this.getServer().getRootBlock(), false);
      dialog.getParent().paintChild(dialog);

      dialog.focus();
      dialog.setInfo(user.jsxid, user.jsxtext);
    }).bind(this));
  },

  _doDeleteContact: function(objEvent, dialog) {
    // Called when user confirms they want to delete
    // a contact.  Removes the contact from their roster.
    this.session.rosterService.removeRosterItem(dialog.jid);
    dialog.doClose();
  }
});
