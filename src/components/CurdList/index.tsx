import React, { useContext } from 'react';
import StandardList, { StandardListProps } from '../StandardList/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import DataContext from '../../DataContext';

type NoDataStandardTableProps<T> = Omit<StandardListProps<T>, 'data'>;

export interface CustomStandardListProps<T> extends NoDataStandardTableProps<T> {
  __curdBox__?: CurdBox<T>;
  fetchLoading?: boolean;
}

function CustomStandardList<T>(props: CustomStandardListProps<T>) {
  const { __curdBox__, fetchLoading, onSelectRow, rowKey, checkable, selectedRows, renderItem } = props;
  const { data } = useContext(DataContext);
  if (__curdBox__) {
    const { handleDataChange } = __curdBox__;
    return (
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
    );
  }
  return null;
}

export interface CurdListProps<T> extends CustomStandardListProps<T>, CurdBoxProps<T> { }

export default function CurdList<T>(props: CurdListProps<T>) {
  const { renderItem, ...rest } = props;
  return (
    <CurdBox {...rest}>
      <CustomStandardList {...props} />
    </CurdBox>
  );
}
