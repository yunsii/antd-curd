import React, { useContext } from 'react';
import StandardList, { StandardListProps } from '../StandardList/index';
import CurdBox, { withCurdBox, CurdBoxProps } from '../CurdBox';
import DataContext from '../../DataContext';

type NoDataStandardTableProps<T> = Omit<StandardListProps<T>, 'data'>;

export interface CustomStandardListProps<T extends { id: number | string }> extends NoDataStandardTableProps<T> {
  __curdBox__?: CurdBox<T>;
  fetchLoading?: boolean;
}

function CustomStandardList<T extends { id: number | string }>(props: CustomStandardListProps<T>) {
  const { __curdBox__, fetchLoading, ...rest } = props;
  const { data } = useContext(DataContext);
  if (__curdBox__) {
    const { handleDataChange } = __curdBox__;
    return (
      <StandardList
        {...rest}
        loading={fetchLoading}
        setActions={(record) => __curdBox__.renderActions(record)}
        onChange={handleDataChange}
        data={data}
      />
    );
  }
  return null;
}
const CurdList = withCurdBox(CustomStandardList);

export interface CurdListProps<T extends { id: number | string }> extends CustomStandardListProps<T>, CurdBoxProps<T> { }

export default function <T extends { id: number | string }>(props: CurdListProps<T>) {
  return <CurdList {...props} />
}
