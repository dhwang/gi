<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright (c) 2001-2009, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes"/>
  <xsl:template match="/">
    <data jsxid="jsxroot">
      <record jsxid="jsxrootnode" jsxtext="rootnode" jsxunselectable="1" jsxopen="1">
        <xsl:apply-templates select="categories/category" />
      </record>
    </data>
  </xsl:template>
  <xsl:template match="category">
    <record>
      <xsl:attribute name="jsxid"><xsl:value-of select="@id"/></xsl:attribute>
      <xsl:attribute name="jsxtext"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="jsxunselectable">1</xsl:attribute>
      <xsl:attribute name="jsximg">jsx:/images/tree/folder.gif</xsl:attribute>

      <xsl:apply-templates select="demos|demo"/>
    </record>
  </xsl:template>
  <xsl:template match="demos">
    <record>
      <xsl:attribute name="jsxid"><xsl:value-of select="@id"/></xsl:attribute>
      <xsl:attribute name="jsxtext"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="jsxunselectable">1</xsl:attribute>
      <xsl:attribute name="jsximg">jsxapp:/images/<xsl:value-of select="@icon"/></xsl:attribute>

      <xsl:apply-templates select="demo"/>
    </record>
  </xsl:template>
  <xsl:template match="demo">
    <record>
      <xsl:attribute name="jsxid"><xsl:value-of select="@file"/></xsl:attribute>
      <xsl:attribute name="jsxtext"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:if test="@icon">
        <xsl:attribute name="jsximg">jsxapp:/images/<xsl:value-of select="@icon"/></xsl:attribute>
      </xsl:if>
    </record>
  </xsl:template>
</xsl:stylesheet>
