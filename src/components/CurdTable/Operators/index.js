import React from 'react';
import { Button } from 'antd';
import { CreateName } from '../../../constant';
import styles from './index.less';

export default function Operators(props) {
  const { createButtonName, children, curdTable } = props;
  return (
    <div className={styles.tableListOperator}>
      {createButtonName ? (
        <Button icon="plus" type="primary" onClick={() => curdTable.handleVisible(CreateName, true)}>
          {createButtonName}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
