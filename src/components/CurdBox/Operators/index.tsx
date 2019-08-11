import React from 'react';
import { Button } from 'antd';
import { CreateName } from '../../../constant';
import styles from './index.less';
import CurdBox from '../index';

export interface OperatorsProps {
  curdBox: CurdBox;
  createButtonName?: string;
  children?: React.ReactChildren;
} 

export default function Operators(props: OperatorsProps) {
  const { createButtonName, children, curdBox } = props;
  return (
    <div className={styles.tableListOperator}>
      {createButtonName ? (
        <Button icon="plus" type="primary" onClick={() => curdBox.handleVisible(CreateName, true)}>
          {createButtonName}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
