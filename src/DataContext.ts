import React from 'react';
import { InternalCurd } from './Curd';

export interface DataContextValue<T> {
  modelName?: string;
  data?: { list: T[]; pagination?: any };
  __curd__?: InternalCurd<T>;
}

const DataContext = React.createContext<DataContextValue<any>>({});

export default DataContext;
