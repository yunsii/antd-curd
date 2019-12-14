import React, { useContext } from 'react';
import StandardTable, { StandardTableProps, StandardTableColumnProps } from '../../components/StandardTable/index';
import { InternalCurdBox } from '../CurdBox';
import { addDivider } from '../../utils';
import DataContext from '../../DataContext';

type NoDataStandardTableProps<T> = Omit<StandardTableProps<T>, 'data'>;

export interface CustomStandardTableProps<T extends { id: number | string }> extends NoDataStandardTableProps<T> {
  columns: StandardTableColumnProps<T>[];
  renderActions?: InternalCurdBox<T>['renderActions'];
  handleDataChange?: InternalCurdBox<T>['handleDataChange'];
}
export default function CustomStandardTable<T extends { id: number | string }>(props: CustomStandardTableProps<T>) {
  const { columns, renderActions, handleDataChange, ...rest } = props;
  const { data } = useContext(DataContext);
  const enhanceColumns = () => {
    if (!columns) return [];
    if (!renderActions) return columns;
    return [
      ...columns,
      {
        title: '操作',
        render: (value, record: T) => {
          return addDivider(renderActions(record));
        }
      },
    ];
  };
  return (
    <StandardTable
      {...rest}
      data={data}
      columns={enhanceColumns()}
      onChange={handleDataChange}
    />
  );
}
