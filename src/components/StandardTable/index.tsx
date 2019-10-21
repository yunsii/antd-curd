/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import {
  TableProps,
  ColumnProps,
  PaginationConfig,
} from 'antd/lib/table';
import classNames from 'classnames';
import styles from './index.less';

type OmittedTableProps<T> = Omit<TableProps<T>, 'dataSource'>;

export interface StandardTableColumnProps<T> extends ColumnProps<T> {
  needTotal?: boolean;
}

function initTotalList<T>(columns: StandardTableColumnProps<T>[]) {
  const totalList: any[] = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

export interface StandardTableProps<T> extends OmittedTableProps<T> {
  columns: StandardTableColumnProps<T>[];
  onSelectRow?: (row: any) => void;
  data: {
    list: T[];
    pagination?: PaginationConfig;
  };
  checkable?: boolean;
  selectedRows?: T[];
}

interface StandardTableState {
  selectedRowKeys: any[];
  needTotalList: any[];
}

function initialState<T>(props: StandardTableProps<T>) {
  const { columns } = props;
  const needTotalList = initTotalList<T>(columns);

  return {
    selectedRowKeys: [],
    needTotalList,
  };
}

class StandardTable<T> extends PureComponent<StandardTableProps<T>, StandardTableState> {
  static defaultProps = {
    rowKey: 'id',
    checkable: true,
    data: { list: [], pagination: {} },
  }

  static getDerivedStateFromProps<T>(nextProps: StandardTableProps<T>) {
    const { checkable } = nextProps;
    if (checkable && nextProps.selectedRows && nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList<T>(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }
    return null;
  }

  state = initialState(this.props);

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex]), 0),
    }));
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, needTotalList });
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { data, checkable, rowClassName, pagination: extraPagination, ...rest } = this.props;
    const { list = [], pagination } = data;

    let paginationProps: PaginationConfig | false = {
      showSizeChanger: true,
      showQuickJumper: true,
      hideOnSinglePage: true,
      showTotal: (total, range) => `${range[0]}-${range[1]}，总计 ${total} 条`,
      ...extraPagination,
      ...pagination,
    };
    if (extraPagination === false) {
      paginationProps = false;
    }

    let rowSelection: any = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    if (!checkable) {
      rowSelection = null;
    }

    return (
      <div className={styles.standardTable}>
        {checkable ? (
          <div className={styles.tableAlert}>
            <Alert
              message={
                <Fragment>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                  {needTotalList.map(item => (
                    <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                      {item.title}
                      总计&nbsp;
                      <span style={{ fontWeight: 600 }}>
                        {item.render ? item.render(item.total) : item.total}
                      </span>
                    </span>
                  ))}
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                    清空
                  </a>
                </Fragment>
              }
              type="info"
              showIcon
            />
          </div>
        ) : null}
        <Table
          rowClassName={(record: T, index: number) => {
            let extraRowClassname: string = '';
            if (rowClassName) {
              extraRowClassname = rowClassName(record, index);
            }
            return classNames(styles.tableRow, extraRowClassname);
          }}
          rowSelection={rowSelection}
          dataSource={list}
          pagination={paginationProps}
          {...rest}
        />
      </div>
    );
  }
}

export default StandardTable;
