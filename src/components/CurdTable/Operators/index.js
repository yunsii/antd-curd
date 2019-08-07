import React from 'react';
import { Button } from 'antd';
import { CreateName } from '../../../constant';
import styles from './index.less';

export default function Operators(props) {
  const { createButtonName, children, curd } = props;
  console.log(children)
  return (
    <div className={styles.tableListOperator}>
      {createButtonName ? (
        <Button icon="plus" type="primary" onClick={() => curd.handleVisible(CreateName, true)}>
          {createButtonName}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
