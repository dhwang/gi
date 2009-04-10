/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.doc;

import org.dojo.jsl.parser.EcmaScript;
import org.dojo.jsl.parser.EcmaScriptConstants;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses <code>JsMember</code> instances from the text content of a JavaScript comment block.
 *
 * @author Jesse Costello-Good <jcostell@tibco.com>
 */
public class Parser {

  private static final Logger LOG = Logger.getLogger(Parser.class.getPackage().getName());

  /**
   * The name of the GI initialization method.
   */
  public static final String INIT_METHOD = "init";

  private static final Pattern EMPTY = Pattern.compile("^\\s*$");

  /**
   * Splits a JavaScript comment block into tokens. Tokens can be the type declaration of a field, the description of
   * the member, or a jsxdoc tag.
   */
  private static class CommentTokenizer implements Iterator<String> {

    private static final Pattern TYPE = Pattern.compile("^\\s*(\\{[ \\w\\.<>\\|/,]*})");
    private static final Pattern TAG = Pattern.compile("^\\s*(@[\\w\\-]+)");

    private final List<String> tokens = new ArrayList<String>();
    private final Iterator<String> i;

    public CommentTokenizer(String comment) {
      try {
        BufferedReader reader = new BufferedReader(new StringReader(comment));
        int i = 0;
        String line;
        StringBuilder current = new StringBuilder();

        while ((line = reader.readLine()) != null) {
          if (i == 0) {
            if (EMPTY.matcher(line).find()) continue;

            Matcher m = TYPE.matcher(line);
            if (m.find()) {
              tokens.add(m.group(1));
              line = line.substring(m.end());
            }
          }

          Matcher m = TAG.matcher(line);
          if (m.find()) {
            if (current.length() > 0) {
              tokens.add(current.toString());
              current = new StringBuilder();
            }
            current.append(m.group(1));
            line = line.substring(m.end());
          }

          if (current.length() > 0) current.append("\n");
          current.append(line);
          i++;
        }

        if (current.length() > 0)
          tokens.add(current.toString());
      } catch (IOException e) {
        e.printStackTrace();
      }

      this.i = tokens.iterator();
    }

    public boolean hasNext() {
      return i.hasNext();
    }

    /**
     * If the returned value starts with a "{" then it is a type token; if it starts with a "@" then it is a tag token;
     * otherwise it is a description token.
     *
     * @return
     */
    public String next() {
      return i.next();
    }

    public void remove() {
      throw new UnsupportedOperationException();
    }
  }

  private static final Pattern TAG = Pattern.compile("^@([\\w\\-]+)\\b\\s*");
  private static final Pattern TYPE = Pattern.compile("^\\s*\\{([ \\w\\.<>\\|/,]*)\\}\\s*");
  private static final Pattern PARAM = Pattern.compile("^\\s*(\\w+)\\s*(?:\\{([ \\w\\.<>\\|/,]*)\\})?\\s*");
  private static final Collection<String> ACCESS_TAGS =
      Arrays.asList("public", "package", "protected", "private");
  private static final Collection<String> PARAM_TAGS =
      Arrays.asList("param", "param-package", "param-private");

  /**
   * Store the name of the parsed file for error reporting purposes.
   */
  private File file;
  private JsMember currentClass;
  private final Collection<JsMember> classes = new ArrayList<JsMember>();

  public Parser(File file) {
    this.file = file;
  }

  public void reInit(File file) {
    this.file = file;
    currentClass = null;
    classes.clear();
  }

  public Collection<JsMember> run() throws ParseException, IOException {
    Reader reader = new FileReader(file);
    EcmaScript parser = new EcmaScript(reader);

    org.dojo.jsl.parser.Token token = parser.getNextToken();
    while (token != null && token.kind != EcmaScriptConstants.EOF) {
      if (token.kind == EcmaScriptConstants.MULTI_LINE_COMMENT) {
        boolean jsxComment = token.image.startsWith("/**");
        if (jsxComment) parseBlockComment(token.image, parser);
      }

      token = parser.getNextToken();
    }

    reader.close();
    return new ArrayList<JsMember>(classes);
  }

  private static final Pattern STAR_STRIPPER = Pattern.compile("^\\s*\\*\\s", Pattern.MULTILINE);

  private void parseBlockComment(String text, EcmaScript parser) throws ParseException {
    text = text.replaceAll("^/\\*\\*+\\s*", "");
    text = text.replaceAll("\\*/$", "");
    text = STAR_STRIPPER.matcher(text).replaceAll("");

    JsMember member = parseMember(text);
    if (member.getType() == null) {
      StringBuilder sb = new StringBuilder();
      String token = null;
      do {
        token = parser.getNextToken().toString();
        sb.append(token);
      } while (token.indexOf(";") < 0 && token.indexOf("{") < 0);

      addDefinitionToMember(member, sb.toString().replaceAll("\\n", " "));
    }

    addMember(member);
  }

  private void addMember(JsMember member) throws ParseException {
    if (member.getType().isClassType() || member.getType() == JsMember.Type.UNKNOWN) {
      currentClass = member;
      classes.add(member);
    } else if (currentClass != null) {
      currentClass.addMember(member);
    } else {
      throw new ParseException("Found member before class: " + member);
    }
  }

