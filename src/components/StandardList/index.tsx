import React, { PureComponent, Fragment } from 'react';
import { List, Alert, Checkbox } from 'antd';
import { ListProps } from 'antd/lib/list';
import { PaginationConfig } from 'antd/lib/pagination';
import styles from './index.less';

type OmittedListProps<T> = Omit<ListProps<T>, 'dataSource' | 'renderItem'>;

export type Page = {
  current: number;
  pageSize: number;
};

export type RecordSelection = {
  selectedRowKeys: number[];
  onSelectChange: (selectedRowKeys: any[]) => void;
  getCheckboxProps: (record: any) => any;
};

export type renderItemConfig = {
  record: any;
  actions: React.ReactNode[] | null;
  recordSelection: RecordSelection;
  checkable?: boolean;
};

export interface StandardListProps<T> extends OmittedListProps<T> {
  data: { list: T[]; pagination?: PaginationConfig };
  onSelectRow?: (recordArray: any[]) => void;
  checkable?: boolean;
  selectedRows?: any[];
  renderItem: (config: renderItemConfig) => React.ReactNode;
  setActions?: (record: any) => React.ReactNode[] | null;
  onChange?: (page: Page) => void;
}

interface StandardListState {
  selectedRowKeys: (number | string)[];
}

class StandardList<T extends { id: number | string }> extends PureComponent<StandardListProps<T>, StandardListState> {
  static defaultProps = {
    data: { list: [], pagination: {} },
    loading: false,
    rowKey: 'id',
  };

  state = {
    selectedRowKeys: []
  };

  cleanSelectedKeys = () => {
    this.handleSelectChange([]);
  };

  onCheckAllChange = () => {
    const { data } = this.props;
    const { list = [] as T[] } = data;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length < list.length) {
      this.handleSelectChange(list.map((item) => item.id));
      return;
    }
    this.handleSelectChange([]);
  };

  handleSelectChange = (selectedRowKeys) => {
    const { data = {} as any, onSelectRow } = this.props;
    const { list = [] as any[] } = data;
    this.setState({
      selectedRowKeys
    });
    if (onSelectRow) {
      onSelectRow(list.filter((item) => selectedRowKeys.includes(item.id)));
    }
  };

  handlePageChange = (current: number, pageSize: number) => {
    console.log(current, pageSize);
    const { onChange = () => { } } = this.props;
    onChange({ current, pageSize } as Page);
  };

  handleShowSizeChange = (current: number, pageSize: number) => {
    this.handlePageChange(current, pageSize);
  };

  render() {
    const {
      data,
      checkable = true,
      renderItem,
      selectedRows,
      setActions,
      onSelectRow,
      onChange,
      pagination: extraPagination,
      ...rest
    } = this.props;
    const { list, pagination } = data;
    const { selectedRowKeys } = this.state;

    let recordSelection: any = {
      selectedRowKeys,
      onSelectChange: this.handleSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record.disabled
      })
    };
    if (!checkable) {
      recordSelection = {};
    }

    let paginationProps: PaginationConfig | false = pagination ? {
      ...pagination,
      ...extraPagination,
      onChange: this.handlePageChange,
      onShowSizeChange: this.handleShowSizeChange,
    } : false;
    if (extraPagination === false) {
      paginationProps = false;
    }

    let renderList = (
      <List
        grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
        {...rest}
        pagination={paginationProps}
        dataSource={list}
        renderItem={(record: any) => (
          <List.Item style={{ position: 'relative' }}>
            {checkable ? (
              <Checkbox
                value={record.id}
                className={styles.checkBox}
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  top: 5,
                  right: 4
                }}
              />
            ) : null}
            {renderItem({
              record,
              actions: setActions ? setActions(record) : null,
              recordSelection,
              checkable
            })}
          </List.Item>
        )}
      />
    );
    if (checkable) {
      renderList = (
        <Checkbox.Group style={{ width: '100%' }} onChange={this.handleSelectChange} value={selectedRowKeys}>
          {renderList}
        </Checkbox.Group>
      );
    }

    return (
      <div className={styles.standardTable}>
        {checkable ? (
          <div className={styles.tableAlert}>
            <Alert
              message={
                <Fragment>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
									{selectedRowKeys.length ? (
                    <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                      清空
										</a>
                  ) : (
                      <a onClick={this.onCheckAllChange} style={{ marginLeft: 24 }}>
                        全选
										</a>
                    )}
                </Fragment>
              }
              type="info"
              showIcon
            />
          </div>
        ) : null}
        {renderList}
      </div>
    );
  }
}

export default StandardList;
