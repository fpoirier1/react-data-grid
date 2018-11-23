const React               = require('react');
const ReactDOM            = require('react-dom');
const joinClasses         = require('classnames');
const shallowCloneObject  = require('./shallowCloneObject');
const ColumnMetrics       = require('./ColumnMetrics');
const ColumnUtils         = require('./ColumnUtils');
const FooterRow           = require('./FooterRow');
const getScrollbarSize  = require('./getScrollbarSize');
import PropTypes from 'prop-types';
const createObjectWithProperties = require('./createObjectWithProperties');
const cellMetaDataShape    = require('./PropTypeShapes/CellMetaDataShape');
require('../../../themes/react-data-grid-footer.css');

type Column = {
  width: number
}

// The list of the propTypes that we want to include in the Footer div
const knownDivPropertyKeys = ['height', 'onScroll'];

class Footer extends React.Component {
  static propTypes = {
    columnMetrics: PropTypes.shape({  width: PropTypes.number.isRequired, columns: PropTypes.any }).isRequired,
    totalWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    footerRows: PropTypes.array.isRequired,
    // sortColumn: PropTypes.string,
    // sortDirection: PropTypes.oneOf(['ASC', 'DESC', 'NONE']),
    // onSort: PropTypes.func,
    onColumnResize: PropTypes.func,
    // onScroll: PropTypes.func,
    // onFooterDrop: PropTypes.func,
    // draggableFooterCell: PropTypes.func,
    // getValidFilterValues: PropTypes.func,
    cellMetaData: PropTypes.shape(cellMetaDataShape)
  };

  // state: {resizing: any} = {resizing: null};

  componentWillReceiveProps() {
    // this.setState({resizing: null});
  }

  shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    let update =  !(ColumnMetrics.sameColumns(this.props.columnMetrics.columns, nextProps.columnMetrics.columns, ColumnMetrics.sameColumn))
    || this.props.totalWidth !== nextProps.totalWidth
    || (this.props.footerRows.length !== nextProps.footerRows.length)
    // || (this.state.resizing !== nextState.resizing)
    // || this.props.sortColumn !== nextProps.sortColumn
    // || this.props.sortDirection !== nextProps.sortDirection;
    return update;
  }

  // onColumnResize = (column: Column, width: number) => {
  //   let state = this.state.resizing || this.props;

  //   let pos = this.getColumnPosition(column);

  //   if (pos != null) {
  //     let resizing = {
  //       columnMetrics: shallowCloneObject(state.columnMetrics)
  //     };
  //     resizing.columnMetrics = ColumnMetrics.resizeColumn(
  //         resizing.columnMetrics, pos, width);

  //     // we don't want to influence scrollLeft while resizing
  //     if (resizing.columnMetrics.totalWidth < state.columnMetrics.totalWidth) {
  //       resizing.columnMetrics.totalWidth = state.columnMetrics.totalWidth;
  //     }

  //     resizing.column = ColumnUtils.getColumn(resizing.columnMetrics.columns, pos);
  //     this.setState({resizing});
  //   }
  // };

  // onColumnResizeEnd = (column: Column, width: number) => {
  //   let pos = this.getColumnPosition(column);
  //   if (pos !== null && this.props.onColumnResize) {
  //     this.props.onColumnResize(pos, width || column.width);
  //   }
  // };

  getFooterRows = (): Array<FooterRow> => {
    let columnMetrics = this.getColumnMetrics();
    // let resizeColumn;
    // if (this.state.resizing) {
    //   resizeColumn = this.state.resizing.column;
    // }
    let footerRows = [];
    this.props.footerRows.forEach((row, index) => {
      // To allow footer filters to be visible
      let rowHeight = 'auto';
      let scrollbarSize = getScrollbarSize() > 0 ? getScrollbarSize() : 0;
      let updatedWidth = isNaN(this.props.totalWidth - scrollbarSize) ? this.props.totalWidth : this.props.totalWidth - scrollbarSize;
      let footerRowStyle = {
        position: 'absolute',
        top: this.getCombinedFooterHeights(index),
        left: 0,
        width: updatedWidth,
        overflowX: 'hidden',
        minHeight: rowHeight
      };

      footerRows.push(<FooterRow
        key={row.ref}
        ref={(node) => this.row = node}
        rowType={row.rowType}
        style={footerRowStyle}
        // onColumnResize={this.onColumnResize}
        // onColumnResizeEnd={this.onColumnResizeEnd}
        width={columnMetrics.width}
        height={row.height || this.props.height}
        columns={columnMetrics.columns}
        // resizing={resizeColumn}
        // draggableFooterCell={this.props.draggableFooterCell}
        // filterable={row.filterable}
        // onFilterChange={row.onFilterChange}
        // onFooterDrop={this.props.onFooterDrop}
        // sortColumn={this.props.sortColumn}
        // sortDirection={this.props.sortDirection}
        // onSort={this.props.onSort}
        // onScroll={this.props.onScroll}
        // getValidFilterValues={this.props.getValidFilterValues}
        />);
    });
    return footerRows;
  };

  getColumnMetrics = () => {
    let columnMetrics;
    // if (this.state.resizing) {
    //   columnMetrics = this.state.resizing.columnMetrics;
    // } else {
      columnMetrics = this.props.columnMetrics;
    // }
    return columnMetrics;
  };

  getColumnPosition = (column: Column): ?number => {
    let columnMetrics = this.getColumnMetrics();
    let pos = -1;
    columnMetrics.columns.forEach((c, idx) => {
      if (c.key === column.key) {
        pos = idx;
      }
    });
    return pos === -1 ? null : pos;
  };

  getCombinedFooterHeights = (until: ?number): number => {
    let stopAt = this.props.footerRows.length;
    if (typeof until !== 'undefined') {
      stopAt = until;
    }

    let height = 0;
    for (let index = 0; index < stopAt; index++) {
      height += this.props.footerRows[index].height || this.props.height;
    }
    return height;
  };

  getStyle = (): {position: string; height: number; bottom: number} => {
    const columnMetrics = this.getColumnMetrics();

    const columnsWidth = columnMetrics.columns.reduce(function(sum, column) {
        return sum + column.width;
    }, 0);
    const bottom = columnsWidth > columnMetrics.totalWidth ? getScrollbarSize() : 0;

    return {
      position: 'absolute',
      height: this.getCombinedFooterHeights(),
      bottom
    };
  };

  setScrollLeft = (scrollLeft: number) => {
    let node = ReactDOM.findDOMNode(this.row);
    node.scrollLeft = scrollLeft;
    this.row.setScrollLeft(scrollLeft);
    if (this.filterRow) {
      let nodeFilters = ReactDOM.findDOMNode(this.filterRow);
      nodeFilters.scrollLeft = scrollLeft;
      this.filterRow.setScrollLeft(scrollLeft);
    }
  };

  getKnownDivProps = () => {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  };

  // Set the cell selection to -1 x -1 when clicking on the footer
  onFooterClick = () => {
    this.props.cellMetaData.onCellClick({rowIdx: -1, idx: -1 });
  };

  render(): ?ReactElement {
    let className = joinClasses({
      'react-grid-Footer': true,
      // 'react-grid-Footer--resizing': !!this.state.resizing
    });
    let footerRows = this.getFooterRows();

    return (
      <div {...this.getKnownDivProps()} style={this.getStyle()} className={className} onClick={this.onFooterClick}>
        {footerRows}
      </div>
    );
  }
}

module.exports = Footer;
