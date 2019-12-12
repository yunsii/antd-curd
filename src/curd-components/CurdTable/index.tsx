import React, { useContext } from 'react';
import StandardTable, { StandardTableProps, StandardTableColumnProps } from '../../components/StandardTable/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import { addDivider } from '../../utils';
import DataContext from '../../DataContext';

type NoDataStandardTableProps<T> = Omit<StandardTableProps<T>, 'data'>;

export interface CustomStandardTableProps<T extends { id: number | string }> extends NoDataStandardTableProps<T> {
  columns: StandardTableColumnProps<T>[];
  actionsConfig?: CurdBoxProps<T>['actionsConfig'];
  renderActions?: CurdBox<T>['renderActions'];
  handleDataChange?: CurdBox<T>['handleDataChange'];
}
export default function CustomStandardTable<T extends { id: number | string }>(props: CustomStandardTableProps<T>) {
  const { columns, actionsConfig, renderActions, handleDataChange, ...rest } = props;
  const { data } = useContext(DataContext);
  const enhanceColumns = () => {
    if (!columns) return [];
    if (!actionsConfig) return columns;
    return [
      ...columns,
      renderActions ? {
        title: '操作',
        render: (value, record: T) => {
          return addDivider(renderActions(record));
        }
      } : null,
    ].filter(item => item);
  };
  return (
    <StandardTable
      {...rest}
      data={data}
      columns={enhanceColumns() as any}
      onChange={handleDataChange}
    />
  );
}
