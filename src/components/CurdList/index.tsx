import React from 'react';
import StandardList, { StandardListProps } from '../StandardList/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';

export interface CustomStandardListProps {
  __curdBox__?: CurdBox;
  data: { list: any[], pagination?: any };
  renderItem: StandardListProps["renderItem"];
}

function CustomStandardList(props: CustomStandardListProps) {
  const { __curdBox__, ...rest } = props;
  if (__curdBox__) {
    const { handleDataChange } = __curdBox__;
    return (
      <StandardList
        {...rest}
        setActions={(record) => __curdBox__.renderActions(record)}
        onChange={handleDataChange}
      />
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
