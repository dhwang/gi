<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2007, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="jsxlib.xsl"/>

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxselectedimage"></xsl:param>
  <xsl:param name="jsxtransparentimage"></xsl:param>
  <xsl:param name="jsxsubmenuimage"></xsl:param>
  <xsl:param name="jsxdragtype">JSX_GENERIC</xsl:param>
  <xsl:param name="jsxrootid">jsxroot</xsl:param>
  <xsl:param name="jsxid">jsxroot</xsl:param>
  <xsl:param name="jsxindex">0</xsl:param>
  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxapppath"></xsl:param>
  <xsl:param name="jsxabspath"></xsl:param>
  <xsl:param name="jsxdisableescape">no</xsl:param>
  <xsl:param name="jsxmode">0</xsl:param>
  <xsl:param name="jsxkeycodes"></xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>

  <xsl:template match="/">
    <JSX_FF_WELLFORMED_WRAPPER>
      <xsl:apply-templates select="//*[@jsxid=$jsxrootid]"/>
    </JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="mystyle" select="@jsxstyle"/>

    <xsl:for-each select="record">
      <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
      <xsl:choose>
        <xsl:when test="@jsxdivider[.='1']">
          <div class="jsx30menu_{$jsxmode}_item_divider" jsxtype="Disabled" jsxdiv="true">
            <div>&#160;</div>
          </div>
        </xsl:when>
      </xsl:choose>
      <div id="{$jsxid}_{@jsxid}" tabindex="{$jsxtabindex}"
          onmouseover="jsx3.GO('{$jsxid}').doFocus(jsx3.gui.Event.wrap(event),this,{$jsxindex});"
          onmouseout="jsx3.GO('{$jsxid}').doBlur(jsx3.gui.Event.wrap(event),this);"
          onblur="jsx3.GO('{$jsxid}').doBlur(jsx3.gui.Event.wrap(event),this);"
          onfocus="jsx3.GO('{$jsxid}').doFocus(jsx3.gui.Event.wrap(event),this,{$jsxindex});" jsxid="{@jsxid}">
        <xsl:choose>
          <xsl:when test="@jsxdisabled='1' or (record and not(record[not(@jsxdisabled='1')]))">
            <xsl:attribute name="class">jsx30menu_<xsl:value-of select="$jsxmode"/>_item_disabled</xsl:attribute>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="class">jsx30menu_<xsl:value-of select="$jsxmode"/>_item</xsl:attribute>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="@jsxtip">
            <xsl:attribute name="title">
              <xsl:value-of select="@jsxtip"/>
            </xsl:attribute>
          </xsl:when>
        </xsl:choose>
        <xsl:attribute name="jsxtype">
        <xsl:choose>
          <xsl:when test="@jsxdisabled='1'">Disabled</xsl:when>
          <xsl:when test="record">Book</xsl:when>
          <xsl:otherwise>Leaf</xsl:otherwise>
        </xsl:choose>
        </xsl:attribute>
        <xsl:choose>
          <xsl:when test="@jsximg">
            <xsl:variable name="src1">
              <xsl:choose>
                <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@jsximg" mode="uri-resolver"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="@jsximg"/></xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
            <img style="position:absolute;left:2px;top:2px;width:16px;height:16px;" src="{$src1}"/>
          </xsl:when>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="@jsxselected = 1">
            <img class="jsx30menu_{$jsxmode}_selected" src="{$jsxselectedimage}"/>
          </xsl:when>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="record">
            <div class="jsx30menu_{$jsxmode}_kc" style="{$mystyle}">
              <table class="jsx30menu_{$jsxmode}_kct">
                <tr>
                  <td class="name">
                    <xsl:apply-templates select="." mode="jsxtext"/>
                  </td>
                  <td class="keycode" style="background-image:url({$jsxsubmenuimage});background-position:right 2px;background-repeat:no-repeat;">&#160;</td>
                </tr>
              </table>
            </div>
          </xsl:when>
          <xsl:otherwise>
            <div class="jsx30menu_{$jsxmode}_kc" style="{$mystyle}">
              <table class="jsx30menu_{$jsxmode}_kct">
                <tr>
                  <td class="name">
                    <xsl:apply-templates select="." mode="jsxtext"/>
                  </td>
                  <xsl:if test="@jsxkeycode">
                    <td class="keycode">
                      <xsl:apply-templates select="." mode="keycode"/>
                    </td>
                  </xsl:if>
                </tr>
              </table>
            </div>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="record" mode="keycode">
    <xsl:variable name="after" select="substring-after($jsxkeycodes, concat(@jsxid,':'))"/>
    <xsl:choose>
      <xsl:when test="$after">
        <xsl:value-of select="substring-before($after, '|')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@jsxkeycode"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="record" mode="jsxtext">
    <xsl:choose>
      <xsl:when test="$jsxdisableescape='yes'">
        <xsl:apply-templates select="@jsxtext" mode="disable-output-escp"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@jsxtext"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
