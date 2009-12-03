<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright (c) 2001-2009, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes"/>
  <xsl:template match="/">
    <data jsxid="jsxroot">
    <xsl:for-each select="countries/country">
      <record>
        <xsl:attribute name="jsxid">
          <xsl:value-of select='id'/>
        </xsl:attribute>
        <xsl:attribute name="jsxtext">
          <xsl:value-of select='name'/>
        </xsl:attribute>
        <xsl:attribute name="jsxpopulation">
          <xsl:value-of select='population'/>
        </xsl:attribute>
        <xsl:attribute name="jsxarea">
          <xsl:value-of select='area' />
        </xsl:attribute>
      </record>
    </xsl:for-each>
    </data>
  </xsl:template>
</xsl:stylesheet>
