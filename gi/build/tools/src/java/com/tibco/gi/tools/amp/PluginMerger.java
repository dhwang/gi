/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.amp;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import com.tibco.gi.tools.Utils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Merges multiple plugin.xml plug-in descriptor files into a single plugins.xml plug-in registration file.
 *
 * @author Jesse Costello-Good
 */
public class PluginMerger {

  private static final Logger LOG = Logger.getLogger(PluginMerger.class.getName());
  private static final String CONFIG_FILE = "plugin.xml";

  private File pluginsFile;
  private boolean all = true;
  private Set<String> plugins;

  public PluginMerger() {
  }

  /**
   * Merges all matching plug-ins into a single plugins.xml file.
   *
   * @throws IOException
   */
  public void run() throws IOException {
    if (pluginsFile == null) throw new NullPointerException("Must set pluginsFile property");
    if (!pluginsFile.isFile()) throw new IllegalArgumentException("pluginsFile property must be an existing file");

    File pluginsDir = pluginsFile.getParentFile();
    if (!pluginsDir.isDirectory()) throw new RuntimeException("Plug-ins directory does not exists: " + pluginsDir);

    Document pluginsDoc = Utils.parseXML(pluginsFile);
    List<File> mergedFiles = new ArrayList<File>();

    Element root = pluginsDoc.getDocumentElement();
    NodeList pluginNodes = root.getChildNodes();
    for (int i = 0; i < pluginNodes.getLength(); i++) {
      Node node = pluginNodes.item(i);
      if (node instanceof Element) {
        Element plugInElement = (Element) node;

        String id = plugInElement.getAttribute("id");
        if (id != null) {
          if (all || plugins.contains(id)) {
            String relativePath = plugInElement.getAttribute("path");
            if (relativePath.length() > 0 && !relativePath.endsWith(File.separator))
              relativePath += File.separator;

            File pluginDir = new File(pluginsDir.toURI().resolve(relativePath + id));

            if (pluginDir.isDirectory()) {
              File configFile = new File(pluginDir.toURI().resolve(CONFIG_FILE));
              if (configFile.isFile()) {
                try {
                  Document pluginDoc = Utils.parseXML(configFile);
                  Element pluginRoot = pluginDoc.getDocumentElement();
                  if (!id.equals(pluginRoot.getAttribute("id"))) {
                    LOG.warning("Expecting plug-in " + id + " but got plug-in " + pluginRoot.getAttribute("id"));
                  } else {
                    NodeList allChildren = pluginRoot.getChildNodes();
                    for (int j = 0; j < allChildren.getLength(); j++) {
                      plugInElement.appendChild(pluginsDoc.importNode(allChildren.item(j), true));
                    }

                    NamedNodeMap attrs = pluginRoot.getAttributes();
                    for (int j = 0; j < attrs.getLength(); j++) {
                      Node attr = attrs.item(j);
                      plugInElement.setAttribute(attr.getNodeName(), attr.getNodeValue());
                    }

                    mergedFiles.add(configFile);
                  }
                } catch (IOException e) {
                  LOG.severe("Could not parse: " + configFile);
                }
              } else {
                LOG.warning("Plug-in descriptor does not exist: " + configFile);
              }
            }
          }
        } else {
          LOG.warning("Plug-in element without ID: " + plugInElement);
        }
      }
    }

    StringWriter out = new StringWriter();
    Utils.serializeDocument(pluginsDoc, out);

    // re-serialize the plugins.xml file
    Utils.serializeDocument(pluginsDoc, pluginsFile);

    // delete plugin.xml files
    for (File mergedFile : mergedFiles) {
      mergedFile.delete();
    }
  }

  /**
   * Sets the list of plug-in IDs to include in the merge. Only these plug-ins will be merged into the plugins.xml
   * file. If no plug-ins are specified here then all plug-ins will be merged.
   * @param plugins
   */
  public void setPlugins(Set<String> plugins) {
    this.all = plugins == null;
    this.plugins = plugins;
  }

  /**
   * Sets the plugins.xml file to merge.
   * @param pluginsFile
   */
  public void setPluginsFile(File pluginsFile) {
    this.pluginsFile = pluginsFile;
  }
}
