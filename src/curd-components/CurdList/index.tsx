import React, { useContext } from 'react';
import StandardList, { StandardListProps } from '../../components/StandardList/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import DataContext from '../../DataContext';

type NoDataStandardTableProps<T> = Omit<StandardListProps<T>, 'data'>;

export interface CustomStandardListProps<T extends { id: number | string }> extends NoDataStandardTableProps<T> {
  actionsConfig?: CurdBoxProps<T>['actionsConfig'];
  renderActions?: CurdBox<T>['renderActions'];
  handleDataChange?: CurdBox<T>['handleDataChange'];
}
export default function CustomStandardList<T extends { id: number | string }>(props: CustomStandardListProps<T>) {
  const { actionsConfig, handleDataChange, renderActions, ...rest } = props;
  const { data } = useContext(DataContext);
  return (
    <StandardList
      {...rest}
      setActions={actionsConfig && renderActions ? (record) => renderActions(record) : undefined}
      onChange={handleDataChange}
      data={data}
    />
  );
}
