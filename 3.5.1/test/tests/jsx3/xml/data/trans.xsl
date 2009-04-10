<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:param name="xslparam1"></xsl:param>

  <xsl:template match="/object">
    <data>
      <xsl:if test="$xslparam1">
        <xsl:attribute name="param"><xsl:value-of select="$xslparam1"/></xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select="*"/>
    </data>
  </xsl:template>

  <xsl:template match="field">
    <record>
      <xsl:apply-templates select="*"/>
    </record>
  </xsl:template>

</xsl:stylesheet>
