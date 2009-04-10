/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import net.sf.saxon.TransformerFactoryImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Result;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;

/**
 * Compiles XML documentation files created with the {@link DocCompiler} into javadoc-like HTML documentation files.
 * <p/>
 * One of the inputs to this tool is the <code>docDir</code>, which is a directory containing the following files:
 * <ul>
 *   <li>index.html &ndash; the HTML documentation index frameset</li>
 *   <li>styles.css &ndash; the CSS styles for the documentation</li>
 *   <li>styles-print.css &ndash; the CSS styles for the documentation when printed</li>
 *   <li>allclasses-frame.xsl &ndash; transforms index.xml into the HTML frame that shows all classes</li>
 *   <li>class-summary.xsl &ndash; transforms each class XML file into the class summary HTML file</li>
 *   <li>deprecated.xsl &ndash; transforms a concatenation of all class XML files into the deprecated HTML file</li>
 *   <li>overview-frame.xsl &ndash; transforms index.xml into the HTML frame showing all packages</li>
 *   <li>overview-summary.xsl &ndash; transforms index.xml into the default main content frame</li>
 *   <li>package-frame.xsl &ndash; transforms each package-summary.xml into the frame showing the classes in that package</li>
 *   <li>package-summary.xsl &ndash; transforms each package-summary.xml into the package summary HTML file</li>
 *   <li>single.xsl &ndash; transforms a concatenation of all class XML files into the single HTML file</li>
 * </ul>
 *
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class HtmlDocCompiler {

  private final static String ALL_CLASSES_FRAME = "allclasses-frame.xsl";
  private final static String CLASS_SUMMARY = "class-summary.xsl";
  private final static String DEPRECATED = "deprecated.xsl";
  private final static String INDEX = "index.html";
  private final static String OVERVIEW_FRAME = "overview-frame.xsl";
  private final static String OVERVIEW_SUMMARY = "overview-summary.xsl";
  private final static String PACKAGE_FRAME = "package-frame.xsl";
  private final static String PACKAGE_SUMMARY = "package-summary.xsl";
  private final static String SINGLE = "single.xsl";
  private final static String STYLES_PRINT = "styles-print.css";
  private final static String STYLES = "styles.css";

  private File docDir;
  private File srcDir;
  private File destDir;

  private DocumentBuilder parser;
  private TransformerFactory factory;

  /**
   * Runs the compilation.
   */
  public void run() throws IOException, TransformerConfigurationException, SAXException {
    if (docDir == null) throw new NullPointerException("Documentation directory must be specified.");
    if (!docDir.isDirectory()) throw new IOException("Documentation directory " + docDir + " does not exist.");
    if (srcDir == null) throw new NullPointerException("Source directory must be specified.");
    if (!srcDir.isDirectory()) throw new IOException("Source directory " + srcDir + " does not exist.");
    if (destDir == null) throw new NullPointerException("Destination directory must be specified.");

    if (!destDir.isDirectory() && !destDir.mkdirs())
      throw new IOException("Could not create destination directory " + destDir);

    this.initXML();

    String[] toCopy = new String[]{INDEX, STYLES, STYLES_PRINT};
    for (String s : toCopy) {
      File sourceFile = new File(docDir, s);
      File destFile = new File(destDir, s);

      if (!sourceFile.isFile())
        throw new IOException("File " + sourceFile + " does not exist.");

      Utils.copyFile(sourceFile, destFile);
    }

    transformFile("index.xml", "overview-frame.html", OVERVIEW_FRAME);
    transformFile("index.xml", "allclasses-frame.html", ALL_CLASSES_FRAME);
    transformFile("index.xml", "overview-summary.html", OVERVIEW_SUMMARY);

    Transformer pkgTrans = getTransformer(PACKAGE_FRAME);
    Collection<File> pkgSum = Utils.findAllRecursive(srcDir, new FileFilter() {
      public boolean accept(File file) {
        return "package-summary.xml".equals(file.getName());
      }
    });
    for (File file : pkgSum) {
      String path = file.getAbsolutePath().substring(srcDir.getAbsolutePath().length());
      path = path.substring(0, path.length() - "package-summary.xml".length()) + "package-frame.html";
      File dest = new File(destDir, path);
      transformFile(file, dest, pkgTrans);
    }

    Transformer pkgSumTrans = getTransformer(PACKAGE_SUMMARY);
    for (File file : pkgSum) {
      String path = file.getAbsolutePath().substring(srcDir.getAbsolutePath().length());
      path = path.substring(0, path.length() - "package-summary.xml".length()) + "package-summary.html";
      File dest = new File(destDir, path);
      transformFile(file, dest, pkgSumTrans);
    }

    Transformer classTrans = getTransformer(CLASS_SUMMARY);
    Collection<File> classSum = Utils.findAllRecursive(srcDir, new FileFilter() {
      public boolean accept(File file) {
        return file.getName().endsWith(".xml") &&
            !"package-summary.xml".equals(file.getName()) &&
            !"index.xml".equals(file.getName());
      }
    });

    for (File file : classSum) {
      String path = file.getAbsolutePath().substring(srcDir.getAbsolutePath().length());
      path = path.substring(0, path.length() - ".xml".length()) + ".html";
      File dest = new File(destDir, path);
      transformFile(file, dest, classTrans);
    }

    // create the document which is a merge of all source files
    Document doc = parser.newDocument();
    Element api = doc.createElement("api");
    doc.appendChild(api);
    Collection<File> allFiles = Utils.findAllRecursive(srcDir, new FileFilter() {
      public boolean accept(File file) {
        return file.getName().endsWith(".xml");
      }
    });
    for (File file : allFiles) {
      Document srcDoc = parser.parse(file);
      api.appendChild(doc.importNode(srcDoc.getDocumentElement(), true));
    }

    transformFile(doc, "single.html", SINGLE);
    transformFile(doc, "deprecated.html", DEPRECATED);
  }

  private void transformFile(String src, String dest, String transformer) throws IOException, SAXException, TransformerConfigurationException {
    transformFile(new File(srcDir, src), new File(destDir, dest), getTransformer(transformer));
  }

  private void transformFile(File src, File dest, Transformer transformer) throws IOException, SAXException {
    transformFile(parser.parse(src), dest, transformer);
  }

  private void transformFile(Document src, String dest, String transformer) throws IOException, SAXException, TransformerConfigurationException {
    transformFile(src, new File(destDir, dest), getTransformer(transformer));
  }

  private void transformFile(Document src, File dest, Transformer transformer) throws IOException {
    DOMSource xmlDomSource = new DOMSource(src);

    dest.getParentFile().mkdirs();
    FileOutputStream outputStream = new FileOutputStream(dest);
    Result result = new StreamResult(outputStream);

    try {
      transformer.transform(xmlDomSource, result);
    } catch (TransformerException e) {
      throw new RuntimeException(e);
    }

    outputStream.close();
  }

  private void initXML() throws IOException {
    try {
      if (parser != null) return;

      DocumentBuilderFactory dFactory = DocumentBuilderFactory.newInstance();
      dFactory.setNamespaceAware(true);
      parser = dFactory.newDocumentBuilder();

      factory = new TransformerFactoryImpl();
      factory.setAttribute("http://saxon.sf.net/feature/strip-whitespace", "none");
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    }
  }

  private Transformer getTransformer(String path) throws IOException, TransformerConfigurationException, SAXException {
    return getTransformer(new File(docDir, path));
  }

  private Transformer getTransformer(File file) throws IOException, SAXException, TransformerConfigurationException {
    return getTransformer(parser.parse(file), file.toURL().toString());
  }

  private Transformer getTransformer(Document doc, String id) throws IOException, TransformerConfigurationException {
    DOMSource xslDomSource = new DOMSource(doc);
    xslDomSource.setSystemId(id);
    return factory.newTransformer(xslDomSource);
  }

  /**
   * Sets the directory containing the compiler resources. See {@link HtmlDocCompiler} for more information.
   * @param docDir
   */
  public void setDocDir(File docDir) {
    this.docDir = docDir;
  }

  /**
   * Sets the directory containing the source XML documentation files.
   * @param srcDir
   */
  public void setSrcDir(File srcDir) {
    this.srcDir = srcDir;
  }

  /**
   * Sets the destination directory for the compiled HTML documentation files.
   * @param destDir
   */
  public void setDestDir(File destDir) {
    this.destDir = destDir;
  }
}
