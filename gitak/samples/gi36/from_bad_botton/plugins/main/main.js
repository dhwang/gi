(function(plugIn) {

  jsx3.$O(plugIn).extend({

    paint: function(objContainer) {
      var layout = this.loadRsrcComponent("layout", objContainer);
      this._layout = layout; 
      var form = layout.getDescendantsOfType("tibco.uxcore.gui.Form")[0];
      form.setEditMode(true);
      form.repaint();
    }
    
  });

})(this);
