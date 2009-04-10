<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2007, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="jsxlib.xsl"/>

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <!-- default parameters managed by the class; most can be updated by calling instance methods in the class, jsx3.gui.Table -->
  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxselectionbgurl">JSX/images/matrix/select.gif</xsl:param>
  <xsl:param name="jsxid"></xsl:param>
  <xsl:param name="jsxapppath"></xsl:param>
  <xsl:param name="jsxabspath"></xsl:param>
  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxshallowfrom">jsxroot</xsl:param>
  <xsl:param name="jsxasyncmessage"></xsl:param>
  <xsl:param name="jsxheaderheight"></xsl:param>
  <xsl:param name="jsxrowstyle1"></xsl:param>
  <xsl:param name="jsxrowclass1"></xsl:param>
  <xsl:param name="jsxrowstyle2"></xsl:param>
  <xsl:param name="jsxrowclass2"></xsl:param>
  <xsl:param name="jsxcellstyle"></xsl:param>
  <xsl:param name="jsxcellclass"></xsl:param>
  <xsl:param name="jsxcellwrap"></xsl:param>
  <xsl:param name="jsxtablestyles"></xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>

  <!-- Users can use these named parameters to further parameterize their templates with custom input parameters -->
  <xsl:param name="jsx_1"/>
  <xsl:param name="jsx_2"/>
  <xsl:param name="jsx_3"/>
  <xsl:param name="jsx_4"/>
  <xsl:param name="jsx_5"/>
  <xsl:param name="jsx_6"/>
  <xsl:param name="jsx_7"/>
  <xsl:param name="jsx_8"/>
  <xsl:param name="jsx_9"/>
  <xsl:param name="jsx_10"/>

  <!-- the root entry template -->
  <xsl:template match="/">
    <JSX_FF_WELLFORMED_WRAPPER>
      <xsl:choose>
        <xsl:when test="$jsxasyncmessage and $jsxasyncmessage!=''">
          <xsl:value-of select="$jsxasyncmessage"/>
        </xsl:when>
        <xsl:otherwise>
          <table class="jsx30table" style="top:{$jsxheaderheight}px;{$jsxtablestyles}" cellpadding="0"
                 cellspacing="0">
            <xsl:for-each select="//*[@jsxid=$jsxshallowfrom]/record">
              <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
              <xsl:apply-templates select="." mode="record">
                <xsl:with-param name="position" select="position()-1"/>
              </xsl:apply-templates>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <!-- Called by the root template. Renders the TR/TD containers -->
  <xsl:template match="record" mode="record">
    <xsl:param name="position"/>
    <xsl:param name="myselectionbg">
      <xsl:if test="@jsxselected='1'">background-image:url(
        <xsl:value-of select="$jsxselectionbgurl"/>
        );
      </xsl:if>
    </xsl:param>
    <xsl:param name="jsxrowclass">
      <xsl:choose>
        <xsl:when test="$position mod 2 = 0"><xsl:value-of select="$jsxrowclass2"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$jsxrowclass1"/></xsl:otherwise>
      </xsl:choose>
    </xsl:param>
    <xsl:param name="jsxrowstyle">
      <xsl:choose>
        <xsl:when test="$position mod 2 = 0"><xsl:value-of select="$jsxrowstyle2"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$jsxrowstyle1"/></xsl:otherwise>
      </xsl:choose><xsl:text>;</xsl:text>
    </xsl:param>

    <tr id="{$jsxid}_{@jsxid}" jsxid="{@jsxid}" jsxposition="{$position}" class="jsx30table {$jsxrowclass}"
        style="{$jsxrowstyle}" tabindex="{$jsxtabindex}">
      <xsl:if test="@jsxtip">
        <xsl:attribute name="title">
          <xsl:value-of select="@jsxtip"/>
        </xsl:attribute>
      </xsl:if>
    </tr>
  </xsl:template>
</xsl:stylesheet>
