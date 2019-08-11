import React, { PureComponent, Fragment } from 'react';
import { List, Alert, Checkbox } from 'antd';
import { callFunctionIfFunction } from '../../utils';
import styles from './index.less';

export type Page = {
  current: number;
  pageSize: number;
}

export type RecordSelection = {
  selectedRowKeys: number[];
  onSelectChange: (selectedRowKeys: any[]) => void;
  getCheckboxProps: (record: any) => any;
}

export type renderItemConfig = {
  record: any;
  actions: React.ReactNode[] | null;
  recordSelection: RecordSelection;
  checkable?: boolean;
}

export interface StandardListProps {
  data: any[];
  onSelectRow?: (recordArray: any[]) => void;
  rowKey?: string;
  checkable?: boolean;
  selectedRows?: any[];
  renderItem: (config: renderItemConfig) => React.ReactNode;
  setActions?: (record: any) => React.ReactNode[];
  onChange?: (page: Page) => void;
  loading?: boolean;
}

interface StandardListState {
  selectedRowKeys: number[] | string[];
}

class StandardList extends PureComponent<StandardListProps, StandardListState> {
  static defaultProps = {
    data: [],
    loading: false,
  };

  constructor(props: StandardListProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  cleanSelectedKeys = () => {
    this.handleSelectChange([]);
  };

  onCheckAllChange = () => {
    const { data = [] } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length < data.length) {
      this.handleSelectChange(data.map(item => item.id));
      return;
    }
    this.handleSelectChange([]);
  };

  handleSelectChange = selectedRowKeys => {
    const { data = [], onSelectRow } = this.props;
    this.setState({
      selectedRowKeys,
    });
    if (onSelectRow) {
      onSelectRow(data.filter(item => selectedRowKeys.includes(item.id)));
    }
  };

  handlePageChange = (current: number, pageSize: number) => {
    console.log(current, pageSize);
    const { onChange } = this.props;
    callFunctionIfFunction(onChange)({
      current,
      pageSize,
    } as Page)
  };

  handleShowSizeChange = (current, pageSize) => {
    this.handlePageChange(current, pageSize);
  };

  render() {
    const {
      data = [],
      checkable = true,
      renderItem,
      selectedRows,
      setActions,
      onSelectRow,
      onChange,
      ...rest
    } = this.props;
    const { selectedRowKeys } = this.state;

    let recordSelection: any = {
      selectedRowKeys,
      onSelectChange: this.handleSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    if (!checkable) {
      recordSelection = {};
    }

    let renderList = (
      <List
        rowKey="id"
        grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
        {...rest}
        dataSource={data}
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
                  right: 4,
                }}
              />
            ) : null}
            {renderItem({
              record,
              actions: setActions ? setActions(record) : null,
              recordSelection,
              checkable,
            })}
          </List.Item>
        )}
      />
    );
    if (checkable) {
      renderList = (
        <Checkbox.Group
          style={{ width: '100%' }}
          onChange={this.handleSelectChange}
          value={selectedRowKeys}
        >
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
