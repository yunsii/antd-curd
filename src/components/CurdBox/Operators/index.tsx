import React from 'react';
import { Button } from 'antd';
import { CreateName } from '../../../constants';
import styles from './index.less';
import CurdBox from '../index';

export interface OperatorsProps {
  __curdBox__: CurdBox<any>;
  createButtonName?: string | false;
  children?: React.ReactChildren;
}

export default function Operators(props: OperatorsProps) {
  const { createButtonName, children, __curdBox__ } = props;
  return (
    <div className={styles.tableListOperator}>
      {createButtonName ? (
        <Button icon="plus" type="primary" onClick={() => __curdBox__.handleVisible(CreateName, true)}>
          {createButtonName}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