  /**
   * Constructs a member from a comment block. Only information present in te comment block is added to the member.
   * Therefore, if the declaration of the member occurs in the JavaScript after the comment block, the name and other
   * fields of the returned member will not be set.
   *
   * @param jsxComment
   * @return
   */
  private JsMember parseMember(String jsxComment) {
    JsMember member = new JsMember();
    Iterator<String> i = new CommentTokenizer(jsxComment);

    while (i.hasNext()) {
      String token = i.next();

      if (token.startsWith("{")) {
        JsType type = parseType(token.substring(1, token.length() - 1));
        member.setReturnType(type);
      } else if (token.startsWith("@")) {
        Matcher m = TAG.matcher(token);
        m.find();
        parseMemberTag(member, m.group(1), token.substring(m.end()));
      } else {
        member.setDescription(token);
      }
    }

    return member;
  }

  /**
   * Parses a type declaration; delegates to the TypeParser javacc class. This method may return null if the declaration
   * is empty or invalid.
   *
   * @param s
   * @return
   */
  private JsType parseType(String s) {
    try {
      TypeParser p = new TypeParser(s);
      JsType type = p.run();
      LOG.finer(s + " -> " + type);
      return type;
    } catch (IOException e) {
      LOG.warning("Bad type " + s + " in " + file);
      return null;
    } catch (ParseException e) {
      LOG.warning("Bad type " + s + " in " + file);
      return null;
    }
  }

  /**
   * Parses a tag token and adds the information in the tag to the member.
   *
   * @param member the member to affect.
   * @param tag the tag name.
   * @param content the content following the tag name.
   */
  private void parseMemberTag(JsMember member, String tag, String content) {
    if ("jsxdoc-definition".equals(tag)) {
      addDefinitionToMember(member, content);
    } else if ("jsxdoc-category".equals(tag)) {
      String name = parseClassName(content);
      member.setType(JsMember.Type.UNKNOWN);
      member.setName(name);
    } else if (ACCESS_TAGS.contains(tag)) {
      member.setAccess(JsMember.Access.valueOf(tag.toUpperCase()));
    } else if ("final".equals(tag)) {
      member.setFinal(true);
    } else if ("abstract".equals(tag)) {
      member.setAbstract(true);
    } else if ("native".equals(tag)) {
      member.setNative(true);
    } else if ("version".equals(tag)) {
      member.setVersion(content);
    } else if ("since".equals(tag)) {
      member.setSince(content);
    } else if ("deprecated".equals(tag)) {
      member.setDeprecated(true);
      if (!EMPTY.matcher(content).find())
        member.setDepDescription(content);
    } else if ("author".equals(tag)) {
      member.addAuthor(content);
    } else if (PARAM_TAGS.contains(tag)) {
      Matcher m = PARAM.matcher(content);
      if (m.find()) {
        String paramName = m.group(1);
        String type = m.group(2);
        String text = content.substring(m.end());
        JsParam param = member.getParam(paramName);
        if (param == null)
          param = member.addParam(paramName);

        if (type != null)
          param.setType(parseType(type));
        param.setDescription(text);
        if ("param-private".equals(tag)) param.setAccess(JsMember.Access.PRIVATE);
        else if ("param-package".equals(tag)) param.setAccess(JsMember.Access.PACKAGE);
      } else {
        LOG.warning("Bad @param tag: " + content + " in " + file);
      }
    } else if ("throws".equals(tag)) {
      JsType type = null;
      String text = content;
      Matcher m = TYPE.matcher(content);
      if (m.find()) {
        if (m.group(1) != null)
          type = parseType(m.group(1));
        text = content.substring(m.end());
      }
      member.addThrows(type, text);
    } else if ("return".equals(tag)) {
      JsType type = null;
      String text = content;
      Matcher m = TYPE.matcher(content);
      if (m.find()) {
        if (m.group(1) != null)
          type = parseType(m.group(1));
        text = content.substring(m.end());
      }
      member.setReturn(type, text);
    } else if ("see".equals(tag)) {
      member.addSee(content.trim());
    } else {

    }
  }

  /**
   * Parses a member declaration and adds the information stored in the declaration to the member. This method parses
   * different information for different types of members: <ul> <li>package - name</li> <li>class - name, superclass,
   * implemented interfaces</li> <li>interface - name, super interface</li> <li>method - name, parameter order, static?,
   * abstract?, constructor?</li> <li>field - name, static?</li> </ul>
   *
   * @param member
   * @param definition
   */
  private void addDefinitionToMember(JsMember member, String definition) {
    boolean ok =
        parseClassDefinition(member, definition) ||
            parseInterfaceDefinition(member, definition) ||
            parsePackageDefinition(member, definition) ||
            parseMethodDefinition(member, definition) ||
            parseFieldDefinition(member, definition);
    if (!ok) {
      member.setType(JsMember.Type.CLASS);
      LOG.warning("Got UNKNOWN: " + definition);
    }
  }

