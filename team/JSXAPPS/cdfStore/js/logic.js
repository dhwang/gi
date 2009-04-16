/* place JavaScript code here */

djConfig = typeof djConfig == "undefined" ? {baseUrl: "../../gi/dojo-toolkit/dojo/", afterOnLoad: true} : djConfig;
jsx3.CLASS_LOADER.loadJSFileSync("../../gi/dojo-toolkit/dojo/dojo.js");

dojo.require("dojox.data.CdfStore");

var storeUrl = dojo.moduleUrl("dojox.data.tests", "stores/cdf1.xml").toString();

loadViaUrl = function(){
	//TODO:
	//	new items IDs
	//	sort
	//  onSet
	//  handle groups / arrays
	//
	console.log("url:", storeUrl);
	var store = new dojox.data.CdfStore({url:storeUrl, label:"name", mode:dojox.data.ASYNC_MODE});
	
	console.log("SYNC MODE");
	console.info(store.fetch({query:"//record[@jsxid]", start:1, count:1, mode:dojox.data.SYNC_MODE}));
	console.info("store.isDirty (false):", store.isDirty());
	store.fetch({query:"//record[@jsxid]",
		mode:dojox.data.ASYNC_MODE,
		onComplete: function(items){
			console.log( " --> onComplete:", items);
			console.log("READ")
			console.info(" getValue:", store.getValue(items[0], "jsxtext"));
			console.info(" getLabel:", store.getLabel(items[0]));
			console.info(" getLabelAttributes:", store.getLabelAttributes(items[0]));
			console.info(" getAttributes:", store.getAttributes(items[0]));
			console.info(" containsValue:", store.containsValue(items[0], "ai", "v1"), store.containsValue(items[0], "a1", "v1"));
			console.info( "isItem:", store.isItem(items[0]));
			console.info( "isItemLoaded:", store.isItemLoaded(items[0]));
			
			console.log("WRITE");
			
				store.setValue(items[0], "jsxtext", "I Set This!");
			console.info(" WRITE setValue:", store.getValue(items[0], "jsxtext"));
				store.unsetAttribute(items[0], "jsxtext");
			console.info(" WRITE unsetAttribute: (null->)", store.getValue(items[0], "jsxtext"));
			
			console.info("store.isDirty (true):", store.isDirty());
			console.info("item.isDirty (true):", store.isDirty(items[0]));
			
			
			setTimeout(function(){
				// without the timeout, the delete will interfere
				//	with async fetches
				store.mode = dojox.data.SYNC_MODE;
				console.info(" BEFORE REVERT getValue:", store.byId('1'));
				store.setValue(store.byId('1'), "jstext", "Text Before revert");
				console.info(" BEFORE REVERT NEW VALUE:", store.byId('1'));
				console.log("REVERT");
				store.revert();	
				console.info(" AFTER REVERT:", store.byId('1'));
			},200);
			
		}, onError: function(err){
			console.error(">>>>>>>>>>>>fetch.error", err)
		}
	});
}

loadViaUrl2 = function(){
	console.log("url:", storeUrl);
	var store = new dojox.data.CdfStore({url:storeUrl, label:"name", mode:dojox.data.ASYNC_MODE});
	store.fetch({query:"//record[@jsxid='5']",
		onComplete: function(items){
			console.log( "onComplete id=5:::", items[0]);
			
			var ni = store.newItem({jsxid:"6", "jstext":"my crazy text"}, "group");
			
			console.info("newItem:", ni);
			
			store.fetch({query:"//record[@jsxid='6']", onComplete: function(items){
				console.info("test fetch newItem:", items[0]);			
			}});
			
			setTimeout(function(){
				// without the timeout, the delete will interfere
				//	with the above async fetches
				console.log("delete item...");
				store.deleteItem(ni);
				store.fetch({query:"//record[@jsxid='6']", onComplete: function(items){
					console.info("test newItem deleted:", items[0]);			
				}});
			},100);
			
			
			
			
			
			// test deferred here
			var dfd = store.fetch({query:"//record[@jsxid='6']", mode:dojox.data.ASYNC_MODE});
			console.info(">>>>>>>>>>>>>>>test deferred fetch of newItem:", dfd);
			dfd.addCallback(function(){
				console.info(">>>>>>>>>>>>>>>test deferred fetch of newItem:", items[0]);
			});
			
			
			store.mode = dojox.data.SYNC_MODE;
			console.info("BYID -> ", store.byId('1'));
			
		}, onError: function(err){
			console.error("fetch.error", err)
		}
	});
	
}	

	
loadBadUrl = function(){
	storeUrl+="XX";
	var store = new dojox.data.CdfStore({url:storeUrl, label:"name", mode:dojox.data.ASYNC_MODE,
		onComplete: function(items){
			console.info("loaded bad url items:", items);
		},
		onError: function(err){
			console.error("bar urdl error:", err);
		}
	});
}
loadBadStr = function(){
	var doc = new jsx3.xml.Document();
	var str = '<data jsxid="jsxroot"><record jsxtext="A"/><record jsxtext="B" jsxid="2" jsxid="2"/></data>';
	var store = new dojox.data.CdfStore({xmlStr:str, label:"name", mode:dojox.data.ASYNC_MODE,
		onComplete: function(items){
			console.info("loaded str url items:", items);
		},
		onError: function(err){
			console.error("bar str error:", err);
		}
	});
}
loadViaStr = function(){
	var str = '<data jsxid="jsxroot"><record jsxid="1" jsxtext="My A Text" /><record jsxid="2" jsxtext="My B Text" /></data>';
    var store = new dojox.data.CdfStore({xmlStr:str, label:"name", mode:dojox.data.SYNC_MODE});
	console.info("store:", store);
	console.info( "sync fetch:", store.fetch({query:"//record[@jsxid]"}) );
}
loadViaObject = function(){
	var data = {
		jsxid:"jsxroot",
		record:[
			{
				jsxid:"1",
				jsxtext:"My A Text"
			},{
				jsxid:"2",
				record:[
					{
						jsxid:"2a",
						jsxtext:"My Group A Text"
					},{
						jsxid:"2b",
						jsxtext:"My Group B Text"
					}
				]
			}
		]
	};
	
	 var store = new dojox.data.CdfStore({data:data, label:"name", mode:dojox.data.SYNC_MODE});
	 console.info( "sync obj fetch:", store.fetch({query:"//record[@jsxid]"}) );
}
queryTest = function(){
	console.log("QUERY TEST")
	var store = new dojox.data.CdfStore({url:storeUrl, label:"name", mode:dojox.data.SYNC_MODE});
	console.info(store.fetch({query:"//record"}));
	console.info(store.fetch({query:"//data/record"}));
	console.info(store.fetch({query:"//record[@jsxid='1']"}));
	console.info(store.fetch({query:"//record[@jsxid='4']"}));
	console.info(store.fetch({query:"//record[@jsxid='4' or @jsxid='1']"}));
	console.info(store.fetch({query:"//group[@name='mySecondGroup']/record"}));
}
//loadViaStr();
loadViaUrl();
//loadViaObject();
//queryTest();

dojo.addOnLoad(function(){
	console.log("dojo loaded.")
	
	//console.log("store:", store);
	
	//from CDF:
	// could use this pattern to create xml from string
	//var objXML = new jsx3.xml.Document();
    //objXML.loadXML('<' + CDF.ELEM_ROOT + ' jsxid="jsxroot"/>');
	
	//setTimeout(loadViaStr, 600);
	//loadViaUrl();

//var store = new dojox.data.CDFStore({cdfDocument: doc});
})
