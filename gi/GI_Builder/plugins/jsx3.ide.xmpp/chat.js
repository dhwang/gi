/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({
  doStartChat: function(selectedNodes) {
    // Called when a contact's tree node is double
    // clicked.  Registers the chat instance with the
    // service and invites the contact to a chat.

    var chatInstance = new dojox.xmpp.ChatService();
    this.session.registerChatInstance(chatInstance);
    chatInstance.invite(selectedNodes);
  },

  onRegisterChatInstance: function(instance, message){
    // Called when the XMPP service gets a request
    // to register a chat instance.  Makes sure our
    // internal list of chat instances is up to date.

    console.log('RegisterChatInstance!', arguments);

    var ci = this.chatInstances;
    if (instance.uid) {
      if (!ci[instance.uid] || ci[instance.uid].chatid != instance.chatid) {
        this._newMessage(instance, instance.uid, message);
      }
      ci[instance.uid] = instance;
    }

    dojo.connect(instance, 'onInvite', this, function(jid) {
      ci[jid] = instance;
      this._newMessage(instance, jid, null);
    });

    dojo.connect(instance, 'onNewMessage', this, function(msg) {
      this._newMessage(instance, instance.uid, msg);
    });

    dojo.connect(instance, 'setState', this, function(state) {
      console.log("IM: ",  instance.uid, " is now ", state);
    });
  },

  _newMessage: function(instance, jid, message) {
    // Called when a chat session gets a new message.
    // Determines if a new dialog needs to be rendered
    // and passes the message to the dialog.

    var cd = this.chatDialogs;
    if (!cd[jid] || !cd[jid]._jsxparent) {
      this.getResource("xmpp_chat_dialog").load().when(jsx3.$F(function() {
        var dialog = cd[jid] = this.loadRsrcComponent("xmpp_chat_dialog", this.getServer().getRootBlock(), false);
        dialog.getParent().paintChild(dialog);

        dialog.focus();

        dialog.initializeTitle(this.roster[jid]);
        dialog.onNewMessage(instance, message);
      }).bind(this));
    } else {
      cd[jid].onNewMessage(instance, message);
    }
  }
});
