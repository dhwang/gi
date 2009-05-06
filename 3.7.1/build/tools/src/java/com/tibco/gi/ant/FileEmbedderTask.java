/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import com.tibco.gi.tools.FileEmbedder;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link com.tibco.gi.tools.FileEmbedder} tool.
 *
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class FileEmbedderTask extends AbstractFileTask {

  private File baseDir;

  public FileEmbedderTask() {
  }

  public void execute() {
    FileEmbedder embedder = new FileEmbedder();
    embedder.setBaseDir(baseDir);
    
    Map<File, File> fileMap = this.getFileMap();

    try {
      for (File inFile : fileMap.keySet()) {
        embedder.setFile(inFile);
        embedder.setOutFile(fileMap.get(inFile));
        embedder.run();
      }
    } catch (IOException e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Sets the base directory against which absolute @Embed source paths are resolved.
   * @param baseDir
   */
  public void setBaseDir(File baseDir) {
    this.baseDir = baseDir;
  }
}