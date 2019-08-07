import React, { PureComponent } from 'react';
import { Card } from 'antd';
import CurdTable from './components/CurdTable/index';
// import TableList from './components/TableList';
import QueryPanel from './components/QueryPanel/index';
import { injectChildren } from './utils';


export interface CurdProps {
  dispatch: any;
  children: any;
}

class Curd extends PureComponent<CurdProps> {
  static defaultProps = {
    createTitle: '新建对象',
    detailTitle: '对象详情',
    updateTitle: '编辑对象',
    fetchLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    createButtonName: '新建',
    dispatch: () => { },
    queryArgsConfig: [],
    queryPanelProps: {},
    containerType: 'table',
    containerProps: {},
    renderItem: () => { },
    data: {},
    actionsConfig: {},
    popupType: 'drawer',
    popupProps: {},
    setFormItemsConfig: () => { },
    interceptors: {},
  };

  static QueryPanel = QueryPanel;
  static CurdTable = CurdTable;


  state = {
    createVisible: false,
    detailVisible: false,
    updateVisible: false,
    selectedRows: [],
    formValues: {},
    record: {} as any,

    queryForm: {},
  };

  // renderContainer = () => {
  //   let result = null;
  //   const {
  //     data,
  //     fetchLoading,
  //     containerType,
  //     container,
  //     containerProps,
  //     checkable,
  //     renderItem,
  //   } = this.props;
  //   const { selectedRows } = this.state;

  //   const composeCommenContainerProps = {
  //     selectedRows,
  //     loading: fetchLoading,
  //     data,
  //     onSelectRow: this.handleSelectRows,
  //     onChange: this.handleStandardTableChange,
  //     checkable,
  //   };

  //   if (containerType === 'table') {
  //     result = (
  //       <StandardTable
  //         {...containerProps}
  //         rowKey={row => row.id}
  //         {...composeCommenContainerProps}
  //         columns={this.enhanceColumns()}
  //       />
  //     );
  //   } else if (containerType === 'list') {
  //     result = (
  //       <TableList
  //         {...containerProps}
  //         rowKey={row => row.id}
  //         {...composeCommenContainerProps}
  //         setActions={record => setActions(record, this, this.props)}
  //         renderItem={renderItem}
  //       />
  //     );
  //   }
  //   return container ? injectChildren(container, composeCommenContainerProps) : result;
  // };


  renderChildren = () => {
    const { children } = this.props;
    return injectChildren(children, { __curd__: this })
  }

  render() {
    return (
      <Card bordered={false}>
        {this.renderChildren()}
      </Card>
    );
  }
}

export default Curd;
