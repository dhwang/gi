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

  setUIState: function(state) {
    // Displays the correct Block depending on the
    // state of the XMPP settings/connection
    var ui = this.getPalette().getUIObject();
    ui.getDescendantOfName("xmpp_conf_block").setDisplay(state == 0?
      jsx3.gui.Block.DISPLAYBLOCK :
      jsx3.gui.Block.DISPLAYNONE,
    true);
    ui.getDescendantOfName("xmpp_loading_block").setDisplay(state == 1?
      jsx3.gui.Block.DISPLAYBLOCK :
      jsx3.gui.Block.DISPLAYNONE,
    true);
    ui.getDescendantOfName("xmpp_list_block").setDisplay(state == 2?
      jsx3.gui.Block.DISPLAYBLOCK :
      jsx3.gui.Block.DISPLAYNONE,
    true);
  },

  getCredentials: function() {
    // Gets the saved credentials from the
    // user's settings
    var s = jsx3.ide.getIDESettings();
    var id = this.getId();

    return {
      username: s.get(id, 'userid'),
      password: s.get(id, 'password'),
      server: s.get(id, 'server'),
      port: s.get(id, 'port'),
      use_ssl: s.get(id, 'ssl')
    }
  },

  getRecord: function(item, notImgFromStatus) {
    // Returns a record object for use with the palette's
    // tree's XML.
    return {
      jsxid: item.jid,
      jsxnick: item.name,
      jsxtext: (item.name||item.jid) + (item.substatus == dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING ? ' (awaiting authorization)' : ''),
      jsximg: 'images/none.gif'
    };
  },

  /******************
   * XMPP Functions *
   ******************/
  connectSession: function(credentials) {
    // Handles connecting to the XMPP server.
    // Determines if we need to use the iframe transport
    // for a cross-domain situation.

    dojo.require("dojox.xmpp.xmppSession");
    var jid_parts = credentials.username.split('@');
    var domain = jid_parts[1];
    var serviceUrl = credentials.server;

    if(serviceUrl.indexOf('http://') != 0){
      serviceUrl = 'http://' + serviceUrl;
    }

    if(credentials.port){
      serviceUrl += ':' + credentials.port;
    }

    serviceUrl += (serviceUrl.charAt(serviceUrl.length-1) == '/' ? '' : '/') + 'http-bind/';

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

    // automatically approve all subscription requests
    dojo.connect(this.session, 'onSubscriptionRequest', this, function(from){
      this.session.presenceService.approveSubscription(from);
    });

    // this is so the iframes get appended to the actual body rather than
    // the loaded application's body
    var oldDojoBody = dojo.body;
    dojo.body = function(){
      return dojo.doc.body || dojo.doc.getElementsByTagName("body")[0]; // Node
    }
    this.setUIState(1);
    this.session.open(credentials.username, credentials.password, 'TIBCO/GIChat');
    dojo.body = oldDojoBody;
  },

  updateTree: function() {
    // Iterates through the XMPP session's roster
    // and updates the palette's tree.
    var objTree = this._getTree();
    if (objTree) {
      for (var i = 0, l = this.session.roster.length; i<l; i++) {
        var buddy = this.session.roster[i];
        this.roster[buddy.jid] = buddy;
        var rec = objTree.getRecordNode(buddy.jid);
        if(!rec) {
          objTree.insertRecord(this.getRecord(buddy), 'jsxcontacts', false);
        }
      }
      objTree.repaint();
    }
  },

  onActive: function(){
    // Called when the XMPP session is active.  Publishes
    // the user's status as "online" and displays the contact
    // tree.

    //console.log('Active!', arguments);
    this.session.presenceService.publish({});
    this.setUIState(2);
  },

  onRosterAdded: function(item){
    // Called when the session adds a contact.  Inserts
    // the contact's record into the tree's XML.

    //console.log('RosterAdded!', arguments);
    var objTree = this._getTree();

    // need this because dojox.xmpp doesn't add the item
    // to the roster.
    this.session.roster.push(item);
    this.roster[item.jid] = item;

    if (objTree) {
      objTree.insertRecord(this.getRecord(item), 'jsxcontacts', true);
    }
  },

  onRosterChanged: function(newItem, oldItem){
    // Called when the session changes the roster.  Updates
    // the tree's record for the contact.

    //console.log('RosterChanged!', arguments);
    var objTree = this._getTree();

    if (objTree) {
      objTree.insertRecordProperty(oldItem.jid, 'jsxtext', (newItem.name||newItem.jid) + (newItem.substatus == dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING ? ' (awaiting authorization)' : ''), true);
    }
  },

  onRosterRemoved: function(item){
    // Called when the session removes a concact
    // from the roster.  Removes the record from
    // the tree.

    //console.log('RosterRemoved!', arguments);
    var objTree = this._getTree();
    delete this.roster[item.id];

    if (objTree) {
      objTree.deleteRecord(item.id, true);
    }
  },

  onRosterUpdated: function(){
    // Called when the session updates the roster.
    // Updates the tree based on the session's roster.

    //console.log('RosterUpdated!', arguments);
    this.updateTree();
  },

  onPresenceUpdate: jsx3.$F(function(buddy){
    // Called when the session updates a contact's
    // status.  Updates the icon for the contact in
    // the tree based on status.

    //console.log('PresenceUpdate!', arguments);
    var objTree = this._getTree();
    if (objTree) {
      var image = '';
      switch(buddy.show) {
        case 'away':
        case 'dnd':
        case 'none':
        case 'xa':
        case 'online':
          image = buddy.show;
          break;
        default:
          image = 'online';
      }
      objTree.insertRecordProperty(buddy.from, 'jsximg', 'images/' + image + '.gif', true);
    }
  }).throttled(),

  /***********************
   * UI Dialog functions *
   ***********************/
  doShutdown: function(){
    // Closes the XMPP session.
    this.session.close();
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
    //console.log(dialog.jsxjid, nickname);
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
