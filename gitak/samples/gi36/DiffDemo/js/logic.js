/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */



/**
 * Controller for the diff demo.
 */
jsx3.Class.defineClass("DiffDemoController",
  null, null, function(staticContext, instanceContext) {


  instanceContext.init = function(server) {
    this.jsxsuper();
    this.server = server;
  }


  instanceContext.populateSample = function() {
    this.server.getJSXByName("textarea1").setValue(
        "  Lorem ipsum dolor sit amet, consectetuer adipiscing elit,\n"
      + "sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna\n"
      + "aliquam erat volutpat.\n\n"
      + "  Ut wisi enim ad minim veniam, quis nostrud exerci tation\n"
      + "ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo\n"
      + "consequat.\n\n"
      + "  Duis autem vel eum iriure dolor in hendrerit in vulputate velit\n"
      + "esse molestie consequat, vel illum dolore eu feugiat nulla\n"
      + "facilisis at vero eros et accumsan et iusto odio dignissim qui\n"
      + "blandit praesent luptatum zzril delenit augue duis dolore te\n"
      + "feugait nulla facilisi.\n\n"
      + "  Cesarem legato alacrem eorum.\n\n"
      + "  Nam liber tempor cum soluta nobis eleifend option congue\n"
      + "nihil imperdiet doming id quod mazim placerat facer possim\n"
      + "assum.\n\n"
      + "  Typi non habent claritatem insitam; est usus legentis in\n"
      + "iis qui facit eorum claritatem.\n\n"
    );
    this.server.getJSXByName("textarea2").setValue(
        "  Lorem ipsum dolor sit amet, consectetuer adipiscing elit,\n"
      + "sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna\n"
      + "aliquam erat volutpat.\n\n"
      + "  Cesarem legato alacrem eorum.\n\n"
      + "  Ut wisi enim ad minim veniam, quis nostrud exerci tation\n"
      + "ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo\n"
      + "consequat.\n\n"
      + "  This is a different line, in hendrerit in vulputate velit\n"
      + "esse molestie consequat, more different stuff here, nulla\n"
      + "facilisis at vero eros et accumsan et iusto odio dignissim qui\n"
      + "blandit praesent luptatum zzril delenit augue duis dolore te\n"
      + "feugait nulla facilisi.\n"
      + "  Nam liber tempor cum soluta nobis eleifend option congue\n"
      + "nihil imperdiet doming id quod mazim placerat facer possim\n"
      + "assum.\n\n"
      + "  Typi non habent claritatem insitam; est usus legentis in\n"
      + "iis qui facit eorum claritatem.\n\n"
    );
  }


  /**
   * Updates the Diff Area.
   */
  instanceContext.updateDiff = function() {
    var diffLines = this._makeDiffLines(
      this.server.getJSXByName("textarea1").getValue().split("\n"),
      this.server.getJSXByName("textarea2").getValue().split("\n"));

    var objDiff = this.server.getJSXByName("diff");

    objDiff.getDescendantOfName("contentOld", false)
      .setText(diffLines.contentOld, true);

    objDiff.getDescendantOfName("contentNew", false)
      .setText(diffLines.contentNew, true);

  }


  /**
   * Returns the difference between two arrays, as HTML.
   * @param arrayOld {Array<String>} an array of old lines.
   * @param arrayNew {Array<String>} an array of new lines.
   * @return {Object} an object with two fields containing HTML,
   *                  contentOld and contentNew.
   * @private
   */
  instanceContext._makeDiffLines = function(arrayOld, arrayNew) {
    var result = { "contentOld":"", "contentNew":""};

    var matches = new com.tibco.cep.util.Diff(arrayOld, arrayNew)
      .getMatches();
    for (var i=0; i<matches.length; i++) {
      var match = matches[i];
      if (match.isSame) {
        for (var j=0; j<match.oldElements.length; j++) {
          var html = this._makeDiffFragment("common", null,
            match.oldElements[j]);
          result.contentOld += html;
          result.contentNew += html;
        }
      } else {
        var numOld = match.oldElements.length;
        var numNew = match.newElements.length;
        var className, toolTip;

        className = (numNew < 1) ? "old" : "changed";
        toolTip = (numNew < 1) ? "Deleted lines." : "Changed lines.";
        for (var j=0; j<match.oldElements.length; j++) {
          result.contentOld += this._makeDiffFragment(className,
            toolTip, match.oldElements[j]);
        }

        className = (numOld < 1) ? "new" : "changed";
        toolTip = (numOld < 1) ? "New lines." : "Changed lines.";
        for (var j=0; j<match.newElements.length; j++) {
          result.contentNew += this._makeDiffFragment(className,
            toolTip, match.newElements[j]);
        }

        if (numOld > numNew) {
          result.contentNew += this._makeDiffFragment("pad",
            "Deleted lines on the opposite side.",
            new Array(+numOld-numNew));
        } else if (numOld < numNew) {
          result.contentOld += this._makeDiffFragment("pad",
            "New lines on the opposite side.",
            new Array(-numOld+numNew));
        }
      }
    }

    result.contentOld = "<table cellspacing=\"0\" width=\"100%\">"
      +result.contentOld+"</table>"
    result.contentNew = "<table cellspacing=\"0\" width=\"100%\">"
      +result.contentNew+"</table>"

    return result;
  }



  /**
   * Makes a fragment of HTML to be placed in one fo the Diff panes.
   * @param strClassName {String} HTML class name.
   * @param strToolTip {String} text for the tooltip
   *                            No tooltip if undefined.
   * @param text {String} text of the fragment. It will be escaped.
   * @private
   */
  instanceContext._makeDiffFragment = function(strClassName,
      strToolTip, text) {
    var height = 17;
    var html = "";
    if (text instanceof Array) {
      height *= text.length;
      for (var i=0; i<text.length; i++) {
        if (i>0) {
          html += "<br/>";
        }
        html += ((text[i] == undefined) || (text[i].length<1)
          ? "&#160;" : text[i].escapeHTML());
      }
    } else {
      html += ((text == undefined) || (text.length<1)
        ? "&#160;" : text.escapeHTML());
    }
    return "<tr><td class=\""+strClassName.escapeHTML()
      + ((strToolTip == undefined) ? "" : "\" title=\""
      + strToolTip.escapeHTML())
      + "\" style=\"font-size:12px;line-height:17px;margin:0;"
      + "padding:0 3px;border:0;height:"
      + height + "px;\"><pre><span style=\"margin:0\">"
      + html + "</span></pre></td></tr>";
  }



  /**
   * Synchronizes scrollbars' position between old and new content.
   * @param objSrc {jsx3.gui.Block} the old or the new content pane.
   * @private
   */
  instanceContext.syncDiffScroll = function(objSrc) {
    if (objSrc) {
      objSrc = jsx3.GO(objSrc.id);
    }
    if (objSrc) {
      var objDiff = objSrc.findAncestor(
        function(x) {return x.getClassName() == "diff"}, false)
      if (objDiff == null) { return; }

      var objOld = objDiff.getDescendantOfName("contentOld", false);
      var objNew = objDiff.getDescendantOfName("contentNew", false);
      var divOld = document.getElementById(objOld.getId());
      var divNew = document.getElementById(objNew.getId());

      if (objSrc == objOld) {
          var callback = divNew.onscroll;
          divNew.onscroll = "";
          divNew.scrollTop = divOld.scrollTop;
          divNew.scrollLeft = divOld.scrollLeft;
          divNew.onscroll = callback;
      } else if (objSrc == objNew) {
          var callback = divOld.onscroll;
          divOld.onscroll = "";
          divOld.scrollTop = divNew.scrollTop;
          divOld.scrollLeft = divNew.scrollLeft;
          divOld.onscroll = callback;
      }
    }
  }



});

window.DiffDemoCtrlr = new DiffDemoController(DiffDemo);
