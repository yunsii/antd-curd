import React from 'react';
import { Button } from 'antd';
import { CreateName } from '../../../constant';
// import { injectChildren } from '../../../utils';
import styles from './index.less';

export default function Operators(props) {
  const { createButtonName, children, curdTable } = props;
  console.log(children)
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
