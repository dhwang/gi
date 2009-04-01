/*
 * Copyright (c) 2001-2009, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.TextBox", "jsx3.util.NumberFormat");

/**
 * A form element (text box) that stores a number value. The value can be formatted according to a number format.
 * User input is parsed according to the number format before setting the value of the form element.
 *
 * @see jsx3.util.NumberFormat
 * @see jsx3.app.Server#getLocale()
 * @since 3.7
 */
jsx3.Class.defineClass("jsx3.gui.NumberInput", jsx3.gui.TextBox, null, function(NumberInput, NumberInput_prototype) {

  var NumberFormat = jsx3.util.NumberFormat;

  /**
   * Returns the number format as set with <code>setFormat()</code>.
   * @return {String | int}
   * @see #setFormat()
   */
  NumberInput_prototype.getFormat = function() {
    return this.jsxformat != null ? this.jsxformat : NumberFormat.NUMBER;
  };

  /**
   * Sets the format of this number input. The format should conform to the syntax of <code>jsx3.util.NumberFormat</code>.
   * The provided format may also be an integer, in which case it is intepreted as one of of the fields of
   * <code>NumberFormat</code> - <code>NUMBER</code>, <code>INTEGER</code>, or <code>CURRENCY</code> - and
   * the displayed format will be localized accordingly.
   *
   * @param format {String|int} the new format.
   * @see jsx3.util.NumberFormat
   * @see jsx3.util.NumberFormat#NUMBER
   * @see jsx3.util.NumberFormat#INTEGER
   * @see jsx3.util.NumberFormat#CURRENCY
   */
  NumberInput_prototype.setFormat = function(format) {
    this.jsxformat = format;
    delete this._jsxformat;
  };

  /** @private @jsxobf-clobber */
  NumberInput_prototype._getFormat = function() {
    if (this._jsxformat == null || !this._jsxformat.getLocale().equals(this._getLocale())) {
      try {
        var format = this.getFormat();
        if (typeof(format) == "number")
          /* @jsxobf-clobber */
          this._jsxformat = NumberFormat.getInstance(format, this._getLocale());
        else
          this._jsxformat = new NumberFormat(format, this._getLocale());
      } catch (e) {
        jsx3.util.Logger.getLogger("jsx3.gui").warn(
            jsx3._msg("gui.ni.fmt", this.getFormat(), this), jsx3.NativeError.wrap(e));
        this._jsxdateformat = NumberFormat.getInstance(null, this._getLocale());
      }
    }

    return this._jsxformat;
  };

  NumberInput_prototype.formatValue = function(value) {
    if (value == null) return "";
    return this._getFormat().format(value);
  };

  NumberInput_prototype.parseValue = function(input) {
    if (input == "") return null;
    return this._getFormat().parse(input);
  };

});