const React             = require('react');
const createReactClass = require('create-react-class');
const shallowEqual    = require('fbjs/lib/shallowEqual');
const BaseFooterCell        = require('./FooterCell');
const getScrollbarSize  = require('./getScrollbarSize');
const ExcelColumn  = require('./PropTypeShapes/ExcelColumn');
const ColumnUtilsMixin  = require('./ColumnUtils');
// const SortableFooterCell    = require('./cells/footerCells/SortableFooterCell');
// const FilterableFooterCell  = require('./cells/footerCells/FilterableFooterCell');
const createObjectWithProperties = require('./createObjectWithProperties');
require('../../../themes/react-data-grid-footer.css');

import PropTypes from 'prop-types';

const FooterRowStyle  = {
  overflow: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.number,
  position: PropTypes.string
};

// The list of the propTypes that we want to include in the FooterRow div
const knownDivPropertyKeys = ['width', 'height', 'style', 'onScroll'];

const FooterRow = createReactClass({
  displayName: 'FooterRow',

  propTypes: {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    columns: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    // onColumnResize: PropTypes.func,
    // onSort: PropTypes.func.isRequired,
    // onColumnResizeEnd: PropTypes.func,
    style: PropTypes.shape(FooterRowStyle),
    // sortColumn: PropTypes.string,
    // sortDirection: PropTypes.oneOf(Object.keys(SortableFooterCell.DEFINE_SORT)),
    cellRenderer: PropTypes.func,
    footerCellRenderer: PropTypes.func,
    // filterable: PropTypes.bool,
    // onFilterChange: PropTypes.func,
    // resizing: PropTypes.object,
    // onScroll: PropTypes.func,
    rowType: PropTypes.string,
    // draggableFooterCell: PropTypes.func,
    // onFooterDrop: PropTypes.func
  },

  mixins: [ColumnUtilsMixin],

  componentWillMount() {
    this.cells = [];
  },

  shouldComponentUpdate(nextProps: {width: ?(number | string); height: number; columns: Array<ExcelColumn>; style: ?FooterRowStyle; onColumnResize: ?any}): boolean {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !shallowEqual(nextProps.style, this.props.style)
      // || this.props.sortColumn !== nextProps.sortColumn
      // || this.props.sortDirection !== nextProps.sortDirection
    );
  },

  getFooterRenderer(column) {
    let renderer;
    if (column.footerRenderer) {
      renderer = column.footerRenderer;
    }
    
    return renderer;
  },

  getStyle(): FooterRowStyle {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  },

  getCells(): Array<FooterCell> {
    let cells = [];
    let lockedCells = [];
    for (let i = 0, len = this.getSize(this.props.columns); i < len; i++) {
      let column = Object.assign({ rowType: this.props.rowType }, this.getColumn(this.props.columns, i));
      let _renderer = this.getFooterRenderer(column);
      let FooterCell = column.draggable ? this.props.draggableFooterCell : BaseFooterCell;
      let cell = (
        <FooterCell
          ref={(node) => this.cells[i] = node}
          key={i}
          height={this.props.height}
          column={column}
          renderer={_renderer}
          // resizing={this.props.resizing === column}
          // onResize={this.props.onColumnResize}
          // onResizeEnd={this.props.onColumnResizeEnd}
          // onFooterDrop={this.props.onFooterDrop}
          />
      );
      if (column.locked) {
        lockedCells.push(cell);
      } else {
        cells.push(cell);
      }
    }

    return cells.concat(lockedCells);
  },

  setScrollLeft(scrollLeft: number) {
    this.props.columns.forEach( (column, i) => {
      if (column.locked) {
        this.cells[i].setScrollLeft(scrollLeft);
      } else {
        if (this.cells[i] && this.cells[i].removeScroll) {
          this.cells[i].removeScroll();
        }
      }
    });
  },

  getKnownDivProps() {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  },

  render(): ?ReactElement {
    let cellsStyle = {
      width: this.props.width ? (this.props.width + getScrollbarSize()) : '100%',
      height: this.props.height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };

    let cells = this.getCells();
    return (
      <div {...this.getKnownDivProps()} className="react-grid-FooterRow">
        <div style={cellsStyle}>
          {cells}
        </div>
      </div>
    );
  }
});

module.exports = FooterRow;
