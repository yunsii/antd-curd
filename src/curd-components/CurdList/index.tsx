import React, { useContext } from 'react';
import StandardList, { StandardListProps } from '../../components/StandardList/index';
import { InternalCurdBox } from '../CurdBox';
import DataContext from '../../DataContext';

type NoDataStandardTableProps<T> = Omit<StandardListProps<T>, 'data'>;

export interface CustomStandardListProps<T extends { id: number | string }> extends NoDataStandardTableProps<T> {
  renderActions?: InternalCurdBox<T>['renderActions'];
  handleDataChange?: InternalCurdBox<T>['handleDataChange'];
}
export default function CustomStandardList<T extends { id: number | string }>(props: CustomStandardListProps<T>) {
  const { handleDataChange, renderActions, ...rest } = props;
  const { data } = useContext(DataContext);
  return (
    <StandardList
      {...rest}
      setActions={renderActions ? (record) => renderActions(record) : undefined}
      onChange={handleDataChange}
      data={data}
    />
  );
}