  private static Pattern DEF_CLASS = Pattern.compile("jsx3\\.(?:lang\\.)?Class\\.defineClass\\(\\s*['\"]([\\w\\.$]+)['\"]\\s*,\\s*(\\S+)\\s*,\\s*(null|\\[.*?\\])\\s*,");
  private static Pattern DEF_INTERFACE = Pattern.compile("jsx3\\.(?:lang\\.)?Class\\.defineInterface\\(\\s*['\"]([\\w\\.$]+)['\"]\\s*,\\s*(\\S+)\\s*,");
  private static Pattern DEF_PACKAGE = Pattern.compile("jsx3\\.(?:lang\\.)?Package\\.definePackage\\(\\s*['\"]([\\w\\.$]+)['\"]\\s*,");
  private static Pattern DEF_METHOD = Pattern.compile("(\\w+)\\.([\\w$]+)\\s*=\\s*function\\s*\\(([\\s\\w,$]*)\\)");
  private static Pattern DEF_METHOD_ABS = Pattern.compile("(\\w+)\\.([\\w$]+)\\s*=\\s*jsx3\\.(?:lang\\.)?Method\\.newAbstract\\s*\\(([\\s\\w,$'\"]*)\\)");
  private static Pattern DEF_FIELD = Pattern.compile("(\\w+)\\.([\\w$]+)\\s*=\\s*(\\S+)");

  private static boolean parseClassDefinition(JsMember member, String definition) {
    Matcher m = DEF_CLASS.matcher(definition);
    if (m.find()) {
      member.setType(JsMember.Type.CLASS);
      member.setName(m.group(1));

      String superClass = m.group(2);
      superClass = parseClassName(superClass);
      // Implicit class hierarchy related to Object and jsx3.lang.Object
      if (superClass == null) {
        if ("Object".equals(member.getName())) {
        } else if ("jsx3.lang.Object".equals(member.getName())) {
          superClass = "Object";
        } else {
          superClass = "jsx3.lang.Object";
        }
      }
      if (!SKIP.equals(superClass))
        member.setSuperClass(superClass);

      String[] interfaces = m.group(3).split("\\s*,\\s*");
      for (String inter : interfaces) {
        String name = parseClassName(inter);
        if (name != null)
          member.addInterface(name);
      }

      LOG.fine("Got: " + member);
      return true;
    }
    return false;
  }

  private static boolean parseInterfaceDefinition(JsMember member, String definition) {
    Matcher m = DEF_INTERFACE.matcher(definition);
    if (m.find()) {
      member.setType(JsMember.Type.INTERFACE);
      member.setName(m.group(1));

      String superClass = m.group(2);
      superClass = parseClassName(superClass);
      if (!SKIP.equals(superClass))
        member.setSuperClass(superClass);

      LOG.fine("Got: " + member);
      return true;
    }
    return false;
  }

  private static boolean parsePackageDefinition(JsMember member, String definition) {
    Matcher m = DEF_PACKAGE.matcher(definition);
    if (m.find()) {
      member.setType(JsMember.Type.PACKAGE);
      member.setName(m.group(1));

      LOG.fine("Got: " + member);
      return true;
    }
    return false;
  }

  private boolean parseMethodDefinition(JsMember member, String definition) {
    Matcher m = DEF_METHOD.matcher(definition);
    if (!m.find()) {
      m = DEF_METHOD_ABS.matcher(definition);
      if (m.find()) {
        member.setAbstract(true);
      } else {
        return false;
      }
    }

    member.setName(m.group(2));
    if (!m.group(1).endsWith("prototype")) member.setStatic(true);

    JsMember.Type type = JsMember.Type.METHOD;
    if (!member.isStatic()) {
      if (INIT_METHOD.equals(member.getName()))
        type = JsMember.Type.CONSTRUCTOR;
    }
    member.setType(type);

    String[] params = m.group(3).split("\\s*,\\s*");
    List<String> paramOrder = new ArrayList<String>();
    for (String param : params) {
      param = parseClassName(param);
      if (param != null && param.length() > 0)
        paramOrder.add(param);
    }

    List<JsParam> removed = member.setParamOrder(paramOrder);
    if (removed.size() > 0)
      LOG.warning("Unknown parameters " + removed + " in method " +
          member.getName() + " in " + file);

    LOG.fine("Got: " + member);
    return true;
  }

  private static boolean parseFieldDefinition(JsMember member, String definition) {
    Matcher m = DEF_FIELD.matcher(definition);
    if (m.find()) {
      if (m.group(3).startsWith("function")) return false;

      member.setType(JsMember.Type.FIELD);
      member.setName(m.group(2));
      if (!m.group(1).endsWith("prototype")) member.setStatic(true);

      LOG.fine("Got: " + member);
      return true;
    }
    return false;
  }

  private static final String SKIP = "-";

  private static String parseClassName(String code) {
    if ("null".equals(code)) return null;
    if ("-".equals(code)) return SKIP;
    if (!code.matches(".*\\S.*")) return null;
    Matcher m = Pattern.compile("[\\w\\.$]+").matcher(code);
    if (m.find()) return m.group(0);
    return null;
  }

}
