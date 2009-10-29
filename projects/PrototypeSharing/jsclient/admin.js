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

var prototypeStore = new dojox.data.PersevereStore({target:"/Prototype/", idAsRef: true}); // persevere stores are auto-generated
var logStore = new dojox.data.PersevereStore({target:"/Log/", idAsRef: true}); // persevere stores are auto-generated
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
    }});
	dojo.body().appendChild(loginDialog.domNode);
	loginDialog.startup();
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
		setText(dojo.byId("author-detail"), prototypeStore.getValue(selectedItem, "user"));
		setText(dojo.byId("name-detail"), prototypeStore.getValue(selectedItem, "name"));
		setText(dojo.byId("status-detail"), prototypeStore.getValue(selectedItem, "status"));
		setText(dojo.byId("version-detail"), prototypeStore.getValue(selectedItem, "version"));
		setText(dojo.byId("downloads-detail"), prototypeStore.getValue(selectedItem, "downloads"));
		setText(dojo.byId("uploaded-detail"), prototypeStore.getValue(selectedItem, "uploaded"));
		setText(dojo.byId("rating-detail"), prototypeStore.getValue(selectedItem, "rating"));
		setText(dojo.byId("category-detail"), prototypeStore.getValue(selectedItem, "category"));
		setText(dojo.byId("description-detail"), prototypeStore.getValue(selectedItem, "description"));
		dojo.byId("component-log").innerHTML = dojo.map(prototypeStore.getValue(selectedItem, "log"), function(entry){
			return "<hr /><div><span>Action: <span><span>" + entry.action + "</span></div>" +
					"<div><span>Notes: <span><span>" + entry.notes + "</span></div>";
		}).join("\n");
		
	}
	var tabElement = dojo.query('div.nowrapTabStrip', infoPane.tablist.tablistWrapper)[0];

	tabElement.style.width = "100%";
	var componentActions = dojo.byId("component-actions");
	componentActions.style.display = "inline-block";
	tabElement.appendChild(componentActions);
	
	var saveParameters = {
		onError: function(error){
			alert("Save failed: " + error);
		}		
	};
	dojo.connect(dojo.byId("download"), "onclick", function(){
		var id = prototypeStore.getIdentity(selectedItem);
		window.location.href = "/Prototype/" + id + ".component";
	});
	dojo.connect(dojo.byId("accept-button"), "onclick", function(){
		prototypeStore.setValue(selectedItem, "enabled", true);
		prototypeStore.setValue(selectedItem, "status", "Accepted");
		prototypeStore.save(saveParameters);
		logStore.newItem({
			prototype_id:selectedItem.id,
			action: "Accepted",
			sendEmail: confirm("Send an email to author?"),
			notes: null
		});
		logStore.save(saveParameters);
	});
	dojo.connect(dojo.byId("reject-button"), "onclick", function(){
		var reason = prompt("Enter the reason for rejecting");
		if(typeof reason === "string"){
			prototypeStore.setValue(selectedItem, "enabled", false);
			prototypeStore.setValue(selectedItem, "status", "Rejected");
			prototypeStore.save(saveParameters);
			logStore.newItem({
				prototype_id:selectedItem.id,
				action: "Rejected",
				sendEmail: confirm("Send an email to author?"),
				notes: reason
			});
			logStore.save(saveParameters);
		}
	});
	dojo.connect(dojo.byId("feature-button"), "onclick", function(){
		prototypeStore.setValue(selectedItem, "featured", !prototypeStore.getValue(selectedItem, "featured"));
		prototypeStore.setValue(selectedItem, "enabled", true);
		prototypeStore.setValue(selectedItem, "status", "Featured");
		prototypeStore.save(saveParameters);
		logStore.newItem({
			prototype_id:selectedItem.id,
			action: "Featured",
			sendEmail: confirm("Send an email to author?"),
			notes: null
		});
		logStore.save(saveParameters);
	});
	dojo.connect(dojo.byId("delete-button"), "onclick", function(){
		prototypeStore.setValue(selectedItem, "deleted", true);
		prototypeStore.setValue(selectedItem, "enabled", false);
		prototypeStore.setValue(selectedItem, "status", "Deleted");
		prototypeStore.save(saveParameters);
	});
	dojo.connect(dojo.byId("purge-button"), "onclick", function(){
		dojo.xhrPost({
            url: this.userUrl,
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