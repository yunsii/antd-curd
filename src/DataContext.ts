import React from 'react';
import { WrappedFormUtils } from "antd/lib/form/Form";
import { ItemConfig, Layout } from 'antd-form-mate/dist/lib/props';
import { InternalCurd } from './Curd';

export interface DataContextValue<T> {
  modelName?: string;
  data?: { list: T[]; pagination?: any };
  __curd__?: InternalCurd<T>;
  createFormItemsFn: (form: WrappedFormUtils) => (
    itemsConfig: ItemConfig[],
    formLayout?: Layout,
  ) => JSX.Element[];
}

const DataContext = React.createContext<DataContextValue<any>>({
  createFormItemsFn: () => () => ([]),
});

export default DataContext;
