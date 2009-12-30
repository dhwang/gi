var path = location.pathname.match(/(.*\/)[^\/]*$/)[1];
//dojo.require("dojox.data.ClientFilter");
dojo.require("dojo.cookie");
dojo.require("dojox.data.PersevereStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.highlight");
dojo.require("dojox.highlight.languages.xml");
dojo.require("dijit.Dialog");

var prototypeStore = new dojox.data.JsonRestStore({target:"Prototype/", idAsRef: true}); // persevere stores are auto-generated
var logStore = new dojox.data.JsonRestStore({target:"Log/", idAsRef: true}); // persevere stores are auto-generated
function requery(status){
	componentGrid.setQuery({status:status});
}
function setText(element, text){
	element.innerHTML = text && text.toString().replace(/</g,"&lt;");
}
function login(){
	if(username){
        dojo.xhrPost({
                url: "Class/User",
                postData: dojo.toJson({method: "authenticate", id:"login", params:[null, null]}),
                handleAs: "json",
                sync: true
        });
        location.reload();
        return;
	}
	var loginAgain = login;
	login = function(){};// no way else 
	dojo.require("persevere.Login");
    var loginDialog = new persevere.Login({onLoginSuccess: function(){
	    	alert("Logged in");
	    	login = loginAgain;
	    	//location.reload();
	    	loginDialog.destroy();
	    },
	    closable: false});
    
	dojo.body().appendChild(loginDialog.domNode);
	loginDialog.startup();
	dojo.style(loginDialog.closeButtonNode, "display", "none");
	setTimeout(function(){
	    dojo.query("button", loginDialog.domNode)[0].parentNode.parentNode.parentNode.style.display= "none";
	},100);
}
dojo.addOnLoad(function(){
	activityTab.onShow = function(){
		activityGrid.setStore(logStore, '');
		delete activityTab.onShow; 
	};
	dojo.connect(componentGrid,"onRowClick", function(event){
		selectedItem = event.grid.getItem(event.rowIndex);
		showSelectedComponent();
	});
	dojo.connect(activityGrid,"onRowClick", function(event){
		selectedItem = event.grid.getItem(event.rowIndex);
		var prototypeId = logStore.getValue(selectedItem, "prototype_id");
		prototypeStore.fetchItemByIdentity({
			identity: prototypeId,
			onItem: function(item){
				selectedItem = item;
				interfaceWrapper.selectChild(interfaceWrapper.getChildren()[0]);
				showSelectedComponent();
			}
		});
		/*
		setText(dojo.byId("log-user-detail"), logStore.getValue(selectedItem, "user"));
		setText(dojo.byId("log-action-detail"), logStore.getValue(selectedItem, "action"));
		setText(dojo.byId("log-notes-detail"), logStore.getValue(selectedItem, "notes"));
		*/
	});
	function showSelectedComponent(){
		var sourceCode = prototypeStore.getValue(selectedItem, "component");
		sourceCode = sourceCode && sourceCode.toString().replace(/</g,"&lt;");
		sourceTab.attr("content", sourceCode);
		dojox.highlight.init(sourceTab.containerNode);
		var status = prototypeStore.getValue(selectedItem, "status");
		setText(dojo.byId("author-detail"), prototypeStore.getValue(selectedItem, "user"));
		setText(dojo.byId("name-detail"), prototypeStore.getValue(selectedItem, "name"));
		setText(dojo.byId("status-detail"), status);
		setText(dojo.byId("downloads-detail"), prototypeStore.getValue(selectedItem, "downloads"));
		setText(dojo.byId("uploaded-detail"), prototypeStore.getValue(selectedItem, "uploaded"));
		setText(dojo.byId("rating-detail"), prototypeStore.getValue(selectedItem, "rating"));
		setText(dojo.byId("description-detail"), prototypeStore.getValue(selectedItem, "description"));
		dojo.byId("component-log").innerHTML = dojo.map(prototypeStore.getValue(selectedItem, "log"), function(entry){
			return "<hr /><div><span>Action: <span><span>" + entry.action + "</span></div>" +
					"<div><span>Notes: <span><span>" + entry.notes + "</span></div>";
		}).join("\n");
		dojo.byId("accept-button").disabled = prototypeStore.getValue(selectedItem, "enabled") && status != "New"; 
		dojo.byId("reject-button").disabled = status == "Rejected"; 
		dojo.byId("feature-button").disabled = false;
		dojo.byId("feature-button").innerHTML = '<span class="featureIcon"></span>' + (status == "Featured" ? "Unfeature" : "Feature"); 
		dojo.byId("delete-button").disabled = false; 
	}
	var tabElement = dojo.query('div.nowrapTabStrip', infoPane.tablist.tablistWrapper)[0];

	tabElement.style.width = "100%";
	var componentActions = dojo.byId("component-actions");
	componentActions.style.display = "inline-block";
	tabElement.appendChild(componentActions);
	function showDialog(question, needReason, callback){
		statusDialog.show();
		dojo.byId("action-confirmation").innerHTML = question;
		dojo.byId("action-reason").style.display = needReason ? "block" : "none";
		dojo.byId("action-reason").value = "";
		dojo.byId("confirm-action").onclick = function(){
			callback({
				notes: dojo.byId("action-reason").value,
				sendEmail: dojo.byId("send-email").checked
			});
			statusDialog.hide();
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
	dojo.connect(dojo.byId("download"), "onclick", function(){
		var id = prototypeStore.getIdentity(selectedItem);
		window.location.href = "Prototype/" + id + ".component";
	});
	dojo.connect(dojo.byId("accept-button"), "onclick", function(){
		if(!this.disabled){
			showDialog("Accepting component", false, function(info){
				prototypeStore.setValue(selectedItem, "enabled", true);
				prototypeStore.setValue(selectedItem, "status", "Accepted");
				prototypeStore.save(saveParameters);
				logStore.newItem({
					prototype_id:selectedItem.id,
					action: "Accepted",
					sendEmail: info.sendEmail,
					notes: info.notes
				});
				logStore.save(saveParameters);
			});
		}
	});
	dojo.connect(dojo.byId("reject-button"), "onclick", function(){
		if(!this.disabled){
			showDialog("Rejecting component<br/>Reason for rejecting:", true, function(info){
				prototypeStore.setValue(selectedItem, "enabled", false);
				prototypeStore.setValue(selectedItem, "status", "Rejected");
				prototypeStore.save(saveParameters);
				logStore.newItem({
					prototype_id:selectedItem.id,
					action: "Rejected",
					sendEmail: info.sendEmail,
					notes: info.notes
				});
				logStore.save(saveParameters);
			});
		}
	});
	dojo.connect(dojo.byId("feature-button"), "onclick", function(){
		if(!this.disabled){
			var wasFeatured = prototypeStore.getValue(selectedItem, "featured");
			showDialog(wasFeatured ? 
				"Unfeaturing component" : "Featuring component", false, function(info){
				prototypeStore.setValue(selectedItem, "featured", !wasFeatured);
				prototypeStore.setValue(selectedItem, "enabled", true);
				prototypeStore.setValue(selectedItem, "status", wasFeatured ? "Accepted" : "Featured");
				prototypeStore.save(saveParameters);
				logStore.newItem({
					prototype_id:selectedItem.id,
					action: wasFeatured ? "Not Featured" : "Featured",
					sendEmail: info.sendEmail,
					notes: info.notes
				});
				logStore.save(saveParameters);
			});
		}
	});
	dojo.connect(dojo.byId("delete-button"), "onclick", function(){
		if(confirm("Are you sure you want to delete the component?")){
			prototypeStore.deleteItem(selectedItem);
			prototypeStore.save(saveParameters);
		}
	});
	dojo.connect(dojo.byId("purge-button"), "onclick", function(){
		if(confirm("Are you sure you want to purge the database of deleted components?")){
			dojo.xhrPost({
	            url: "Class/Prototype",
	            postData: dojo.toJson({method: "purge", id:"purge", params:[]}),
	            handleAs: "json",
	            headers: {Accept:"application/javascript, application/json"},
	            load: function(response){
	            	if(response.error == null){
	            		alert("Database purged");
	            	}
	            	else{
	            		alert("Purge failed: " + response.error);
	            	}
	            },
	            error: function(error){
	            	alert("Purge failed: " + error);
	            }
	        });
			
		}
	});
	
	dojo.connect(dojo.byId("login"), "onclick", login);
	dojo.connect(dojo.byId("filter-box-form"), "onsubmit", function(event){
		componentGrid.setQuery("?fulltext('" + dojo.byId("filter-box").value.replace(/'/g,"\\'") + "')");
		prototypeStore.save(saveParameters);
		dojo.stopEvent(event);
	});
});
function dateFormatter(date){
	return date && (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());
}
function getStatus(rowIndex, item){
    if(!item){
            return this.defaultValue;
    }
    if(prototypeStore.getValue(item, "featured")){
		return "Featured";
	}
    if(prototypeStore.getValue(item, "enabled")){
		return "Accepted";
	}
	return "Flagged";
}
(function(){
	var plainXhr = dojo.xhr;
	username = undefined;
	dojo.xhr = function(method,args,hasBody) {
		function done(res) {
			username = dfd.ioArgs.xhr.getResponseHeader("Username");
			if(!username){
				login();
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