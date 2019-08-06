import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import classNames from 'classnames';
import { setActions } from './actions';
import { addDivider, transferBoolArrayToString } from '../../utils';
import StandardTable from '../StandardTable';
import styles from './index.less';


function CurdTable(props) {
  const { columns, actionsConfig, ...rest } = props;

  const enhanceColumns = () => {
    if (!columns) return [];
    if (!actionsConfig) return columns;
    return [
      ...columns,
      {
        title: '操作',
        render: (value, record) => addDivider(setActions(record, this, this.props)),
      },
    ];
  };

  return (
    <StandardTable {...rest} columns={this.enhanceColumns()} />
  )
}

export default CurdTable;
