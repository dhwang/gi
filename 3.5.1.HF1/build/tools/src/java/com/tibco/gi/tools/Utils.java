package com.tibco.gi.tools;

import org.w3c.dom.Document;
import org.apache.xml.serializer.OutputPropertiesFactory;
import org.apache.xml.serializer.Serializer;
import org.apache.xml.serializer.SerializerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.FileFilter;
import java.util.Properties;
import java.util.Collection;
import java.util.LinkedList;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.Iterator;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class Utils {

  private Utils() {
  }

  public static void copyFile(File src, File dest) throws IOException {
    FileInputStream from = null;
    try {
      from = new FileInputStream(src);
      copyFile(from, dest);
    } finally {
      if (from != null)
        try {
          from.close();
        } catch (IOException e) {
        }
    }
  }

  public static void copyFile(InputStream from, File dest) throws IOException {
    FileOutputStream to = null;
    try {
      to = new FileOutputStream(dest);
      byte[] buffer = new byte[4096];
      int bytesRead;

      while ((bytesRead = from.read(buffer)) != -1)
        to.write(buffer, 0, bytesRead); // write
    } finally {
      if (to != null)
        try {
          to.close();
        } catch (IOException e) {
        }
    }
  }

  public static void appendFromReader(Writer writer, File file) throws IOException {
	  Reader reader = new FileReader(file);
	  appendFromReader(writer, new BufferedReader(reader));
	  reader.close();
  }

  public static void appendFromReader(Writer writer, BufferedReader reader) throws IOException {
    String line = reader.readLine();
    String nextLine;

    while (line != null) {
      nextLine = reader.readLine();

      writer.write(line);

      if (nextLine != null)
        writer.write("\n");

      line = nextLine;
    }
  }

  public static void serializeDocument(Document doc, File file) throws IOException {
    file.getParentFile().mkdirs();

    Properties props = new Properties();
    props.put("method", "xml");
    props.put("encoding", "UTF-8");
    props.put("indent", "yes");
    props.put(OutputPropertiesFactory.S_KEY_INDENT_AMOUNT, "2");

    Serializer serializer = SerializerFactory.getSerializer(props);
    FileOutputStream out = new FileOutputStream(file);
    Writer writer = new OutputStreamWriter(out, "utf-8");
    serializer.setWriter(writer);
    serializer.asDOMSerializer().serialize(doc);
    out.close();
  }

  public static Collection<File> findAllRecursive(File root, FileFilter filter) throws IOException {
    LinkedList<File> dirs = new LinkedList<File>();
    dirs.add(root);

    Collection<File> found = new ArrayList<File>();

    while (dirs.size() > 0) {
      File dir = dirs.removeFirst();
      File[] children = dir.listFiles();
      for (File child : children) {
        if (child.isDirectory())
          dirs.add(child);
        else if (filter.accept(child))
          found.add(child);
      }
    }

    return found;
  }

  public static URI relativizeURI(URI u1, URI u2) {
    if (!u1.isOpaque() && !u2.isOpaque()) {
      String s1 = u1.getScheme();
      String s2 = u2.getScheme();
      String a1 = u1.getAuthority();
      String a2 = u2.getAuthority();

      if (((s1 == null && s2 == null) || (s1 != null && s1.equals(s2))) &&
        ((a1 == null && a2 == null) || (a1 != null && a1.equals(a2)))) {

        String p1 = u1.getPath();
        String p2 = u2.getPath();

        List<String> t1 = new ArrayList<String>(Arrays.asList(p1.split("/")));
        if (p1.endsWith("/")) t1.add("");
        List<String> t2 = new ArrayList<String>(Arrays.asList(p2.split("/")));
        if (p2.endsWith("/")) t2.add("");

        t1.remove(t1.size() - 1);

        List<String> tokens = new ArrayList<String>();

        int i = 0;
        while (i < t1.size() && i < t2.size()) {
          if (! t1.get(i).equals(t2.get(i))) break;
          i++;
        }

        String newPath;
        if (i < 2 && p1.indexOf("/") == 0) {
          newPath = p2;
        } else {
          for (int j = i; j < t1.size(); j++)
            tokens.add("..");

          for (int j = i; j < t2.size(); j++)
            tokens.add(t2.get(j));

          StringBuilder sb = new StringBuilder();
          for (Iterator<String> j = tokens.iterator(); j.hasNext();) {
            sb.append(j.next());
            if (j.hasNext())
              sb.append("/");
          }
          newPath = sb.toString();
        }

        try {
          return new URI(null, null, newPath, u2.getQuery(), u2.getFragment());
        } catch (URISyntaxException e) {
          return u1.relativize(u2);
        }
      }
    }

    return u2;
  }

}
