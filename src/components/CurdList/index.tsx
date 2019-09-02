import React from 'react';
import StandardList, { StandardListProps } from '../StandardList/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import { injectChildren } from '../../utils';

export interface CustomStandardListProps extends StandardListProps {
  __curdBox__?: CurdBox;
  data: { list: any[], pagination?: any };
  renderItem: StandardListProps["renderItem"];
  fetchLoading?: boolean;
  children?: React.ReactChildren;
}

function CustomStandardList(props: CustomStandardListProps) {
  const {
    __curdBox__,
    fetchLoading,
    data,
    onSelectRow,
    rowKey,
    checkable,
    selectedRows,
    renderItem,
    children,
  } = props;
  if (__curdBox__) {
    const { handleDataChange } = __curdBox__;
    return (
      <>
        <StandardList
          loading={fetchLoading}
          setActions={(record) => __curdBox__.renderActions(record)}
          onChange={handleDataChange}
          data={data}
          onSelectRow={onSelectRow}
          rowKey={rowKey}
          checkable={checkable}
          selectedRows={selectedRows}
          renderItem={renderItem}
        />
        {injectChildren(children, { __curdBox__ })}
      </>
    )
  }
  return null
}

export interface CurdListProps extends StandardListProps, CurdBoxProps {
}

export default function CurdList(props: CurdListProps) {
  const { renderItem, ...rest } = props;
  return (
    <CurdBox {...rest}>
      <CustomStandardList {...props} />
    </CurdBox>
  )
}
