import React from 'react';
import StandardTable, { StandardTableProps } from '../StandardTable/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import { addDivider } from '../../utils';
import { injectChildren } from '../../utils';

export interface CustomStandardTableProps {
  __curdBox__?: CurdBox;
  data: { list: any[], pagination?: any };
  columns: any[];
  fetchLoading?: boolean;
  children?: React.ReactChildren;
}

function CustomStandardTable(props: CustomStandardTableProps) {
  const { __curdBox__, columns, fetchLoading, children, ...rest } = props;
  if (__curdBox__) {
    const { handleDataChange } = __curdBox__;
    const enhanceColumns = () => {
      const { actionsConfig } = __curdBox__.props;
      if (!columns) return [];
      if (!actionsConfig) return columns;
      return [
        ...columns,
        {
          title: '操作',
          render: (value, record) => {
            return addDivider(__curdBox__.renderActions(record));
          }
        },
      ];
    };
    return (
      <>
        <StandardTable
          {...rest}
          loading={fetchLoading}
          columns={enhanceColumns()}
          onChange={handleDataChange}
        />
        {injectChildren(children, { __curdBox__ })}
      </>
    )
  }
  return null
}

export interface CurdTableProps extends StandardTableProps, CurdBoxProps {
}

export default function CurdTable(props: CurdTableProps) {
  return (
    <CurdBox {...props}>
      <CustomStandardTable {...props} />
    </CurdBox>
  )
}
