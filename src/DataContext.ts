import React from 'react';
import Curd from './Curd';

export interface DataContextValue<T> {
  modelName?: string;
  data?: { list: T[]; pagination?: any };
  __curd__?: Curd<T>;
}

const DataContext = React.createContext<DataContextValue<any>>({});

export default DataContext;
