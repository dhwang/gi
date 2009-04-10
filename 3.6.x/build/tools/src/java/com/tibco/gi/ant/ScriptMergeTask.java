/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import com.tibco.gi.tools.ScriptMerger;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

import java.io.File;

/**
 * Ant interface for the {@link ScriptMerger} tool.
 *
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class ScriptMergeTask extends Task {

  private File dir;
  private File graph;
  private String target;
  private File outfile;
  private String includes;
  private File log;

  public void execute() throws BuildException {
    ScriptMerger merger = new ScriptMerger();
    merger.setBaseDir(dir);
    merger.setGraphFile(graph);
    merger.setTarget(target);
    merger.setOutFile(outfile);
    merger.setLogFile(log);
    for (String include : includes.split("[ ,;]+"))
      merger.addRequire(include);

    try {
      merger.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the base directory of the source files to merge.
   *
   * @param dir
   * @see ScriptMerger#setBaseDir
   */
  public void setDir(File dir) {
    this.dir = dir;
  }

  /**
   * Ant setter method for the depedency graph file.
   *
   * @param graph
   * @see ScriptMerger#setGraphFile
   */
  public void setGraph(File graph) {
    this.graph = graph;
  }

  /**
   * Ant setter method for the merge target.
   *
   * @param target
   * @see ScriptMerger#setTarget
   */
  public void setTarget(String target) {
    this.target = target;
  }

  /**
   * Ant setter method for the merge output file.
   *
   * @param outfile
   * @see ScriptMerger#setOutFile
   */
  public void setOutfile(File outfile) {
    this.outfile = outfile;
  }

  /**
   * Ant setter method for the "provides" keys to include in the merge.
   *
   * @param includes a comma-separated list of keys.
   * @see ScriptMerger#addRequire
   */
  public void setIncludes(String includes) {
    this.includes = includes;
  }

  /**
   * Ant setter method for the output log file.
   *
   * @param log
   * @see ScriptMerger#setLogFile
   */
  public void setLog(File log) {
    this.log = log;
  }
}
