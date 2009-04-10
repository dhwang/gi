/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import com.tibco.gi.tools.HtmlDocCompiler;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

import java.io.File;

/**
 * Ant interface for the {@link HtmlDocCompiler} tool.
 *
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class HtmlDocTask extends Task {

  private File srcdir;
  private File destdir;
  private File docdir;

  public void execute() throws BuildException {
    HtmlDocCompiler compiler = new HtmlDocCompiler();
    compiler.setSrcDir(srcdir);
    compiler.setDestDir(destdir);
    compiler.setDocDir(docdir);

    try {
      compiler.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  public void setSrcdir(File srcdir) {
    this.srcdir = srcdir;
  }

  public void setDestdir(File destdir) {
    this.destdir = destdir;
  }

  public void setDocdir(File docdir) {
    this.docdir = docdir;
  }
}
