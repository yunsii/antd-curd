import React, { PureComponent } from 'react';
import { Card, Button } from 'antd';
import { FormProps } from 'antd/lib/form';
import { ItemConfig } from 'antd-form-mate';
import { addDivider, transferBoolArrayToString } from './utils';
import CurdTable from './components/CurdTable';
// import TableList from './components/TableList';
import QueryPanel from './components/QueryPanel';
import DetailFormDrawer from './components/DetailFormDrawer/index';
import DetailFormModal from './components/DetailFormModal';
import { callFunctionIfFunction, injectCurdChildren } from './utils';
import { CreateName, DetailName, UpdateName, DetailVisible, UpdateVisible } from './constant';
import { setActions } from './components/CurdTable/actions/index';
import { CustomDetailFormDrawerProps } from './components/CurdTable/CustomDetailFormDrawerProps';
import { CustomDetailFormModalProps } from './components/CurdTable/CustomDetailFormModalProps';
import styles from './index.less';


async function updateFieldsValueByInterceptors(fieldsValue, interceptors, mode) {
  const { updateFieldsValue } = interceptors;
  let newFieldsValue = { ...fieldsValue };
  if (updateFieldsValue) {
    newFieldsValue = await updateFieldsValue(fieldsValue, mode);
  }
  return newFieldsValue;
}

async function updateSearchValueByInterceptors(fieldsValue, interceptors) {
  const { updateSearchValue } = interceptors;
  let newFieldsValue = { ...fieldsValue };
  if (updateSearchValue) {
    newFieldsValue = await updateSearchValue(fieldsValue);
  }
  return newFieldsValue;
}

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');


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

  // componentDidMount() {
  //   const { namespace, dispatch } = this.props;
  //   dispatch({
  //     type: `${namespace}/fetch`,
  //   });
  // }


  // renderQueryPanel = () => {
  //   const { queryArgsConfig, queryPanelProps } = this.props;
  //   const composeQueryPanelProps = {
  //     ...queryPanelProps,
  //     queryArgsConfig,
  //     onSearch: this.handleSearch,
  //   };
  //   return <QueryPanel {...composeQueryPanelProps} />;
  // };

  // renderOperators = () => {
  //   const { createButtonName, operators } = this.props;
  //   return (
  //     <div className={styles.tableListOperator}>
  //       {createButtonName ? (
  //         <Button icon="plus" type="primary" onClick={() => this.handleVisible(CreateName, true)}>
  //           {createButtonName}
  //         </Button>
  //       ) : null}
  //       {injectChildren(operators, { __curd__: this })}
  //     </div>
  //   );
  // };

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
    return injectCurdChildren(children, { StandardTable: this })
  }

  render() {
    const { children } = this.props;
    return (
      <Card bordered={false}>
        {/* {this.renderQueryPanel()}
        {this.renderOperators()}
        {this.renderContainer()}
        {this.renderChildren()} */}
        {/* {this.renderChildren()} */}
        {children}
      </Card>
    );
  }
}

export default Curd;
