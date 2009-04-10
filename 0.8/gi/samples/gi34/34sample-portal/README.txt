Classes:
jsx3.chart.PieSeries
jsx3.chart.PieChart
jsx3.gui.list
jsx3.xml.CDF

Methods:
jsx3.chart.PieSeries.tooltip
jsx3.xml.CDF.insertRecord
jsx3.xml.CDF.resetData
jsx3.app.Model.getDescendantOfName
getChildNodes();
jsx3.app.Model.getParent()
jsx3.xml.Entity.getChildNodes()
parseFloat
roundTo
jsx3.CDF.getKey()
jsx3.chart.PieSeries.tooltip


Constants:



Keywords:
Drag
Drop
multi portlet
portlet communication
pie chart
package name
namespaces

Description:
portlet Communication; version 3.0
JSX version: 3.4.0

This sample application demonstrates how to instantiate two GI application instances in a single HTML page, 
and communicate between them using PageBus. Each GI instance or server has its own name space. 

Each GI Application can also define javascript package with set of javascript functions to avoid method names collison.

Furthermore, functions loaded by one instance are available to another instance. 

There are two projects included in this zip file, along with a launch page to demonstrate the behavior.
To install, simply unzip the attached .zip file into your JSXAPPS/ folder. Update the JSX path and Double-clicking the launch page will open the two "portlets".

Variables in the global scope also persist through the life of the script. In the local scope, they are destroyed when the local scope is lost. The memory they use can then be freed by the garbage collector.

Lastly, the global scope is shared by the window object, meaning that it is in essense two scopes, not just one. In the global scope, variables are always located using their name, instead of using an optimized predefined index, as they can be in local scopes. A global variable will take longer for the script engine to find, as a result.[/i]

So how do we avoid using the namespace as a global variable?
In project settings define your application namespace as : eg.sample.portletA.APP
and define your code as :
[code][nobr]
jsx3.lang.Package.definePackage(
  "eg.sample.portletA",                //the full package name
  function(portletA) {          

  portletA.APP;

 ...
} );