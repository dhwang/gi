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

var showcaseStore = new dojox.data.JsonRestStore({target:"Showcase/", idAsRef: true}); 
selectedItem = {};
function requery(license){
	componentGrid.setQuery({license:license});
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
	}
	var loginAgain = login;
	login = function(){};// no way else 
	dojo.require("persevere.Login");
    var loginDialog = new persevere.Login({onLoginSuccess: function(){
	    	alert("Logged in");
	    	location.reload();
	    },
	    closable: false});
    
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
	dojo.connect(dojo.byId("uploadApplication"), "onclick", function(e){
		selectedItem = {};
		showSelectedComponent();
	});
	function showSelectedComponent(){
		dojo.byId("title-description").value = showcaseStore.getValue(selectedItem, "title") || "";
		dojo.byId("version-detail").value = showcaseStore.getValue(selectedItem, "appVersion") || "";
		dojo.byId("about-description").value = showcaseStore.getValue(selectedItem, "description") || "";
		dojo.byId("tags-description").value = showcaseStore.getValue(selectedItem, "tags") || "";
		dojo.byId("proxy-description").value = showcaseStore.getValue(selectedItem, "proxy") || "";
		dojo.byId("license-detail").value = showcaseStore.getValue(selectedItem, "license") || "";
		dojo.byId("author-detail").value = showcaseStore.getValue(selectedItem, "author") || "";
		dojo.byId("key-detail").value = showcaseStore.getValue(selectedItem, "key") || "";
		dojo.byId("runtime-location-description").value = showcaseStore.getValue(selectedItem, "runtime") || "";
		dojo.byId("email-detail").value = showcaseStore.getValue(selectedItem, "email") || "";
		dojo.byId("publish-detail").checked= showcaseStore.getValue(selectedItem, "publish") || "";
		dojo.byId("preview-button").disabled = !selectedItem.id;
		dojo.byId("delete-button").disabled = !selectedItem.id;
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
	dojo.connect(dojo.byId("delete-button"), "onclick", function(e){
		if(confirm("Are you sure you want to delete " + selectedItem.title)){
			showcaseStore.deleteItem(selectedItem);
			showcaseStore.save();
		}
	});
	dojo.connect(dojo.byId("save-button"), "onclick", function(e){
		dojo.stopEvent(e);
		dojo.io.iframe.send({
			form:"upload-form",
			url:"Showcase/" + (selectedItem.id || "") + "?http-Accept=text/html&pintura-auth=" + dojo.cookie("pintura-auth"),
			timeout: 10000,
			handleAs: "javascript" 
		}).addCallback(function(value){
			if(typeof value === "string"){
				alert(value);
			}
			else{
				componentGrid._refresh(true);
				alert("Saved ");
				dojo.byId("preview-button").disabled = false;
				dojo.byId("delete-button").disabled = false;
			}
		});
	});
	dojo.connect(dojo.byId("preview-button"), "onclick", function(e){
		dojo.stopEvent(e);
		window.location = '/' + selectedItem.id + "/launch.html"; 
	});
	dojo.connect(dojo.byId("add-runtime-button"), "onclick", function(e){
		dojo.stopEvent(e);
		var runtimePath = prompt("Enter new GI runtime path:");
		if(runtimePath){
	        dojo.xhrPost({
	        	url: "GIRuntime/",
	        	headers:{"Accept":"application/json"},
                postData: dojo.toJson({path: runtimePath}),
                handleAs: "json"
	        });
	        addRuntimeOption({path: runtimePath});
		}
	});
	dojo.connect(dojo.byId("remove-runtime-button"), "onclick", function(e){
		dojo.stopEvent(e);
		var confirmed = confirm("Are you sure you want to remove the runtime path " + dojo.byId("runtime-location-description").value + "?");
		if(confirmed){
			removeRuntimeOption(select.value);
	        dojo.xhrDelete({
                url: "GIRuntime/" + runtimes[dojo.byId("runtime-location-description").value].id,
	        	headers:{"Accept":"application/json"},
                handleAs: "json"
	        });
		}
	});
	dojo.connect(dojo.byId("login"), "onclick", login);
	dojo.connect(dojo.byId("filter-box-form"), "onsubmit", function(event){
		componentGrid.setQuery("?fulltext('" + dojo.byId("filter-box").value.replace(/'/g,"\\'") + "')");
		showcaseStore.save(saveParameters);
		dojo.stopEvent(event);
	});
	var runtimes = {};
	dojo.xhrGet({
		url: "GIRuntime/",
	    headers:{"Accept":"application/json"},
		handleAs:"json"
	}).addCallback(function(runtimes){
		dojo.forEach(runtimes, addRuntimeOption);
	});
	var select = dojo.byId("runtime-location-description");
	function addRuntimeOption(runtime){
		runtimes[runtime.path] = runtime;
		var option = select.appendChild(document.createElement("option"));
		option.innerHTML = runtime.path;
		option.value = runtime.path;
	}
	function removeRuntimeOption(path){
		var runtime = runtimes[path];
		delete runtimes[path];
		var children = select.childNodes;
		dojo.forEach(select.childNodes, function(element){
			if(element.value == runtime.path){
				select.removeChild(element);
			}
		});
	}
});
function dateFormatter(date){
	return date && ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
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