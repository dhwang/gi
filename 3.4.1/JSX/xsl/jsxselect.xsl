<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2007, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="jsxlib.xsl"/>

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:variable name="upperCase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
  <xsl:variable name="lowerCase" select="'abcdefghijklmnopqrstuvwxyz'"/>
  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxselectedimage"></xsl:param>
  <xsl:param name="jsxtransparentimage"></xsl:param>
  <xsl:param name="jsxdragtype">JSX_GENERIC</xsl:param>
  <xsl:param name="jsxselectedid">null</xsl:param>
  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxid">_jsx</xsl:param>
  <xsl:param name="jsxtext"></xsl:param>
  <xsl:param name="jsxdisableescape">no</xsl:param>
  <xsl:param name="jsxshallowfrom"></xsl:param>
  <xsl:param name="jsxcasesensitive">0</xsl:param>
  <xsl:param name="jsxnocheck">0</xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>
  <xsl:param name="jsx_type">select</xsl:param> <!-- Set to "combo" for combo control XSL -->

  <xsl:template match="/">
  <JSX_FF_WELLFORMED_WRAPPER><xsl:choose>
    <xsl:when test="$jsxshallowfrom">
      <xsl:for-each select="//*[@jsxid=$jsxshallowfrom]/record">
        <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
        <xsl:choose>
          <xsl:when test="$jsx_type='select'">
            <xsl:apply-templates select="." mode="select"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="." mode="combo"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="//record">
        <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
        <xsl:choose>
          <xsl:when test="$jsx_type='select'">
            <xsl:apply-templates select="." mode="select"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="." mode="combo"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose></JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <xsl:template match="record" mode="select">
    <xsl:param name="myjsxid" select="@jsxid"/>

    <div id="{$jsxid}_{$myjsxid}" jsxtype="Option" tabindex="{$jsxtabindex}"
        jsxid="{@jsxid}" title="{@jsxtip}" class="jsx30select_option"
        onmouseover="jsx3.gui.Select.doFocus(this);"
        onmouseout="jsx3.gui.Select.doBlur(this);"
        onblur="jsx3.gui.Select.doBlur(this);">
      <xsl:if test="@jsxstyle">
        <xsl:attribute name="style">
          <xsl:value-of select="@jsxstyle"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$jsxnocheck != '1'">
        <xsl:choose>
          <xsl:when test="$jsxselectedid=@jsxid">
            <img unselectable="on" class="jsx30select_check" src="{$jsxselectedimage}"/>
          </xsl:when>
          <xsl:otherwise>
            <img unselectable="on" class="jsx30select_check" src="{$jsxtransparentimage}"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:if>
      <xsl:if test="@jsximg and @jsximg != ''">
        <xsl:variable name="src1">
          <xsl:choose>
            <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@jsximg" mode="uri-resolver"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="@jsximg"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <img unselectable="on" class="jsx30select_icon" src="{$src1}"/>
      </xsl:if>
      <span>
        <xsl:apply-templates select="." mode="jsxtext"/>
      </span>
    </div>
  </xsl:template>

  <xsl:template match="record" mode="combo">
    <xsl:variable name="mytext">
      <xsl:choose>
        <xsl:when test="@jsxtext"><xsl:value-of select="@jsxtext"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="@jsxid"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="(not($jsxcasesensitive = 1) and starts-with(translate($mytext, $lowerCase, $upperCase), translate($jsxtext, $lowerCase, $upperCase)))
        or (starts-with($mytext, $jsxtext))">
      <div jsxtype="Option" tabindex="{$jsxtabindex}" id="{$jsxid}_{@jsxid}"
        jsxid="{@jsxid}" title="{@jsxtip}" class="jsx30select_option"
        onmouseover="this.focus(); jsx3.gui.Select.doFocus(this);"
        onmouseout="jsx3.gui.Select.doBlur(this);"
        onfocus="jsx3.gui.Select.doFocus(this);"
        onblur="jsx3.gui.Select.doBlur(this);">
        <xsl:if test="@jsxstyle">
          <xsl:attribute name="style">
            <xsl:value-of select="@jsxstyle"/>
          </xsl:attribute>
        </xsl:if>
        <xsl:if test="$jsxnocheck != '1'">
          <xsl:choose>
            <xsl:when test="$jsxselectedid=@jsxid">
              <img unselectable="on" class="jsx30select_check" src="{$jsxselectedimage}"/>
            </xsl:when>
            <xsl:otherwise>
              <img unselectable="on" class="jsx30select_check" src="{$jsxtransparentimage}"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
        <xsl:if test="@jsximg and @jsximg != ''">
          <xsl:variable name="src1">
            <xsl:choose>
              <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@jsximg" mode="uri-resolver"/></xsl:when>
              <xsl:otherwise><xsl:value-of select="@jsximg"/></xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <img unselectable="on" class="jsx30select_icon" src="{$src1}"/>
        </xsl:if>
        <span>
          <xsl:apply-templates select="." mode="jsxtext">
            <xsl:with-param name="value" select="$mytext"/>
          </xsl:apply-templates>
        </span>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="record" mode="jsxtext">
    <xsl:param name="value" select="@jsxtext"/>

    <xsl:choose>
      <xsl:when test="$jsxdisableescape='yes'">
        <xsl:call-template name="disable-output-escp">
          <xsl:with-param name="value" select="$value"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$value"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
