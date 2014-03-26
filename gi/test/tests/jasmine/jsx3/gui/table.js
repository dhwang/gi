/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Table", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Table");
  var t = new _jasmine_test.App("jsx3.gui.Table");
  var table, Table, testspace;

  var getTable = function(s) {
    var root = s.getBodyBlock().load("data/table.xml");
    return root.getServer().getJSXByName('table');
  };

  var getRendered = function(table) {
    var select_cell, header_cell, alternateRow, cell, header_cells, header_pane, header, row;
    
    select_cell = document.getElementsByTagName('table')[0].tBodies[0].rows[0].cells[0];
    header_cell = table.getRendered().childNodes[1].firstChild.childNodes[0];
    alternateRow = document.getElementsByTagName('table')[0].tBodies[0].rows[0];
    cell = document.getElementsByTagName('table')[0].tBodies[0].rows[0].cells[0];
    header_cells = table.getRendered().childNodes[1].firstChild.childNodes;
    header_pane = table.getRendered().childNodes[1].firstChild;
    header = table.getRendered().childNodes[1];
    row = document.getElementsByTagName('table')[0].tBodies[0].rows[1];

    return {
      select_cell: select_cell,
      header_cell: header_cell,
      alternateRow: alternateRow,
      cell: cell,
      header_cells: header_cells,
      header_pane: header_pane,
      header: header,
      row: row
    };
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_table.xml", ".", true) : t._server;
    table = getTable(t._server);
    testspace = new RegExp("");

    if (!Table) {
      Table = jsx3.gui.Table;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(table).toBeInstanceOf(jsx3.gui.Table);
  });

  it("should be able to paint", function() {
    expect(table.getRendered()).not.toBeNull();
    expect(table.getRendered().nodeName.toLowerCase()).toEqual("div");
  });

  it("should be able to select and deselect a CDF record within the Table", function() {
    table.selectRecord(1);
    expect(getRendered(table).select_cell).toHaveStyle('backgroundImage', /select.gif/);
    table.deselectRecord(1);
    expect(getRendered(table).select_cell).toHaveStyle('backgroundImage',testspace);
  });

  it("should be able to sort according to the current sort path", function() {
    getRendered(table).header_cell.click();
    expect(getRendered(table).header_cell).toHaveStyle('backgroundImage', /sort_desc.gif/);
    table.doSort("ascending");
    header_cell = table.getRendered().childNodes[1].firstChild.childNodes[0];
    expect(getRendered(table).header_cell).toHaveStyle('backgroundImage', /sort_asc.gif/);
  });

  it("should be able to validate the Table", function() {
    expect(table.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
    table.setRequired(jsx3.gui.Form.REQUIRED);
    expect(table.doValidate()).toEqual(jsx3.gui.Form.STATEINVALID);
    table.selectRecord(1);
    expect(table.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });

  it("should be able to set and get the CSS rule for the HTML row element(s) containing the alternating table data rows", function() {
    var alternateRowClass = table.getAlternateRowClass();
    expect(alternateRowClass).toBeNull();
    table.setAlternateRowClass('row-class');
    table.repaint();
    alternateRowClass = table.getAlternateRowClass();
    expect(alternateRowClass).toEqual("row-class");
    expect(getRendered(table).alternateRow.className).toEqual('jsx30table row-class');
  });

  it("should be able to set and get the CSS properties for the HTML row element(s) containing the alternating table data rows", function() {
    var alternateRowStyle = table.getAlternateRowStyle();
    expect(alternateRowStyle).toEqual('background-color:#efefff;');
    table.setAlternateRowStyle('background-color:blue;');
    table.repaint();
    alternateRowStyle = table.getAlternateRowStyle();
    expect(alternateRowStyle).toEqual('background-color:blue;');
    expect(getRendered(table).alternateRow).toHaveStyle('backgroundColor', /blue/);
  });

  it("should be able to set and get whether the table is sortable", function() {
    var canSort = table.getCanSort();
    expect(canSort).toBeUndefined();
    getRendered(table).header_cell.click();
    expect(getRendered(table).header_cell).toHaveStyle('backgroundImage', /sort_desc.gif/);
    table.setCanSort(jsx3.Boolean.FALSE);
    table.repaint();
    canSort = table.getCanSort();
    expect(canSort).toEqual(jsx3.Boolean.FALSE);
    getRendered(table).header_cell.click();
    expect(getRendered(table).header_cell).toHaveStyle('backgroundImage', /sort_desc.gif/);
  });

  it("should be able to set and get the CSS rule that will be applied to every HTML cell in the body of the table", function() {
    var cellClass = table.getCellClass();
    expect(cellClass).toBeUndefined();
    expect(getRendered(table).cell.className.trim()).toEqual('jsx30table');
    table.setCellClass('class1');
    table.repaint();
    cellClass = table.getCellClass();
    expect(cellClass).toEqual('class1');
    expect(getRendered(table).cell.className).toEqual('jsx30table class1');
  });

  it("should be able to set and get the CSS properties that will be inlined on every HTML cell in the body of the table", function() {
    var cellStyle = table.getCellStyle();
    expect(cellStyle).toEqual('border-right:solid 1px gray;border-bottom:solid 1px gray;padding:4px;padding-bottom:3px;cursor:default;word-wrap:break-word;');
    table.setCellStyle('border: 1px solid red');
    table.repaint();
    expect(getRendered(table).cell).toHaveStyle('border', /red/);
  });

  it("should be able to set and get the string of XML in CDF format representing the Column Profile Document", function() {
    var columnProfile = table.getColumnProfile();
    expect(table.getColumnProfileDocument().selectNodes("//record").size()).toEqual(6);
    expect(getRendered(table).header_cells.length).toEqual(6);
    table.setColumnProfile('<data jsxid="jsxroot"><record jsxid="a5" jsxwidth="100" jsxtext="&lt;div style=\'padding:8px;border-right:solid 1px gray;border-bottom:solid 1px gray;white-space:nowrap;\'&gt;Col 1&lt;/div&gt;" jsxpath="jsxtext"/><record jsxid="a1" jsxwidth="25%" jsxtext="&lt;div style=\'padding:8px;border-right:solid 1px gray;border-bottom:solid 1px gray;white-space:nowrap;\'&gt;Col 2&lt;/div&gt;" jsxpath="jsxtext"/></data>');
    table.repaint();
    expect(table.getColumnProfileDocument().selectNodes("//record").size()).toEqual(2);
    expect(getRendered(table).header_cells.length).toEqual(2);
  });

  it("should be able to set and get the CSS rule for the HTML row containing the column headers", function() {
    var headerClass = table.getHeaderClass();
    expect(headerClass).toEqual('');
    table.setHeaderClass('headerClass');
    table.repaint();
    headerClass = table.getHeaderClass();
    expect(headerClass).toEqual('headerClass');
    expect(getRendered(table).header_pane.className).toEqual('jsx30table_head_pane headerClass');
  });

  it("should be able to set and get the height of the header row in pixels. Set to zero (0) to hide the header row and only render the body rows", function() {
    var headerHeight = table.getHeaderHeight();
    expect(headerHeight).toEqual(29);
    expect(getRendered(table).header).toHaveStyle('height', /29px/);
    table.setHeaderHeight(50, true);
    table.repaint();
    headerHeight = table.getHeaderHeight();
    expect(headerHeight).toEqual(50);
    expect(getRendered(table).header).toHaveStyle('height', /50px/);
  });

  it("should be able to set and get the CSS style properties for the HTML row containing the column headers", function() {
    var headerStyle = table.getHeaderStyle();
    expect(headerStyle).toEqual('background-color:#dfdfff;');
    table.setHeaderStyle('background-color:red;');
    table.repaint();
    headerStyle = table.getHeaderStyle();
    expect(headerStyle).toEqual('background-color:red;');
    expect(getRendered(table).header_pane).toHaveStyle('backgroundColor', /red/);
  });

  it("should be able to set and get the jsxid of the CDF record that will serve as the origin when rendering the data on-screen", function() {
    var renderingCtxt = table.getRenderingContext();
    expect(renderingCtxt).toBeNull();
    table.setRenderingContext('3');
    renderingCtxt = table.getRenderingContext();
    expect(renderingCtxt).toEqual('3');
  });

  it("should be able to set and get the CSS rule for the HTML row element(s) containing the table data", function() {
    var rowClass = table.getRowClass();
    expect(rowClass).toBeUndefined();
    table.setRowClass('row-class');
    table.repaint();
    rowClass = table.getRowClass();
    expect(rowClass).toEqual('row-class');
    expect(getRendered(table).row.className).toEqual('jsx30table row-class');
  });

  it("should be able to set and get the CSS properties for the HTML row elements(s) containing the table data", function() {
    var rowStyle = table.getRowStyle();
    expect(rowStyle).toEqual('background-color:#fafaff;');
    table.setRowStyle('background-color:red;');
    table.repaint();
    rowStyle = table.getRowStyle();
    expect(rowStyle).toEqual('background-color:red;');
    expect(getRendered(table).row).toHaveStyle('backgroundColor', /red/);
  });

  it("should be able to set and get the URL for the image to use (as the repeating background image) to denote selection", function() {
    var selectionBG = table.getSelectionBG();
    expect(selectionBG).toBeNull();
    table.setSelectionBG(Table.SELECTION_BG);
    table.repaint();
    selectionBG = table.getSelectionBG();
    expect(selectionBG).toEqual(Table.SELECTION_BG);
  });

  it("should be able to set and get the selection model", function() {
    var selectionModel = table.getSelectionModel();
    expect(selectionModel).toEqual(Table.SELECTION_ROW);
    table.setSelectionModel(Table.SELECTION_UNSELECTABLE);
    table.repaint();
    selectionModel = table.getSelectionModel();
    expect(selectionModel).toEqual(Table.SELECTION_UNSELECTABLE);
    table.selectRecord(1);
    expect(getRendered(table).select_cell).toHaveStyle('backgroundImage', testspace);
  });

  it("should be able to set and get the direction (ascending or descending) for the sorted column", function() {
    var sortDirection = table.getSortDirection();
    expect(sortDirection).toEqual('ascending');
    getRendered(table).header_cell.click();
    getRendered(table).header_cell.click();
    expect(getRendered(table).header_cell).toHaveStyle('backgroundImage', /sort_asc.gif/);
    table.setSortDirection("descending");
    sortDirection = table.getSortDirection();
    expect(sortDirection).toEqual("descending");
    table.repaintHead();
    expect(getRendered(table).header_cell).toHaveStyle('backgroundImage', /sort_desc.gif/);
  });

  it("should be able to set and get the name of the CDF attribute to sort on", function() {
    var sortPath = table.getSortPath();
    expect(sortPath).toEqual('');
    table.setSortPath('jsxtext');
    sortPath = table.getSortPath();
    expect(sortPath).toEqual('jsxtext');
  });

  it("should be able to set and get the data type for the list", function() {
    var sortType = table.getSortType();
    expect(sortType).toEqual('text');
    table.setSortType('number');
    sortType = table.getSortType();
    expect(sortType).toEqual('number');
  });

  it("should be able to set and get the value of this table", function() {
    var value = table.getValue();
    expect(value).toBeUndefined();
    table.setValue('1');
    value = table.getValue();
    expect(value).toEqual('1');
    expect(getRendered(table).select_cell).toHaveStyle('backgroundImage', /select.gif/);
  });

  it("should be able to set and get the user-defined XSL template", function() {
    var valueTemplate = table.getValueTemplate();
    expect(valueTemplate).toBeUndefined();
    table.setValueTemplate(Table.DEFAULT_CELL_VALUE_TEMPLATE);
    valueTemplate = table.getValueTemplate();
    expect(valueTemplate).toEqual(Table.DEFAULT_CELL_VALUE_TEMPLATE);
  });

  it("should be able to set and get whether or not the table's data cells support text-wrapping", function() {
    var wrap = table.getWrap();
    expect(wrap).toBeNull();
    table.setWrap(jsx3.Boolean.FALSE);
    wrap = table.getWrap();
    expect(wrap).toEqual(jsx3.Boolean.FALSE);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});