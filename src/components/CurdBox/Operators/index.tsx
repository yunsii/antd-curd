import React from 'react';
import { Button } from 'antd';
import styles from './index.less';

export interface OperatorsProps {
  createButtonName?: string | false | null;
  handleCreateClick: () => void;
  children?: React.ReactChildren | JSX.Element;
}

export default function Operators(props: OperatorsProps) {
  const { createButtonName, children, handleCreateClick } = props;
  return (
    <div className={styles.tableListOperator}>
      {createButtonName ? (
        <Button icon="plus" type="primary" onClick={handleCreateClick}>
          {createButtonName}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
