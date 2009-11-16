var path = location.pathname.match(/(.*\/)[^\/]*$/)[1];
//dojo.require("dojox.data.ClientFilter");
dojo.require("dojo.cookie");
dojo.require("dojox.data.PersevereStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Dialog");
dojo.require("dojo.io.iframe");
dojo.require("dojo.cookie");

var showcaseStore = new dojox.data.PersevereStore({target:"Showcase/", idAsRef: true, simplifiedQuery: true}); // persevere stores are auto-generated
function requery(status){
	componentGrid.setQuery({status:status});
}
function setText(element, text){
	element.innerHTML = text && text.toString().replace(/</g,"&lt;");
}
function login(){
	var loginAgain = login;
	login = function(){};// no way else 
	dojo.require("persevere.Login");
    var loginDialog = new persevere.Login({onLoginSuccess: function(){
	    	alert("Logged in");
	    	login = loginAgain;
	    	//location.reload();
	    	realHide();
	    },
	    closable: false});
    var realHide = dojo.hitch(loginDialog, loginDialog.hide);
    loginDialog.onExecute = function(){
    	realHide();
    };
	loginDialog.hide = function(){
		alert("Must login first");
	};
    
	dojo.body().appendChild(loginDialog.domNode);
	loginDialog.startup();
	setTimeout(function(){
	    dojo.query("#dijit_form_Button_0", loginDialog.domNode)[0].parentNode.parentNode.parentNode.style.display= "none";
	},100);
}
dojo.addOnLoad(function(){
	dojo.connect(componentGrid,"onRowClick", function(event){
		selectedItem = event.grid.getItem(event.rowIndex);
		showSelectedComponent();
	});
	function showSelectedComponent(){
		dojo.byId("title-description").value = showcaseStore.getValue(selectedItem, "title");
		
	}
	var tabElement = dojo.query('div.nowrapTabStrip', infoPane.tablist.tablistWrapper)[0];

	tabElement.style.width = "100%";
/*	var componentActions = dojo.byId("component-actions");
	componentActions.style.display = "inline-block";
	tabElement.appendChild(componentActions);*/
	function showDialog(question, needReason, callback){
		statusDialog.show();
		dojo.byId("action-confirmation").innerHTML = question;
		dojo.byId("action-reason").style.display = needReason ? "block" : "none";
		dojo.byId("confirm-action").onclick = function(){
			realHide();
			callback({
				notes: dojo.byId("action-reason").value,
				sendEmail: dojo.byId("send-email").checked
			});
		};
		dojo.byId("cancel-action").onclick = function(){
			statusDialog.hide();
		};
	}
	var saveParameters = {
		onError: function(error){
			alert("Save failed: " + error.responseText);
		}		
	};
	dojo.connect(dojo.byId("save-button"), "onclick", function(e){
		dojo.stopEvent(e);
		dojo.io.iframe.send({
			form:"upload-form",
			url:"http://localhost:7000/Showcase/?pintura-auth=" + dojo.cookie("pintura-auth") 
		});
	});
	
	dojo.connect(dojo.byId("login"), "onclick", login);
	dojo.connect(dojo.byId("filter-box-form"), "onsubmit", function(event){
		componentGrid.setQuery("?fulltext('" + dojo.byId("filter-box").value.replace(/'/g,"\\'") + "')");
		showcaseStore.save(saveParameters);
		dojo.stopEvent(event);
	});
});
function dateFormatter(date){
	return date && (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());
}
(function(){
	var plainXhr = dojo.xhr;
	username = undefined;
	dojo.xhr = function(method,args,hasBody) {
		function done(res) {
			username = dfd.ioArgs.xhr.getResponseHeader("Username");
			if(!username){
			//	login();
			}
			// if the sign-in button is waiting for us
			dojo.byId("username").innerHTML = username;
			return res;
		}
		var dfd = plainXhr(method,args,hasBody);
		dfd.addBoth(done);
		return dfd;
	}
})();