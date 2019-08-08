import React, { PureComponent } from 'react';
import { Card } from 'antd';
import CurdTable from './components/CurdTable';
// import TableList from './components/TableList';
import QueryPanel from './components/QueryPanel';
import { injectChildren } from './utils';


export interface CurdProps {
  modelName: string;
  dispatch: Function;
  children?: any;
}

class Curd extends PureComponent<CurdProps> {
  static defaultProps = {
    modelName: '',
    dispatch: Function,
  };

  static QueryPanel = QueryPanel;
  static CurdTable = CurdTable;

  state = {
    searchForm: {},
  };

  handleSearch = () => {
    const { modelName, dispatch } = this.props;
    const { searchForm } = this.state;
    dispatch({
      type: `${modelName}/fetch`,
      payload: { ...searchForm },
    })
  }

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
