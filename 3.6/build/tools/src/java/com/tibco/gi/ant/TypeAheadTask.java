/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import com.tibco.gi.tools.TypeAheadCompiler;
import org.apache.tools.ant.BuildException;

import java.io.File;

/**
 * Ant interface for the {@link TypeAheadCompiler} tool.
 *
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class TypeAheadTask extends AbstractFileTask {

  private File outfile;

  public TypeAheadTask() {
  }

  public void execute() throws BuildException {
    TypeAheadCompiler compiler = new TypeAheadCompiler();
    compiler.setOutFile(outfile);

    for (File inFile : this.getFileSet())
      compiler.addSrcFile(inFile);

    try {
      compiler.run();
    } catch (Throwable e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the compilation output file.
   *
   * @param outfile
   * @see TypeAheadCompiler#setOutFile
   */
  public void setOutfile(File outfile) {
    this.outfile = outfile;
  }
}
