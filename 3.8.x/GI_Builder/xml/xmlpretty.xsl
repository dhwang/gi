<!--
  ~ Copyright (c) 2001-2009, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:jsx1="urn:tibco.com/v3.0" >

  <xsl:output
      method="xml"
      encoding="UTF-8"
      omit-xml-declaration="yes"
      cdata-section-elements="jsx1:name jsx1:icon jsx1:description jsx1:onAfterDeserialize jsx1:onBeforeDeserialize
          name icon description onAfterDeserialize onBeforeDeserialize" />

  <xsl:param name="indent-increment" select="'  '" />

  <xsl:template match="/*">
    <xsl:param name="indent" select="''"/>

    <xsl:value-of select="$indent"/>
    <xsl:copy>
      <xsl:copy-of select="@*" />
      <xsl:apply-templates>
        <xsl:with-param name="indent" select="concat('&#xA;', $indent-increment)"/>
      </xsl:apply-templates>
      <xsl:if test="*">
        <xsl:value-of select="'&#xA;'"/>
      </xsl:if>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="indent" select="'&#xA;'"/>

    <xsl:value-of select="$indent"/>
    <xsl:copy>
      <xsl:copy-of select="@*" />
      <xsl:apply-templates>
        <xsl:with-param name="indent" select="concat($indent, $indent-increment)"/>
      </xsl:apply-templates>
      <xsl:if test="*">
        <xsl:value-of select="$indent"/>
      </xsl:if>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="comment()|processing-instruction()">
    <xsl:copy />
  </xsl:template>

   <!-- WARNING: this is dangerous. Handle with care -->
  <xsl:template match="text()[normalize-space(.)='']"/>

</xsl:stylesheet>
